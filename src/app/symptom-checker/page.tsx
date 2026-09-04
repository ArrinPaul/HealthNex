"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import SymptomCheckerModal from "@/components/SymptomCheckerModal";
import { Button } from "@/components/ui/button";
import { Activity, History, Stethoscope } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

export default function SymptomCheckerPage() {
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use query directly because we can't use our hook properly due to the `any` workaround.
  // Wait, I can just use getAssessmentStatus or similar.
  const assessments = useQuery(
    api.healthAssessments.getUserAssessments as any,
    token ? { token } : "skip"
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "health-worker", "public-user"]}>
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                AI Symptom Checker
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Take our AI-driven assessment to understand your symptoms and get a disease prediction.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground font-bold shadow-lg">
              <Stethoscope className="w-4 h-4 mr-2" />
              Start New Assessment
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold flex items-center gap-2 border-b border-border/50 pb-3 mb-4">
              <History className="w-4 h-4 text-primary" />
              Assessment History
            </h2>

            {assessments === undefined ? (
              <div className="text-xs text-muted-foreground animate-pulse py-8 text-center">Loading history...</div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-border/50">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">No assessments yet</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Take your first symptom assessment to keep track of your health.</p>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="text-xs font-bold">
                  Start Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((record: any) => (
                  <div key={record._id} className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-primary">{record.predictedDisease}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20">
                          {record.predictionScore}% Match
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <span>Reported symptoms: {record.symptomsProvided.join(", ") || "None"}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/80">
                        {new Date(record.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {record.notes && (
                      <div className="text-xs bg-secondary/50 p-2.5 rounded-lg max-w-sm italic border border-border/50">
                        "{record.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <SymptomCheckerModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={() => setIsModalOpen(false)}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
