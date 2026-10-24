"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRecencyScore = calculateRecencyScore;
exports.calculateSignificanceScore = calculateSignificanceScore;
exports.calculateCareerRelevanceScore = calculateCareerRelevanceScore;
exports.calculateSourceAuthorityScore = calculateSourceAuthorityScore;
exports.calculateCrossCoverageScore = calculateCrossCoverageScore;
exports.calculateEngagementScore = calculateEngagementScore;
exports.computeArticleScores = computeArticleScores;
const career_profile_1 = require("../config/career-profile");
const SOURCE_AUTHORITY_MAP = {
    'blog.google': 0.95,
    'github.blog': 0.92,
    'aws.amazon.com': 0.90,
    'openai.com': 0.95,
    'techcrunch.com': 0.80,
    'arstechnica.com': 0.80,
    'theverge.com': 0.75,
    'infoq.com': 0.88,
    'bleepingcomputer.com': 0.82,
    'news.ycombinator.com': 0.70,
    '_default': 0.50,
};
/**
 * Signal 1: Recency with exponential decay (half-life exactly 18 hours)
 * R(t) = 2^(-t / 18), normalized to [0, 1]
 */
function calculateRecencyScore(publishedAt) {
    const publishedDate = new Date(publishedAt).getTime();
    const now = Date.now();
    const ageHours = Math.max(0, (now - publishedDate) / (1000 * 60 * 60));
    const score = Math.pow(2, -ageHours / 18);
    return Math.min(Math.max(score, 0), 1.0);
}
/**
 * Signal 2: Technical Significance normalized to [0, 1]
 * T_norm = (T - 1) / 9 for T in [1, 10]
 */
function calculateSignificanceScore(enrichment) {
    if (enrichment && typeof enrichment.technicalSignificance === 'number') {
        const clamped = Math.min(Math.max(enrichment.technicalSignificance, 1), 10);
        return (clamped - 1) / 9;
    }
    return 0.44; // neutral default (equivalent to ~5/10)
}
/**
 * Signal 3: CS Student Career Relevance normalized to [0, 1]
 */
function calculateCareerRelevanceScore(category, skills, topicKeywords) {
    let score = 0;
    // 1. Category alignment (up to 0.4)
    if (career_profile_1.CS_STUDENT_PROFILE.interestCategories.includes(category)) {
        score += 0.4;
    }
    // 2. Skill overlap with student target skills (up to 0.6)
    const allArticleTerms = [...skills, ...topicKeywords].map((s) => s.toLowerCase());
    const profileSkills = career_profile_1.CS_STUDENT_PROFILE.coreSkills.map((s) => s.toLowerCase());
    const matches = profileSkills.filter((ps) => allArticleTerms.some((term) => term === ps || term.includes(ps) || ps.includes(term)));
    // Cap at 3 skill matches for full 0.6 score
    const skillRatio = Math.min(matches.length / 3, 1.0);
    score += 0.6 * skillRatio;
    return Math.min(score, 1.0);
}
/**
 * Signal 4: Source Authority Tier normalized to [0, 1]
 */
function calculateSourceAuthorityScore(domain) {
    return SOURCE_AUTHORITY_MAP[domain] || SOURCE_AUTHORITY_MAP['_default'];
}
/**
 * Signal 5: Cross-Coverage Boost normalized to [0, 1]
 * Validates independent multi-source reporting (up to 3 independent outlets)
 */
function calculateCrossCoverageScore(relatedCount = 0) {
    return Math.min(relatedCount / 3, 1.0);
}
/**
 * Signal 6: Engagement Proxy normalized to [0, 1]
 */
function calculateEngagementScore(raw) {
    if (raw?.hnPoints) {
        return Math.min(raw.hnPoints / 250, 1.0);
    }
    if (raw?.redditScore) {
        return Math.min(raw.redditScore / 500, 1.0);
    }
    return 0.35; // Neutral baseline
}
/**
 * Normalized Multi-Signal Composite Ranking:
 * Composite = 0.28 * R + 0.32 * T + 0.22 * C + 0.13 * A + 0.05 * X
 * All inputs strictly in [0, 1], weights sum to 1.00
 */
function computeArticleScores(article, enrichment, rawMeta, relatedSourcesCount = 0) {
    const recency = calculateRecencyScore(article.publishedAt);
    const significance = calculateSignificanceScore(enrichment);
    const careerRelevance = calculateCareerRelevanceScore(article.category, enrichment?.extractedSkills || [], article.topicKeywords);
    const sourceAuthority = calculateSourceAuthorityScore(article.sourceDomain);
    const crossCoverage = calculateCrossCoverageScore(relatedSourcesCount);
    const engagement = calculateEngagementScore(rawMeta);
    const composite = Number((0.28 * recency +
        0.32 * significance +
        0.22 * careerRelevance +
        0.13 * sourceAuthority +
        0.05 * crossCoverage).toFixed(4));
    return {
        recency: Number(recency.toFixed(3)),
        significance: Number(significance.toFixed(3)),
        careerRelevance: Number(careerRelevance.toFixed(3)),
        sourceAuthority: Number(sourceAuthority.toFixed(3)),
        crossCoverage: Number(crossCoverage.toFixed(3)),
        engagement: Number(engagement.toFixed(3)),
        composite,
    };
}
//# sourceMappingURL=rank.js.map