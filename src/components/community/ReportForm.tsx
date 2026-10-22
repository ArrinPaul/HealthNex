"use client";

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Droplet, AlertCircle, MapPin, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ReportForm() {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    issueType: 'water' as "water" | "health" | "outbreak" | "environmental" | "safety",
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation Unavailable', { description: 'GPS is not supported by your browser.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        toast.success('Location Tagged', {
          description: `GPS coordinates (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}) attached to report.`
        });
        setLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err.message);
        toast.info('Location Note', {
          description: 'Could not access GPS. Your typed village or district address will be used.'
        });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      toast.error('Unsupported File Type', {
        description: 'Please select a JPEG, PNG, or WebP image file.'
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('File Exceeds Limit', {
        description: `Image size must be 5MB or less. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Session Expired', { description: 'Please sign in again to submit reports.' });
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Missing Description', { description: 'Please provide a description of the issue.' });
      return;
    }

    setSubmitting(true);

    try {
      const lat = coords?.lat || 20.5937; // Default to India centroid if unpermitted
      const lng = coords?.lng || 78.9629;

      const submitData = new FormData();
      submitData.append('title', formData.issueType === 'water' ? 'Unsafe Water Source' : 'Health Issue');
      submitData.append('description', formData.description);
      submitData.append('category', formData.issueType);
      submitData.append('latitude', String(lat));
      submitData.append('longitude', String(lng));
      submitData.append('address', formData.location);
      submitData.append('severity', '3');

      if (selectedFile) {
        submitData.append('attachment', selectedFile);
      }

      const res = await fetch('/api/community-reports', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit community report.');
      }

      toast.success('Report Registered', {
        description: 'Your report has been submitted to the District Health Authorities for verification.'
      });

      // Reset form
      setFormData({
        name: '',
        location: '',
        issueType: 'water',
        description: ''
      });
      setCoords(null);
      handleRemoveFile();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Submission Failed', {
        description: error.message || 'Could not submit your report. Please check your connection and try again.'
      });
    } finally {
      setSubmitting(false);
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
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
                placeholder="Your name or Anonymous"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="location">{t('location')}</Label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={locating || submitting}
                  className="text-[11px] font-medium text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  <span>{coords ? "GPS Tagged" : "Detect GPS"}</span>
                </button>
              </div>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="mt-1"
                placeholder="Village/Town, District"
              />
              {coords && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  ✓ Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                </p>
              )}
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              id="report-photo-input"
            />

            {!selectedFile ? (
              <label
                htmlFor="report-photo-input"
                className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer block bg-card/30"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Click to select a photo of the issue
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: JPEG, PNG, WebP (Max 5MB, 1 image)
                </p>
              </label>
            ) : (
              <div className="mt-2 border rounded-lg p-4 bg-surface-2/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Attachment preview"
                      className="w-14 h-14 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={submitting}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full md:w-auto">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting report...
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
