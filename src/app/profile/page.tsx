"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, MapPin, Shield, Save, Phone, Calendar, Activity, FileText, Bell, Edit3, X, Check } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PasswordStrengthIndicator from '@/components/ui/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
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
    
    if (formData.newPassword) {
      const { isValid } = validatePassword(formData.newPassword);
      if (!isValid) {
        toast.error('Password does not meet the required criteria.');
        setLoading(false);
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Passwords do not match.');
        setLoading(false);
        return;
      }
    }
    
    setTimeout(() => {
      setLoading(false);
      setEditing(false);
      toast.success('Profile updated successfully!');
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }, 1000);
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'super-admin':
        return <Badge className="bg-red-500/15 text-red-400 border border-red-500/25 text-[10px] font-bold uppercase tracking-wider">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-violet-500/15 text-violet-400 border border-violet-500/25 text-[10px] font-bold uppercase tracking-wider">Admin</Badge>;
      case 'health-worker':
        return <Badge className="bg-sky-500/15 text-sky-400 border border-sky-500/25 text-[10px] font-bold uppercase tracking-wider">Health Worker</Badge>;
      case 'community-user':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold uppercase tracking-wider">Community User</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider">User</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
        {/* Ambient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Account Settings</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Profile</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage your account information and preferences</p>
          </div>
          
          <div className="flex items-center gap-2">
            {!editing ? (
              <Button 
                onClick={() => setEditing(true)}
                className="h-9 px-4 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => { setEditing(false); setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' })); }}
                  variant="outline"
                  className="h-9 px-3 rounded-xl text-[11px] font-semibold border-border/60 hover:bg-secondary/80 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="h-9 px-4 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/10" />
              <div className="px-6 pb-5">
                <div className="flex items-end gap-4 -mt-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-cyan-400 text-white flex items-center justify-center rounded-2xl font-bold text-2xl shadow-lg shadow-primary/30 border-4 border-card">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-card rounded-full shadow-sm" />
                  </div>
                  <div className="flex-1 pb-1">
                    <h2 className="text-xl font-black text-foreground">{user?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                      <span className="text-border">•</span>
                      {getRoleBadge()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
            <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editing}
                    className="h-10 bg-secondary/50 border-border/60 text-sm font-medium disabled:opacity-60 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!editing}
                    className="h-10 bg-secondary/50 border-border/60 text-sm font-medium disabled:opacity-60 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!editing}
                    className="h-10 bg-secondary/50 border-border/60 text-sm font-medium disabled:opacity-60 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    className="h-10 bg-secondary/50 border-border/60 text-sm font-medium disabled:opacity-60 focus:ring-primary/30"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Role
                  </Label>
                  <div className="h-10 bg-secondary/30 border border-border/40 rounded-md px-3 flex items-center text-sm font-medium text-muted-foreground">
                    {user?.role?.replace('-', ' ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Member Since
                  </Label>
                  <div className="h-10 bg-secondary/30 border border-border/40 rounded-md px-3 flex items-center text-sm font-medium text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password Section */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg">
              <CardHeader className="border-b border-border/60 bg-secondary/20 py-4 px-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <CardTitle className="text-sm font-bold text-foreground">Change Password</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="h-10 bg-secondary/50 border-border/60 text-sm font-medium focus:ring-primary/30"
                      placeholder="••••••••"
                    />
                    <PasswordStrengthIndicator password={formData.newPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-10 bg-secondary/50 border-border/60 text-sm font-medium focus:ring-primary/30"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground">12</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Reports Submitted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground">5</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Active Alerts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-lg hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-foreground">3</div>
                    <div className="text-[11px] text-muted-foreground font-medium">Months Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
