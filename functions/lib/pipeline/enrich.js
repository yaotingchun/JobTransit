"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichArticle = enrichArticle;
exports.enrichBatch = enrichBatch;
const generative_ai_1 = require("@google/generative-ai");
let genAIInstance = null;
function getGenAI() {
    if (genAIInstance)
        return genAIInstance;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        return null;
    genAIInstance = new generative_ai_1.GoogleGenerativeAI(apiKey);
    return genAIInstance;
}
const SYSTEM_INSTRUCTION = `You are an expert career and engineering advisor for Computer Science students.
Your job is to analyze tech news articles to assess technical significance and career impact.

CRITICAL RULES TO PREVENT HALLUCINATION:
1. Base your analysis STRICTLY AND ONLY on the provided article text. Do not invent benchmark numbers, version numbers, architectures, or company plans that are not explicitly stated.
2. If the article content is too brief, vague, or purely promotional/commercial without technical substance, set status to "insufficient_content", return null for whyItMatters, and confidence "low".
3. "whyItMatters" must explain directly why a CS student or junior engineer should care (e.g. implications on architecture, tech stack shifts, hiring demand, or tooling changes).
4. Set "confidence" to:
   - "high": clear technical article with sufficient evidence and details
   - "medium": only short summary available, but subject is unambiguous
   - "low": ambiguous, marketing-heavy, or very sparse content
5. "technicalSignificance": rate 1 to 10 based on genuine industry/engineering importance.
6. "chineseSummary": 1-2 concise, clear sentences in Chinese explaining the core development.

Return ONLY valid JSON matching this schema:
{
  "whyItMatters": string | null,
  "chineseSummary": string | null,
  "extractedSkills": string[],
  "technicalSignificance": number,
  "confidence": "high" | "medium" | "low",
  "status": "enriched" | "insufficient_content"
}`;
const PROMPT_VERSION = 'v2.1';
const MODEL_VERSION = 'gemini-2.0-flash';
/**
 * Perform evidence-gated LLM enrichment for an article with idempotency and schema validation.
 */
async function enrichArticle(article, existing) {
    // 1. Idempotency check: Reuse valid stored enrichment only if category matches
    if (existing && (existing.status === 'enriched' || existing.status === 'insufficient_content')) {
        const isCategoryMismatch = existing.whyItMatters &&
            existing.whyItMatters.startsWith('Relevant to engineers working in ') &&
            !existing.whyItMatters.toLowerCase().includes(article.category.replace('-', ' '));
        if (!isCategoryMismatch) {
            return existing;
        }
    }
    const combinedContent = `${article.description} ${article.bodyExcerpt || ''}`.trim();
    // 2. Strict grounding gate: if content is too brief, avoid hallucination by rejecting early
    if (combinedContent.length < 80) {
        return {
            whyItMatters: null,
            chineseSummary: null,
            extractedSkills: article.subTags || [],
            technicalSignificance: 4,
            confidence: 'low',
            status: 'insufficient_content',
            modelVersion: MODEL_VERSION,
            promptVersion: PROMPT_VERSION,
            enrichedAt: new Date().toISOString(),
        };
    }
    const genAI = getGenAI();
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({
                model: MODEL_VERSION,
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1, // low temperature to strictly minimize hallucination
                },
            });
            const prompt = `${SYSTEM_INSTRUCTION}

ARTICLE DETAILS:
Title: ${article.cleanedTitle}
Source: ${article.sourceName} (${article.sourceDomain})
Category: ${article.category}
Description: ${article.description}
Body Excerpt: ${article.bodyExcerpt || 'Not available'}`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            const parsed = JSON.parse(rawText);
            // Schema and type validation
            const whyItMatters = typeof parsed.whyItMatters === 'string' && parsed.whyItMatters.trim().length > 10
                ? parsed.whyItMatters.trim()
                : null;
            const chineseSummary = typeof parsed.chineseSummary === 'string' && parsed.chineseSummary.trim().length > 5
                ? parsed.chineseSummary.trim()
                : null;
            const extractedSkills = Array.isArray(parsed.extractedSkills)
                ? parsed.extractedSkills.filter((s) => typeof s === 'string' && s.length < 35)
                : article.subTags || [];
            const technicalSignificance = typeof parsed.technicalSignificance === 'number'
                ? Math.max(1, Math.min(10, Math.round(parsed.technicalSignificance)))
                : 5;
            const confidence = ['high', 'medium', 'low'].includes(parsed.confidence)
                ? parsed.confidence
                : 'medium';
            const status = parsed.status === 'insufficient_content' || !whyItMatters
                ? 'insufficient_content'
                : 'enriched';
            return {
                whyItMatters,
                chineseSummary,
                extractedSkills,
                technicalSignificance,
                confidence,
                status,
                modelVersion: MODEL_VERSION,
                promptVersion: PROMPT_VERSION,
                enrichedAt: new Date().toISOString(),
            };
        }
        catch (err) {
            console.warn(`[Enrichment] Gemini enrichment failed for "${article.cleanedTitle}":`, err);
        }
    }
    // Grounded heuristic fallback (never invents ungrounded facts)
    const isDetailed = (article.bodyExcerpt?.length || 0) > 300 || article.description.length > 150;
    const subTags = article.subTags || [];
    return {
        whyItMatters: isDetailed
            ? `Relevant to engineers working in ${article.category.replace('-', ' ')} with focus on ${subTags.join(', ')}.`
            : null,
        chineseSummary: null,
        extractedSkills: subTags,
        technicalSignificance: isDetailed ? 6 : 4,
        confidence: isDetailed ? 'medium' : 'low',
        status: isDetailed ? 'enriched' : 'insufficient_content',
        modelVersion: 'heuristic-grounded',
        promptVersion: PROMPT_VERSION,
        enrichedAt: new Date().toISOString(),
    };
}
/**
 * Batch enrichment helper with idempotency check
 */
async function enrichBatch(articles, existingEnrichments = new Map(), concurrency = 3) {
    const results = new Map();
    const queue = [...articles];
    async function worker() {
        while (queue.length > 0) {
            const article = queue.shift();
            if (!article)
                break;
            const existing = existingEnrichments.get(article.id);
            const output = await enrichArticle(article, existing);
            results.set(article.id, output);
        }
    }
    const workers = Array.from({ length: Math.min(concurrency, articles.length) }, () => worker());
    await Promise.all(workers);
    return results;
}
//# sourceMappingURL=enrich.js.map