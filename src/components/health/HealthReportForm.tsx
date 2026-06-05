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
      await addReport({
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
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <CardTitle>{t('submitReport')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">{t('patientName')}</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="date">{t('date')}</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="age">{t('age', 'Age')}</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">{t('gender', 'Gender')}</Label>
              <Input
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="symptoms">{t('symptoms')}</Label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
              className="mt-1"
              rows={4}
              placeholder="Describe symptoms in detail..."
            />
          </div>

          <div>
            <Label htmlFor="upload">{t('uploadImage')} (Optional)</Label>
            <div className="mt-2 relative border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer group">
              <input 
                id="upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {processing ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
                  <p className="text-sm font-medium">AI is analyzing report...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop medical report
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will automatically extract data from your image
                  </p>
                </>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading || processing} className="w-full md:w-auto">
            {loading ? t('loading') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
