import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run the AI-Powered daily dataset ingestion every day at 11:00 AM UTC
crons.daily(
  "fetch-ai-outbreak-news-daily",
  { hourUTC: 11, minuteUTC: 0 },
  internal.diseases.fetchDailyPublicDataset
);

export default crons;
