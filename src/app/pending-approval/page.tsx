"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Clock, Mail, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">Account Pending Approval</h1>
            <p className="text-sm text-muted-foreground">
              Hi <span className="font-medium text-foreground">{user?.name}</span>, your account has been created and onboarding is complete.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">Admin Approval Required</p>
                <p className="text-xs text-muted-foreground">
                  An administrator needs to approve your account before you can access the dashboard. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">What happens next?</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive access to disease surveillance, health data entry, and community reporting once approved. In the meantime, you can access health education resources.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={() => router.push('/education')}>
              Browse Health Education
            </Button>
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
