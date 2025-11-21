
import { createClient } from '@supabase/supabase-js';

// Helper to find environment variables across different build systems (Create React App, Vite, Next.js)
const getEnvVar = (keys: string[]): string => {
  // 1. Check process.env (Standard Node/CRA/Next.js)
  if (typeof process !== 'undefined' && process.env) {
    for (const key of keys) {
      if (process.env[key]) return process.env[key] as string;
    }
  }

  // 2. Check import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      for (const key of keys) {
        // @ts-ignore
        if (import.meta.env[key]) return import.meta.env[key] as string;
      }
    }
  } catch (e) {
    // Ignore errors if import.meta is not defined
  }

  return '';
};

// Check for all common variable naming conventions
const supabaseUrlEnv = getEnvVar([
  'REACT_APP_SUPABASE_URL', 
  'VITE_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_URL'
]);

const supabaseKeyEnv = getEnvVar([
  'REACT_APP_SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]);

// Fallback for development using the provided credentials
// This enables "Real Mode" functionality immediately without .env file setup for the demo
const validUrl = supabaseUrlEnv || 'https://oslvdgslfsjdujyemyfo.supabase.co';
const validKey = supabaseKeyEnv || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbHZkZ3NsZnNqZHVqeWVteWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2OTkzMjQsImV4cCI6MjA3OTI3NTMyNH0.YHJM8pIDCT7q-1Bsg0TVczeM2VE0paXJ6VWTDtXQ6to';

// Export a flag to let the app know if we are in "Real" or "Demo" mode
export const isSupabaseConfigured = !!validUrl && !!validKey && validUrl !== 'https://placeholder.supabase.co';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Key is missing. Running in Demo/Mock mode.');
} else {
  console.log('Supabase Client Configured', { url: validUrl });
}

export const supabase = createClient(validUrl, validKey);
