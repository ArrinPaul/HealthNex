/**
 * Environment Variable Validator
 * Ensures all required secrets are present before the app attempts to use them.
 */

export const REQUIRED_SERVER_ENVS = [
  'JWT_SECRET',
  'GOOGLE_AI_API_KEY',
  'CONVEX_DEPLOYMENT',
] as const;

export const REQUIRED_PUBLIC_ENVS = [
  'NEXT_PUBLIC_CONVEX_URL',
  'NEXT_PUBLIC_APP_URL',
] as const;

/**
 * Validates that all required environment variables are set.
 * In production, it throws an error to stop the process.
 * In development, it logs a warning.
 */
export function validateEnv() {
  const missingServer = REQUIRED_SERVER_ENVS.filter((key) => !process.env[key]);
  const missingPublic = REQUIRED_PUBLIC_ENVS.filter((key) => !process.env[key]);

  if (missingServer.length > 0 || missingPublic.length > 0) {
    const error = `❌ Missing Environment Variables:\nServer: ${missingServer.join(', ') || 'None'}\nPublic: ${missingPublic.join(', ') || 'None'}`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error);
    } else {
      console.warn(error);
      console.warn('⚠️ App may run in demo mode with restricted functionality.');
    }
    return false;
  }

  return true;
}

/**
 * Check if the app is currently in demo mode (missing AI keys)
 */
export function isDemoMode() {
  return (
    !process.env.GOOGLE_AI_API_KEY || 
    process.env.GOOGLE_AI_API_KEY === 'your_gemini_api_key_here'
  );
}
