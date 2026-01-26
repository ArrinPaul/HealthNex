"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Upload, MessageSquare, Droplet, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function CommunityReportsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const reports = useQuery(api.communityReports.getReports);
  const createReport = useMutation(api.communityReports.createReport);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    issueType: 'water',
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
          latitude: 0, // In a real app, use geolocation
          longitude: 0,
          address: formData.location
        },
        severity: 3
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

  const communityReports = [
    {
      id: 1,
      reporter: 'Ram Kumar',
      location: 'Village Majuli, Assam',
      type: 'water',
      description: 'Local pond water appears contaminated. Many people experiencing stomach issues.',
      date: '2024-01-15',
      status: 'Under Investigation'
    },
    {
      id: 2,
      reporter: 'Anita Devi',
      location: 'Guwahati Ward 12',
      type: 'health',
      description: 'Multiple families in neighborhood reporting fever and body aches.',
      date: '2024-01-14',
      status: 'Confirmed'
    },
    {
      id: 3,
      reporter: 'Bhaskar Sharma',
      location: 'Jorhat Town',
      type: 'water',
      description: 'Hand pump water has unusual smell and taste. Concerned about safety.',
      date: '2024-01-13',
      status: 'Resolved'
    },
    {
      id: 4,
      reporter: 'Community ASHA',
      location: 'Tezpur District',
      type: 'health',
      description: 'Increase in diarrhea cases among children under 5 years.',
      date: '2024-01-12',
      status: 'Under Investigation'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('communityReports')}</h1>
          <p className="text-muted-foreground mt-2">
            Report health issues and unsafe water sources in your community
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">{t('reportIssue')}</TabsTrigger>
            <TabsTrigger value="reports">View Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
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
                      onValueChange={(value) => setFormData({ ...formData, issueType: value })}
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
                      placeholder="Describe the issue in detail. Include when it started, how many people affected, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="upload">{t('uploadImage')} (Optional)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload photos of the issue
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Privacy Notice:</strong> Your report will be reviewed by health officials. 
                      You can choose to submit anonymously. Your personal information will be kept confidential.
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? t('loading') : t('submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="backdrop-blur-xl bg-card/50">
              <CardHeader>
                <CardTitle>Community Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports?.map((report: any) => (
                    <Card key={report._id} className="backdrop-blur-xl bg-background/50">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            report.category === 'water' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            {report.category === 'water' ? (
                              <Droplet className="w-6 h-6 text-blue-600" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-orange-600" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="font-semibold">
                                  {report.category === 'water' ? t('unsafeWaterSource') : t('healthIssue')}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Reported • {report.location?.address}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  report.status === 'Confirmed' ? 'destructive' :
                                  report.status === 'resolved' ? 'default' :
                                  'secondary'
                                }
                              >
                                {report.status}
                              </Badge>
                            </div>

                            <p className="text-muted-foreground mb-3">{report.description}</p>

                            <div className="text-sm text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {reports?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No reports found in your community.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}