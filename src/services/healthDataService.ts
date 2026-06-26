// Real-time health data service using Convex
// Standardized on Convex as the primary backend

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

// Convex-based hooks
export const useHealthData = (token: string | null) => {
  const data = useQuery(api.healthData.getUserHealthData, token ? { token } : "skip");
  return data || [];
};

export const useDiseaseData = (region?: string) => {
  const data = useQuery(api.diseases.getDiseaseOutbreaks, { region });
  return data || [];
};

export const useAlerts = () => {
  const data = useQuery(api.alerts.getActiveAlerts, {});
  return data || [];
};

export const useDashboardAggregates = () => {
  const { token } = useAuth();
  const data = useQuery(api.stats.getDashboardAggregates, token ? { token } : "skip");
  return data;
};

export const useGlobalInstitutionalData = (type: string = "outbreak_global") => {
  const data = useQuery(api.externalData.getGlobalStats, { type });
  return data;
};

export const useAddHealthData = () => {
  const addData = useMutation(api.healthData.addHealthData);
  return addData;
};

export const useReportDisease = () => {
  const report = useMutation(api.diseases.reportDisease);
  return report;
};
