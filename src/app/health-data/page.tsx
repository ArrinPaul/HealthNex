"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Search, Filter, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function HealthDataPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const reports = useQuery(api.healthData.getUserHealthData, { userId: "demo-user" as any });
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
    setLoading(true);
    try {
      await addReport({
        userId: "demo-user" as any,
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
      alert(t('reportSuccess', 'Health report submitted successfully!'));
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
    } finally {
      setLoading(false);
    }
  };

  const mockReports = [
    { id: 1, patient: 'Anonymous', symptoms: 'Fever, Headache', location: 'Guwahati', date: '2024-01-15', status: 'Under Review' },
    { id: 2, patient: 'Anonymous', symptoms: 'Diarrhea, Vomiting', location: 'Jorhat', date: '2024-01-14', status: 'Confirmed' },
    { id: 3, patient: 'Anonymous', symptoms: 'Cough, Fever', location: 'Dibrugarh', date: '2024-01-13', status: 'Resolved' },
    { id: 4, patient: 'Anonymous', symptoms: 'Skin Rash', location: 'Tezpur', date: '2024-01-12', status: 'Under Review' },
    { id: 5, patient: 'Anonymous', symptoms: 'Abdominal Pain', location: 'Shillong', date: '2024-01-11', status: 'Confirmed' }
  ];

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('healthData')}</h1>
          <p className="text-muted-foreground mt-2">
            Collect and manage health data reports
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submit">{t('submitReport')}</TabsTrigger>
            <TabsTrigger value="reports">{t('viewReports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="submit">
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
                      <Label htmlFor="age">Age</Label>
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
                      <Label htmlFor="gender">Gender</Label>
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
          </TabsContent>

          <TabsContent value="reports">
            <Card className="backdrop-blur-xl bg-card/50">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Health Reports</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      {t('search')}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      {t('filter')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.map((report: any) => (
                        <TableRow key={report._id}>
                          <TableCell className="font-medium">{report.data?.patientName || 'Anonymous'}</TableCell>
                          <TableCell className="max-w-xs truncate">{report.notes}</TableCell>
                          <TableCell>{report.location?.address}</TableCell>
                          <TableCell>{new Date(report.timestamp).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                report.severity > 7 ? 'destructive' :
                                report.severity > 4 ? 'default' :
                                'secondary'
                              }
                            >
                              {report.severity}/10
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {reports?.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                            No health reports found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}