"use client";

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  BookOpen, FileText, 
  Droplet, AlertTriangle, ShieldCheck, 
  Brain, PlayCircle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const ModuleCard = ({ title, type, duration, desc, icon: Icon, color, delay }: any) => {
  const startModule = () => {
    toast.success(`Started: ${title}`, {
      description: `Estimated time: ${duration}`
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all group"
    >
       <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
             <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div className="text-right">
             <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{type}</span>
             <p className="text-xs text-muted-foreground mt-1">{duration}</p>
          </div>
       </div>

       <div className="space-y-2 mb-5">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
       </div>

       <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button 
            onClick={startModule}
            variant="ghost" 
            size="sm" 
            className="gap-2 text-xs font-medium px-0 hover:bg-transparent hover:text-primary"
          >
             <PlayCircle className="w-4 h-4" /> Start
          </Button>
          <div 
            onClick={startModule}
            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all cursor-pointer"
          >
             <ArrowRight className="w-3.5 h-3.5" />
          </div>
       </div>
    </motion.div>
  );
};

export default function EducationHubPage() {
  const categories = [
    { title: 'Water Safety', icon: Droplet, count: 4 },
    { title: 'Disease Prevention', icon: ShieldCheck, count: 6 },
    { title: 'Data Collection', icon: Brain, count: 3 },
    { title: 'Emergency Response', icon: AlertTriangle, count: 2 }
  ];

  const modules = [
    { title: 'Identifying Water Contamination', type: 'Video', duration: '12 min', desc: 'Learn the visual and chemical signs of water source contamination.', icon: Droplet, color: 'text-sky-400', delay: 0 },
    { title: 'Writing Health Reports', type: 'Interactive', duration: '15 min', desc: 'How to write effective community health reports for maximum impact.', icon: FileText, color: 'text-primary', delay: 0.1 },
    { title: 'Understanding AI Insights', type: 'Guide', duration: '20 min', desc: 'How to read and act on AI-generated health trend analysis.', icon: Brain, color: 'text-violet-500', delay: 0.2 },
    { title: 'Emergency Response Basics', type: 'Manual', duration: '10 min', desc: 'Immediate steps to take when a health issue is reported in your area.', icon: AlertTriangle, color: 'text-rose-500', delay: 0.3 }
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Courses and guides to help you use HealthNex effectively.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {categories.map((cat, i) => (
             <motion.div 
               key={cat.title}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer group flex flex-col items-center text-center gap-3"
               onClick={() => toast(`Showing ${cat.title} courses`)}
             >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                   <cat.icon className="w-5 h-5" />
                </div>
                <div>
                   <h5 className="font-medium text-sm">{cat.title}</h5>
                   <p className="text-xs text-muted-foreground mt-0.5">{cat.count} courses</p>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Available Courses</h3>
           </div>
           <div className="grid md:grid-cols-2 gap-4">
              {modules.map((m, i) => (
                <ModuleCard key={m.title} {...m} />
              ))}
           </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
