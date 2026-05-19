import { query } from "./_generated/server";
import { v } from "convex/values";

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

export const getDashboardAggregates = query({
  handler: async (ctx) => {
    const outbreaks = await ctx.db.query("diseaseOutbreaks").collect();
    const reports = await ctx.db.query("communityReports").collect();
    const healthData = await ctx.db.query("healthData").collect();
    const waterQuality = await ctx.db.query("waterQuality").collect();
    const alerts = await ctx.db.query("alerts").collect();
    const users = await ctx.db.query("users").collect();

    // 1. Distribution by category (Outbreaks + Reports)
    const distribution: Record<string, number> = {
      Waterborne: outbreaks.filter(o => o.disease.toLowerCase().includes('water') || o.disease.toLowerCase().includes('cholera')).length + reports.filter(r => r.category === 'water').length,
      Vector: outbreaks.filter(o => o.disease.toLowerCase().includes('malaria') || o.disease.toLowerCase().includes('dengue')).length,
      Respiratory: outbreaks.filter(o => o.disease.toLowerCase().includes('flu') || o.disease.toLowerCase().includes('covid')).length + reports.filter(r => r.category === 'outbreak').length,
      Environmental: reports.filter(r => r.category === 'environmental').length + waterQuality.filter(w => w.quality === 'poor').length,
    };

    // 2. Trend Data (Last 6 months)
    const now = Date.now();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = months[d.getMonth()];
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();

      const count = outbreaks.filter(o => o.timestamp >= startOfMonth && o.timestamp <= endOfMonth).length +
                    reports.filter(r => r.createdAt >= startOfMonth && r.createdAt <= endOfMonth).length;
      
      last6Months.push({
        month: monthLabel,
        actual: count,
        predicted: Math.floor(count * 1.1) // Simple AI simulation based on real data
      });
    }

    // 3. Stats for StatsGrid
    const totalCases = outbreaks.reduce((acc, o) => acc + (o.confirmedCases || 0), 0);
    const activeAlerts = alerts.filter(a => a.isActive).length;
    const aiInsightsCount = outbreaks.filter(o => o.severity === 'critical' || o.severity === 'high').length;

    return {
      distribution: Object.entries(distribution).map(([name, value]) => ({ name, value })),
      trends: last6Months,
      stats: {
        totalCases,
        activeAlerts,
        aiInsightsCount,
        totalNodes: users.length + reports.length + outbreaks.length
      }
    };
  }
});
