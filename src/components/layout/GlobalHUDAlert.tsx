"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, Zap, MapPin, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalHUDAlert() {
  const alerts = useQuery(api.alerts.getActiveAlerts);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAlerts = alerts?.filter(a => !dismissedAlerts.includes(a._id)) || [];

  useEffect(() => {
    if (activeAlerts.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % activeAlerts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeAlerts.length]);

  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[currentIndex];

  const handleDismiss = () => {
    setDismissedAlerts(prev => [...prev, currentAlert._id]);
    setCurrentIndex(0);
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6">
       <AnimatePresence mode="wait">
          <motion.div
            key={currentAlert._id}
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`relative p-5 rounded-2xl border shadow-xl flex items-center justify-between gap-6 overflow-hidden ${
              currentAlert.severity === 'critical' ? 'bg-rose-500/95 border-rose-400 text-white' :
              currentAlert.severity === 'high' ? 'bg-amber-500/95 border-amber-400 text-white' : 'bg-primary/95 border-primary/40 text-white'
            }`}
          >
             <div className="flex items-center gap-4 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                   <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Priority Alert</span>
                      {activeAlerts.length > 1 && (
                        <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          {currentIndex + 1} of {activeAlerts.length}
                        </span>
                      )}
                   </div>
                   <h4 className="text-base font-bold tracking-tight leading-none truncate">{currentAlert.title}</h4>
                   <p className="text-xs opacity-90 leading-relaxed line-clamp-1">{currentAlert.message}</p>
                </div>
             </div>

             <div className="flex items-center gap-3 relative z-10 shrink-0">
                <Button className="rounded-lg bg-white text-black font-semibold text-xs px-4 h-9 hover:bg-white/90">
                   View Details
                </Button>
                <button onClick={handleDismiss} aria-label="Dismiss alert" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>
          </motion.div>
       </AnimatePresence>
    </div>
  );
}
