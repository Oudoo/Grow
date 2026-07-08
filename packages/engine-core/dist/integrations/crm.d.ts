import { type Connector } from "./types.js";
/**
 * CRM connectors — pull funnel facts (leads created, deals won/lost,
 * pipeline value) that power the Process Intelligence Engine and the
 * non-marketing Business Advisory layer.
 */
/** Zoho CRM. Credentials: { accessToken, refreshToken, clientId, clientSecret, apiDomain?, accountsDomain? } */
export declare const zohoCrmConnector: Connector;
/** HubSpot. Credentials: { accessToken } (private app token). */
export declare const hubspotConnector: Connector;
/** Salesforce. Credentials: { accessToken, refreshToken?, instanceUrl, clientId?, clientSecret? } */
export declare const salesforceConnector: Connector;
/** Microsoft Dynamics 365. Credentials: { accessToken, refreshToken?, orgUrl, tenantId?, clientId?, clientSecret? } */
export declare const dynamicsConnector: Connector;
/** Odoo. Credentials: { baseUrl, database, username, apiKey } — JSON-RPC. */
export declare const odooConnector: Connector;
//# sourceMappingURL=crm.d.ts.map