import bizSdk from "facebook-nodejs-business-sdk";

// Define simpler return types
export interface AdAccount {
  id: string;
  name: string;
}

export interface AdDataRow {
  date_start: string;
  date_stop: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
}

/**
 * Initializes the Facebook Business SDK with the user's mapped FB token.
 */
export async function initFacebookApi(accessToken: string) {
  bizSdk.FacebookAdsApi.init(accessToken);
}

/**
 * Fetch ad accounts for the authenticated user.
 */
export async function getAdAccounts(accessToken: string): Promise<AdAccount[]> {
  const api = bizSdk.FacebookAdsApi.init(accessToken);
  
  // Note: Using raw fetch because bizSdk typed 'User' methods can be complex.
  const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name&access_token=${accessToken}`);
  const data = await res.json();
  
  if (data.error) throw new Error(data.error.message);
  return data.data || [];
}

/**
 * Fetch Insights (Metrics) for an ad account over a date preset.
 */
export async function getAdInsights(
  accessToken: string,
  accountId: string, // Format: 'act_123456789'
  datePreset: string = 'last_7d',
  level: string = 'campaign'
): Promise<AdDataRow[]> {
  // Using direct fetch for a simpler implementation instead of SDK classes
  const url = new URL(`https://graph.facebook.com/v19.0/${accountId}/insights`);
  url.searchParams.append("access_token", accessToken);
  url.searchParams.append("level", level);
  url.searchParams.append("date_preset", datePreset);
  url.searchParams.append("time_increment", "1"); // Daily breakdown
  url.searchParams.append("fields", "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,reach,frequency,cpc,cpm,cpp,ctr,date_start,date_stop,inline_link_clicks,cost_per_inline_link_click,canvas_avg_view_time,canvas_avg_view_percent,actions,video_avg_time_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions");

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);
  
  if (data.data && data.data.length > 0) {
    console.log("Raw FB Insights (first row):", JSON.stringify(data.data[0]));
  }

  return (data.data || []) as AdDataRow[];
}
