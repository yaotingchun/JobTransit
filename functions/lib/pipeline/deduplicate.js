"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSubstantiveTokens = extractSubstantiveTokens;
exports.calculateTokenOverlap = calculateTokenOverlap;
exports.clusterArticles = clusterArticles;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Tokenize and normalize title for similarity comparison, extracting substantive keywords
 */
function extractSubstantiveTokens(title) {
    const stopwords = new Set([
        'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
        'and', 'or', 'is', 'are', 'was', 'were', 'it', 'its', 'as', 'that', 'this',
        'how', 'why', 'what', 'new', 'now', 'says', 'after', 'about', 'into', 'over',
        'via', 'more', 'than', 'will', 'can', 'could', 'may', 'your', 'their', 'our',
        'here', 'just', 'out', 'up', 'down', 'all', 'one', 'two', 'first', 'second'
    ]);
    const words = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopwords.has(w));
    return new Set(words);
}
/**
 * Calculate Jaccard similarity and return shared token count
 */
function calculateTokenOverlap(setA, setB) {
    if (setA.size === 0 || setB.size === 0)
        return { similarity: 0, sharedCount: 0 };
    let sharedCount = 0;
    for (const item of setA) {
        if (setB.has(item))
            sharedCount++;
    }
    const unionSize = setA.size + setB.size - sharedCount;
    return {
        similarity: unionSize > 0 ? sharedCount / unionSize : 0,
        sharedCount,
    };
}
/**
 * Two-stage deduplication:
 * 1. Strict canonical URL deduplication (discards identical URLs)
 * 2. Conservative event candidate clustering (groups stories covering the exact same event)
 */
function clusterArticles(articles) {
    const seenUrls = new Set();
    const uniqueArticles = [];
    // Stage 1: Exact canonical URL deduplication
    for (const article of articles) {
        if (seenUrls.has(article.urlHash)) {
            continue; // Identical canonical URL already processed
        }
        seenUrls.add(article.urlHash);
        uniqueArticles.push(article);
    }
    // Stage 2: Event clustering with strict entity + temporal constraints
    const events = [];
    const articleToEvent = new Map(); // articleId -> eventId
    const eventArticles = new Map();
    const MAX_TIME_WINDOW_MS = 36 * 60 * 60 * 1000; // 36 hours
    for (const article of uniqueArticles) {
        const articleTime = new Date(article.publishedAt).getTime();
        const tokens = extractSubstantiveTokens(article.cleanedTitle);
        let matchedEventId = null;
        for (const event of events) {
            const eventTime = new Date(event.firstSeenAt).getTime();
            const timeDiff = Math.abs(articleTime - eventTime);
            // Temporal safeguard: stories separated by > 36h are distinct events
            if (timeDiff > MAX_TIME_WINDOW_MS) {
                continue;
            }
            const eventTokens = extractSubstantiveTokens(event.title);
            const { similarity, sharedCount } = calculateTokenOverlap(tokens, eventTokens);
            // Strict event matching criteria:
            // High token similarity (>= 0.72) AND at least 3 shared substantive terms
            // OR direct destination URL match (e.g., aggregator link pointing to the same source)
            const isContentMatch = similarity >= 0.72 && sharedCount >= 3;
            const isTargetLinkMatch = article.link.length > 10 && event.articles.some((a) => a.link === article.link);
            if (isContentMatch || isTargetLinkMatch) {
                matchedEventId = event.eventId;
                break;
            }
        }
        if (matchedEventId) {
            // Attach to existing event cluster
            const list = eventArticles.get(matchedEventId) || [];
            list.push(article);
            eventArticles.set(matchedEventId, list);
            articleToEvent.set(article.id, matchedEventId);
            const event = events.find((e) => e.eventId === matchedEventId);
            event.articleCount++;
            event.lastUpdatedAt = new Date().toISOString();
            // Cap stored article references in event doc to 15 to safeguard doc size
            if (event.articles.length < 15) {
                event.articles.push({
                    articleId: article.id,
                    sourceName: article.sourceName,
                    sourceDomain: article.sourceDomain,
                    link: article.link,
                    publishedAt: article.publishedAt,
                });
            }
        }
        else {
            // Create new event cluster
            const titleHash = crypto_1.default.createHash('md5').update(article.cleanedTitle).digest('hex').slice(0, 12);
            const newEventId = `evt_${titleHash}_${articleTime}`;
            const summaryItem = {
                articleId: article.id,
                sourceName: article.sourceName,
                sourceDomain: article.sourceDomain,
                link: article.link,
                publishedAt: article.publishedAt,
            };
            events.push({
                eventId: newEventId,
                primaryArticleId: article.id,
                title: article.cleanedTitle,
                summary: article.description,
                articles: [summaryItem],
                firstSeenAt: article.publishedAt,
                lastUpdatedAt: article.publishedAt,
                articleCount: 1,
            });
            eventArticles.set(newEventId, [article]);
            articleToEvent.set(article.id, newEventId);
        }
    }
    // Stage 3: Designate primary article per event and attach cross-source references
    const clusteredArticles = [];
    for (const article of uniqueArticles) {
        const eventId = articleToEvent.get(article.id);
        const cluster = eventArticles.get(eventId) || [article];
        // Sort cluster to determine authoritative primary article:
        // Prefer articles with full body excerpt or longer detailed description
        const sortedCluster = [...cluster].sort((a, b) => {
            const aLen = (a.bodyExcerpt?.length || 0) + (a.description?.length || 0);
            const bLen = (b.bodyExcerpt?.length || 0) + (b.description?.length || 0);
            return bLen - aLen;
        });
        const isPrimary = sortedCluster[0].id === article.id;
        // Related sources from cluster (excluding current article)
        const related = cluster
            .filter((a) => a.id !== article.id)
            .slice(0, 10)
            .map((a) => ({
            articleId: a.id,
            sourceName: a.sourceName,
            sourceDomain: a.sourceDomain,
            link: a.link,
            publishedAt: a.publishedAt,
        }));
        clusteredArticles.push({
            ...article,
            eventId,
            isPrimaryInEvent: isPrimary,
            relatedSources: related,
        });
    }
    return {
        clusteredArticles,
        events,
    };
}
//# sourceMappingURL=deduplicate.js.map