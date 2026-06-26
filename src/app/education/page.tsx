"use client";

import { useState } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Droplet, 
  AlertTriangle, 
  ShieldCheck, 
  Brain, 
  PlayCircle, 
  ArrowRight,
  Video,
  Award,
  CheckCircle2,
  HelpCircle,
  X,
  BookOpen as BookOpenIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface Module {
  id: string;
  title: string;
  type: string;
  duration: string;
  desc: string;
  icon: any;
  color: string;
  videoUrl: string;
  manualText: string;
  quiz: {
    question: string;
    options: string[];
    correct: string;
  };
}

// Simple bold tag parser: **text** -> <strong>text</strong>
const parseBoldText = (text: string) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-foreground font-bold">{part}</strong>;
    }
    return part;
  });
};

// Line-by-line markdown parser
const renderManualText = (text: string) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let listKey = 0;

  const pushCurrentList = () => {
    if (currentListItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside pl-4 space-y-1.5 text-muted-foreground my-2.5 font-medium">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      pushCurrentList();
      return;
    }

    if (trimmedLine.startsWith('### ')) {
      pushCurrentList();
      renderedElements.push(
        <h3 key={index} className="text-sm font-bold text-primary pt-3.5 pb-1 uppercase tracking-wide border-b border-border/30 mb-2">
          {trimmedLine.replace('### ', '')}
        </h3>
      );
    } else if (trimmedLine.startsWith('#### ')) {
      pushCurrentList();
      renderedElements.push(
        <h4 key={index} className="text-xs font-bold text-foreground pt-3 pb-1 uppercase tracking-wider">
          {trimmedLine.replace('#### ', '')}
        </h4>
      );
    } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const cleanLine = trimmedLine.replace(/^[\*\-]\s*/, '');
      currentListItems.push(
        <li key={index} className="leading-relaxed">
          {parseBoldText(cleanLine)}
        </li>
      );
    } else {
      pushCurrentList();
      renderedElements.push(
        <p key={index} className="text-muted-foreground font-medium leading-relaxed my-2">
          {parseBoldText(trimmedLine)}
        </p>
      );
    }
  });

  pushCurrentList();
  return renderedElements;
};

