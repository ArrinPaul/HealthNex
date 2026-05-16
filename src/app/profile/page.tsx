"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, MapPin, Shield, Save } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidation';

export default function ProfilePage() {
  const { user } = useAuth();
  // const { t } = useTranslation(); // Removed for SSR compatibility
  const t = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.location || '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    setLoading(true);
    
    // Validate password if it's being changed
    if (formData.newPassword) {
      const { isValid } = validatePassword(formData.newPassword);
      if (!isValid) {
        alert('Password does not meet the required criteria. Please check the requirements.');
        setLoading(false);
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        alert('Passwords do not match');
        setLoading(false);
        return;
      }
    }
    
    setTimeout(() => {
      setLoading(false);
      setEditing(false);
      alert('Profile updated successfully!');
      // Clear password fields after successful update
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }, 1000);
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30">Admin</Badge>;
      case 'health-worker':
        return <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30">Health Worker</Badge>;
      case 'community-user':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Community User</Badge>;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold">{t('profile')}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle>{user?.name}</CardTitle>
                  <div className="mt-2">{getRoleBadge()}</div>
                </div>
              </div>
              <Button 
                variant={editing ? "outline" : "default"}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t('location')}
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  className="mt-1"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('role')}
                </Label>
                <Input
                  id="role"
                  value={user?.role}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            </div>

            {editing && (
              <>
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Change Password</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="mt-1"
                        placeholder="••••••••"
                      />
                      <PasswordStrengthIndicator password={formData.newPassword} />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="mt-1"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? t('loading') : t('save')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-card/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Reports Submitted</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-card/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-card/50">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Months Active</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}