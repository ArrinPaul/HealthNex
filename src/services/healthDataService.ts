// Real-time health data service using Convex
// Standardized on Convex as the primary backend

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Mock data for development
export const mockHealthData = {
  heartRate: 72,
  bloodPressure: { systolic: 120, diastolic: 80 },
  temperature: 36.6,
  oxygenLevel: 98,
  steps: 8543,
  waterIntake: 1800,
  sleep: 7.5,
  lastUpdated: new Date().toISOString(),
};

export const mockDiseaseData = [
  { disease: "Dengue", cases: 145, location: "Northern Province", severity: "high" },
  { disease: "Malaria", cases: 89, location: "Eastern Province", severity: "medium" },
  { disease: "Typhoid", cases: 34, location: "Central Province", severity: "low" },
  { disease: "Cholera", cases: 12, location: "Western Province", severity: "high" },
];

export const mockAlerts = [
  {
    id: "1",
    type: "outbreak",
    title: "Outbreak Alert",
    message: "Dengue outbreak reported in Northern Province",
    severity: "high",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "2",
    type: "water",
    title: "Water Quality Alert",
    message: "Water quality alert in Western Province",
    severity: "medium",
    createdAt: Date.now() - 7200000,
  },
];

// Convex-based hooks
export const useHealthData = (token: string | null) => {
  const data = useQuery(api.healthData.getUserHealthData, token ? { token } : "skip");
  return data || [];
};

export const useDiseaseData = (region?: string) => {
  const data = useQuery(api.diseases.getDiseaseOutbreaks, { region });
  return data || mockDiseaseData;
};

export const useAlerts = () => {
  const data = useQuery(api.alerts.getActiveAlerts, {});
  return data || mockAlerts;
};

export const useAddHealthData = () => {
  const addData = useMutation(api.healthData.addHealthData);
  return addData;
};

export const useReportDisease = () => {
  const report = useMutation(api.diseases.reportDisease);
  return report;
};
