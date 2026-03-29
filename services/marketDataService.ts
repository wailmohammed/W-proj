/**
 * Market Data Service
 * Handles connections to external financial data providers.
 * Configurable via environment variables (managed by Super Admin).
 */

import { envConfig } from './envConfig';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  peRatio: number | null;
  week52High: number;
  week52Low: number;
  dividendYield: number | null;
  timestamp: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  country: string;
  website: string;
  ceo: string;
  employees: number;
}

export interface HistoricalData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DividendData {
  symbol: string;
  exDate: string;
  paymentDate: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annual' | 'Irregular';
}

class MarketDataService {
  private apiKey: string;
  private provider: 'ALPHA_VANTAGE' | 'FMP' | 'MOCK';

  constructor() {
    // Super Admin can set these in .env or via dashboard later
    this.apiKey = envConfig.get('MARKET_DATA_API_KEY') || '';
    const providerEnv = envConfig.get('MARKET_DATA_PROVIDER') || 'MOCK';
    this.provider = (providerEnv as any) || 'MOCK';
    
    if (!this.apiKey && this.provider !== 'MOCK') {
      console.warn(`⚠️ Market Data API Key missing for ${this.provider}. Running in MOCK mode.`);
      this.provider = 'MOCK';
    }
  }

  /**
   * Get real-time quote for a stock
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    if (this.provider === 'MOCK') {
      return this.getMockQuote(symbol);
    }

    try {
      // Example implementation for Financial Modeling Prep
      if (this.provider === 'FMP') {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${this.apiKey}`
        );
        const data = await response.json();
        if (data && data[0]) {
          return this.mapFmpQuote(data[0]);
        }
      }
      // Add Alpha Vantage logic here if needed
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
    }

    return this.getMockQuote(symbol);
  }

  /**
   * Get company profile
   */
  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    if (this.provider === 'MOCK') {
      return this.getMockProfile(symbol);
    }

    try {
      if (this.provider === 'FMP') {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${this.apiKey}`
        );
        const data = await response.json();
        if (data && data[0]) {
          return this.mapFmpProfile(data[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching profile for ${symbol}:`, error);
    }

    return this.getMockProfile(symbol);
  }

  /**
   * Get historical daily data
   */
  async getHistoricalData(symbol: string, limit: number = 365): Promise<HistoricalData[]> {
    if (this.provider === 'MOCK') {
      return this.getMockHistorical(symbol, limit);
    }

    try {
      if (this.provider === 'FMP') {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?limit=${limit}&apikey=${this.apiKey}`
        );
        const data = await response.json();
        if (data && data.historical) {
          return data.historical.map((d: any) => ({
            symbol,
            date: d.date,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
            volume: d.volume
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
    }

    return this.getMockHistorical(symbol, limit);
  }

  /**
   * Get dividend history
   */
  async getDividends(symbol: string): Promise<DividendData[]> {
    if (this.provider === 'MOCK') {
      return this.getMockDividends(symbol);
    }

    try {
      if (this.provider === 'FMP') {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${this.apiKey}`
        );
        const data = await response.json();
        if (data && data.historical) {
          return data.historical.map((d: any) => ({
            symbol,
            exDate: d.date,
            paymentDate: d.date, // FMP sometimes combines these
            amount: d.adjDividend || d.dividend,
            frequency: 'Quarterly' // Would need additional logic to determine
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching dividends for ${symbol}:`, error);
    }

    return this.getMockDividends(symbol);
  }

  // --- Mappers ---

  private mapFmpQuote(data: any): StockQuote {
    return {
      symbol: data.symbol,
      price: data.price,
      change: data.changes,
      changePercent: data.changesPercentage,
      volume: data.volume,
      avgVolume: data.avgVolume,
      marketCap: data.marketCap,
      peRatio: data.pe,
      week52High: data.yearHigh,
      week52Low: data.yearLow,
      dividendYield: data.dividendYield,
      timestamp: new Date().toISOString()
    };
  }

  private mapFmpProfile(data: any): CompanyProfile {
    return {
      symbol: data.symbol,
      name: data.companyName,
      description: data.description,
      sector: data.sector,
      industry: data.industry,
      country: data.country,
      website: data.website,
      ceo: data.ceo,
      employees: data.fullTimeEmployees
    };
  }

  // --- Mock Data Generators ---

  private getMockQuote(symbol: string): StockQuote {
    const basePrice = Math.random() * 200 + 50;
    return {
      symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      changePercent: parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      avgVolume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(basePrice * 10000000),
      peRatio: parseFloat((Math.random() * 30 + 10).toFixed(2)),
      week52High: parseFloat((basePrice * 1.2).toFixed(2)),
      week52Low: parseFloat((basePrice * 0.8).toFixed(2)),
      dividendYield: Math.random() > 0.5 ? parseFloat((Math.random() * 4).toFixed(2)) : null,
      timestamp: new Date().toISOString()
    };
  }

  private getMockProfile(symbol: string): CompanyProfile {
    return {
      symbol,
      name: `${symbol} Corporation`,
      description: `A leading company in the technology sector, specializing in innovative solutions. This is mock data for ${symbol}.`,
      sector: 'Technology',
      industry: 'Software',
      country: 'USA',
      website: 'https://example.com',
      ceo: 'John Doe',
      employees: 5000
    };
  }

  private getMockHistorical(symbol: string, limit: number): HistoricalData[] {
    const data: HistoricalData[] = [];
    let price = Math.random() * 100 + 100;
    const now = new Date();
    
    for (let i = 0; i < limit; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 5;
      price += change;
      
      data.push({
        symbol,
        date: date.toISOString().split('T')[0],
        open: parseFloat((price + Math.random()).toFixed(2)),
        high: parseFloat((price + Math.random() * 2).toFixed(2)),
        low: parseFloat((price - Math.random() * 2).toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    return data.reverse();
  }

  private getMockDividends(symbol: string): DividendData[] {
    const data: DividendData[] = [];
    const now = new Date();
    
    for (let i = 0; i < 8; i++) { // Last 8 quarters
      const date = new Date(now);
      date.setMonth(date.getMonth() - (i * 3));
      
      data.push({
        symbol,
        exDate: date.toISOString().split('T')[0],
        paymentDate: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
        frequency: 'Quarterly'
      });
    }
    return data;
  }
}

export const marketDataService = new MarketDataService();
