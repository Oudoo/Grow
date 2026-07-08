import { type Connector } from "./types.js";
/**
 * Google Ads connector — REST searchStream with GAQL.
 * Credentials: { refreshToken, customerId?, loginCustomerId? }.
 * Requires GOOGLE_ADS_DEVELOPER_TOKEN + platform Google OAuth app.
 */
export declare const googleAdsConnector: Connector;
/**
 * TikTok Marketing API connector. Credentials: { accessToken }.
 * externalAccountId = advertiser_id.
 */
export declare const tiktokConnector: Connector;
/**
 * LinkedIn Marketing API connector. Credentials: { accessToken, refreshToken? }.
 * externalAccountId = sponsored ad account URN id (numeric).
 */
export declare const linkedinConnector: Connector;
/**
 * X (Twitter) Ads API connector. Credentials: { accessToken, accessTokenSecret }
 * via OAuth 2.0 bearer where available. externalAccountId = ads account id.
 */
export declare const xConnector: Connector;
//# sourceMappingURL=ads-platforms.d.ts.map