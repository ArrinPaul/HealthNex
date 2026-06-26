"use client";

import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useDiseaseData, useDashboardAggregates } from '@/services/healthDataService';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ChartsSection from '@/components/dashboard/ChartsSection';
import DistributionSection from '@/components/dashboard/DistributionSection';
import { 
  Globe, Map as MapIcon, Zap, LayoutGrid, Bell, 
  Activity, ArrowRight, ShieldCheck, Download, Plus, Filter,
  RefreshCw, Radio, FileText, CheckCircle2, AlertOctagon, Terminal as TerminalIcon, Send, Eye, X, Check, ShieldAlert,
  Mic, Volume2, Sliders, CheckSquare, Trash2, Flame, Play, Square, Settings, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InstitutionalTrust from '@/components/dashboard/InstitutionalTrust';

const DiseaseMap = dynamic(() => import('@/components/DiseaseMap'), { ssr: false });

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
  
  const [mockForm, setMockForm] = useState({
    disease: "Cholera",
    cases: 35,
    location: "Sualkuchi",
    latitude: 26.1738,
    longitude: 91.5694,
    severity: "high"
  });

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
  const { user } = useAuth();

  // Load baseline outbreaks
  useEffect(() => {
    setIsMounted(true);
    
    const defaultHotspots = [
      { id: "default-1", lat: 26.1445, lng: 91.7362, cases: 45, location: 'Guwahati', disease: 'Cholera', severity: 'critical', timestamp: Date.now() },
      { id: "default-2", lat: 26.2006, lng: 92.9376, cases: 23, location: 'Jorhat', disease: 'Dengue', severity: 'medium', timestamp: Date.now() - 3600000 },
      { id: "default-3", lat: 26.7509, lng: 94.2037, cases: 12, location: 'Dibrugarh', disease: 'COVID', severity: 'low', timestamp: Date.now() - 7200000 },
      { id: "default-4", lat: 25.5788, lng: 91.8933, cases: 34, location: 'Shillong', disease: 'Flu', severity: 'high', timestamp: Date.now() - 14400000 },
      { id: "default-5", lat: 26.7271, lng: 93.0800, cases: 18, location: 'Tezpur', disease: 'Malaria', severity: 'medium', timestamp: Date.now() - 28800000 }
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
    const cities = [
      { name: "Silchar", lat: 24.8333, lng: 92.7789 },
      { name: "Nagaon", lat: 26.3562, lng: 92.6832 },
      { name: "Bongaigaon", lat: 26.4758, lng: 90.5581 },
      { name: "Tinsukia", lat: 27.5000, lng: 95.3667 },
      { name: "Goalpara", lat: 26.1700, lng: 90.6200 },
      { name: "Barpeta", lat: 26.3200, lng: 91.0000 }
    ];
    
    const diseases = ["Cholera", "Dengue", "COVID", "Malaria", "Flu"];
    const severities = ["medium", "high", "critical"];

    const targetCity = cities[Math.floor(Math.random() * cities.length)];
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
      lat: 26.1738,
      lng: 91.5694,
      cases: 26,
      location: "Sualkuchi",
      disease: "Waterborne Cholera",
      severity: "high",
      timestamp: Date.now()
    };
    
    setOutbreaks(prev => [parsedOutbreak, ...prev]);
    setSelectedHotspot({ lat: 26.1738, lng: 91.5694 });
    setIsRecording(false);
    toast.success("Voice telemetry ingested! Outbreak parsed at Sualkuchi.");
    setTerminalLogs(prev => [...prev, `[INGESTION] Plotted voice parsed node at lat: 26.17, lng: 91.56`]);
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">LIVE TELEMETRY NODE ACTIVE</span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Global health surveillance audit command system
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={simulateLiveEvent}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-bold border-primary/30 hover:bg-primary/5 text-primary flex items-center gap-2 shadow-sm animate-pulse-subtle"
            >
              <Zap className="w-4 h-4 text-primary fill-primary/10" />
              Simulate Live Event
            </Button>

            <Button
              onClick={handleMitigateAll}
              disabled={isMitigatingAll || outbreaks.length === 0}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-bold border-red-500/35 hover:bg-red-500/5 text-red-500 flex items-center gap-2 shadow-sm"
            >
              <Flame className="w-4 h-4 text-red-500" />
              {isMitigatingAll ? "Resolving Nodes..." : "Mitigate All Active Threats"}
            </Button>

            <Button
              onClick={() => router.push('/surveillance')}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-bold border-border/80 hover:bg-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Symptom Reports
            </Button>
            
            <Button
              onClick={handleExportData}
              variant="outline"
              className="h-10 px-4 rounded-xl text-xs font-bold border-border/80 hover:bg-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Telemetry
            </Button>
            
            <Button
              onClick={() => setIsSimulateOpen(true)}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Report Simulation
            </Button>
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

          {/* Node Controllers (HUD switches) */}
          <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-lg flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2.5 mb-3 border-b border-border/40 pb-3 justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-primary" />
                  <h4 className="font-bold text-sm text-foreground">Sensory Node Config</h4>
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">HUD CONTROL</span>
              </div>
              
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

                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Location Name</label>
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
