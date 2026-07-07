"use client";

import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useDiseaseData, useDashboardAggregates } from '@/services/healthDataService';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DistributionSection from '@/components/dashboard/DistributionSection';
import { 
  Globe, Map as MapIcon, Zap, LayoutGrid, Bell, 
  Activity, ArrowRight, ShieldCheck, Download, Plus, Filter,
  RefreshCw, Radio, FileText, CheckCircle2, AlertOctagon, Terminal as TerminalIcon, Send, Eye, X, Check, ShieldAlert,
  Mic, Volume2, Sliders, CheckSquare, Trash2, Flame, Play, Square, Settings, MessageSquare, Database, Droplet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InstitutionalTrust from '@/components/dashboard/InstitutionalTrust';
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), { ssr: false });

const INDIAN_STATES_DISTRICTS: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  "Andhra Pradesh": [
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365 }
  ],
  "Arunachal Pradesh": [
    { name: "Itanagar", lat: 27.0844, lng: 93.6053 },
    { name: "Tawang", lat: 27.5860, lng: 91.8594 }
  ],
  "Assam": [
    { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
    { name: "Dibrugarh", lat: 27.4728, lng: 94.9120 },
    { name: "Silchar", lat: 24.8333, lng: 92.7789 },
    { name: "Jorhat", lat: 26.7509, lng: 94.2037 }
  ],
  "Bihar": [
    { name: "Patna", lat: 25.5941, lng: 85.1376 },
    { name: "Gaya", lat: 24.7955, lng: 84.9994 },
    { name: "Muzaffarpur", lat: 26.1209, lng: 85.3647 }
  ],
  "Chhattisgarh": [
    { name: "Raipur", lat: 21.2514, lng: 81.6296 },
    { name: "Bilaspur", lat: 22.0790, lng: 82.1391 }
  ],
  "Goa": [
    { name: "Panaji", lat: 15.4909, lng: 73.8278 },
    { name: "Margao", lat: 15.2736, lng: 73.9580 }
  ],
  "Gujarat": [
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Surat", lat: 21.1702, lng: 72.8311 },
    { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
    { name: "Rajkot", lat: 22.3039, lng: 70.8022 }
  ],
  "Haryana": [
    { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
    { name: "Faridabad", lat: 28.4089, lng: 77.3178 },
    { name: "Ambala", lat: 30.3782, lng: 76.7767 }
  ],
  "Himachal Pradesh": [
    { name: "Shimla", lat: 31.1048, lng: 77.1734 },
    { name: "Dharamshala", lat: 32.2190, lng: 76.3234 }
  ],
  "Jharkhand": [
    { name: "Ranchi", lat: 23.3441, lng: 85.3096 },
    { name: "Jamshedpur", lat: 22.8046, lng: 86.2029 }
  ],
  "Karnataka": [
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { name: "Hubballi", lat: 15.3647, lng: 75.1240 },
    { name: "Mangaluru", lat: 12.9141, lng: 74.8560 }
  ],
  "Kerala": [
    { name: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366 },
    { name: "Kochi", lat: 9.9312, lng: 76.2673 },
    { name: "Kozhikode", lat: 11.2588, lng: 75.7804 }
  ],
  "Madhya Pradesh": [
    { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
    { name: "Indore", lat: 22.7196, lng: 75.8577 },
    { name: "Gwalior", lat: 26.2183, lng: 78.1828 }
  ],
  "Maharashtra": [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Nashik", lat: 19.9975, lng: 73.7898 }
  ],
  "Manipur": [
    { name: "Imphal", lat: 24.8170, lng: 93.9368 }
  ],
  "Meghalaya": [
    { name: "Shillong", lat: 25.5788, lng: 91.8933 },
    { name: "Tura", lat: 25.5141, lng: 90.2201 }
  ],
  "Mizoram": [
    { name: "Aizawl", lat: 23.7307, lng: 92.7173 }
  ],
  "Nagaland": [
    { name: "Kohima", lat: 25.6751, lng: 94.1086 },
    { name: "Dimapur", lat: 25.9080, lng: 93.7259 }
  ],
  "Odisha": [
    { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
    { name: "Cuttack", lat: 20.4625, lng: 85.8830 },
    { name: "Rourkela", lat: 22.2604, lng: 84.8536 }
  ],
  "Punjab": [
    { name: "Ludhiana", lat: 30.9010, lng: 75.8573 },
    { name: "Amritsar", lat: 31.6340, lng: 74.8723 },
    { name: "Jalandhar", lat: 31.3260, lng: 75.5762 }
  ],
  "Rajasthan": [
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Jodhpur", lat: 26.2389, lng: 73.0243 },
    { name: "Udaipur", lat: 24.5854, lng: 73.7125 },
    { name: "Kota", lat: 25.2138, lng: 75.8648 }
  ],
  "Sikkim": [
    { name: "Gangtok", lat: 27.3314, lng: 88.6138 }
  ],
  "Tamil Nadu": [
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore", lat: 11.0168, lng: 76.9558 },
    { name: "Madurai", lat: 9.9252, lng: 78.1198 }
  ],
  "Telangana": [
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Warangal", lat: 17.9784, lng: 79.5941 }
  ],
  "Tripura": [
    { name: "Agartala", lat: 23.8315, lng: 91.2868 }
  ],
  "Uttar Pradesh": [
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { name: "Varanasi", lat: 25.3176, lng: 82.9739 },
    { name: "Agra", lat: 27.1767, lng: 78.0081 },
    { name: "Noida", lat: 28.5355, lng: 77.3910 }
  ],
  "Uttarakhand": [
    { name: "Dehradun", lat: 30.3165, lng: 78.0322 },
    { name: "Haridwar", lat: 29.9457, lng: 78.1642 }
  ],
  "West Bengal": [
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Darjeeling", lat: 27.0410, lng: 88.2627 },
    { name: "Siliguri", lat: 26.7271, lng: 88.3953 }
  ],
  "Delhi (UT)": [
    { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Dwarka", lat: 28.5823, lng: 77.0500 }
  ],
  "Jammu & Kashmir": [
    { name: "Srinagar", lat: 34.0837, lng: 74.7973 },
    { name: "Jammu", lat: 32.7266, lng: 74.8570 }
  ],
  "Ladakh": [
    { name: "Leh", lat: 34.1526, lng: 77.5771 }
  ],
  "Puducherry": [
    { name: "Puducherry", lat: 11.9416, lng: 79.8083 }
  ]
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  // State for all active outbreaks (merged Convex + static default + custom overrides)
  const [outbreaks, setOutbreaks] = useState<any[]>([]);
  const [escalatedList, setEscalatedList] = useState<string[]>([]);
  
  // Interactive Panel States
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState("all");
  const [selectedHotspot, setSelectedHotspot] = useState<{ lat: number; lng: number } | null>(null);
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);
  const [nodeLogs, setNodeLogs] = useState<Record<string, string[]>>({});
  const [nodeLogInput, setNodeLogInput] = useState("");
  
  // HUD controls
  const [acousticScanner, setAcousticScanner] = useState(true);
  const [ocrScanner, setOcrScanner] = useState(true);
  const [heatmapInterpolation, setHeatmapInterpolation] = useState(false);
  
  // Simulation and UI states
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isMitigatingAll, setIsMitigatingAll] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [selectedState, setSelectedState] = useState<string>("Delhi (UT)");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("New Delhi");

  const [mockForm, setMockForm] = useState({
    disease: "Cholera",
    cases: 35,
    location: "New Delhi, Delhi (UT)",
    latitude: 28.6139,
    longitude: 77.2090,
    severity: "high"
  });

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    const districts = INDIAN_STATES_DISTRICTS[stateName];
    if (districts && districts.length > 0) {
      const firstDistrict = districts[0];
      setSelectedDistrict(firstDistrict.name);
      setMockForm(prev => ({
        ...prev,
        location: `${firstDistrict.name}, ${stateName}`,
        latitude: firstDistrict.lat,
        longitude: firstDistrict.lng
      }));
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
    const districts = INDIAN_STATES_DISTRICTS[selectedState];
    const dist = districts.find(d => d.name === districtName);
    if (dist) {
      setMockForm(prev => ({
        ...prev,
        location: `${dist.name}, ${selectedState}`,
        latitude: dist.lat,
        longitude: dist.lng
      }));
    }
  };

  // WHO & Weather Telemetry States
  const [configTab, setConfigTab] = useState<"hud" | "who">("hud");
  const [whoRecords, setWhoRecords] = useState<any[]>([]);
  const [whoDisease, setWhoDisease] = useState<string>("cholera");
  const [whoLoading, setWhoLoading] = useState<boolean>(false);

  const [nodeWeather, setNodeWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  // Fetch WHO GHO data
  useEffect(() => {
    if (configTab !== "who") return;
    const fetchWhoData = async () => {
      setWhoLoading(true);
      try {
        const res = await fetch(`/api/health/who?disease=${whoDisease}`);
        const data = await res.json();
        if (data.success) {
          setWhoRecords(data.records || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setWhoLoading(false);
      }
    };
    fetchWhoData();
  }, [configTab, whoDisease]);

  // Fetch live weather data for the inspected node
  useEffect(() => {
    const inspectedNode = outbreaks.find(o => o.id === inspectedNodeId);
    if (!inspectedNodeId || !inspectedNode) {
      setNodeWeather(null);
      return;
    }
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch(`/api/weather?lat=${inspectedNode.lat || inspectedNode.latitude}&lon=${inspectedNode.lng || inspectedNode.longitude}`);
        const data = await res.json();
        if (data && !data.error) {
          setNodeWeather(data);
        } else {
          setNodeWeather(null);
        }
      } catch (err) {
        console.error(err);
        setNodeWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [inspectedNodeId, outbreaks]);

  // Terminal Logs
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "HEALTHNEX COGNITIVE SURVEILLANCE v1.2.0",
    "Type 'help' to review console triggers.",
    "Ready for telemetry directives..."
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const diseaseData = useDiseaseData();
  const aggregates = useDashboardAggregates();
  const { user, token } = useAuth();
  const trackUsage = useMutation(api.usage.trackUsage as any);

  // Load baseline outbreaks
  useEffect(() => {
    setIsMounted(true);
    if (token) trackUsage({ token, feature: 'dashboard_view', status: 'success' }).catch(() => {});
    
    const defaultHotspots = [
      { id: "default-1", lat: 28.6139, lng: 77.2090, cases: 45, location: 'Delhi', disease: 'COVID', severity: 'critical', timestamp: Date.now() },
      { id: "default-2", lat: 19.0760, lng: 72.8777, cases: 38, location: 'Mumbai', disease: 'Dengue', severity: 'high', timestamp: Date.now() - 3600000 },
      { id: "default-3", lat: 22.5726, lng: 88.3639, cases: 28, location: 'Kolkata', disease: 'Cholera', severity: 'medium', timestamp: Date.now() - 7200000 },
      { id: "default-4", lat: 12.9716, lng: 77.5946, cases: 15, location: 'Bengaluru', disease: 'Flu', severity: 'low', timestamp: Date.now() - 14400000 },
      { id: "default-5", lat: 26.1445, lng: 91.7362, cases: 23, location: 'Guwahati', disease: 'Malaria', severity: 'medium', timestamp: Date.now() - 28800000 }
    ];

    if (Array.isArray(diseaseData) && diseaseData.length > 0) {
      const dbHotspots = diseaseData.map((d: any) => ({
        id: d._id || Math.random().toString(),
        lat: d.latitude || 0,
        lng: d.longitude || 0,
        cases: d.confirmedCases || d.cases || 0,
        location: d.location || 'Unknown',
        disease: d.disease || 'General',
        severity: d.severity || 'medium',
        timestamp: d.timestamp || Date.now()
      }));
      setOutbreaks(dbHotspots);
    } else {
      setOutbreaks(defaultHotspots);
    }
  }, [diseaseData]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Filters calculation
  const getFilteredOutbreaks = () => {
    let result = outbreaks;
    if (selectedDiseaseFilter !== "all") {
      result = result.filter(h => h.disease.toLowerCase().includes(selectedDiseaseFilter.toLowerCase()));
    }
    if (selectedSeverityFilter !== "all") {
      result = result.filter(h => h.severity === selectedSeverityFilter);
    }
    return result;
  };

  const activeHotspots = getFilteredOutbreaks();

  // Dynamic calculations feeding subcomponents
  const getDynamicStats = () => {
    const totalCases = outbreaks.reduce((sum, h) => sum + h.cases, 0);
    const activeAlerts = outbreaks.filter(h => h.severity === "critical" || h.severity === "high").length;
    const aiInsightsCount = outbreaks.filter(h => h.severity === "critical").length;
    
    // Nodes calculation accounts for active scanners toggled online
    let baseNodesCount = outbreaks.length;
    if (acousticScanner) baseNodesCount += 4;
    if (ocrScanner) baseNodesCount += 4;
    if (heatmapInterpolation) baseNodesCount += 5;
    
    return {
      totalCases,
      activeAlerts,
      aiInsightsCount,
      totalNodes: baseNodesCount
    };
  };

  const getDynamicDistribution = () => {
    const categories = {
      Waterborne: outbreaks.filter(h => h.disease.toLowerCase().includes("cholera") || h.disease.toLowerCase().includes("water")).length,
      Vector: outbreaks.filter(h => h.disease.toLowerCase().includes("dengue") || h.disease.toLowerCase().includes("malaria") || h.disease.toLowerCase().includes("mosquito")).length,
      Respiratory: outbreaks.filter(h => h.disease.toLowerCase().includes("covid") || h.disease.toLowerCase().includes("flu") || h.disease.toLowerCase().includes("respiratory")).length,
      Environmental: outbreaks.filter(h => h.disease.toLowerCase().includes("environmental") || h.disease.toLowerCase().includes("safety")).length || 2
    };
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getDynamicTrends = () => {
    const baseline = [
      { month: "Jan", actual: 12, predicted: 15 },
      { month: "Feb", actual: 19, predicted: 18 },
      { month: "Mar", actual: 15, predicted: 20 },
      { month: "Apr", actual: 28, predicted: 24 },
      { month: "May", actual: 22, predicted: 26 },
      { month: "Jun", actual: outbreaks.length * 4, predicted: outbreaks.length * 4 + 4 }
    ];
    return baseline;
  };

  // Actions
  const handleResolveIncident = (id: string, location: string) => {
    setOutbreaks(prev => prev.filter(o => o.id !== id));
    toast.success(`Incident in ${location} marked as CONTAINED & RESOLVED.`);
    setTerminalLogs(prev => [...prev, `[RESOLVED] incident solved at node: ${location}`]);
    if (selectedHotspot && activeHotspots.find(h => h.id === id)) {
      setSelectedHotspot(null);
    }
    if (inspectedNodeId === id) setInspectedNodeId(null);
  };

  const handleEscalateIncident = (id: string, location: string) => {
    if (escalatedList.includes(id)) {
      setEscalatedList(prev => prev.filter(item => item !== id));
      toast.info(`Escalation caution flag removed for ${location}.`);
      setTerminalLogs(prev => [...prev, `[STATUS] De-escalated warnings for node: ${location}`]);
    } else {
      setEscalatedList(prev => [...prev, id]);
      toast.error(`[EMERGENCY] Escalating outbreak threats in ${location}! Alert broadcasted.`, { duration: 6000 });
      setTerminalLogs(prev => [...prev, `[ESCALATION] Emergency signals dispatched to district: ${location}`]);
    }
  };

  // Cascade resolve all active incidents
  const handleMitigateAll = async () => {
    if (outbreaks.length === 0) {
      toast.info("No active incidents to mitigate.");
      return;
    }
    setIsMitigatingAll(true);
    setTerminalLogs(prev => [...prev, "[SHUTDOWN] Starting emergency containment protocols..."]);
    
    // Resolve one by one
    const localOutbreaksCopy = [...outbreaks];
    for (let i = 0; i < localOutbreaksCopy.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 450));
      const target = localOutbreaksCopy[i];
      setOutbreaks(prev => prev.filter(o => o.id !== target.id));
      setTerminalLogs(prev => [...prev, `[CONTAINED] Node cleared: ${target.location}`]);
      toast.success(`Contained: ${target.location}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsMitigatingAll(false);
    setSelectedHotspot(null);
    setInspectedNodeId(null);
    toast.info("All regional disease parameters brought back to nominal levels.");
    setTerminalLogs(prev => [...prev, "[SYSTEM] Threat levels nominal. 0 cases reported."]);
  };

  const simulateLiveEvent = () => {
    const allLocations = Object.entries(INDIAN_STATES_DISTRICTS).flatMap(([state, districts]) => 
      districts.map(d => ({ name: `${d.name}, ${state}`, lat: d.lat, lng: d.lng }))
    );
    
    const targetCity = allLocations[Math.floor(Math.random() * allLocations.length)];
    
    const diseases = ["Cholera", "Dengue", "COVID", "Malaria", "Flu"];
    const severities = ["medium", "high", "critical"];

    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const cases = Math.floor(Math.random() * 55) + 20;

    const simulatedIncident = {
      id: `sim-${Date.now()}`,
      lat: targetCity.lat,
      lng: targetCity.lng,
      cases,
      location: targetCity.name,
      disease,
      severity,
      timestamp: Date.now()
    };

    setOutbreaks(prev => [simulatedIncident, ...prev]);
    setSelectedHotspot({ lat: targetCity.lat, lng: targetCity.lng });
    toast.warning(`[SIMULATION] Spontaneous ${disease} outbreak reported in ${targetCity.name}!`);
    setTerminalLogs(prev => [...prev, `[SIM_ALERT] Ingested raw telemetry warning: ${cases} cases at ${targetCity.name}`]);
  };

  const handleSeedIDSP = async () => {
    try {
      setTerminalLogs(prev => [...prev, "[DATABASE] Ingesting IDSP CSV telemetry seed stream..."]);
      const res = await fetch("/api/health/seed-idsp", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || `Successfully seeded ${result.count} real historical IDSP outbreaks!`);
        setTerminalLogs(prev => [...prev, `[DATABASE] Synced ${result.count} official IDSP telemetry records from CSV`]);
      } else {
        toast.error(result.error || "Failed to seed historical outbreaks");
        setTerminalLogs(prev => [...prev, `[DATABASE] Seeding failure: ${result.error || "Unknown error"}`]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to seed real historical outbreaks");
      setTerminalLogs(prev => [...prev, `[DATABASE] System connection error during seed transmission`]);
    }
  };

  // Node Comments Log system
  const handleAddNodeLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedNodeId || !nodeLogInput.trim()) return;

    setNodeLogs(prev => {
      const currentLogs = prev[inspectedNodeId] || [];
      return {
        ...prev,
        [inspectedNodeId]: [...currentLogs, `[${new Date().toLocaleTimeString()}] ${nodeLogInput}`]
      };
    });

    setTerminalLogs(prev => [...prev, `[LOG_RECORDED] Added comment to node ${inspectedNodeId}`]);
    setNodeLogInput("");
  };

  // Audio speech synthesis simulation
  const triggerAudioScanner = async () => {
    setIsRecording(true);
    setTerminalLogs(prev => [...prev, "[VOICE] Initializing acoustic recording sweep..."]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    const simulatedAudioInput = "High fever spike and respiratory coughs reported in Sualkuchi Sector 3 after drinking local canal water.";
    setTerminalLogs(prev => [
      ...prev, 
      `[AUDIO_INGESTED] Raw speech: "${simulatedAudioInput}"`,
      "[VOICE] Parsing speech parameters using Neural Parser..."
    ]);

    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Inject parsed data
    const parsedOutbreak = {
      id: `voice-${Date.now()}`,
      lat: 28.5823,
      lng: 77.0500,
      cases: 26,
      location: "Dwarka, Delhi (UT)",
      disease: "Waterborne Cholera",
      severity: "high",
      timestamp: Date.now()
    };
    
    setOutbreaks(prev => [parsedOutbreak, ...prev]);
    setSelectedHotspot({ lat: 28.5823, lng: 77.0500 });
    setIsRecording(false);
    toast.success("Voice telemetry ingested! Outbreak parsed at Dwarka, Delhi (UT).");
    setTerminalLogs(prev => [...prev, `[INGESTION] Plotted voice parsed node at lat: 28.58, lng: 77.05`]);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      userScope: user?.role,
      telemetryNodesCount: outbreaks.length,
      timestamp: Date.now(),
      records: outbreaks
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `healthnex_telemetry_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Telemetry report exported successfully.");
  };

  // Terminal CLI submission
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const args = cmd.split(" ");
    const primaryCmd = args[0];

    let response = "";
    
    switch (primaryCmd) {
      case 'help':
        response = "Directives Menu:\n - help : List commands\n - scan : Run diagnostic sweep\n - alert <msg> : Broadcast Sonner warning\n - clear : Wipe logs\n - status : Show sync statistics\n - inject : Inject mock outbreak\n - resolve <city> : Solve outbreak by city\n - toggle <node> : Toggle scanner (acoustic/ocr/heatmap)";
        break;
      case 'scan':
        response = `Scan completed. Scanned ${outbreaks.length} active reporting nodes. Detections count:\n - Waterborne: ${outbreaks.filter(o => o.disease === 'Cholera').length}\n - Vector-borne: ${outbreaks.filter(o => o.disease === 'Dengue' || o.disease === 'Malaria').length}`;
        break;
      case 'clear':
        setTerminalLogs([]);
        setTerminalInput("");
        return;
      case 'status':
        response = `NODE_SOCKET://ONLINE\nCLOUD_LATENCY://18ms\nRECORDS_SYNCED://${outbreaks.length}\nSCANNERS://Acoustic:${acousticScanner ? 'ON':'OFF'}|OCR:${ocrScanner ? 'ON':'OFF'}`;
        break;
      case 'toggle':
        const targetScanner = args[1];
        if (targetScanner === 'acoustic') {
          setAcousticScanner(prev => !prev);
          response = `Acoustic scanner node set to ${!acousticScanner ? 'ON' : 'OFF'}`;
        } else if (targetScanner === 'ocr') {
          setOcrScanner(prev => !prev);
          response = `OCR scanner node set to ${!ocrScanner ? 'ON' : 'OFF'}`;
        } else if (targetScanner === 'heatmap') {
          setHeatmapInterpolation(prev => !prev);
          response = `Heatmap interpolation mode set to ${!heatmapInterpolation ? 'ON' : 'OFF'}`;
        } else {
          response = "Usage: toggle [acoustic | ocr | heatmap]";
        }
        break;
      case 'alert':
        const alertMsg = args.slice(1).join(" ");
        if (alertMsg) {
          toast.warning(`[COMMAND BROADCAST] ${alertMsg}`, { duration: 5000 });
          response = `Dispatched message successfully: "${alertMsg}"`;
        } else {
          response = "Error: Please specify message. E.g. 'alert water hazard'";
        }
        break;
      case 'inject':
        simulateLiveEvent();
        response = "Injected spontaneous simulated case node on Leaflet dashboard.";
        break;
      case 'resolve':
        const searchCity = args.slice(1).join(" ");
        if (searchCity) {
          const target = outbreaks.find(o => o.location.toLowerCase() === searchCity.toLowerCase());
          if (target) {
            handleResolveIncident(target.id, target.location);
            response = `Outbreak solved at node: ${target.location}`;
          } else {
            response = `Node mismatch: No outbreak found at '${searchCity}'`;
          }
        } else {
          response = "Syntax Error: Use 'resolve <city_name>'. E.g. 'resolve guwahati'";
        }
        break;
      default:
        response = `Unknown Directive: '${primaryCmd}'. Type 'help' for instructions.`;
    }

    setTerminalLogs(prev => [...prev, `> ${terminalInput}`, response]);
    setTerminalInput("");
  };

  const submitSimulationForm = (e: React.FormEvent) => {
    e.preventDefault();
    const newHotspot = {
      id: `form-${Date.now()}`,
      disease: mockForm.disease,
      cases: Number(mockForm.cases),
      location: mockForm.location,
      latitude: Number(mockForm.latitude),
      longitude: Number(mockForm.longitude),
      severity: mockForm.severity,
      timestamp: Date.now()
    };
    
    setOutbreaks(prev => [newHotspot, ...prev]);
    setSelectedHotspot({ lat: newHotspot.latitude, lng: newHotspot.longitude });
    setIsSimulateOpen(false);
    toast.success(`Outbreak successfully plotted in ${mockForm.location}!`);
    setTerminalLogs(prev => [...prev, `[INGESTION] Plotted mock incident coordinates at ${mockForm.location}`]);
  };

  const activeCategories = ["all", "cholera", "dengue", "covid", "flu", "malaria"];
  const inspectedNode = outbreaks.find(o => o.id === inspectedNodeId);

  return (
    <ProtectedRoute allowedRoles={['super-admin', 'admin', 'health-worker', 'community-user']}>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 p-6 lg:p-8">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/3 to-transparent rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              {/* Live Status Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">Live Telemetry Active</span>
                <span className="text-[9px] text-emerald-400/70 font-mono">NODE://ONLINE</span>
              </motion.div>
              
              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  Command{' '}
                  <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-lg">
                  Global health surveillance audit command system — Monitor, analyze, and respond to disease outbreaks across India in real-time.
                </p>
              </motion.div>
              
              {/* Quick Stats Row */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="font-semibold">{outbreaks.length}</span> Active Nodes
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-semibold">{outbreaks.filter(h => h.severity === 'critical' || h.severity === 'high').length}</span> Critical Alerts
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold">24/7</span> Surveillance
                </div>
              </motion.div>
            </div>
            
            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-2"
            >
              <Button
                onClick={handleSeedIDSP}
                variant="outline"
                className="h-9 px-3 rounded-xl text-[11px] font-semibold border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                Seed IDSP
              </Button>

              <Button
                onClick={simulateLiveEvent}
                variant="outline"
                className="h-9 px-3 rounded-xl text-[11px] font-semibold border-primary/30 hover:bg-primary/10 text-primary flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                Simulate
              </Button>

              <Button
                onClick={handleMitigateAll}
                disabled={isMitigatingAll || outbreaks.length === 0}
                variant="outline"
                className="h-9 px-3 rounded-xl text-[11px] font-semibold border-red-500/30 hover:bg-red-500/10 text-red-400 flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                {isMitigatingAll ? "Resolving..." : "Mitigate All"}
              </Button>

              <Button
                onClick={() => router.push('/surveillance')}
                variant="outline"
                className="h-9 px-3 rounded-xl text-[11px] font-semibold border-border/60 hover:bg-secondary/80 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Reports
              </Button>
              
              <Button
                onClick={handleExportData}
                variant="outline"
                className="h-9 px-3 rounded-xl text-[11px] font-semibold border-border/60 hover:bg-secondary/80 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
              
              <Button
                onClick={() => setIsSimulateOpen(true)}
                className="h-9 px-4 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Report
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Filters and Search toolbar */}
        <div className="bg-secondary/45 border border-border/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Category */}
            <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border/50 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Category:
              </span>
              <div className="flex gap-1 flex-wrap">
                {activeCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedDiseaseFilter(cat);
                      setSelectedHotspot(null);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wide font-extrabold transition-all border ${
                      selectedDiseaseFilter === cat 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-secondary text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Severity */}
            <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border/50 shadow-sm">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 flex items-center gap-1.5">
                <Sliders className="w-3 h-3" /> Severity:
              </span>
              <div className="flex gap-1 flex-wrap">
                {["all", "critical", "high", "medium", "low"].map(sev => (
                  <button
                    key={sev}
                    onClick={() => {
                      setSelectedSeverityFilter(sev);
                      setSelectedHotspot(null);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wide font-extrabold transition-all border ${
                      selectedSeverityFilter === sev 
                        ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                        : "bg-secondary text-muted-foreground border-transparent hover:bg-muted"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground/80 bg-card px-3 py-1.5 rounded-xl border border-border/55">
            <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>NODE_ID: {user?.id?.slice(0, 8) || 'healthnex'} ({user?.role})</span>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsGrid statsData={getDynamicStats()} />
        </div>

        {/* Main Content Layout (Map + Incident List / Detail Inspector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (8 Cols): Map */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col relative shadow-xl"
            >
              <div className="p-4 border-b border-border/60 flex items-center justify-between shrink-0 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Spatial Hazard Projection Map</h3>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> Critical
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> High
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Medium/Low
                  </div>
                </div>
              </div>
              
              <div className="h-[420px] w-full relative">
                {isMounted ? (
                  <DiseaseMap hotspots={activeHotspots} selectedHotspot={selectedHotspot} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs font-semibold bg-secondary/30">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column (4 Cols): Directory or Detail Inspector */}
          <div className="lg:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
              {inspectedNodeId && inspectedNode ? (
                /* IN-DEPTH NODE DETAILED INSPECTOR DRAW PANEL */
                <motion.div 
                  key="inspector"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-lg max-h-[480px] h-[480px] text-left relative overflow-hidden"
                >
                  <button 
                    onClick={() => setInspectedNodeId(null)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>

                  <div className="mb-4 pb-3 border-b border-border/40">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        inspectedNode.severity === 'critical' ? 'bg-red-500/15 text-red-500' :
                        inspectedNode.severity === 'high' ? 'bg-amber-500/15 text-amber-500' :
                        'bg-emerald-500/15 text-emerald-500'
                      }`}>
                        {inspectedNode.severity} ALERT
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-foreground">{inspectedNode.location} Node</h3>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto mb-4 scrollbar-thin text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-secondary/45 p-3 rounded-xl border border-border/55">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-bold">DISEASE</span>
                        <span className="font-bold text-foreground">{inspectedNode.disease}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-bold">CASES</span>
                        <span className="font-bold text-foreground">{inspectedNode.cases} active</span>
                      </div>
                    </div>

                    {/* Real-Time Climate Metrics */}
                    <div className="bg-cyan-500/5 border border-cyan-500/15 p-3 rounded-xl">
                      <span className="text-[10px] text-cyan-400 block font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                        <Droplet className="w-3.5 h-3.5" /> Environmental Metrics (Live)
                      </span>
                      {weatherLoading ? (
                        <div className="text-[9px] text-muted-foreground animate-pulse font-mono">Querying weather node...</div>
                      ) : nodeWeather ? (
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-foreground font-semibold">
                          <div>Temp: <span className="text-cyan-400 font-bold">{nodeWeather.current.temperature}°C</span></div>
                          <div>Humidity: <span className="text-cyan-400 font-bold">{nodeWeather.current.humidity}%</span></div>
                          <div className="col-span-2">Condition: <span className="text-cyan-400 font-bold">{nodeWeather.current.condition}</span></div>
                        </div>
                      ) : (
                        <div className="text-[9px] text-muted-foreground italic font-mono">Weather telemetry unavailable</div>
                      )}
                    </div>

                    {/* Node logs / timeline updates */}
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Action Log Logbook</span>
                      <div className="space-y-1.5 font-mono text-[9px] text-muted-foreground">
                        {(nodeLogs[inspectedNode.id] || []).length === 0 ? (
                          <div className="italic text-muted-foreground/60 py-2">No comments logged for this outbreak yet.</div>
                        ) : (
                          nodeLogs[inspectedNode.id].map((log, index) => (
                            <div key={index} className="p-1.5 rounded bg-secondary/30 border border-border/40">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Log / Action Form */}
                  <form onSubmit={handleAddNodeLog} className="mt-auto pt-3 border-t border-border/40 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={nodeLogInput}
                        onChange={(e) => setNodeLogInput(e.target.value)}
                        placeholder="Log new countermeasure..."
                        className="flex-1 bg-secondary border border-border px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                      />
                      <Button type="submit" className="h-8 px-3 rounded-xl text-[10px] font-bold bg-primary text-primary-foreground shrink-0">
                        Log
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleResolveIncident(inspectedNode.id, inspectedNode.location)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-bold text-[10px] text-center hover:bg-emerald-600 transition-all"
                      >
                        Contain outbreak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEscalateIncident(inspectedNode.id, inspectedNode.location)}
                        className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border font-bold text-[10px] text-center text-foreground transition-all"
                      >
                        {escalatedList.includes(inspectedNode.id) ? "De-escalate" : "Escalate Warnings"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* INCIDENT DIRECTORY CARD LIST */
                <motion.div 
                  key="directory"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-lg max-h-[480px] h-[480px]"
                >
                  <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3 justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">Incident Directory</h3>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{activeHotspots.length} Nodes</span>
                  </div>
                  
                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 text-left scrollbar-thin">
                    {activeHotspots.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-10 italic">
                        No active reports found matching filters.
                      </div>
                    ) : (
                      activeHotspots.map((hotspot) => {
                        const isSelected = selectedHotspot?.lat === hotspot.lat && selectedHotspot?.lng === hotspot.lng;
                        const isEscalated = escalatedList.includes(hotspot.id);

                        return (
                          <div 
                            key={hotspot.id}
                            onClick={() => {
                              setSelectedHotspot({ lat: hotspot.lat, lng: hotspot.lng });
                              setInspectedNodeId(hotspot.id);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group/item ${
                              isEscalated 
                                ? "bg-red-500/5 border-red-500/40 shadow-sm animate-pulse-subtle" 
                                : isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/60 bg-secondary/20 hover:bg-secondary/50 hover:border-border"
                            }`}
                          >
                            {isEscalated && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                            )}

                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="text-xs font-bold text-foreground">
                                {hotspot.location}
                              </span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.25 rounded uppercase leading-normal ${
                                hotspot.severity === 'critical' ? 'bg-red-500/15 text-red-500' :
                                hotspot.severity === 'high' ? 'bg-amber-500/15 text-amber-500' :
                                'bg-emerald-500/15 text-emerald-500'
                              }`}>
                                {hotspot.severity}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span>{hotspot.disease}</span>
                              <span className="font-mono font-bold text-foreground">{hotspot.cases} cases</span>
                            </div>

                            {/* View Details hover trigger */}
                            <div className="mt-2.5 pt-2 border-t border-border/30 flex justify-between items-center text-[9px] font-bold text-primary opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <span>Inspect Node Details</span>
                              <Eye className="w-3.5 h-3.5 text-primary" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Charts & Interactive CLI terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ChartsSection 
              trendsData={getDynamicTrends()} 
              distributionData={getDynamicDistribution()} 
            />
          </div>

          {/* Interactive Console Shell (Includes Speech Trigger) */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-lg flex-1 min-h-[300px]">
              <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <TerminalIcon className="w-4 h-4 text-primary" /> Cognitive Telemetry Terminal
                </div>
                
                {/* Speech Micro Sensor Simulation Trigger */}
                <button
                  onClick={triggerAudioScanner}
                  disabled={isRecording}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                    isRecording 
                      ? "bg-red-500 border-red-500 text-white animate-pulse" 
                      : "bg-secondary hover:bg-secondary/80 border-border text-muted-foreground hover:text-foreground"
                  }`}
                  title="Simulate Voice Report Ingestion"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex-1 bg-secondary/40 rounded-xl border border-border p-4 font-mono text-[10px] text-muted-foreground flex flex-col justify-between h-[160px]">
                <div className="overflow-y-auto space-y-1.5 max-h-[140px] pr-1 scrollbar-thin">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
                
                <form onSubmit={handleTerminalSubmit} className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                  <span className="text-primary font-bold">{`>`}</span>
                  <input
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="type directive..."
                    className="flex-1 bg-transparent text-[10px] text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 border-none p-0"
                  />
                  <button type="submit" className="text-primary hover:text-primary-foreground p-1 transition-all">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Global Distribution details + Hardware Node Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-lg">
             <InstitutionalTrust />
          </div>

          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col h-[300px]">
             <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-3">
               <Activity className="w-4.5 h-4.5 text-violet-400" />
               <h3 className="text-sm font-bold text-foreground">Incidents Ratio</h3>
             </div>
             <div className="flex-1 min-h-0">
                <DistributionSection compact distributionData={getDynamicDistribution()} />
             </div>
          </div>

          {/* Node Controllers (HUD switches / WHO Feed) */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between text-left min-h-[300px]">
            <div>
              <div className="flex items-center gap-2.5 mb-3 border-b border-border/40 pb-3 justify-between">
                <div className="flex gap-3 text-xs">
                  <button 
                    onClick={() => setConfigTab("hud")}
                    className={`font-bold pb-1 border-b-2 transition-all ${configTab === 'hud' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Sensory Config
                  </button>
                  <button 
                    onClick={() => setConfigTab("who")}
                    className={`font-bold pb-1 border-b-2 transition-all ${configTab === 'who' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    WHO Feed (IND)
                  </button>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">{configTab === 'hud' ? 'HUD CONTROL' : 'REAL DATA'}</span>
              </div>
              
              {configTab === 'hud' ? (
                <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-cyan-400" /> Acoustic Scanning Node</span>
                    <input
                      type="checkbox"
                      checked={acousticScanner}
                      onChange={(e) => {
                        setAcousticScanner(e.target.checked);
                        toast.info(`Acoustic scanning node set to ${e.target.checked ? 'ONLINE' : 'OFFLINE'}`);
                        setTerminalLogs(prev => [...prev, `[CONFIG] Acoustic scanning hardware is now ${e.target.checked ? 'ACTIVE' : 'DEACTIVATED'}`]);
                      }}
                      className="w-4 h-4 text-primary bg-secondary border-border focus:ring-0 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-violet-400" /> OCR Report Scan Node</span>
                    <input
                      type="checkbox"
                      checked={ocrScanner}
                      onChange={(e) => {
                        setOcrScanner(e.target.checked);
                        toast.info(`OCR scanner node set to ${e.target.checked ? 'ONLINE' : 'OFFLINE'}`);
                        setTerminalLogs(prev => [...prev, `[CONFIG] Optical text reader node is now ${e.target.checked ? 'ONLINE' : 'DEACTIVATED'}`]);
                      }}
                      className="w-4 h-4 text-primary bg-secondary border-border focus:ring-0 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> Heatmap Interpolation</span>
                    <input
                      type="checkbox"
                      checked={heatmapInterpolation}
                      onChange={(e) => {
                        setHeatmapInterpolation(e.target.checked);
                        toast.info(`Geospatial Heatmap Interpolation set to ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                        setTerminalLogs(prev => [...prev, `[CONFIG] Heatmap rendering algorithm set to ${e.target.checked ? 'INTERPOLATED' : 'DISCRETE'}`]);
                      }}
                      className="w-4 h-4 text-primary bg-secondary border-border focus:ring-0 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="flex justify-between items-center bg-secondary/30 p-1.5 rounded-lg border border-border/30">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Select Disease</span>
                    <select 
                      value={whoDisease}
                      onChange={(e) => setWhoDisease(e.target.value)}
                      className="bg-background border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none"
                    >
                      <option value="cholera">Cholera cases</option>
                      <option value="malaria">Malaria cases</option>
                    </select>
                  </div>
                  
                  <div className="h-[120px] overflow-y-auto space-y-1.5 scrollbar-thin pr-1 text-left">
                    {whoLoading ? (
                      <div className="text-center text-muted-foreground py-6 animate-pulse text-[10px]">Loading WHO Feed...</div>
                    ) : whoRecords.length === 0 ? (
                      <div className="text-center text-muted-foreground py-6 italic text-[10px]">No WHO records found.</div>
                    ) : (
                      whoRecords.map((r, i) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-border/20 text-[10px] font-mono">
                          <span className="text-muted-foreground font-semibold">Year {r.year}</span>
                          <span className="text-foreground font-bold">{r.cases.toLocaleString()} cases</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider pt-4 border-t border-border/40 mt-6 flex justify-between items-center font-mono">
              <span>Telemetry Compliant</span>
              <span>127.0.0.1</span>
            </div>
          </div>
        </div>

        {/* Simulate Outbreak Form Modal Dialog */}
        <AnimatePresence>
          {isSimulateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative text-left"
              >
                <button 
                  onClick={() => setIsSimulateOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold mb-1.5 flex items-center gap-2">
                  <AlertOctagon className="w-5.5 h-5.5 text-primary" /> Simulated Case Report
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Inject a mock telemetry node on the Leaflet map in real time.
                </p>

                <form onSubmit={submitSimulationForm} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Disease</label>
                    <select
                      value={mockForm.disease}
                      onChange={(e) => setMockForm(prev => ({ ...prev, disease: e.target.value }))}
                      className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>Cholera</option>
                      <option>Dengue</option>
                      <option>COVID</option>
                      <option>Flu</option>
                      <option>Malaria</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Cases Count</label>
                      <input
                        type="number"
                        value={mockForm.cases}
                        onChange={(e) => setMockForm(prev => ({ ...prev, cases: Number(e.target.value) }))}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Severity</label>
                      <select
                        value={mockForm.severity}
                        onChange={(e) => setMockForm(prev => ({ ...prev, severity: e.target.value }))}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {Object.keys(INDIAN_STATES_DISTRICTS).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">District / City</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {INDIAN_STATES_DISTRICTS[selectedState]?.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Target Location Label</label>
                    <input
                      type="text"
                      value={mockForm.location}
                      onChange={(e) => setMockForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={mockForm.latitude}
                        onChange={(e) => setMockForm(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={mockForm.longitude}
                        onChange={(e) => setMockForm(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                        className="w-full bg-secondary border border-border p-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsSimulateOpen(false)}
                      className="flex-1 h-11 rounded-xl text-sm font-bold border-border"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg"
                    >
                      Report Case
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
