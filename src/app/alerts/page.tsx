"use client";

import { useState } from 'react';
// import { useTranslation } from 'react-i18next'; // Removed for SSR compatibility
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Droplet, Activity, Bell, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

interface AlertItem {
  id: number;
  type: 'outbreak' | 'water' | 'general';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  location: string;
  date: string;
  read: boolean;
}

export default function AlertsPage() {
  // const { t } = useTranslation(); // Removed for SSR compatibility
  const t = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Simple fallback
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 1,
      type: 'outbreak',
      severity: 'high',
      title: 'Predicted Outbreak: Dengue',
      message: 'AI model predicts increased dengue cases in the next 2 weeks based on current weather patterns and historical data.',
      location: 'Guwahati District',
      date: '2024-01-15T10:30:00',
      read: false
    },
    {
      id: 2,
      type: 'water',
      severity: 'high',
      title: 'Water Quality Alert: High Turbidity',
      message: 'Water sources in the area showing turbidity levels above safe limits. Recommend boiling water before consumption.',
      location: 'Jorhat Region',
      date: '2024-01-15T09:15:00',
      read: false
    },
    {
      id: 3,
      type: 'outbreak',
      severity: 'medium',
      title: 'Increased Cases: Waterborne Diseases',
      message: 'Moderate increase in waterborne disease reports. Enhanced surveillance recommended.',
      location: 'Dibrugarh',
      date: '2024-01-14T16:45:00',
      read: true
    },
    {
      id: 4,
      type: 'water',
      severity: 'medium',
      title: 'Water Quality: pH Levels',
      message: 'pH levels slightly below optimal range. Monitor water sources closely.',
      location: 'Tezpur',
      date: '2024-01-14T14:20:00',
      read: true
    },
    {
      id: 5,
      type: 'general',
      severity: 'low',
      title: 'Health Advisory: Seasonal Precautions',
      message: 'Monsoon season approaching. Increase awareness about waterborne diseases and vector control.',
      location: 'Assam State',
      date: '2024-01-13T08:00:00',
      read: true
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'outbreak':
        return Activity;
      case 'water':
        return Droplet;
      default:
        return Bell;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const markAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.read;
    return alert.severity === filter;
  });

  return (
    <ProtectedRoute allowedRoles={['admin', 'health-worker']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('alerts')}</h1>
          <p className="text-muted-foreground mt-2">
            Real-time alerts for disease outbreaks and water quality issues
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">Total Alerts</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-rose-500/10 border-rose-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-rose-400">
                {alerts.filter(a => a.severity === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Severity</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-400">
                {alerts.filter(a => a.severity === 'medium').length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Severity</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {alerts.filter(a => !a.read).length}
              </div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium">{t('filter')}:</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="high">High Severity</SelectItem>
                  <SelectItem value="medium">Medium Severity</SelectItem>
                  <SelectItem value="low">Low Severity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="backdrop-blur-xl bg-card/60 border border-[var(--border-soft)]">
              <CardContent className="pt-6 text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No alerts to display</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => {
              const Icon = getIcon(alert.type);
              return (
                <Card key={alert.id} className={`backdrop-blur-xl ${
                  !alert.read ? 'bg-primary/5 border-primary/20' : 'bg-card/60 border border-[var(--border-soft)]'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        alert.severity === 'high' ? 'bg-rose-500/15' :
                        alert.severity === 'medium' ? 'bg-amber-500/15' :
                        'bg-sky-500/15'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          alert.severity === 'high' ? 'text-rose-400' :
                          alert.severity === 'medium' ? 'text-amber-400' :
                          'text-sky-400'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {alert.title}
                              {!alert.read && (
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {alert.location}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-muted-foreground mb-3">{alert.message}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {new Date(alert.date).toLocaleString()}
                          </span>
                          {!alert.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsRead(alert.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}