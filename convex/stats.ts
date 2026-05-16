import { query } from "./_generated/server";

export const getLandingPageStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const reports = await ctx.db.query("communityReports").collect();
    const healthData = await ctx.db.query("healthData").collect();
    const alerts = await ctx.db.query("alerts").collect();
    const outbreaks = await ctx.db.query("diseaseOutbreaks").collect();
    
    // Calculate total data nodes (users + reports + healthData + outbreaks)
    const totalDataNodes = users.length + reports.length + healthData.length + outbreaks.length;
    
    return {
      dataNodes: totalDataNodes,
      alertsSent: alerts.length,
      accuracy: 99.9, // This remains a performance target
      latency: "<1s", // System architecture baseline
      activeUsers: users.length,
      communityReports: reports.length,
    };
  },
});
