"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Search, 
  Hospital, Pill, 
  Star, Navigation, 
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const FacilityCard = ({ name, type, address, phone, rating, status, distance }: any) => (
  <div className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group">
     <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'hospital' ? 'bg-primary/10 text-primary' : 'bg-emerald-500/10 text-emerald-500'}`}>
           {type === 'hospital' ? <Hospital className="w-5 h-5" /> : <Pill className="w-5 h-5" />}
        </div>
        <div className="text-right">
           <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'Open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {status}
           </span>
           <p className="text-xs text-muted-foreground mt-1">{distance}</p>
        </div>
     </div>

     <div className="space-y-1 mb-4">
        <h4 className="font-semibold text-sm">{name}</h4>
        <div className="flex items-center gap-1.5 text-muted-foreground">
           <MapPin className="w-3 h-3" />
           <p className="text-xs">{address}</p>
        </div>
     </div>

     <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
           <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
           <span className="text-xs font-medium">{rating}</span>
        </div>
        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => toast.info('Navigation coming soon')}>
           <Navigation className="w-3 h-3" /> Directions
        </Button>
     </div>
  </div>
);

export default function ResourcesPage() {
  const [search, setSearch] = useState('');

  const facilities = [
    { name: 'City General Hospital', type: 'hospital', address: '123 Main St, Downtown', phone: '(555) 123-4567', rating: 4.8, status: 'Open', distance: '0.8 km' },
    { name: 'Community Health Center', type: 'hospital', address: '456 Oak Ave, Midtown', phone: '(555) 234-5678', rating: 4.6, status: 'Open', distance: '1.2 km' },
    { name: 'QuickCare Pharmacy', type: 'pharmacy', address: '789 Elm St, Westside', phone: '(555) 345-6789', rating: 4.5, status: 'Open', distance: '1.5 km' },
    { name: 'Riverside Medical', type: 'hospital', address: '321 River Rd, Eastside', phone: '(555) 456-7890', rating: 4.7, status: 'Closing Soon', distance: '2.4 km' },
    { name: 'HealthPlus Pharmacy', type: 'pharmacy', address: '654 Pine Ln, Northside', phone: '(555) 567-8901', rating: 4.4, status: 'Open', distance: '3.1 km' },
    { name: 'Central Emergency Care', type: 'hospital', address: '987 Cedar Dr, Southside', phone: '(555) 678-9012', rating: 4.9, status: 'Open', distance: '4.5 km' }
  ];

  const filtered = facilities.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Health Resources</h1>
            <p className="text-muted-foreground text-sm mt-1">Find hospitals, pharmacies, and clinics near you.</p>
          </div>
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
               placeholder="Search facilities..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="h-10 pl-9 rounded-xl" 
             />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
           <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary font-medium mb-1">Nearby Facilities</p>
              <h3 className="text-2xl font-bold">{filtered.length}</h3>
           </div>
           <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-xs text-muted-foreground">Open Now</p>
              </div>
              <h3 className="text-2xl font-bold">{facilities.filter(f => f.status === 'Open').length}</h3>
           </div>
           <div className="p-5 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                 <Clock className="w-3.5 h-3.5 text-amber-500" />
                 <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <h3 className="text-2xl font-bold">~12 min</h3>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8">
              <div className="grid md:grid-cols-2 gap-4">
                 {filtered.map((f, i) => (
                   <FacilityCard key={f.name} {...f} />
                 ))}
              </div>
           </div>

           <div className="lg:col-span-4 space-y-4">
              <Card className="bg-rose-500/10 border border-rose-500/20">
                 <CardContent className="p-5 space-y-3">
                    <h4 className="font-semibold text-sm text-rose-500">Emergency</h4>
                    <Button className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium gap-2">
                       <Phone className="w-4 h-4" /> Call Emergency
                    </Button>
                 </CardContent>
              </Card>

              <Card className="bg-card border border-border">
                 <CardContent className="p-5 space-y-3">
                    <h4 className="font-semibold text-sm">Suggest a Facility</h4>
                    <p className="text-xs text-muted-foreground">Know a health facility that should be listed? Let us know.</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => toast.info('Feature coming soon')}>
                       Submit Facility
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
