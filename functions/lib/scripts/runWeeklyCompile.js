"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const compileWeekly_1 = require("../weekly/compileWeekly");
async function main() {
    console.log('====================================================');
    console.log('⚡ Compiling Weekly Summary 快讯 (Top 5 Express)');
    console.log('====================================================\n');
    const summary = await (0, compileWeekly_1.compileWeeklySummary)('manual_redo');
    console.log(`\n📅 Issue: ${summary.issueId} (#${summary.issueNumber})`);
    console.log(`⏱️ Estimated Read Time: ~${summary.totalReadTimeMinutes} minutes`);
    console.log(`🔒 Status: ${summary.status.toUpperCase()} (Next Lock: ${summary.nextLockAt})`);
    console.log(`\n🏆 TOP 5 WEEKLY EXPRESS STORIES:`);
    summary.topArticles.forEach((art) => {
        console.log(`\n[#${art.number}] [${art.categoryLabel}] ${art.title}`);
        console.log(`     Source: ${art.sourceName} | Score: ${art.weeklyScore}`);
        console.log(`     🎯 Core Verdict: ${art.coreVerdict}`);
        console.log(`     💡 Why It Matters: ${art.whyItMatters}`);
        console.log(`     🛠️ Skills: ${art.actionableSkills.join(', ')}`);
    });
    console.log(`\n📦 Candidate Pool for Custom Swapping: ${summary.candidateArticles.length} articles available.`);
    console.log('\n✨ Weekly compilation complete!\n');
}
main().catch((err) => {
    console.error('Weekly compilation failed:', err);
    process.exit(1);
});
//# sourceMappingURL=runWeeklyCompile.js.map