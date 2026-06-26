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
  X,
  Pencil
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
  const updateAlert = useMutation(api.alerts.updateAlert);
  const activeAlerts = useQuery(api.alerts.getActiveAlerts);
  const allAlerts = useQuery(api.alerts.getAllAlerts);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);

  const alertsToDisplay = showAllAlerts ? allAlerts : activeAlerts;


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
      if (editingAlertId) {
        await (updateAlert as any)({
          token,
          alertId: editingAlertId,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          severity: formData.severity,
          radius: formData.radius
        });
        toast.success("Protocol Alert Updated", { description: "The existing broadcast payload has been successfully updated." });
        setEditingAlertId(null);
      } else {
        await (broadcastAlert as any)({
          token,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          severity: formData.severity,
          radius: formData.radius
        });
        toast.success("Protocol Alert Broadcasted", { description: "Notification has been successfully transmitted to all regional nodes." });
      }
      setFormData({ title: '', message: '', type: 'health_alert', severity: 'medium', radius: 10 });
    } catch (error: any) {
      toast.error("Broadcast Action Failed", { description: error.message || "An unexpected database validation occurred." });
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
                  <div className="flex gap-3">
                    {editingAlertId && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setEditingAlertId(null);
                          setFormData({ title: '', message: '', type: 'health_alert', severity: 'medium', radius: 10 });
                          toast.info("Edit cancelled");
                        }}
                        className="h-12 rounded-xl text-xs font-bold border-border"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.005] flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {editingAlertId ? "Update Alert Broadcast" : "Broadcast Alert Payload"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 Cols): Active Streams */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
              <div className="flex flex-col">
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Broadcasters Stream</h3>
                <span className="text-[8px] font-semibold text-muted-foreground/60 tracking-wider">
                  {showAllAlerts ? "DISPLAYING ENTIRE HISTORY" : "LIVE ACTIVE TELEMETRY"}
                </span>
              </div>
              <div className="flex bg-secondary/40 p-0.5 rounded-lg border border-border/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAllAlerts(false)}
                  className={`px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide rounded-md transition-all ${
                    !showAllAlerts
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Active Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllAlerts(true)}
                  className={`px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide rounded-md transition-all ${
                    showAllAlerts
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All History
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {alertsToDisplay?.map((alert) => (
                  <motion.div 
                    key={alert._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-xl border text-left cursor-default transition-all relative overflow-hidden group ${
                      !alert.isActive
                        ? 'bg-secondary/15 border-border/40 opacity-70'
                        : alert.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/40 shadow-sm animate-pulse-subtle' :
                        alert.severity === 'high' ? 'bg-orange-500/5 border-orange-500/40 shadow-sm' :
                        alert.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-secondary/20 border-border/75'
                    }`}
                  >
                    {/* Left Accent Color bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      !alert.isActive ? 'bg-muted-foreground/30' :
                      alert.severity === 'critical' ? 'bg-rose-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />

                    <div className="flex items-start justify-between gap-4 mb-2 pl-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.25 rounded uppercase leading-normal ${
                          !alert.isActive ? 'bg-secondary text-muted-foreground' :
                          alert.severity === 'critical' ? 'bg-rose-500/15 text-rose-500' :
                          alert.severity === 'high' ? 'bg-orange-500/15 text-orange-500' :
                          alert.severity === 'medium' ? 'bg-amber-500/15 text-amber-500' :
                          'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {alert.severity}
                        </span>
                        {!alert.isActive && (
                          <span className="text-[8px] font-extrabold px-1.5 py-0.25 rounded uppercase bg-emerald-500/10 text-emerald-400">
                            RESOLVED
                          </span>
                        )}
                        <h4 className="font-bold text-xs text-foreground tracking-tight">{alert.title}</h4>
                      </div>
                      
                      {/* Action buttons (Edit / Resolve Alert) */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAlertId(alert._id);
                            setFormData({
                              title: alert.title,
                              message: alert.message,
                              type: alert.type as any,
                              severity: alert.severity as any,
                              radius: alert.location?.radius || 10
                            });
                            toast.info(`Editing alert: ${alert.title}`);
                          }}
                          className="text-muted-foreground hover:text-primary p-1 rounded-lg hover:bg-secondary border border-transparent hover:border-border/60 transition-all"
                          title="Edit Broadcast"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {alert.isActive && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(alert._id)}
                            disabled={deactivatingId === alert._id}
                            className="text-muted-foreground hover:text-rose-500 p-1 rounded-lg hover:bg-secondary border border-transparent hover:border-border/60 transition-all"
                            title="Dismiss / Resolve Alert"
                          >
                            {deactivatingId === alert._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
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
              
              {alertsToDisplay?.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl opacity-40 bg-secondary/10 flex flex-col items-center justify-center">
                  <Globe className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {showAllAlerts ? "No broadcasts found" : "No active network broadcasts"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>

  );
}
