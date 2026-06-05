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
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-2">
         <ShieldCheck className="w-5 h-5 text-amber-500" />
         <h2 className="text-xl font-bold uppercase tracking-tight">Institutional Onboarding Queue</h2>
         <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{pendingUsers.length} Pending</Badge>
      </div>

      <div className="grid gap-4">
        {pendingUsers.map((u: any) => (
          <Card key={u._id} className="backdrop-blur-xl bg-amber-500/5 border-amber-500/20 shadow-lg overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{u.name}</h4>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Badge variant="outline" className="text-[9px] uppercase font-bold border-amber-500/30 text-amber-600">
                          Requesting: {u.requestedRole.replace('-', ' ')}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <Button variant="ghost" className="h-12 gap-2 text-muted-foreground hover:text-rose-500" onClick={() => handleReject(u._id)}>
                      <X className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Dismiss</span>
                   </Button>
                   <Button className="h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl shadow-lg shadow-emerald-500/20" onClick={() => handleApprove(u._id)}>
                      <Check className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">Approve Credentials</span>
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
