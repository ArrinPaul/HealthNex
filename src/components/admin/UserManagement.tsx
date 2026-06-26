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
import { ROLE_HIERARCHY } from "../../../convex/roles";

export default function UserManagement() {
  const { user: currentUser, token } = useAuth();
  const users = useQuery(api.users.getAllUsers, token ? { token } : "skip");
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!currentUser) return null;

  if (users === undefined) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Synchronizing with protocol...</p>
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
      await updateUserRole({
        token,
        targetUserId: targetUserId as any,
        newRole
      });
      toast.success("Role Updated", { description: "User permissions have been updated in the protocol." });
    } catch (error: any) {
      console.error("Role update failed:", error);
      toast.error("Update Failed", { description: error.message || "Failed to update user role." });
    } finally {
      setLoadingId(null);
    }
  };

  const getAvailableRoles = (targetUser: any) => {
    if (targetUser.role === 'super-admin') return [];
    
    const currentUserLevel = ROLE_HIERARCHY[currentUser.role as keyof typeof ROLE_HIERARCHY] || 0;
    const targetUserLevel = ROLE_HIERARCHY[targetUser.role as keyof typeof ROLE_HIERARCHY] || 0;

    if (currentUser.role === 'super-admin') {
      return Object.keys(ROLE_HIERARCHY);
    }

    if (currentUserLevel > targetUserLevel) {
      return Object.entries(ROLE_HIERARCHY)
        .filter(([, level]) => level < currentUserLevel)
        .map(([role]) => role);
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
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((u: any) => {
            const availableRoles = getAvailableRoles(u);
            const canEdit = availableRoles.length > 0 && u._id !== currentUser.id;

            return (
              <div key={u._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-secondary border border-border hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    {getRoleIcon(u.role)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{u.name}</h4>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.requestedRole && u.requestedRole !== u.role && (
                      <p className="text-xs text-amber-500 mt-1">
                        Requested: {u.requestedRole.replace('-', ' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block mr-4">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium">{format(u.createdAt, 'MMM d, yyyy')}</p>
                  </div>
                  
                  {canEdit ? (
                    <Select 
                      disabled={loadingId === u._id} 
                      value={u.role} 
                      onValueChange={(val) => handleRoleChange(u._id, val)}
                    >
                      <SelectTrigger className="w-36 rounded-xl bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map(r => (
                          <SelectItem key={r} value={r} className="text-sm capitalize">
                            {r.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-xs capitalize bg-secondary">
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
