/**
 * Admin Configuration Service
 * Allows Super Admin to manage API keys and system settings from the dashboard.
 * In a real app, this would persist to a database (Supabase).
 */

import { supabase } from './supabaseClient';

export interface ApiProviderConfig {
  id?: string;
  name: string; // e.g., 'MARKET_DATA_PROVIDER'
  value: string; // e.g., 'FMP', 'ALPHA_VANTAGE'
  category: 'market_data' | 'ai' | 'news' | 'other';
  description: string;
  isEncrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemSetting {
  key: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'json';
  description: string;
}

class AdminConfigService {
  /**
   * Get all configured API providers
   */
  async getApiConfigs(): Promise<ApiProviderConfig[]> {
    try {
      const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching API configs:', error);
      // Return defaults for mock mode
      return this.getDefaultConfigs();
    }
  }

  /**
   * Update or create an API configuration
   */
  async updateApiConfig(config: ApiProviderConfig): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_configs')
        .upsert({
          ...config,
          updatedAt: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating API config:', error);
      return false;
    }
  }

  /**
   * Delete an API configuration
   */
  async deleteApiConfig(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('api_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting API config:', error);
      return false;
    }
  }

  /**
   * Test API connection
   */
  async testApiConnection(provider: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    try {
      if (provider === 'FMP') {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=${apiKey}`
        );
        if (response.ok) {
          return { success: true, message: 'Successfully connected to Financial Modeling Prep!' };
        } else {
          return { success: false, message: 'Invalid API key or connection failed.' };
        }
      } else if (provider === 'ALPHA_VANTAGE') {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`
        );
        const data = await response.json();
        if (data['Global Quote'] && !data['Note']) {
          return { success: true, message: 'Successfully connected to Alpha Vantage!' };
        } else {
          return { success: false, message: 'Invalid API key or rate limit exceeded.' };
        }
      } else if (provider === 'GEMINI') {
        // Simple test - just check if key format is valid
        if (apiKey.length > 10) {
          return { success: true, message: 'API key format looks valid.' };
        }
        return { success: false, message: 'Invalid API key format.' };
      }
      
      return { success: true, message: 'Provider test not implemented, assuming OK.' };
    } catch (error) {
      return { 
        success: false, 
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<SystemSetting[]> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Update a system setting
   */
  async updateSystemSetting(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value, updatedAt: new Date().toISOString() });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating system setting:', error);
      return false;
    }
  }

  /**
   * Get default configurations (for mock/demo mode)
   */
  private getDefaultConfigs(): ApiProviderConfig[] {
    return [
      {
        name: 'MARKET_DATA_PROVIDER',
        value: 'MOCK',
        category: 'market_data',
        description: 'Primary market data provider (FMP, ALPHA_VANTAGE, or MOCK)'
      },
      {
        name: 'MARKET_DATA_API_KEY',
        value: '',
        category: 'market_data',
        description: 'API key for market data provider',
        isEncrypted: true
      },
      {
        name: 'GEMINI_API_KEY',
        value: '',
        category: 'ai',
        description: 'Google Gemini API key for AI features',
        isEncrypted: true
      }
    ];
  }

  private getDefaultSettings(): SystemSetting[] {
    return [
      {
        key: 'ALLOW_MOCK_DATA',
        value: true,
        type: 'boolean',
        description: 'Allow fallback to mock data when APIs are unavailable'
      },
      {
        key: 'REFRESH_INTERVAL_MINUTES',
        value: 15,
        type: 'number',
        description: 'How often to refresh market data (in minutes)'
      },
      {
        key: 'DEFAULT_CURRENCY',
        value: 'USD',
        type: 'string',
        description: 'Default currency for portfolio valuation'
      }
    ];
  }
}

export const adminConfigService = new AdminConfigService();
