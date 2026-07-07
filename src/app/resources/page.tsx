"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, Phone, Search, 
  Hospital, Pill, 
  Navigation, Loader2, RefreshCw, ExternalLink, MapPinned
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { lookupCoordsFromLocation } from '@/lib/location-utils';

interface Facility {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string;
  lat: number;
  lng: number;
  distance: number;
  isOpen: boolean | null;
  openingHours: string;
  specialties: string[];
  operator: string;
  beds: number | null;
}

const FacilityCard = ({ facility }: { facility: Facility }) => (
  <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        facility.type === 'hospital' ? 'bg-primary/10 text-primary' :
        facility.type === 'pharmacy' ? 'bg-emerald-500/10 text-emerald-500' :
        'bg-blue-500/10 text-blue-500'
      }`}>
        {facility.type === 'pharmacy' ? <Pill className="w-5 h-5" /> : <Hospital className="w-5 h-5" />}
      </div>
      <div className="text-right">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          facility.isOpen === true ? 'bg-emerald-500/10 text-emerald-500' :
          facility.isOpen === false ? 'bg-rose-500/10 text-rose-500' :
          'bg-gray-500/10 text-gray-500'
        }`}>
          {facility.isOpen === true ? 'Open' : facility.isOpen === false ? 'Closed' : 'Hours N/A'}
        </span>
        <p className="text-xs text-muted-foreground mt-1">{facility.distance} km</p>
      </div>
    </div>

    <div className="space-y-1 mb-4">
      <h4 className="font-semibold text-sm">{facility.name}</h4>
      {facility.address && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="w-3 h-3 shrink-0" />
          <p className="text-xs">{facility.address}</p>
        </div>
      )}
      {facility.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {facility.specialties.slice(0, 3).map((s, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-border">
      <div className="flex items-center gap-2">
        {facility.phone && (
          <a href={`tel:${facility.phone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Phone className="w-3 h-3" /> Call
          </a>
        )}
        {facility.website && (
          <a href={facility.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ExternalLink className="w-3 h-3" /> Web
          </a>
        )}
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-7 gap-1 text-xs"
        onClick={() => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
          window.open(url, '_blank');
        }}
      >
        <Navigation className="w-3 h-3" /> Directions
      </Button>
    </div>
  </div>
);

export default function ResourcesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'hospital' | 'pharmacy'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState('Detecting location...');

  // Derive location from user's onboarding profile
  const getProfileLocation = useCallback(() => {
    // Try direct coordinates first
    if (user?.userLocation?.latitude && user?.userLocation?.longitude) {
      const lat = user.userLocation.latitude;
      const lng = user.userLocation.longitude;
      const parts = [user.userLocation.district, user.userLocation.state].filter(Boolean);
      return { lat, lng, label: parts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
    }
    // Fallback: resolve from state/district even if lat/lng are 0
    if (user?.userLocation?.state) {
      const resolved = lookupCoordsFromLocation(user.userLocation.state, user.userLocation.district);
      if (resolved) {
        const parts = [user.userLocation.district, user.userLocation.state].filter(Boolean);
        return { lat: resolved.lat, lng: resolved.lng, label: parts.join(', ') };
      }
    }
    return null;
  }, [user]);

  const fetchFacilities = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}&radius=10&type=${filterType}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFacilities(data.facilities || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load facilities');
      toast.error('Could not load hospital data');
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    const profileLoc = getProfileLocation();

    // If profile has valid coordinates, use them directly (most reliable)
    if (profileLoc) {
      setUserLocation({ lat: profileLoc.lat, lng: profileLoc.lng });
      setLocationLabel(profileLoc.label);
      fetchFacilities(profileLoc.lat, profileLoc.lng);
      return;
    }

    // Try browser geolocation as secondary option
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setLocationLabel('Your current location');
          fetchFacilities(loc.lat, loc.lng);
        },
        () => {
          // Geolocation denied — use Delhi fallback
          const delhi = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(delhi);
          setLocationLabel('New Delhi (default)');
          fetchFacilities(delhi.lat, delhi.lng);
        },
        { timeout: 10000, maximumAge: 300000 }
      );
    } else {
      const delhi = { lat: 28.6139, lng: 77.2090 };
      setUserLocation(delhi);
      setLocationLabel('New Delhi (default)');
      fetchFacilities(delhi.lat, delhi.lng);
    }
  }, [fetchFacilities, getProfileLocation]);

  const filtered = facilities.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.address.toLowerCase().includes(search.toLowerCase()) ||
    f.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const openCount = facilities.filter(f => f.isOpen === true).length;

  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Health Resources</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Real hospitals & pharmacies near your location.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => userLocation && fetchFacilities(userLocation.lat, userLocation.lng)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Location badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-xl border border-border/50 w-fit">
          <MapPinned className="w-3.5 h-3.5 text-primary" />
          <span>Showing results for: <span className="font-medium text-foreground">{locationLabel}</span></span>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'hospital', 'pharmacy'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                filterType === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-secondary'
              }`}
            >
              {t === 'all' ? 'All' : t === 'hospital' ? 'Hospitals' : 'Pharmacies'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-xs text-primary font-medium mb-1">Nearby Facilities</p>
            <h3 className="text-2xl font-bold">{loading ? '—' : filtered.length}</h3>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs text-muted-foreground">Open Now</p>
            </div>
            <h3 className="text-2xl font-bold">{loading ? '—' : openCount}</h3>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">Search Radius</p>
            </div>
            <h3 className="text-2xl font-bold">10 km</h3>
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm">Fetching real hospital data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-sm text-rose-500 mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={() => userLocation && fetchFacilities(userLocation.lat, userLocation.lng)} disabled={!userLocation}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Retry
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Hospital className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No facilities found. Try a different search or location.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered.map((f) => (
                  <FacilityCard key={f.id} facility={f} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-rose-500/10 border border-rose-500/20">
              <CardContent className="p-5 space-y-3">
                <h4 className="font-semibold text-sm text-rose-500">Emergency</h4>
                <Button className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium gap-2" asChild>
                  <a href="tel:108">
                    <Phone className="w-4 h-4" /> Call Emergency (108)
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border">
              <CardContent className="p-5 space-y-3">
                <h4 className="font-semibold text-sm">Data Source</h4>
                <p className="text-xs text-muted-foreground">
                  Hospital data provided by OpenStreetMap contributors. Coordinates and details are community-maintained.
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" /> OpenStreetMap
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
