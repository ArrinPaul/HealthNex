"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, FileText, Check, X, Loader2, User } from "lucide-react";
import { useState } from "react";

export default function VerificationQueue() {
  const { user: currentUser, token } = useAuth();
  // Use specialized query for pending verifications
  const pendingUsers = useQuery(api.users.getPendingVerifications, token ? { token } : "skip");
  const verifyUser = useMutation(api.users.verifyUser);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!pendingUsers) {
    return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
  }

  const handleApprove = async (userId: string) => {
    if (!token) return;
    setLoadingId(userId);
    try {
      await verifyUser({
        token,
        targetUserId: userId as any,
        status: "verified",
      });
      toast.success("Professional Verified", { description: "User has been promoted to their requested role." });
    } catch (error: any) {
      toast.error("Verification Failed", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!token) return;
    setLoadingId(userId);
    try {
      await verifyUser({
        token,
        targetUserId: userId as any,
        status: "rejected",
        adminNotes: "Does not meet professional criteria"
      });
      toast.info("Verification Rejected", { description: "The request has been rejected." });
    } catch (error: any) {
      toast.error("Action Failed", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  if (pendingUsers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
         <h2 className="text-lg font-semibold">Pending Verifications</h2>
         <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-medium">{pendingUsers.length}</span>
      </div>

      <div className="grid gap-4">
        {pendingUsers.map((u: any) => (
          <div key={u._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold">{u.name}</h4>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                <span className="text-xs text-amber-600 mt-1 inline-block">
                  Requesting: {u.requestedRole.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500" onClick={() => handleReject(u._id)}>
                  <X className="w-4 h-4 mr-1" />
                  Reject
               </Button>
               <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4" onClick={() => handleApprove(u._id)}>
                  <Check className="w-4 h-4 mr-1" />
                  Approve
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
