/**
 * Supabase Client Configuration
 * 
 * Uses environment variables for sensitive configuration.
 * Falls back to mock mode if not configured.
 */

import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Flag to indicate configuration is present
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Mock client for when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
    signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
    signUp: async () => ({ error: new Error('Supabase not configured') }),
    resetPasswordForEmail: async () => ({ error: new Error('Supabase not configured') }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error('Supabase not configured') }),
        maybeSingle: async () => ({ data: null, error: null }),
        insert: async () => ({ error: new Error('Supabase not configured') }),
        update: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) }),
        delete: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) }),
      }),
    }),
  }),
});

// Initialize client conditionally
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createMockClient() as any;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured. Running in mock mode.');
} else {
  console.log('Supabase Client Initialized', { url: SUPABASE_URL });
}
