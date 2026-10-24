"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileWeeklySummary = compileWeeklySummary;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const CATEGORY_DISPLAY_NAMES = {
    'ai-ml': 'AI & Machine Learning',
    'software-engineering': 'Software Engineering',
    'data-cloud': 'Data & Cloud',
    'security': 'Cybersecurity',
    'career-industry': 'Industry & Careers',
    'general-tech': 'General Tech',
};
/**
 * Clean up verbose summary text into a punchy 1-sentence "快讯" core verdict
 */
function extractCoreVerdict(title, description, bodyExcerpt) {
    let text = description || bodyExcerpt || '';
    // Clean raw HN metadata if present
    text = text
        .replace(/Article URL:\s*https?:\/\/[^\s]+/gi, '')
        .replace(/Comments URL:\s*https?:\/\/[^\s]+/gi, '')
        .replace(/Points:\s*\d+/gi, '')
        .replace(/#?\s*Comments:\s*\d+/gi, '')
        .replace(/^Trending engineering discussion on Hacker News(?:\s*\([^)]*\))?\s*analyzing:\s*/i, '')
        .replace(/^Read the full story at .*$/i, '')
        .trim();
    if (!text || text.length < 15 || text.toLowerCase() === title.toLowerCase()) {
        return `Major technical development analyzing ${title} and its architectural implications.`;
    }
    // Grab the first 1-2 sentences, max 180 chars
    const sentences = text.split(/(?<=[.!?])\s+/);
    const first = sentences[0] || text;
    if (first.length > 180) {
        return first.slice(0, 177).trim() + '...';
    }
    return first;
}
/**
 * Calculate weekly dates and week number
 */
