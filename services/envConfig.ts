/**
 * Environment Configuration Helper
 * Centralizes environment variable access with validation
 */

interface EnvConfig {
  geminiApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDevelopment: boolean;
}

class EnvConfigService {
  private config: EnvConfig;

  constructor() {
    this.config = {
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      isDevelopment: import.meta.env.DEV || false,
    };
  }

  getConfig(): EnvConfig {
    return { ...this.config };
  }

  isGeminiConfigured(): boolean {
    return !!this.config.geminiApiKey && this.config.geminiApiKey.length > 10;
  }

  isSupabaseConfigured(): boolean {
    return !!(this.config.supabaseUrl && this.config.supabaseAnonKey);
  }

  validate(): string[] {
    const warnings: string[] = [];
    
    if (!this.isGeminiConfigured()) {
      warnings.push('Gemini API key not configured. AI features will be disabled.');
    }
    
    if (!this.isSupabaseConfigured()) {
      warnings.push('Supabase not configured. Running in mock/local mode.');
    }

    return warnings;
  }
}

export const envConfig = new EnvConfigService();
export default envConfig;
