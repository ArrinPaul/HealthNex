"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Shield, User as UserIcon, Activity, Globe, Loader2, 
  Search, Users, UserCheck, AlertTriangle, Key, Calendar, Mail,
  CheckCircle, ArrowUpRight, BarChart3, Fingerprint, Lock
} from "lucide-react";
import { useState } from "react";
import { ROLE_HIERARCHY, ROLES } from "../../../convex/roles";
import type { UserRole } from "../../../convex/roles";
import { motion, AnimatePresence } from "framer-motion";

export default function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const users = useQuery(api.users.getAllUsers, token ? { token } : "skip");
  const updateUserRole = useMutation(api.users.updateUserRole);
  
  // UI states
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  if (!currentUser) return null;

  if (users === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground font-mono">Synchronizing protocol database...</p>
      </div>
    );
  }

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!token) {
      toast.error("Auth Error", { description: "Your session token is missing. Please re-login." });
      return;
    }

    setLoadingId(targetUserId);
    
    try {
      await (updateUserRole as any)({
        token,
        targetUserId: targetUserId,
        newRole
      });
      toast.success("Security Role Transferred", { description: "User permission payload updated successfully." });
    } catch (error: any) {
      console.error("Role update failed:", error);
      toast.error("Update Failed", { description: error.message || "Failed to update user role." });
    } finally {
      setLoadingId(null);
    }
  };

  const getAvailableRoles = (targetUser: any) => {
    // Admin is the top tier — an admin can reassign anyone, including other admins.
    if (currentUser.role === ROLES.ADMIN) {
      return Object.values(ROLES);
    }

    const currentUserLevel = ROLE_HIERARCHY[currentUser.role as UserRole] || 0;

    return Object.entries(ROLE_HIERARCHY)
      .filter(([, level]) => level < currentUserLevel)
      .map(([role]) => role);
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case ROLES.ADMIN: return <Shield className="w-4 h-4 text-violet-500" />;
      case ROLES.HEALTH_WORKER: return <Activity className="w-4 h-4 text-emerald-500" />;
      case ROLES.PUBLIC_USER: return <UserIcon className="w-4 h-4 text-sky-400" />;
      default: return <Globe className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case ROLES.ADMIN: return 'bg-violet-500/10 text-violet-500 border-violet-500/30';
      case ROLES.HEALTH_WORKER: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case ROLES.PUBLIC_USER: return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default: return 'bg-secondary text-muted-foreground border-border/80';
    }
  };

  // Metric aggregates
  const totalUsers = users.length;
  const adminCount = users.filter((u: any) => u.role === ROLES.ADMIN).length;
  const workerCount = users.filter((u: any) => u.role === ROLES.HEALTH_WORKER).length;
  const communityCount = users.filter((u: any) => u.role === ROLES.PUBLIC_USER).length;
  const pendingRequests = users.filter((u: any) => u.requestedRole && u.requestedRole !== u.role).length;

  const adminPercent = totalUsers ? (adminCount / totalUsers) * 100 : 0;
  const workerPercent = totalUsers ? (workerCount / totalUsers) * 100 : 0;
  const communityPercent = totalUsers ? (communityCount / totalUsers) * 100 : 0;

  // Filtered list
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 text-left relative">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-subtle" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Verification Alerts Row */}
      {pendingRequests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-400 flex items-start gap-3 shadow-md shadow-amber-500/5"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-bounce-subtle" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Sentinel Role Requests Pending Verification</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              There are currently <strong className="text-amber-400 font-bold">{pendingRequests}</strong> users requesting role promotion levels in the directory. Review their profiles below to approve or adjust permissions.
            </p>
          </div>
        </motion.div>
      )}

      {/* Grid Dashboard Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-4 border-b border-border/40">
        {/* Total Users */}
        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Total Node Connections</span>
          </div>
          <h3 className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-primary">{totalUsers}</h3>
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest opacity-80">Active nodes syncing telemetry</p>
        </div>

        {/* Administrators */}
        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Security Officers</span>
          </div>
          <h3 className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-violet-500">{adminCount}</h3>
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest opacity-80">Full system authority</p>
        </div>

        {/* Medical Workers */}
        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Medical Officers</span>
          </div>
          <h3 className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-emerald-500">{workerCount}</h3>
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest opacity-80">Verifying outbreak datasets</p>
        </div>

        {/* Node Verification Level */}
        <div className="space-y-2 group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fingerprint className={`w-4 h-4 ${pendingRequests > 0 ? 'text-amber-500 animate-pulse' : ''}`} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Role Requests</span>
          </div>
          <h3 className="text-4xl font-light tracking-tight text-foreground transition-colors group-hover:text-amber-500">{pendingRequests}</h3>
          <p className="text-[9px] text-muted-foreground uppercase font-mono tracking-widest opacity-80">Awaiting permission updates</p>
        </div>
      </div>

      {/* Role Distribution visual statistics */}
      <div className="py-6 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-primary" /> Role Distribution Breakdown
          </h4>
          <span className="font-mono text-muted-foreground/80">{totalUsers} Total Registered Nodes</span>
        </div>
        
        {/* Segmented Progress Bar */}
        <div className="h-2 w-full rounded-full bg-secondary flex overflow-hidden">
          <div style={{ width: `${adminPercent}%` }} className="bg-violet-500 transition-all duration-500" title={`Admins: ${adminCount}`} />
          <div style={{ width: `${workerPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`Health Workers: ${workerCount}`} />
          <div style={{ width: `${communityPercent}%` }} className="bg-sky-400 transition-all duration-500" title={`Public Users: ${communityCount}`} />
        </div>

        {/* Color Indicators Legend */}
        <div className="flex items-center gap-6 flex-wrap pt-2 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2 text-violet-500">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Admin ({adminCount})
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Health-Worker ({workerCount})
          </div>
          <div className="flex items-center gap-2 text-sky-400">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Public-User ({communityCount})
          </div>
        </div>
      </div>

      {/* Main Operations Block */}
      <Card className="bg-card/65 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-secondary/15 py-4 px-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" /> Identity Access Registry
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Audit credentials and dispatch cryptographic authority permissions across sentinel nodes
              </CardDescription>
            </div>
            
            {/* Search and Filters Toolbar */}
            <div className="flex items-center gap-3.5 flex-wrap lg:flex-nowrap">
              <div className="relative w-full lg:w-60">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search by name/email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-xs rounded-xl bg-secondary/40 border-border/60 focus:ring-1 focus:ring-primary font-semibold placeholder:text-muted-foreground/50"
                />
                {searchQuery && (
                  <Badge className="absolute right-2.5 top-2.5 text-[8px] bg-secondary border border-border/50 text-foreground py-0.5 px-1.5">
                    Found: {filteredUsers.length}
                  </Badge>
                )}
              </div>

              {/* Filtering Chips */}
              <div className="flex bg-secondary/40 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                    roleFilter === "all"
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({totalUsers})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter(ROLES.ADMIN)}
                  className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                    roleFilter === ROLES.ADMIN
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Admins ({adminCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter(ROLES.HEALTH_WORKER)}
                  className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                    roleFilter === ROLES.HEALTH_WORKER
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Medical ({workerCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter(ROLES.PUBLIC_USER)}
                  className={`px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md transition-all ${
                    roleFilter === ROLES.PUBLIC_USER
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Public ({communityCount})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 max-h-[580px] overflow-y-auto pr-0.5 scrollbar-thin">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((u: any) => {
                const availableRoles = getAvailableRoles(u);
                const canEdit = availableRoles.length > 0 && u._id !== currentUser.id;
                const hasPendingRequest = u.requestedRole && u.requestedRole !== u.role;

                return (
                  <motion.div
                    key={u._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/40 transition-all border-l-2 border-transparent hover:border-primary/50 text-left"
                  >
                    {/* Left Details block */}
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Holographic Role Icon Container */}
                      <div className="relative group shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border/60 mt-0.5">
                          {getRoleIcon(u.role)}
                        </div>
                        {/* Active Green Dot Indicator */}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-card"></span>
                        </span>
                      </div>
                      
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground tracking-tight">{u.name}</h4>
                          <Badge variant="outline" className={`text-[8px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(u.role)}`}>
                            {u.role.replace('-', ' ')}
                          </Badge>
                          
                          {hasPendingRequest && (
                            <Badge className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse-subtle">
                              Requested Role: {u.requestedRole.replace('-', ' ')}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 text-[10px] text-muted-foreground/80 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground/50" /> {u.email}
                          </span>
                          <span className="hidden sm:inline opacity-30">|</span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" /> Registered: {format(u.createdAt, 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Controls Block */}
                    <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                      {canEdit ? (
                        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-xl border border-border/80 hover:border-primary/30 transition-colors shadow-sm">
                          <span className="text-[9px] font-extrabold uppercase text-muted-foreground/60 tracking-wider pl-1 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5" /> Reassign
                          </span>
                          <select
                            disabled={loadingId === u._id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="h-8 rounded-lg bg-card border border-border px-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary outline-none cursor-pointer hover:border-primary/50 transition-all"
                          >
                            <option value={u.role} disabled>Choose authority level...</option>
                            {availableRoles.map(r => (
                              <option key={r} value={r}>
                                {r.replace('-', ' ').toUpperCase()}
                              </option>
                            ))}
                          </select>
                          {loadingId === u._id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                          )}
                        </div>
                      ) : (
                        <div className="text-right flex items-center gap-1.5 bg-secondary/25 py-1.5 px-3 rounded-lg border border-border/40">
                          <CheckCircle className="w-3 h-3 text-muted-foreground/60" />
                          <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-wider">
                            Immutable Permission Node
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center justify-center opacity-40">
                  <UserIcon className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No sentinel nodes matched search parameters</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
