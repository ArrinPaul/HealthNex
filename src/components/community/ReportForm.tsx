"use client";

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Droplet, AlertCircle } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

function SubmitButton({ t }: { t: any }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? t('loading') : t('submit')}
    </Button>
  );
}

export default function ReportForm() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const createReport = useMutation(api.communityReports.createReport);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    issueType: 'water' as "water" | "health" | "outbreak" | "environmental" | "safety",
    description: ''
  });

  const handleAction = async () => {
    if (!token) {
      toast.error('Session Expired', { description: 'Please sign in again to submit reports.' });
      return;
    }

    try {
      await (createReport as any)({
        title: formData.issueType === 'water' ? 'Unsafe Water Source' : 'Health Issue',
        description: formData.description,
        category: formData.issueType,
        location: {
          latitude: 0,
          longitude: 0,
          address: formData.location
        },
        severity: 3 as 1 | 2 | 3 | 4 | 5,
        token: token
      });
      
      toast.success('Report Transmitted', {
        description: 'Ground intelligence received by the protocol.'
      });
      
      setFormData({
        name: '',
        location: '',
        issueType: 'water',
        description: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Transmission Failed', {
        description: 'The protocol could not ingest your report. Please try again.'
      });
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <CardTitle>{t('reportIssue')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleAction} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
                placeholder="Your name or Anonymous"
              />
            </div>

            <div>
              <Label htmlFor="location">{t('location')}</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="mt-1"
                placeholder="Village/Town, District"
              />
            </div>
          </div>

          <div>
            <Label>Issue Type</Label>
            <Select 
              value={formData.issueType} 
              onValueChange={(value: any) => setFormData({ ...formData, issueType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="water">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    {t('unsafeWaterSource')}
                  </div>
                </SelectItem>
                <SelectItem value="health">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {t('healthIssue')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">{t('problemDescription')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="mt-1"
              rows={5}
              placeholder="Describe the issue in detail."
            />
          </div>

          <div>
            <Label>{t('uploadImage')} (Optional)</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload photos of the issue
              </p>
            </div>
          </div>

          <SubmitButton t={t} />
        </form>
      </CardContent>
    </Card>
  );
}