function getWeekContext(targetDate = new Date()) {
    const d = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
    const dayNum = d.getUTCDay() || 7; // 1 = Monday, 7 = Sunday
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    // Start of week (Monday)
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    // End of week (Sunday 23:59:59)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    // Next Monday
    const nextMonday = new Date(sunday);
    nextMonday.setDate(sunday.getDate() + 1);
    nextMonday.setHours(6, 0, 0, 0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekRange = `${monthNames[monday.getMonth()]} ${monday.getDate()} – ${monthNames[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;
    const mondayDate = `${monthNames[nextMonday.getMonth()]} ${nextMonday.getDate()}, ${nextMonday.getFullYear()}`;
    // Check if today is Sunday late night (>= 22:00) or Monday
    const currentDay = targetDate.getDay();
    const isSundayNightOrLater = currentDay === 0 && targetDate.getHours() >= 22 || currentDay === 1;
    return {
        weekNumber,
        weekRange,
        mondayDate,
        sundayDate: sunday.toISOString(),
        isSundayNightOrLater,
        nextLockAt: sunday.toISOString(),
    };
}
/**
 * Compile weekly summary from recent 7-day articles
 */
async function compileWeeklySummary(compiledBy = 'scheduled_cron') {
    const now = new Date();
    const weekCtx = getWeekContext(now);
    const issueId = `issue_${now.getFullYear()}_w${weekCtx.weekNumber}`;
    // 1. Gather articles from the last 7 days
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let pool = [];
    const db = (0, firebaseAdmin_1.getFirestore)();
    if (db) {
        try {
            const snap = await db
                .collection('daily_articles')
                .where('publishedAt', '>=', sevenDaysAgo)
                .limit(120)
                .get();
            snap.forEach((doc) => {
                pool.push(doc.data());
            });
        }
        catch (err) {
            console.warn('[Weekly] Could not query Firestore daily_articles, falling back to local snapshot:', err);
        }
    }
    // Fallback to local dailyNewsFeed.json if Firestore pool is sparse
    if (pool.length < 5) {
        const frontendDataDir = path_1.default.resolve(__dirname, '../../../src/data');
        const localDailyFeedPath = path_1.default.join(frontendDataDir, 'dailyNewsFeed.json');
        if (fs_1.default.existsSync(localDailyFeedPath)) {
            try {
                const raw = JSON.parse(fs_1.default.readFileSync(localDailyFeedPath, 'utf8'));
                if (Array.isArray(raw.articles)) {
                    pool = raw.articles;
                }
            }
            catch (e) {
                console.warn('[Weekly] Error reading local dailyNewsFeed:', e);
            }
        }
    }
    // 2. Score articles by Weekly Impact Weight
    // Weekly impact balances Technical Significance (40%), Multi-source Cross Coverage (35%), and Engagement/Recency (25%)
    const scored = pool.map((art) => {
        const sig = art.scores?.significance ?? 0.5;
        const crossCov = art.scores?.crossCoverage ?? (art.relatedSources?.length ? Math.min(art.relatedSources.length / 3, 1) : 0);
        const eng = art.scores?.engagement ?? 0.35;
        const rec = art.scores?.recency ?? 0.5;
        const weeklyScore = Number((0.40 * sig + 0.35 * crossCov + 0.15 * eng + 0.10 * rec).toFixed(4));
        return {
            art,
            weeklyScore,
        };
    });
    // Sort descending by weekly score
    scored.sort((a, b) => b.weeklyScore - a.weeklyScore);
    // 3. Category Diversity Gate: pick Top 5 (max 2 per category to guarantee a balanced cross-domain briefing)
    const categoryCounts = {};
    const topPicked = [];
    const candidatePool = [];
    for (const item of scored) {
        const cat = item.art.category || 'general-tech';
        const count = categoryCounts[cat] || 0;
        if (topPicked.length < 5 && count < 2) {
            topPicked.push(item);
            categoryCounts[cat] = count + 1;
        }
        else {
            candidatePool.push(item);
        }
    }
    // If diversity was too strict, fill remaining slots up to 5
    while (topPicked.length < 5 && candidatePool.length > 0) {
        topPicked.push(candidatePool.shift());
    }
    // Format Top 5
    const topArticles = topPicked.map((item, idx) => {
        const art = item.art;
        const verdict = extractCoreVerdict(art.cleanedTitle || art.title, art.description, art.bodyExcerpt);
        const whyItMatters = art.enrichment?.whyItMatters ||
            `Direct impact on ${art.category.replace('-', ' ')} architectural choices and engineer tooling.`;
        const actionableSkills = art.enrichment?.extractedSkills?.length
            ? art.enrichment.extractedSkills.slice(0, 3)
            : (art.subTags?.slice(0, 3) || ['Engineering']);
        return {
            id: art.id,
            number: String(idx + 1).padStart(2, '0'),
            title: art.cleanedTitle || art.title,
            category: art.category,
            categoryLabel: CATEGORY_DISPLAY_NAMES[art.category] || 'Tech',
            subTags: art.subTags || [],
            sourceName: art.sourceName,
            sourceDomain: art.sourceDomain,
            link: art.link,
            publishedAt: art.publishedAt,
            coreVerdict: verdict,
            whyItMatters,
            actionableSkills,
            weeklyScore: item.weeklyScore,
            estimatedReadSeconds: 45, // ~45s per flash card
        };
    });
    // Format candidate pool (up to 7 alternatives for custom swap)
    const candidateArticles = candidatePool.slice(0, 7).map((item, idx) => {
        const art = item.art;
        return {
            id: art.id,
            number: String(idx + 6).padStart(2, '0'),
            title: art.cleanedTitle || art.title,
            category: art.category,
            categoryLabel: CATEGORY_DISPLAY_NAMES[art.category] || 'Tech',
            subTags: art.subTags || [],
            sourceName: art.sourceName,
            sourceDomain: art.sourceDomain,
            link: art.link,
            publishedAt: art.publishedAt,
            coreVerdict: extractCoreVerdict(art.cleanedTitle || art.title, art.description, art.bodyExcerpt),
            whyItMatters: art.enrichment?.whyItMatters ||
                `Key development in ${art.category.replace('-', ' ')} industry standards.`,
            actionableSkills: art.enrichment?.extractedSkills?.length
                ? art.enrichment.extractedSkills.slice(0, 3)
                : (art.subTags?.slice(0, 3) || ['Engineering']),
            weeklyScore: item.weeklyScore,
            estimatedReadSeconds: 45,
        };
    });
    const totalReadTimeMinutes = Math.round((topArticles.length * 45) / 60); // 5 * 45s = 225s ~ 4 mins
    const payload = {
        issueId,
        issueNumber: weekCtx.weekNumber,
        weekRange: weekCtx.weekRange,
        mondayDate: weekCtx.mondayDate,
        status: weekCtx.isSundayNightOrLater ? 'finalized' : 'draft',
        isLockedUntilSunday: weekCtx.isSundayNightOrLater,
        nextLockAt: weekCtx.nextLockAt,
        totalReadTimeMinutes,
        topArticles,
        candidateArticles,
        lastCompiledAt: now.toISOString(),
        compiledBy,
    };
    // 4. Save to local snapshot src/data/weeklySummaryFeed.json for instant frontend consumption
    try {
        const frontendDataDir = path_1.default.resolve(__dirname, '../../../src/data');
        if (!fs_1.default.existsSync(frontendDataDir)) {
            fs_1.default.mkdirSync(frontendDataDir, { recursive: true });
        }
        const weeklyJsonPath = path_1.default.join(frontendDataDir, 'weeklySummaryFeed.json');
        fs_1.default.writeFileSync(weeklyJsonPath, JSON.stringify(payload, null, 2), 'utf8');
        console.log(`[Weekly] Published weekly summary snapshot to ${weeklyJsonPath}`);
    }
    catch (err) {
        console.warn('[Weekly] Failed to write local weeklySummaryFeed.json:', err);
    }
    // 5. Persist to Firestore if available
    if (db) {
        try {
            await db.collection('weekly_summaries').doc(issueId).set(payload, { merge: true });
            await db.collection('weekly_summaries').doc('latest').set(payload, { merge: true });
            console.log(`[Weekly] Successfully synced weekly issue ${issueId} to Firestore.`);
        }
        catch (err) {
            console.warn('[Weekly] Firestore sync error for weekly summary:', err.message);
        }
    }
    return payload;
}
//# sourceMappingURL=compileWeekly.js.map