export default function EducationHubPage() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'text'>('video');

  const categories = [
    { title: 'Water Safety', icon: Droplet, count: 4, label: 'Potable water monitoring & filter protocols' },
    { title: 'Disease Surveillance', icon: ShieldCheck, count: 6, label: 'Outbreak tracing and case documentation' },
    { title: 'Epidemiology AI', icon: Brain, count: 3, label: 'Deciphering neural warnings & forecasting' },
    { title: 'Emergency Response', icon: AlertTriangle, count: 2, label: 'District containment & vector suppression' }
  ];

  const modules: Module[] = [
    { 
      id: 'water_contamination',
      title: 'Identifying Water Contamination', 
      type: 'Video + Guide', 
      duration: '12 min', 
      desc: 'Learn the visual, biological, and chemical indicators of water source contamination.', 
      icon: Droplet, 
      color: 'text-sky-400',
      videoUrl: 'https://www.youtube.com/embed/q02n1y41n-Y', // TED-Ed: When is water safe to drink?
      manualText: `### Potable Water Contamination Protocols

This training module details the methods required to audit local drinking water safety in rural and high-risk nodes.

#### 1. Physical Indicators
* **Turbidity (Cloudiness):** Suspended silt and organic particles block light transmission. WHO drinking standards require water to be **less than 5 NTU**. High turbidity is heavily correlated with pathogenic breeding.
* **Odor Verification:** Earthy or fecal odors indicate high bacterial activity. Rotten egg smells indicate hydrogen sulfide leaching from sewage runoff.
* **Coloration Tints:** Reddish-brown color indicates metallic iron rust, while green hints at cyanobacteria (algae blooms).

#### 2. Chemical potability metrics
* **pH Range:** Potable drinking water must maintain a pH **between 6.5 and 8.5**. Severe shifts indicate chemical runoff or acid rain infiltration.
* **Chlorine Residuals:** For post-outbreak disinfection, residual chlorine must measure at least **0.2 - 0.5 mg/L** at supply inlets.

#### 3. Immediate Countermeasures
* Deploy activated carbon or cloth filters for preliminary filtration.
* Distribute sodium hypochlorite (chlorine) tablets to all affected residential nodes.
* Enforce boiling protocols (boil vigorously for at least 1-2 minutes).`,
      quiz: {
        question: "What is the maximum turbidity level (NTU) recommended by WHO for safe drinking water?",
        options: ["1 NTU", "5 NTU", "12 NTU", "25 NTU"],
        correct: "5 NTU"
      }
    },
    { 
      id: 'health_reporting',
      title: 'Writing Epidemiological Reports', 
      type: 'Interactive Guide', 
      duration: '15 min', 
      desc: 'How to write structured community health reports to notify central desks of outbreaks.', 
      icon: FileText, 
      color: 'text-primary',
      videoUrl: 'https://www.youtube.com/embed/tP71ZgL7q50', // Dr. Greg Martin: Public Health Surveillance
      manualText: `### Outbreak Documentation Standards

Accurate reporting is key to triggering early warnings and mobilizing relief. Follow these documentation standards.

#### 1. Spatial Telemetry
* Always report precise GPS coordinates (Latitude and Longitude) of the primary sentinel zone. Mapping inaccurate coordinates misdirects emergency relief.
* Clearly specify state and district divisions to ensure administrative compliance.

#### 2. Clinical Profiling
* Group cases by disease symptoms. E.g., record:
  * Watery stool, dehydration, and vomiting under **Waterborne Enteric (Cholera)**.
  * Sudden high fever, rashes, and back headache under **Vector-Borne (Dengue/Malaria)**.
* Record both **Suspected Cases** and **Confirmed Cases** (verified by blood profiles).

#### 3. Urgency Classification
* **Critical:** Documented deaths, rapidly escalating caseloads, or contamination of the municipal water grid.
* **High:** Multi-family cluster reports with high fever symptoms.
* **Medium/Low:** Isolated, seasonal illness reports.`,
      quiz: {
        question: "Which of the following coordinates is mandatory when reporting regional outbreak telemetry?",
        options: ["Central hospital address", "GPS Latitude and Longitude", "State administrative office location", "IP address of the reporter"],
        correct: "GPS Latitude and Longitude"
      }
    },
    { 
      id: 'understanding_insights',
      title: 'Deciphering AI Outbreak Insights', 
      type: 'Visual Manual', 
      duration: '20 min', 
      desc: 'How to interpret predictive hazard percentages, peak windows, and factor stats.', 
      icon: Brain, 
      color: 'text-violet-500',
      videoUrl: 'https://www.youtube.com/embed/oQ8LgZdOPCI', // CDC Big Data Applications in Public Health
      manualText: `### Reading ML Outbreak Forecasts

HealthNex incorporates machine learning models to analyze climate data and historical trends. Understanding these predictions helps target resources.

#### 1. Outbreak Probability
* Represents the percentage likelihood of an epidemic surge in the upcoming weeks.
* **Action Thresholds:**
  * **Under 40% (Low Risk):** Maintain routine community sanitation.
  * **40% - 70% (Medium Risk):** Distribute prophylactic packages (ORS, netting) to high-density zones.
  * **Above 70% (High/Critical):** Disinfect major water wells, schedule anti-larval spraying, and notify emergency response teams.

#### 2. Estimated Peak Window
* Indicates the timeframe (e.g. 2-4 weeks) during which clinical case metrics are forecasted to reach maximum intensity.
* Plan medicine supply stockpiling to conclude *prior* to this window.

#### 3. Factor Diagnostics
* Analyzes environmental variables (e.g. Sanitation Coverage, Population Density, Stagnant Rainfall).
* Identifies the primary driver (e.g. compromised sewers) so municipal interventions are targeted correctly.`,
      quiz: {
        question: "What is the recommended protocol when an ML Outbreak Probability exceeds 70%?",
        options: [
          "Continue routine monthly checkups only",
          "Immediately disinfect major wells and activate medical squads",
          "Clear the cache and restart the telemetry node",
          "Wait for the peak incident window to conclude"
        ],
        correct: "Immediately disinfect major wells and activate medical squads"
      }
    },
    { 
      id: 'emergency_response',
      title: 'Emergency Response Protocols', 
      type: 'Clinical Manual', 
      duration: '10 min', 
      desc: 'Containment actions, isolation protocols, and municipal sanitation overrides.', 
      icon: AlertTriangle, 
      color: 'text-rose-500',
      videoUrl: 'https://www.youtube.com/embed/Xt9xzg20S0c', // CDC NERD Academy Outbreak Investigation
      manualText: `### Outbreak Containment Guidelines

When a vector-borne or waterborne outbreak is confirmed in your district, execute these containment protocols immediately.

#### Step 1: Ingestion Source Isolation
* Cut off public access to suspected water sources. Mark the node with hazard warnings.
* Set up temporary chlorinated water distribution hubs for the community.

#### Step 2: Patient Quarantine
* Isolate suspected cholera or dysentery cases in dedicated quarantine units to prevent secondary fecal-oral transmission.
* Provide healthcare workers with protective gear, and enforce strict disinfection of medical waste.

#### Step 3: Broadcast Advisory Warnings
* Dispatch a high-severity alert payload via the Broadcast Center to notify all surrounding district nodes.
* Outline symptoms, specify affected containment coordinates, and share disinfection instructions.

#### Step 4: Vector Sanitation Campaigns
* Spray standing water pools with larvicide within a 500-meter radius of confirmed vector cases.
* Distribute insecticide-treated mosquito nets (ITNs) to all local households.`,
      quiz: {
        question: "What is the immediate primary step when an outbreak is suspected in a village?",
        options: [
          "Order vaccine imports from global centers",
          "Isolate suspected patient and cut off access to contaminated water sources",
          "Publish a statistical trend chart",
          "Conduct a census of the local population density"
        ],
        correct: "Isolate suspected patient and cut off access to contaminated water sources"
      }
    }
  ];

  const handleStartModule = (mod: Module) => {
    setSelectedModule(mod);
    setQuizAnswer(null);
    setQuizSubmitted(false);
    setQuizError(false);
    setActiveTab('video');
    toast.info(`Started Course: ${mod.title}`);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !quizAnswer) return;

    if (quizAnswer === selectedModule.quiz.correct) {
      setQuizSubmitted(true);
      setQuizError(false);
      toast.success("Validation Succeeded!", { description: "Checkpoint cleared. Course badge unlocked!" });
      if (!completedModules.includes(selectedModule.id)) {
        setCompletedModules(prev => [...prev, selectedModule.id]);
      }
    } else {
      setQuizError(true);
      toast.error("Validation Failed", { description: "Incorrect response. Review the course material and try again." });
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative text-left">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" /> Learning Center
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive guides, clinical training videos, and validation checkpoints to enable effective public health surveillance.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-secondary/50 border border-border/80 px-3.5 py-1.5 rounded-xl font-mono text-[10px] text-muted-foreground">
            <Award className="w-4 h-4 text-primary animate-pulse" />
            <span>Badges Unlocked: <span className="font-bold text-foreground">{completedModules.length} / {modules.length}</span></span>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Card key={i} className="backdrop-blur-xl bg-card/65 border border-border hover:border-primary/35 transition-all">
              <CardContent className="p-4 flex items-start gap-3.5 text-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground leading-normal">{cat.title}</h4>
                  <p className="text-[10px] text-muted-foreground/90 mt-0.5 leading-snug">{cat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Course Modules Grid */}
        <div className="space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground ml-1">Available Training Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((m, i) => {
              const isCompleted = completedModules.includes(m.id);
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all bg-card/60 relative group ${
                    isCompleted ? 'border-emerald-500/30' : 'border-border/80 hover:border-primary/40'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute right-4 top-4 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-secondary/80 ${m.color}`}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{m.type}</span>
                        <span className="text-[9px] font-mono text-muted-foreground/60 ml-2 border-l border-border/60 pl-2">{m.duration}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">{m.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 font-medium">{m.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-5">
                    <Button 
                      onClick={() => handleStartModule(m)}
                      variant="outline" 
                      className={`h-8 rounded-lg text-[10px] font-bold border-border gap-1.5 ${
                        isCompleted ? 'hover:bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'hover:bg-secondary text-foreground'
                      }`}
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {isCompleted ? 'Review Lesson' : 'Launch Course'}
                    </Button>
                    <div 
                      onClick={() => handleStartModule(m)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Interactive Lesson Overlay Modal */}
        <AnimatePresence>
          {selectedModule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative text-left"
              >
                {/* Modal Close Button */}
                <button
                  onClick={() => setSelectedModule(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Modal Header */}
                <div className="p-5 border-b border-border/40 bg-secondary/20 flex flex-row items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-secondary ${selectedModule.color}`}>
                    <selectedModule.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground leading-none">{selectedModule.title}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-wider">{selectedModule.type} • {selectedModule.duration} Duration</p>
                  </div>
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 scrollbar-thin text-xs">
                  {/* Left Column (7 Cols): Video / Text Tabs */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex bg-secondary/50 border border-border p-1 rounded-xl w-fit gap-1">
                      <button
                        onClick={() => setActiveTab('video')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                          activeTab === 'video' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        Video Training
                      </button>
                      <button
                        onClick={() => setActiveTab('text')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                          activeTab === 'text' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Training Manual
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-secondary/20 rounded-2xl border border-border overflow-hidden h-[280px]">
                      {activeTab === 'video' ? (
                        <iframe
                          src={selectedModule.videoUrl}
                          title={selectedModule.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-5 h-full overflow-y-auto scrollbar-thin text-left leading-relaxed space-y-2 prose prose-invert font-sans">
                          {renderManualText(selectedModule.manualText)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (5 Cols): Interactive Checkpoint Quiz */}
                  <div className="lg:col-span-5 flex flex-col h-full justify-between">
                    <Card className="border border-border/80 shadow bg-secondary/15 rounded-2xl text-left flex-1 flex flex-col justify-between p-4 min-h-[280px]">
                      <div>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
                          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Checkpoint Validation</h4>
                        </div>

                        <p className="font-bold text-foreground leading-normal mb-4">{selectedModule.quiz.question}</p>

                        <form onSubmit={handleQuizSubmit} className="space-y-2.5">
                          {selectedModule.quiz.options.map((option, oIdx) => {
                            const isSelected = quizAnswer === option;
                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'border-primary bg-primary/5 text-foreground font-bold shadow-sm' 
                                    : 'border-border/60 bg-card hover:bg-secondary/40 text-muted-foreground'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="checkpoint-quiz"
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!quizSubmitted) {
                                      setQuizAnswer(option);
                                      setQuizError(false);
                                    }
                                  }}
                                  disabled={quizSubmitted}
                                  className="accent-primary w-3.5 h-3.5 shrink-0"
                                />
                                <span className="text-xs leading-normal">{option}</span>
                              </label>
                            );
                          })}
                        </form>
                      </div>

                      {/* Quiz State Outputs & Submission */}
                      <div className="pt-4 mt-4 border-t border-border/30">
                        {quizSubmitted ? (
                          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <span className="font-bold">Checkpoint Cleared! You unlocked the course badge.</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {quizError && (
                              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-xl">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Incorrect answer. Review the manual or video.</span>
                              </div>
                            )}
                            <Button
                              onClick={handleQuizSubmit}
                              disabled={!quizAnswer}
                              className="w-full h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow"
                            >
                              Submit Checkpoint Response
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-border/40 bg-secondary/30 flex justify-end shrink-0">
                  <Button 
                    onClick={() => setSelectedModule(null)}
                    variant="outline" 
                    className="h-9 px-5 rounded-xl text-xs font-bold border-border"
                  >
                    Close Course Hub
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
