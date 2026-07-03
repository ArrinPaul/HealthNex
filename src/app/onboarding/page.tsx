"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, User, Heart, Briefcase, 
  ChevronRight, ChevronLeft, Check,
  Loader2, Navigation, Globe
} from 'lucide-react';
import { toast } from 'sonner';

const INDIAN_STATES: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Lower Subansiri", "Upper Subansiri"],
  "Assam": ["Kamrup", "Nagaon", "Golaghat", "Jorhat", "Sivasagar", "Dibrugarh", "Tinsukia", "Cachar", "Karimganj", "Hailakandi", "Goalpara", "Darrang"],
  "Bihar": ["Patna", "Gaya", "Nalanda", "Muzaffarpur", "Vaishali", "Bhagalpur", "Munger", "Rohtas", "Aurangabad", "Nawada"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Korba", "Jagdalpur"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Jamnagar", "Bhavnagar", "Junagadh", "Gandhinagar"],
  "Haryana": ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Sonipat", "Rohtak", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Kullu", "Manali", "Dharamshala", "Mandi", "Kangra"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belgaum", "Gulbarga", "Davangere", "Shimoga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kottayam", "Alappuzha", "Palakkad", "Malappuram"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  "Manipur": ["Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur"],
  "Meghalaya": ["East Khasi Hills", "West Khasi Hills", "Jaintia Hills", "Garo Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur", "Berhampur", "Rourkela"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Pushkar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Rangpo"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida", "Meerut", "Allahabad", "Gorakhpur"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Nainital", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Bardhaman"],
  "Delhi (UT)": ["New Delhi", "Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  "Ladakh": ["Leh", "Kargil"],
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const COMMON_CONDITIONS = ['None', 'Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Thyroid', 'Kidney Disease', 'Allergies', 'Arthritis', 'Obesity'];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const [form, setForm] = useState({
    state: '',
    district: '',
    address: '',
    latitude: 0,
    longitude: 0,
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    medicalConditions: [] as string[],
    occupation: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/onboarding');
    } else if (user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        toast.success('Location detected');
        setLocating(false);
      },
      () => {
        toast.error('Could not detect location. Please select your state manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const toggleCondition = (cond: string) => {
    setForm(f => {
      if (cond === 'None') return { ...f, medicalConditions: [] };
      const filtered = f.medicalConditions.filter(c => c !== 'None');
      const exists = filtered.includes(cond);
      return {
        ...f,
        medicalConditions: exists ? filtered.filter(c => c !== cond) : [...filtered, cond],
      };
    });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.state;
      case 1: return !!form.dateOfBirth && !!form.gender;
      case 2: return !!form.occupation;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < 3 && canProceed()) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = document.cookie.match(/auth-token=([^;]+)/)?.[1] || '';
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('Profile completed!');
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    // Step 0: Location
    <div key="location" className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Where are you located?</h2>
        <p className="text-sm text-muted-foreground mt-1">This helps us provide region-specific health alerts and data.</p>
      </div>

      <Button variant="outline" className="w-full gap-2" onClick={detectLocation} disabled={locating}>
        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {locating ? 'Detecting...' : 'Use My Current Location'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or select manually</span></div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">State *</label>
          <select
            value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value, district: '' }))}
            className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select State</option>
            {Object.keys(INDIAN_STATES).sort().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {form.state && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">District</label>
            <select
              value={form.district}
              onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select District</option>
              {(INDIAN_STATES[form.state] || []).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Address (optional)</label>
          <Input
            placeholder="Village/Town, PIN code"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="h-10 rounded-xl"
          />
        </div>
      </div>
    </div>,

    // Step 1: Personal Info
    <div key="personal" className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <User className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Personal Information</h2>
        <p className="text-sm text-muted-foreground mt-1">Helps us personalize your health profile.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Birth *</label>
          <Input
            type="date"
            value={form.dateOfBirth}
            onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
            className="h-10 rounded-xl"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Gender *</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDERS.map(g => (
              <button
                key={g}
                onClick={() => setForm(f => ({ ...f, gender: g }))}
                className={`h-10 rounded-xl text-xs font-medium border transition-all ${
                  form.gender === g
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Blood Group</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                className={`h-10 rounded-xl text-xs font-medium border transition-all ${
                  form.bloodGroup === bg
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Step 2: Health & Occupation
    <div key="health" className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Heart className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Health & Occupation</h2>
        <p className="text-sm text-muted-foreground mt-1">Optional — helps with personalized health insights.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Occupation *</label>
          <Input
            placeholder="e.g. Student, Teacher, Farmer, Doctor"
            value={form.occupation}
            onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
            className="h-10 rounded-xl"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Medical Conditions</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_CONDITIONS.map(cond => (
              <button
                key={cond}
                onClick={() => toggleCondition(cond)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  (cond === 'None' && form.medicalConditions.length === 0) || form.medicalConditions.includes(cond)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Step 3: Review
    <div key="review" className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Review Your Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">Make sure everything looks correct.</p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-primary" /><span className="font-medium">Location</span></div>
          <p className="text-muted-foreground text-xs">{form.district ? `${form.district}, ` : ''}{form.state || 'Not set'}</p>
          {form.address && <p className="text-muted-foreground text-xs mt-0.5">{form.address}</p>}
          {form.latitude !== 0 && <p className="text-muted-foreground text-xs mt-0.5">GPS: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>}
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-primary" /><span className="font-medium">Personal</span></div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <p>DOB: {form.dateOfBirth || 'Not set'}</p>
            <p>Gender: {form.gender || 'Not set'}</p>
            <p>Blood: {form.bloodGroup || 'Not specified'}</p>
            <p>Occupation: {form.occupation || 'Not set'}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-2"><Heart className="w-4 h-4 text-primary" /><span className="font-medium">Medical</span></div>
          <p className="text-xs text-muted-foreground">
            {form.medicalConditions.length > 0 ? form.medicalConditions.join(', ') : 'No conditions reported'}
          </p>
        </div>
      </div>
    </div>,
  ];

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {totalSteps}</span>
            <span className="text-xs font-medium text-primary">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[420px] flex flex-col">
          <div className="flex-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
              >
                {steps[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
            {step > 0 ? (
              <Button variant="outline" className="gap-1" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}

            {step < totalSteps - 1 ? (
              <Button className="gap-1 ml-auto" onClick={nextStep} disabled={!canProceed()}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button className="gap-1 ml-auto" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {submitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You can update these details later in Settings.
        </p>
      </div>
    </div>
  );
}
