"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Send, ShieldAlert, Zap, Globe, MapPin, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function AlertBroadcastPage() {
  const { token } = useAuth();
  const broadcastAlert = useMutation(api.alerts.broadcastAlert);
  const activeAlerts = useQuery(api.alerts.getActiveAlerts);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'health_alert' as any,
    severity: 'medium' as any,
    radius: '10'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      await broadcastAlert({
        token,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        severity: formData.severity,
        radius: parseInt(formData.radius)
      });
      toast.success("Protocol Alert Broadcasted", { description: "Notification is being transmitted to all regional nodes." });
      setFormData({ title: '', message: '', type: 'health_alert', severity: 'medium', radius: '10' });
    } catch (error: any) {
      toast.error("Broadcast Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Broadcast Center</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-2">
            Regional Alert Transmission & Node Notifications
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
           {/* Composer */}
           <div className="lg:col-span-7">
              <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)] shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-[var(--border-soft)] bg-rose-500/5">
                   <CardTitle className="flex items-center gap-3 text-lg uppercase font-bold tracking-tight text-rose-500">
                      <Radio className="w-5 h-5 animate-pulse" />
                      Compose Alert Payload
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                         <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-bold uppercase tracking-widest ml-2">Alert Type</Label>
                               <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                                  <SelectTrigger className="h-12 rounded-xl bg-[var(--surface-2)]">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="health_alert">Health Alert</SelectItem>
                                     <SelectItem value="outbreak">Outbreak Warning</SelectItem>
                                     <SelectItem value="water_quality">Water Advisory</SelectItem>
                                     <SelectItem value="weather_warning">Weather Warning</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-bold uppercase tracking-widest ml-2">Severity Level</Label>
                               <Select value={formData.severity} onValueChange={(val) => setFormData({...formData, severity: val})}>
                                  <SelectTrigger className="h-12 rounded-xl bg-[var(--surface-2)]">
                                     <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                     <SelectItem value="low">Low Impact</SelectItem>
                                     <SelectItem value="medium">Medium Priority</SelectItem>
                                     <SelectItem value="high">High Alert</SelectItem>
                                     <SelectItem value="critical">Critical Emergency</SelectItem>
                                  </SelectContent>
                               </Select>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest ml-2">Alert Title</Label>
                            <Input 
                              placeholder="e.g., Regional Symptom Spike Detected"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              required
                              className="h-14 rounded-xl bg-[var(--surface-2)] border-[var(--border-soft)] font-bold"
                            />
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest ml-2">Protocol Message</Label>
                            <Textarea 
                              placeholder="Detailed instructions for community nodes..."
                              value={formData.message}
                              onChange={(e) => setFormData({...formData, message: e.target.value})}
                              required
                              className="min-h-[120px] rounded-xl bg-[var(--surface-2)] border-[var(--border-soft)]"
                            />
                         </div>

                         <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest ml-2">Transmission Radius (km)</Label>
                            <Input 
                              type="number"
                              value={formData.radius}
                              onChange={(e) => setFormData({...formData, radius: e.target.value})}
                              className="h-12 rounded-xl bg-[var(--surface-2)] border-[var(--border-soft)]"
                            />
                         </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl text-lg font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20 transition-all hover:scale-[1.02]">
                         {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Send className="w-5 h-5 mr-3" />}
                         Broadcast to Global Network
                      </Button>
                   </form>
                </CardContent>
              </Card>
           </div>

           {/* Active Stream */}
           <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Active Broadcast Stream</h3>
                 <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-emerald-500/30 text-emerald-500">Live</Badge>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-auto pr-2 custom-scrollbar">
                 <AnimatePresence mode="popLayout">
                    {activeAlerts?.map((alert) => (
                      <motion.div 
                        key={alert._id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-soft)] shadow-sm hover:border-rose-500/30 transition-colors group"
                      >
                         <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${
                                 alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-500' :
                                 alert.severity === 'high' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                               }`}>
                                  <ShieldAlert className="w-4 h-4" />
                               </div>
                               <h4 className="font-bold text-sm tracking-tight group-hover:text-rose-500 transition-colors">{alert.title}</h4>
                            </div>
                            <span className="text-[8px] font-mono opacity-50 uppercase">{format(alert.createdAt, 'HH:mm:ss')}</span>
                         </div>
                         <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{alert.message}</p>
                         <div className="flex items-center justify-between pt-4 border-t border-[var(--border-soft)]">
                            <div className="flex items-center gap-2">
                               <MapPin className="w-3 h-3 text-muted-foreground" />
                               <span className="text-[9px] font-bold text-muted-foreground uppercase">{alert.radius}km Range</span>
                            </div>
                            <Badge className="text-[8px] font-bold uppercase bg-[var(--surface-2)] text-foreground border-0">{alert.type.replace('_', ' ')}</Badge>
                         </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {activeAlerts?.length === 0 && (
                   <div className="text-center py-20 border-2 border-dashed border-[var(--border-soft)] rounded-3xl opacity-30">
                      <Globe className="w-10 h-10 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No active broadcasts</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
