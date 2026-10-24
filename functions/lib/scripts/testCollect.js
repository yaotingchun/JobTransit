"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collect_1 = require("../pipeline/collect");
const sources_1 = require("../config/sources");
async function main() {
    console.log('====================================================');
    console.log('🚀 Testing Resilient Collector across', sources_1.NEWS_SOURCES.length, 'sources...');
    console.log('====================================================\n');
    const startTime = Date.now();
    const { articles, statusUpdates } = await (0, collect_1.collectAllSources)(sources_1.NEWS_SOURCES);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nCompleted in ${duration}s. Total articles collected: ${articles.length}\n`);
    console.log('--- Source Health Status ---');
    for (const [sourceId, status] of statusUpdates.entries()) {
        const errorMsg = status.lastError ? `❌ Error: ${status.lastError}` : '✅ OK';
        console.log(`- ${sourceId}: ${errorMsg}`);
    }
    console.log('\n--- Sample Collected Articles (First 5) ---');
    articles.slice(0, 5).forEach((article, idx) => {
        console.log(`\n[#${idx + 1}] [${article.sourceName}] ${article.title}`);
        console.log(`     Link: ${article.link}`);
        console.log(`     Date: ${article.publishedAt}`);
        console.log(`     Desc: ${article.description.slice(0, 120)}...`);
        if (article.hnPoints) {
            console.log(`     HN Points: ${article.hnPoints}`);
        }
    });
}
main().catch((err) => {
    console.error('Collector test failed:', err);
    process.exit(1);
});
//# sourceMappingURL=testCollect.js.map