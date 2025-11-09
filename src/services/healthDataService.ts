// Real-time health data service using Supabase
// This replaces the mock data with actual database queries

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data for development (remove after Supabase setup)
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
    id: 1,
    type: "outbreak",
    message: "Dengue outbreak reported in Northern Province",
    severity: "high",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    type: "water",
    message: "Water quality alert in Western Province",
    severity: "medium",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Real-time data functions
export async function fetchHealthData(userId: string) {
  const { data, error } = await supabase
    .from("health_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching health data:", error);
    return null;
  }

  return data;
}

export async function fetchDiseaseData(region?: string) {
  const query = supabase.from("disease_outbreaks").select("*");

  if (region) {
    query.eq("region", region);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching disease data:", error);
    return [];
  }

  return data;
}

export async function fetchAlerts(userId: string) {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  return data;
}

export async function addHealthData(data: any) {
  const { error } = await supabase.from("health_data").insert([data]);

  if (error) {
    console.error("Error adding health data:", error);
    return { success: false };
  }

  return { success: true };
}

export async function reportDisease(data: any) {
  const { error } = await supabase.from("disease_outbreaks").insert([data]);

  if (error) {
    console.error("Error reporting disease:", error);
    return { success: false };
  }

  return { success: true };
}

// Development exports (remove after Supabase setup)
export const useHealthData = (userId: string) => mockHealthData;
export const useDiseaseData = (region?: string) => mockDiseaseData;
export const useAlerts = (userId: string) => mockAlerts;
export const useAddHealthData = () => async (data: any) => {
  console.log("Mock: Adding health data", data);
  return { success: true, id: Math.random().toString(36) };
};
export const useReportDisease = () => async (data: any) => {
  console.log("Mock: Reporting disease", data);
  return { success: true, id: Math.random().toString(36) };
};
