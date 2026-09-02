"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from 'sonner';

export default function HealthReportForm() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const addReport = useMutation(api.healthData.addHealthData);

  const [formData, setFormData] = useState({
    patientName: '',
    symptoms: '',
    location: '',
    date: '',
    age: '',
    gender: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const res = await fetch('/api/ai/process-report', {
        method: 'POST',
        body
      });
      const result = await res.json();
      if (result.data) {
        setFormData(prev => ({
          ...prev,
          patientName: result.data.patientName || prev.patientName,
          age: result.data.age || prev.age,
          gender: result.data.gender || prev.gender,
          symptoms: result.data.symptoms || prev.symptoms,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Authentication Required", { description: "Please login to submit a report" });
    
    setLoading(true);
    try {
      await (addReport as any)({
        token,
        type: "symptom",
        data: {
          patientName: formData.patientName,
          age: formData.age,
          gender: formData.gender
        },
        location: {
          latitude: 0,
          longitude: 0,
          address: formData.location
        },
        severity: 5,
        notes: formData.symptoms
      });
      toast.success(t('reportSuccess', 'Health report submitted successfully!'));
      setFormData({
        patientName: '',
        symptoms: '',
        location: '',
        date: '',
        age: '',
        gender: ''
      });
    } catch (err) {
      console.error(err);
      toast.error(t('reportError', 'Failed to submit report.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-xl overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          {t('submitReport')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">Upload a medical report or enter details manually.</p>
      </CardHeader>
      
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* AI Upload Section - Prominently featured */}
          <div className="bg-secondary/20 rounded-xl p-1 border border-border/50">
            <div className="relative border-2 border-dashed border-primary/20 rounded-lg p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group overflow-hidden">
              <input 
                id="upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              
              {/* Animated scanning line effect when processing */}
              {processing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 animate-[scan_2s_ease-in-out_infinite]" />
              )}
              
              {processing ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                    <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground tracking-tight">Neural Engine is extracting data...</p>
                    <p className="text-sm text-muted-foreground">Parsing symptoms, patient details, and severity.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">
                      Auto-fill with Medical Document
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag & drop or click to upload a photo of the health report
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Or enter manually</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="patientName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                {t('patientName')}
              </Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
                className="bg-background/50 focus:bg-background transition-colors h-11"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="location" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                {t('location')}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="bg-background/50 focus:bg-background transition-colors h-11"
                placeholder="District or City"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <Label htmlFor="age" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                  {t('age', 'Age')}
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  className="bg-background/50 focus:bg-background transition-colors h-11"
                  placeholder="34"
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="gender" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                  {t('gender', 'Gender')}
                </Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  className="bg-background/50 focus:bg-background transition-colors h-11"
                  placeholder="M/F/Other"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
                {t('date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-background/50 focus:bg-background transition-colors h-11"
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="symptoms" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-focus-within:text-primary transition-colors">
              {t('symptoms')}
            </Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
              className="bg-background/50 focus:bg-background transition-colors min-h-[120px] resize-none"
              placeholder="Describe symptoms in detail..."
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={loading || processing} 
              className="w-full h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Committing to Ledger...
                </span>
              ) : t('submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
