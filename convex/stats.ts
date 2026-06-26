import { query } from "./_generated/server";
import { v } from "convex/values";
import { queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

export const getLandingPageStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(1000);
    const reports = await ctx.db.query("communityReports").take(1000);
    const healthData = await ctx.db.query("healthData").take(1000);
    const alerts = await ctx.db.query("alerts").take(1000);
    const outbreaks = await ctx.db.query("diseaseOutbreaks").take(1000);
    
    const totalDataNodes = users.length + reports.length + healthData.length + outbreaks.length;
    
    return {
      dataNodes: totalDataNodes,
      alertsSent: alerts.length,
      activeUsers: users.length,
      communityReports: reports.length,
    };
  },
});

export const getDashboardAggregates = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN && user.role !== ROLES.HEALTH_WORKER && user.role !== ROLES.COMMUNITY_USER)) {
      throw new Error("Unauthorized: Only admins, health workers and community users can view dashboard aggregates");
    }

    const outbreaks = await ctx.db.query("diseaseOutbreaks").take(500);
    const reports = await ctx.db.query("communityReports").take(500);
    const healthData = await ctx.db.query("healthData").take(500);
    const waterQuality = await ctx.db.query("waterQuality").take(500);
    const alerts = await ctx.db.query("alerts").take(500);
    const users = await ctx.db.query("users").take(500);

    // 1. Distribution by category (Outbreaks + Reports)
    const distribution: Record<string, number> = {
      Waterborne: outbreaks.filter((o: any) => o.disease.toLowerCase().includes('water') || o.disease.toLowerCase().includes('cholera')).length + reports.filter((r: any) => r.category === 'water').length,
      Vector: outbreaks.filter((o: any) => o.disease.toLowerCase().includes('malaria') || o.disease.toLowerCase().includes('dengue')).length,
      Respiratory: outbreaks.filter((o: any) => o.disease.toLowerCase().includes('flu') || o.disease.toLowerCase().includes('covid')).length + reports.filter((r: any) => r.category === 'outbreak').length,
      Environmental: reports.filter((r: any) => r.category === 'environmental').length + waterQuality.filter((w: any) => w.quality === 'poor').length,
    };

    // 2. Trend Data (Last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = months[d.getMonth()];
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();

      const count = outbreaks.filter((o: any) => o.timestamp >= startOfMonth && o.timestamp <= endOfMonth).length +
                    reports.filter((r: any) => r.createdAt >= startOfMonth && r.createdAt <= endOfMonth).length;
      
      last6Months.push({
        month: monthLabel,
        actual: count,
      });
    }

    // 3. Stats for StatsGrid
    const totalCases = outbreaks.reduce((acc: number, o: any) => acc + (o.confirmedCases || 0), 0);
    const activeAlerts = alerts.filter((a: any) => a.isActive).length;
    const aiInsightsCount = outbreaks.filter((o: any) => o.severity === 'critical' || o.severity === 'high').length;

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
