"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyArticle = classifyArticle;
exports.classifyBatch = classifyBatch;
const categories_1 = require("../config/categories");
/**
 * Classify article into a primary CS category and extract relevant subTags
 */
function classifyArticle(article) {
    const titleText = article.cleanedTitle.toLowerCase();
    const descText = (article.description || '').toLowerCase();
    const fullText = `${titleText} ${descText}`;
    const categoryScores = {
        'ai-ml': 0,
        'software-engineering': 0,
        'data-cloud': 0,
        'security': 0,
        'career-industry': 0,
        'general-tech': 0,
    };
    const matchedKeywords = {
        'ai-ml': [],
        'software-engineering': [],
        'data-cloud': [],
        'security': [],
        'career-industry': [],
        'general-tech': [],
    };
    for (const [catKey, def] of Object.entries(categories_1.CATEGORY_DEFINITIONS)) {
        const category = catKey;
        for (const kw of def.keywords) {
            // Regex word-boundary match to avoid substrings (e.g. "go" in "good")
            const regex = new RegExp(`\\b${kw.replace('/', '\\/')}\\b`, 'i');
            let matchWeight = 0;
            if (regex.test(titleText)) {
                matchWeight += 3.0; // 3x weight for title appearance
            }
            if (regex.test(descText)) {
                matchWeight += 1.0; // 1x weight for body appearance
            }
            if (matchWeight > 0) {
                categoryScores[category] += matchWeight * def.weight;
                matchedKeywords[category].push(kw);
            }
        }
    }
    // Find winning category
    let topCategory = 'general-tech';
    let highestScore = 0;
    for (const [catKey, score] of Object.entries(categoryScores)) {
        if (score > highestScore) {
            highestScore = score;
            topCategory = catKey;
        }
    }
    // If score is too low or empty, fall back to general-tech
    if (highestScore < 1.0) {
        topCategory = 'general-tech';
    }
    // Extract unique subTags (capitalized for display)
    const allKeywords = matchedKeywords[topCategory] || [];
    const subTags = Array.from(new Set(allKeywords.slice(0, 4).map((kw) => {
        // Uppercase acronyms, capitalize normal words
        if (['ai', 'llm', 'gpt', 'ml', 'api', 'sql', 'aws', 'gcp', 'cve', 'ci/cd', 'k8s'].includes(kw.toLowerCase())) {
            return kw.toUpperCase();
        }
        return kw.charAt(0).toUpperCase() + kw.slice(1);
    })));
    return {
        ...article,
        category: topCategory,
        subTags: subTags.length > 0 ? subTags : [categories_1.CATEGORY_DEFINITIONS[topCategory].label.split(' ')[0]],
        topicKeywords: allKeywords,
    };
}
function classifyBatch(articles) {
    return articles.map((a) => classifyArticle(a));
}
//# sourceMappingURL=classify.js.map