"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Radio, 
  Send, 
  ShieldAlert, 
  Zap, 
  Globe, 
  MapPin, 
  Loader2, 
  Heart, 
  Droplet, 
  CloudRain, 
  Check, 
  X 
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function AlertBroadcastPage() {
  const { token } = useAuth();
  const broadcastAlert = useMutation(api.alerts.broadcastAlert);
  const deactivateAlert = useMutation(api.alerts.deactivateAlert);
  const activeAlerts = useQuery(api.alerts.getActiveAlerts);
  const [loading, setLoading] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'health_alert' as 'health_alert' | 'outbreak' | 'water_quality' | 'weather_warning',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    radius: 10
  });

  const getRadiusDescription = (radiusVal: number) => {
    if (radiusVal <= 15) return "Local Community Node (Immediate Proximity)";
    if (radiusVal <= 50) return "Sub-District Hub (Block/Taluk Area)";
    if (radiusVal <= 150) return "District Network (City & Outer Regions)";
    return "State-Level Broadcast (Wide-Area Alert)";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required", { description: "Please log in to broadcast alerts." });
      return;
    }
    
    setLoading(true);
    try {
      await (broadcastAlert as any)({
        token,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        severity: formData.severity,
        radius: formData.radius
      });
      toast.success("Protocol Alert Broadcasted", { description: "Notification has been successfully transmitted to all regional nodes." });
      setFormData({ title: '', message: '', type: 'health_alert', severity: 'medium', radius: 10 });
    } catch (error: any) {
      toast.error("Broadcast Failed", { description: error.message || "An unexpected database validation occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (alertId: any) => {
    if (!token) return;
    setDeactivatingId(alertId);
    try {
      await (deactivateAlert as any)({ token, alertId });
      toast.success("Alert Dismissed", { description: "The broadcast has been marked as resolved and cleared from active nodes." });
    } catch (error: any) {
      toast.error("Action Failed", { description: error.message || "Could not resolve alert." });
    } finally {
      setDeactivatingId(null);
    }
  };

  const alertTypes = [
    { id: 'health_alert', label: 'Health Alert', icon: Heart, color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' },
    { id: 'outbreak', label: 'Outbreak Warning', icon: ShieldAlert, color: 'border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10' },
    { id: 'water_quality', label: 'Water Advisory', icon: Droplet, color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10' },
    { id: 'weather_warning', label: 'Weather Warning', icon: CloudRain, color: 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' }
  ];

  const severityLevels = [
    { id: 'low', label: 'Low Impact', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/20' },
    { id: 'medium', label: 'Medium Priority', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 active:bg-amber-500/20' },
    { id: 'high', label: 'High Alert', color: 'border-orange-500/20 text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 active:bg-orange-500/20' },
    { id: 'critical', label: 'Critical Emergency', color: 'border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 active:bg-rose-500/20 animate-pulse' }
  ];

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker']}>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative text-left">
        {/* Glow Backgrounds */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider font-mono">EMERGENCY BROADCAST ROUTER: ONLINE</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Radio className="w-8 h-8 text-rose-500" /> Broadcast Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Regional Alert Transmission & Node Notifications — Deploy warnings and emergency advisories to community segments.
          </p>
        </div>

        {/* Grid Panels */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 Cols): Composer Form */}
          <div className="lg:col-span-7">
            <Card className="backdrop-blur-xl bg-card/65 border border-border shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-rose-500/5 py-4 px-5">
                <CardTitle className="text-sm font-bold uppercase tracking-wide text-rose-500 flex items-center gap-2.5">
                  <Zap className="w-4.5 h-4.5" /> Compose Alert Payload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Alert Type Choice Chips */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Alert Ingestion Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {alertTypes.map(t => {
                        const isSelected = formData.type === t.id;
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: t.id as any })}
                            className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                              isSelected 
                                ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-md shadow-rose-500/5 scale-[1.01]' 
                                : t.color
                            }`}
                          >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severity Level Choice Chips */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Severity Priority</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {severityLevels.map(s => {
                        const isSelected = formData.severity === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, severity: s.id as any })}
                            className={`p-2.5 rounded-xl border text-center font-bold text-[10px] uppercase transition-all ${
                              isSelected 
                                ? 'border-rose-500 bg-rose-500/10 text-rose-400 shadow-md scale-[1.01]' 
                                : s.color
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Alert Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Alert Headline</Label>
                    <Input 
                      id="title"
                      placeholder="e.g., Regional Waterborne Spike Identified"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      className="h-11 rounded-xl bg-secondary/30 border-border text-xs font-bold text-foreground focus:ring-1 focus:ring-rose-500 placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Protocol Message */}
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Protocol Instructions & Message</Label>
                    <Textarea 
                      id="message"
                      placeholder="Detail instructions for local health nodes, sanitation desks, and water containment units..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      className="min-h-[100px] rounded-xl bg-secondary/30 border-border text-xs text-foreground placeholder:text-muted-foreground/60 resize-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Transmission Radius Range Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase ml-1">
                      <span>Transmission Broadcast Radius</span>
                      <span className="font-mono text-rose-400">{formData.radius} km</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="300"
                      step="5"
                      value={formData.radius}
                      onChange={(e) => setFormData({...formData, radius: Number(e.target.value)})}
                      className="w-full accent-rose-500 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] font-mono text-muted-foreground block text-left ml-1 italic">{getRadiusDescription(formData.radius)}</span>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.005] flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Broadcast Alert Payload
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 Cols): Active Streams */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Active Broadcasters Stream</h3>
              <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-emerald-500/30 text-emerald-500 animate-pulse-subtle bg-emerald-500/5">LIVE TELEMETRY</Badge>
            </div>

            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {activeAlerts?.map((alert) => (
                  <motion.div 
                    key={alert._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl border text-left cursor-default transition-all relative overflow-hidden group ${
                      alert.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/40 shadow-sm animate-pulse-subtle' :
                      alert.severity === 'high' ? 'bg-orange-500/5 border-orange-500/40 shadow-sm' :
                      alert.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-secondary/20 border-border/75'
                    }`}
                  >
                    {/* Left Accent Color bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.severity === 'critical' ? 'bg-rose-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />

                    <div className="flex items-start justify-between gap-4 mb-2 pl-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.25 rounded uppercase leading-normal ${
                          alert.severity === 'critical' ? 'bg-rose-500/15 text-rose-500' :
                          alert.severity === 'high' ? 'bg-orange-500/15 text-orange-500' :
                          alert.severity === 'medium' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {alert.severity}
                        </span>
                        <h4 className="font-bold text-xs text-foreground tracking-tight">{alert.title}</h4>
                      </div>
                      
                      {/* Action buttons (Dismiss / Resolve Alert) */}
                      <button
                        onClick={() => handleDeactivate(alert._id)}
                        disabled={deactivatingId === alert._id}
                        className="text-muted-foreground hover:text-rose-500 p-1 rounded-lg hover:bg-secondary border border-transparent hover:border-border/60 transition-all shrink-0"
                        title="Dismiss / Resolve Alert"
                      >
                        {deactivatingId === alert._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-3.5 pl-1.5 font-medium">{alert.message}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/30 pl-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{alert.location?.radius || 0} km Broadcast</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-muted-foreground/60">{format(alert.createdAt, 'HH:mm:ss')}</span>
                        <Badge className="text-[8px] font-bold uppercase bg-secondary/80 text-foreground border-0">{alert.type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {activeAlerts?.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl opacity-40 bg-secondary/10 flex flex-col items-center justify-center">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No active network broadcasts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
