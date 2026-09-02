"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function UsageStats() {
  const { token } = useAuth();
  const stats = useQuery(api.usage.getUsageStats as any, token ? { token, days: 30 } : "skip");

  if (!stats) {
    return <div className="text-muted-foreground text-sm font-medium">Loading usage telemetry...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">API Calls (30d)</span>
          </div>
          <div className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-primary">
            {stats.totalCalls}
          </div>
        </div>

        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Success Rate</span>
          </div>
          <div className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-emerald-500">
            {stats.totalCalls > 0 
              ? `${Math.round((stats.successCount / stats.totalCalls) * 100)}%` 
              : "0%"}
          </div>
        </div>

        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Errors</span>
          </div>
          <div className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-rose-500">
            {stats.errorCount}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border/40">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Usage by Feature</h3>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
          {Object.entries(stats.byFeature as Record<string, number>).map(([feature, count]) => (
            <div key={feature} className="flex items-center justify-between group">
              <span className="text-sm font-medium capitalize text-foreground/80 group-hover:text-foreground transition-colors">{feature.replace(/_/g, ' ')}</span>
              <span className="text-sm font-mono font-medium text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
