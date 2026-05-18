"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Shield, User, Activity, Globe, Loader2 } from "lucide-react";
import { useState } from "react";

export default function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const users = useQuery(api.users.getAllUsers, token ? { token } : "skip");
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!users || !currentUser) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!token) return;
    setLoadingId(targetUserId);
    try {
      await updateUserRole({
        token,
        targetUserId: targetUserId as any,
        newRole
      });
      toast.success("Role Updated", { description: "User permissions have been updated in the protocol." });
      // Note: If the user changed their own role to a lower tier, they will lose access on next session refresh.
    } catch (error: any) {
      toast.error("Update Failed", { description: error.message || "Failed to update user role." });
    } finally {
      setLoadingId(null);
    }
  };

  const getAvailableRoles = (targetRole: string) => {
    if (targetRole === 'super-admin') return []; // Nobody can change a super-admin
    
    if (currentUser.role === 'super-admin') {
      return ['super-admin', 'admin', 'health-worker', 'community-user', 'public'];
    } else if (currentUser.role === 'admin') {
      return ['health-worker', 'community-user', 'public']; // Admin can only manage below admin
    } else if (currentUser.role === 'health-worker') {
      return ['community-user', 'public']; // Health worker manages community and public
    }
    return [];
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'super-admin': return <Shield className="w-4 h-4 text-rose-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-violet-500" />;
      case 'health-worker': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'community-user': return <User className="w-4 h-4 text-sky-400" />;
      default: return <Globe className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold uppercase tracking-tight">Network Personnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((u: any) => {
            const availableRoles = getAvailableRoles(u.role);
            const canEdit = availableRoles.length > 0 && u._id !== currentUser.id; // Usually shouldn't edit self, but can if needed. Let's prevent editing self here to avoid immediate lockouts.

            return (
              <div key={u._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)] hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                    {getRoleIcon(u.role)}
                  </div>
                  <div>
                    <h4 className="font-bold tracking-tight text-lg">{u.name}</h4>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    {u.requestedRole && u.requestedRole !== u.role && (
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                        Requested: {u.requestedRole.replace('-', ' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block mr-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Joined</p>
                    <p className="text-sm font-medium">{format(u.createdAt, 'MMM d, yyyy')}</p>
                  </div>
                  
                  {canEdit ? (
                    <Select 
                      disabled={loadingId === u._id} 
                      value={u.role} 
                      onValueChange={(val) => handleRoleChange(u._id, val)}
                    >
                      <SelectTrigger className="w-40 rounded-xl bg-[var(--surface-2)] border-[var(--border-soft)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(r => (
                          <SelectItem key={r} value={r} className="uppercase tracking-widest text-[10px] font-bold">
                            {r.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="px-4 py-2 rounded-xl uppercase tracking-widest text-[10px] font-bold bg-[var(--surface-2)]">
                      {u.role.replace('-', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
