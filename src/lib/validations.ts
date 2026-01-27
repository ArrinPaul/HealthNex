import { z } from "zod";

// Chatbot Message Validation
export const ChatbotMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
  language: z.enum(["en", "hi", "bn", "es", "fr"]).default("en"),
  context: z.any().optional(),
});

// Prediction API Validation
export const PredictionRequestSchema = z.object({
  type: z.enum(["outbreak", "trend", "epidemic", "maintenance", "sentiment"]),
  data: z.record(z.string(), z.any()),
});

// Health Data Validation
export const HealthDataSchema = z.object({
  userId: z.string(),
  type: z.string(),
  data: z.any(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
  }).optional(),
  severity: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

// Water Quality Analysis Validation
export const WaterQualityAnalyzeSchema = z.object({
  location: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  waterQuality: z.object({
    pH: z.number(),
    turbidity: z.number(),
    riskLevel: z.string(),
  }),
  weather: z.object({
    temperature: z.number(),
    humidity: z.number(),
    rainfall: z.number().optional(),
  }).optional(),
});
