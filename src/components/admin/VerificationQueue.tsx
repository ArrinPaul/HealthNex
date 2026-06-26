"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Loader2, User } from "lucide-react";
import { useState } from "react";

export default function VerificationQueue() {
  const { user: currentUser, token } = useAuth();
  // Use specialized query for pending verifications
  const pendingUsers = useQuery(api.users.getPendingVerifications, token ? { token } : "skip");
  const verifyUser = useMutation(api.users.verifyUser);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!currentUser) return null;

  if (pendingUsers === undefined) {
    return <div className="p-12 text-center flex flex-col items-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
      <p className="text-sm text-muted-foreground">Fetching pending requests...</p>
    </div>;
  }

  const handleApprove = async (userId: string) => {
    if (!token) {
      toast.error("Auth Error", { description: "Session token missing." });
      return;
    }
    setLoadingId(userId);
    try {
      await (verifyUser as any)({
        token,
        targetUserId: userId,
        status: "verified",
      });
      toast.success("Professional Verified", { description: "User has been promoted to their requested role." });
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast.error("Verification Failed", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    if (!token) {
      toast.error("Auth Error", { description: "Session token missing." });
      return;
    }
    setLoadingId(userId);
    try {
      await (verifyUser as any)({
        token,
        targetUserId: userId,
        status: "rejected",
        adminNotes: "Does not meet professional criteria"
      });
      toast.info("Verification Rejected", { description: "The request has been rejected." });
    } catch (error: any) {
      console.error("Rejection failed:", error);
      toast.error("Action Failed", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  if (pendingUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-secondary/30 border border-dashed border-border rounded-2xl">
         <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-muted-foreground" />
         </div>
         <h3 className="text-sm font-semibold">Queue Clear</h3>
         <p className="text-xs text-muted-foreground mt-1">No pending verification requests at this time.</p>
      </div>
    );
  }

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
