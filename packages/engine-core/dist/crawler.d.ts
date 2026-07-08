export interface CrawledPage {
    url: string;
    status: number;
    title: string | null;
    metaDescription: string | null;
    headings: {
        level: number;
        text: string;
    }[];
    /** Visible body text, whitespace-normalized */
    text: string;
    /** Parsed JSON-LD blocks */
    structuredData: unknown[];
    /** Microdata/RDFa itemtype values found */
    schemaTypes: string[];
    links: string[];
    wordCount: number;
}
export declare function fetchPage(url: string): Promise<CrawledPage>;
/**
 * Same-domain breadth-first crawl with politeness delay, honoring robots
 * "Disallow: /" at minimum.
 */
export declare function crawlSite(startUrl: string, maxPages?: number, delayMs?: number): Promise<CrawledPage[]>;
export interface FeedMention {
    source: string;
    title: string;
    link: string;
    publishedAt: string | null;
    snippet: string;
}
/** Monitor RSS feeds (incl. Google News RSS) for brand/competitor mentions. */
export declare function searchMentions(query: string, extraFeeds?: string[]): Promise<FeedMention[]>;
//# sourceMappingURL=crawler.d.ts.map