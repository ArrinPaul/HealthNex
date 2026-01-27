"use client";

import { useState } from 'react';
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

export default function ReportForm() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const createReport = useMutation(api.communityReports.createReport);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    issueType: 'water' as "water" | "health" | "outbreak" | "environmental" | "safety",
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReport({
        title: formData.issueType === 'water' ? 'Unsafe Water Source' : 'Health Issue',
        description: formData.description,
        category: formData.issueType,
        location: {
          latitude: 0,
          longitude: 0,
          address: formData.location
        },
        severity: 3 as 1 | 2 | 3 | 4 | 5
      });
      alert(t('reportSuccess', 'Report submitted successfully!'));
      setFormData({
        name: '',
        location: '',
        issueType: 'water',
        description: ''
      });
    } catch (error) {
      console.error(error);
      alert(t('reportError', 'Failed to submit report.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/50">
      <CardHeader>
        <CardTitle>{t('reportIssue')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
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
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="mt-1"
                placeholder="Village/Town, District"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="issueType">Issue Type</Label>
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="mt-1"
              rows={5}
              placeholder="Describe the issue in detail."
            />
          </div>

          <div>
            <Label htmlFor="upload">{t('uploadImage')} (Optional)</Label>
            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload photos of the issue
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? t('loading') : t('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
