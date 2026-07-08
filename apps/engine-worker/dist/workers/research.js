import { randomUUID } from "node:crypto";
import { db, knowledgeDocuments, } from "@growengine/db";
import { createPollWorker, QUEUE_NAMES, crawlSite, searchMentions, aiComplete, indexEntity, } from "@growengine/core";
import { markJobStatus } from "../lib/track.js";
/**
 * Research Worker — competitor analysis and open-web monitoring built on
 * direct fetch + Cheerio + RSS (near-zero licensing cost; ScraperAPI only
 * as configured fallback inside the crawler).
 */
async function handleCompetitorAnalysis(data) {
    const { competitorUrl, competitorName } = data.input;
    const pages = await crawlSite(competitorUrl, 8);
    const mentions = await searchMentions(competitorName);
    const ctx = {
        tenantId: data.tenantId,
        clientId: data.clientId,
        feature: "competitor_analysis",
    };
    const markdown = await aiComplete(`You are a competitive intelligence analyst. Produce a competitor analysis in markdown for "${competitorName}".

LIVE SITE CRAWL (${pages.length} pages):
${JSON.stringify(pages.map((p) => ({
        url: p.url,
        title: p.title,
        metaDescription: p.metaDescription,
        headings: p.headings.slice(0, 10),
        wordCount: p.wordCount,
    })))}

RECENT PRESS/NEWS MENTIONS (RSS, real):
${JSON.stringify(mentions.slice(0, 15))}

Sections: Positioning & Messaging, Product/Service Focus, Content Strategy Signals, Recent News & PR, Implications For Us. Ground every statement in the crawl or the mentions; cite URLs inline.`, ctx, { maxTokens: 5000 });
    const docId = randomUUID();
    await db.insert(knowledgeDocuments).values({
        id: docId,
        tenantId: data.tenantId,
        clientId: data.clientId ?? null,
        type: "research",
        title: `Competitor Analysis — ${competitorName} — ${new Date().toISOString().slice(0, 10)}`,
        contentMarkdown: markdown,
        tags: ["competitor", competitorName],
    });
    try {
        await indexEntity({
            tenantId: data.tenantId,
            clientId: data.clientId ?? null,
            entityType: "knowledge_document",
            entityId: docId,
            text: markdown,
        }, ctx);
    }
    catch {
        /* embeddings optional */
    }
    return { documentId: docId, pagesCrawled: pages.length, mentions: mentions.length };
}
async function handlePrMentions(data) {
    const { query, feeds } = data.input;
    const mentions = await searchMentions(query, feeds ?? []);
    if (mentions.length === 0)
        return { mentions: 0 };
    const docId = randomUUID();
    await db.insert(knowledgeDocuments).values({
        id: docId,
        tenantId: data.tenantId,
        clientId: data.clientId ?? null,
        type: "research",
        title: `PR Mentions — "${query}" — ${new Date().toISOString().slice(0, 10)}`,
        contentMarkdown: mentions
            .map((m) => `- [${m.title}](${m.link}) — ${m.source}${m.publishedAt ? ` (${m.publishedAt.slice(0, 10)})` : ""}\n  ${m.snippet}`)
            .join("\n"),
        tags: ["pr_mentions", query],
    });
    return { documentId: docId, mentions: mentions.length };
}
async function handleWebCrawl(data) {
    const { url, maxPages } = data.input;
    const pages = await crawlSite(url, maxPages ?? 10);
    return {
        pagesCrawled: pages.length,
        pages: pages.map((p) => ({ url: p.url, title: p.title, wordCount: p.wordCount })),
    };
}
export function createResearchWorker() {
    return createPollWorker(QUEUE_NAMES.research, async (job) => {
        await markJobStatus(job, "active");
        switch (job.data.operation) {
            case "competitor_analysis":
                return handleCompetitorAnalysis(job.data);
            case "pr_mentions":
            case "rss_monitor":
                return handlePrMentions(job.data);
            case "web_crawl":
                return handleWebCrawl(job.data);
        }
    });
}
//# sourceMappingURL=research.js.map