"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Droplet, Heart, 
  Plus, TrendingUp, Lock, 
  FileText, Calendar, ChevronRight, Zap,
  Pencil, Shield, MapPin, Loader2, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const MetricCard = ({ label, value, unit, icon: Icon, color, subtext }: any) => (
  <Card className="bg-card border border-border hover:border-primary/30 transition-all shadow-md relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-1 h-full ${color.replace('text-', 'bg-')}`} />
    <CardContent className="p-5">
       <div className="flex items-start justify-between mb-3 pl-1">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-secondary`}>
             <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
             {subtext}
          </div>
       </div>
       <div className="space-y-1 pl-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p>
          <h3 className="text-2xl font-black tracking-tight">{value} <span className="text-xs font-normal opacity-40">{unit}</span></h3>
       </div>
    </CardContent>
  </Card>
);

export default function HealthVaultPage() {
  const { user, token } = useAuth();
  const isAdmin = user && (user.role === 'admin' || user.role === 'super-admin');

  // Convex endpoints
  const healthRecords = useQuery(api.healthData.getAllHealthData, token ? { token } : "skip");
  const addHealthData = useMutation(api.healthData.addHealthData);
  const updateHealthData = useMutation(api.healthData.updateHealthData);

  // Modal Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formType, setFormType] = useState<'vitals' | 'symptom' | 'medication' | 'water_test'>('vitals');
  const [notes, setNotes] = useState('');
  const [severity, setSeverity] = useState(5);
  const [address, setAddress] = useState('');

  // Type-specific form fields
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState('72');
  const [bs, setBs] = useState('98');
  const [hydration, setHydration] = useState('2.4');

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const [ph, setPh] = useState('7.2');
  const [turbidity, setTurbidity] = useState('1.5');
  const [waterSource, setWaterSource] = useState('Well');

  // Compute Vitals summary based on the latest logged vitals
  const latestVitals = healthRecords?.find(r => r.type === 'vitals');
  const latestVitalsData = latestVitals?.data || {};

  const handleOpenAddDialog = () => {
    setEditingRecordId(null);
    setFormType('vitals');
    setNotes('');
    setSeverity(5);
    setAddress('');
    
    // reset form fields
    setBp('120/80');
    setHr('72');
    setBs('98');
    setHydration('2.4');
    setPatientName(user?.name || '');
    setAge('');
    setGender('');
    setMedName('');
    setDosage('');
    setFrequency('');
    setPh('7.2');
    setTurbidity('1.5');
    setWaterSource('Well');

    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (record: any) => {
    setEditingRecordId(record._id);
    setFormType(record.type);
    setNotes(record.notes || '');
    setSeverity(record.severity || 5);
    setAddress(record.location?.address || '');

    // Populate type-specific states
    if (record.type === 'vitals') {
      setBp(record.data?.bloodPressure || '');
      setHr(record.data?.heartRate || '');
      setBs(record.data?.bloodSugar || '');
      setHydration(record.data?.hydration || '');
    } else if (record.type === 'symptom') {
      setPatientName(record.data?.patientName || '');
      setAge(record.data?.age || '');
      setGender(record.data?.gender || '');
    } else if (record.type === 'medication') {
      setMedName(record.data?.name || '');
      setDosage(record.data?.dosage || '');
      setFrequency(record.data?.frequency || '');
    } else if (record.type === 'water_test') {
      setPh(record.data?.pH || '');
      setTurbidity(record.data?.turbidity || '');
      setWaterSource(record.data?.source || '');
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);
    try {
      let data: any = {};
      
      if (formType === 'vitals') {
        data = {
          bloodPressure: bp,
          heartRate: parseInt(hr) || 0,
          bloodSugar: parseInt(bs) || 0,
          hydration: parseFloat(hydration) || 0
        };
      } else if (formType === 'symptom') {
        data = {
          patientName,
          age: parseInt(age) || 0,
          gender
        };
      } else if (formType === 'medication') {
        data = {
          name: medName,
          dosage,
          frequency
        };
      } else if (formType === 'water_test') {
        data = {
          pH: parseFloat(ph) || 0,
          turbidity: parseFloat(turbidity) || 0,
          source: waterSource
        };
      }

      const locationPayload = address ? {
        latitude: 0,
        longitude: 0,
        address
      } : undefined;

      if (editingRecordId) {
        // Edit record
        await (updateHealthData as any)({
          token,
          id: editingRecordId,
          type: formType,
          data,
          severity,
          notes
        });
        toast.success("Health record updated successfully");
      } else {
        // Add new record
        await (addHealthData as any)({
          token,
          type: formType,
          data,
          location: locationPayload,
          severity,
          notes
        });
        toast.success("Health record logged successfully");
      }

      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error("Action Failed", { description: err.message || "Failed to process database payload." });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get relative record details for rendering
  const getRecordDetails = (record: any) => {
    if (record.type === 'vitals') {
      return `BP: ${record.data?.bloodPressure || '—'} mmHg | HR: ${record.data?.heartRate || '—'} BPM | Sugar: ${record.data?.bloodSugar || '—'} mg/dL | Hydration: ${record.data?.hydration || '—'} L`;
    }
    if (record.type === 'symptom') {
      return `Patient: ${record.data?.patientName || 'Anonymous'} (${record.data?.age || '—'}y, ${record.data?.gender || '—'}) | Notes: ${record.notes || 'No description'}`;
    }
    if (record.type === 'medication') {
      return `Med: ${record.data?.name || '—'} | Dose: ${record.data?.dosage || '—'} | Freq: ${record.data?.frequency || '—'} | ${record.notes || ''}`;
    }
    if (record.type === 'water_test') {
      return `pH: ${record.data?.pH || '—'} | Turbidity: ${record.data?.turbidity || '—'} NTU | Source: ${record.data?.source || '—'} | ${record.notes || ''}`;
    }
    return record.notes || 'No further data logged';
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-6 text-left animate-in fade-in duration-500 relative">
        {/* Glow decoration */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Lock className="w-8 h-8 text-primary" /> Health Vault
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your secure decentralized database — Log daily vitals, symptom snapshots, and test reports.
            </p>
          </div>
          <div className="flex gap-2.5">
             <Button size="sm" className="h-10 rounded-xl px-4 font-bold text-xs gap-2 shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]" onClick={handleOpenAddDialog}>
                <Plus className="w-4 h-4" /> Log Health Record
             </Button>
          </div>
        </div>

        {/* Metric panels displaying dynamic latest vitals check */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <MetricCard 
             label="Blood Pressure" 
             value={latestVitalsData.bloodPressure || "—"} 
             unit="mmHg" 
             icon={Activity} 
             color="text-rose-500" 
             subtext={latestVitals ? format(latestVitals.timestamp, 'MMM dd, yyyy') : "Not Logged"} 
           />
           <MetricCard 
             label="Heart Rate" 
             value={latestVitalsData.heartRate !== undefined ? String(latestVitalsData.heartRate) : "—"} 
             unit="BPM" 
             icon={Heart} 
             color="text-rose-400" 
             subtext={latestVitals ? format(latestVitals.timestamp, 'MMM dd, yyyy') : "Not Logged"} 
           />
           <MetricCard 
             label="Blood Sugar" 
             value={latestVitalsData.bloodSugar !== undefined ? String(latestVitalsData.bloodSugar) : "—"} 
             unit="mg/dL" 
             icon={Zap} 
             color="text-amber-500" 
             subtext={latestVitals ? format(latestVitals.timestamp, 'MMM dd, yyyy') : "Not Logged"} 
           />
           <MetricCard 
             label="Hydration" 
             value={latestVitalsData.hydration !== undefined ? String(latestVitalsData.hydration) : "—"} 
             unit="L" 
             icon={Droplet} 
             color="text-sky-400" 
             subtext={latestVitals ? format(latestVitals.timestamp, 'MMM dd, yyyy') : "Not Logged"} 
           />
        </div>

        {/* Dashboard split content */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
           {/* Left Content (8 Cols): Recent Activity logs */}
           <div className="lg:col-span-8 space-y-4">
              <Card className="bg-card/65 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/40 py-4 px-5">
                    <div className="flex items-center justify-between">
                       <div>
                         <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Intelligence & Vitals Logs</CardTitle>
                         <p className="text-[10px] text-muted-foreground mt-0.5">
                           {isAdmin ? "Global administrative list (All users)" : "Your personal telemetry timeline"}
                         </p>
                       </div>
                       <Badge variant="outline" className="text-[8px] font-mono border-primary/20 text-primary">SECURE SYNC</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/60">
                       {healthRecords?.map((record) => {
                         const isOwner = record.userId === user?.id;
                         const canEdit = isOwner || isAdmin;
                         return (
                           <div key={record._id} className="p-4 flex items-center justify-between hover:bg-secondary/40 transition-all gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                 <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-border/40">
                                    {record.type === 'vitals' && <Activity className="w-4.5 h-4.5 text-sky-400" />}
                                    {record.type === 'symptom' && <Heart className="w-4.5 h-4.5 text-rose-400" />}
                                    {record.type === 'medication' && <Zap className="w-4.5 h-4.5 text-amber-500" />}
                                    {record.type === 'water_test' && <Droplet className="w-4.5 h-4.5 text-cyan-400" />}
                                 </div>
                                 <div className="min-w-0 text-left">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-xs text-foreground uppercase tracking-wide">
                                         {record.type.replace('_', ' ')} Record
                                      </h4>
                                      {isAdmin && (
                                        <Badge variant="secondary" className="text-[8px] font-mono py-0 px-1 bg-secondary/80 flex items-center gap-1">
                                          <User className="w-2 h-2" /> {record.userName || "User"}
                                        </Badge>
                                      )}
                                      {record.severity !== undefined && (
                                        <Badge className={`text-[8px] font-bold uppercase border-0 ${
                                          record.severity >= 8 ? 'bg-rose-500/15 text-rose-500' :
                                          record.severity >= 5 ? 'bg-amber-500/15 text-amber-500' :
                                          'bg-emerald-500/15 text-emerald-500'
                                        }`}>
                                          Severity {record.severity}/10
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium truncate mt-1 leading-relaxed">
                                       {getRecordDetails(record)}
                                    </p>
                                    {record.location?.address && (
                                      <span className="text-[9px] text-muted-foreground/60 font-mono flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-2.5 h-2.5" /> {record.location.address}
                                      </span>
                                    )}
                                 </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                 <span className="text-[9px] font-mono text-muted-foreground/60">
                                    {format(record.timestamp, 'HH:mm:ss, MMM dd')}
                                 </span>
                                 {canEdit && (
                                   <Button 
                                     variant="ghost" 
                                     size="icon" 
                                     className="h-8 w-8 rounded-lg hover:bg-secondary hover:text-primary transition-all shrink-0 border border-transparent hover:border-border/60"
                                     onClick={() => handleOpenEditDialog(record)}
                                     title="Edit health record"
                                   >
                                      <Pencil className="w-3.5 h-3.5" />
                                   </Button>
                                 )}
                              </div>
                           </div>
                         );
                       })}
                       {healthRecords?.length === 0 && (
                         <div className="text-center py-20 flex flex-col items-center justify-center opacity-40">
                           <FileText className="w-10 h-10 text-muted-foreground mb-3 animate-pulse" />
                           <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">No records logged in secure storage</p>
                         </div>
                       )}
                    </div>
                </CardContent>
              </Card>
           </div>

           {/* Right Content (4 Cols): Data info and Security */}
           <div className="lg:col-span-4 space-y-4">
              <Card className="bg-card/70 border border-border/80 shadow-md">
                 <CardContent className="p-5 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                       <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-sm tracking-wide uppercase text-foreground">Decentralized Security</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">
                         Your health telemetry is linked strictly with your authorization token, verifying access cryptographically before resolving records.
                       </p>
                    </div>
                    <ul className="space-y-2">
                       {['SSL/TLS Payload Security', 'Cryptographic Token Auth', 'Strict Owner/Admin ACL'].map(item => (
                         <li key={item} className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-wide">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
                         </li>
                       ))}
                    </ul>
                 </CardContent>
              </Card>

              <Card className="bg-card/70 border border-border/80 shadow-md">
                <CardContent className="p-5 text-center space-y-3">
                   <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Clinical Node Export</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     Compile your health record files into a temporary sharing link for doctors and verified health workers.
                   </p>
                   <Button variant="outline" size="sm" className="w-full rounded-xl border-border h-10 font-bold text-xs" onClick={() => toast.info('Feature coming soon')}>
                      Generate Sharing Token
                   </Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>

      {/* Unified Log/Edit Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card/95 border border-border backdrop-blur-xl text-left rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-foreground uppercase">
              {editingRecordId ? "Update Telemetry Data" : "Log Health Telemetry"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the configuration parameters of your clinical records. Logs will update dynamically in real time.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Record type chooser (Only on creation, read-only on edit to avoid schema pollution) */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Telemetry Type</Label>
              {editingRecordId ? (
                <div className="p-3 bg-secondary/60 rounded-xl text-xs font-bold uppercase tracking-wide border border-border/60">
                  {formType.replace('_', ' ')}
                </div>
              ) : (
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-11 rounded-xl bg-secondary/50 border border-border px-3 py-2 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="vitals">Vitals (BP, HR, Blood Sugar, Hydration)</option>
                  <option value="symptom">Symptom Snapshot</option>
                  <option value="medication">Medication Log</option>
                  <option value="water_test">Water Quality Test</option>
                </select>
              )}
            </div>

            {/* Type-Specific Input Fields */}
            {formType === 'vitals' && (
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <Label htmlFor="bp" className="text-[10px] font-bold uppercase text-muted-foreground">Blood Pressure</Label>
                  <Input
                    id="bp"
                    placeholder="e.g. 120/80"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hr" className="text-[10px] font-bold uppercase text-muted-foreground">Heart Rate (BPM)</Label>
                  <Input
                    id="hr"
                    type="number"
                    placeholder="e.g. 72"
                    value={hr}
                    onChange={(e) => setHr(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="bs" className="text-[10px] font-bold uppercase text-muted-foreground">Blood Sugar (mg/dL)</Label>
                  <Input
                    id="bs"
                    type="number"
                    placeholder="e.g. 98"
                    value={bs}
                    onChange={(e) => setBs(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hydration" className="text-[10px] font-bold uppercase text-muted-foreground">Hydration (Liters)</Label>
                  <Input
                    id="hydration"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.4"
                    value={hydration}
                    onChange={(e) => setHydration(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            )}

            {formType === 'symptom' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="pName" className="text-[10px] font-bold uppercase text-muted-foreground">Patient Name</Label>
                    <Input
                      id="pName"
                      placeholder="e.g. Jane Doe"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-[10px] font-bold uppercase text-muted-foreground">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender" className="text-[10px] font-bold uppercase text-muted-foreground">Gender</Label>
                    <Input
                      id="gender"
                      placeholder="e.g. Female"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {formType === 'medication' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="medName" className="text-[10px] font-bold uppercase text-muted-foreground">Medication Name</Label>
                  <Input
                    id="medName"
                    placeholder="e.g. Paracetamol"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="dosage" className="text-[10px] font-bold uppercase text-muted-foreground">Dosage</Label>
                    <Input
                      id="dosage"
                      placeholder="e.g. 500mg"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="freq" className="text-[10px] font-bold uppercase text-muted-foreground">Frequency</Label>
                    <Input
                      id="freq"
                      placeholder="e.g. Twice Daily"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                </div>
              </div>
            )}

            {formType === 'water_test' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="ph" className="text-[10px] font-bold uppercase text-muted-foreground">pH Level</Label>
                    <Input
                      id="ph"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 7.2"
                      value={ph}
                      onChange={(e) => setPh(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="turbidity" className="text-[10px] font-bold uppercase text-muted-foreground">Turbidity (NTU)</Label>
                    <Input
                      id="turbidity"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.5"
                      value={turbidity}
                      onChange={(e) => setTurbidity(e.target.value)}
                      required
                      className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="waterSource" className="text-[10px] font-bold uppercase text-muted-foreground">Water Source</Label>
                  <Input
                    id="waterSource"
                    placeholder="e.g. River Inlet, Well, Tube-well"
                    value={waterSource}
                    onChange={(e) => setWaterSource(e.target.value)}
                    required
                    className="h-10 rounded-xl bg-secondary/30 border-border text-xs font-semibold text-foreground"
                  />
                </div>
              </div>
            )}

            {/* Common fields: Notes, Severity, Address */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[10px] font-bold uppercase text-muted-foreground">Description Notes</Label>
              <Textarea
                id="notes"
                placeholder="Include additional clinical details or contextual notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[70px] rounded-xl bg-secondary/30 border-border text-xs text-foreground placeholder:text-muted-foreground/60 resize-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                <span>Severity Scale Index</span>
                <span className="font-mono text-primary">{severity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {!editingRecordId && (
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-[10px] font-bold uppercase text-muted-foreground">Report Location (Address)</Label>
                <Input
                  id="address"
                  placeholder="e.g. District A, Sector-3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-10 rounded-xl bg-secondary/30 border-border text-xs text-foreground"
                />
              </div>
            )}

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-11 rounded-xl text-xs font-bold border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 flex-1 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {editingRecordId ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
