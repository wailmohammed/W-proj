
import { GoogleGenAI, Type } from "@google/genai";
import { Portfolio } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Persistent Cache Helpers to prevent 429s across reloads
const CACHE_PREFIX = 'wealthos_cache_v1_';

const getFromCache = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(CACHE_PREFIX + key);
        if (item) {
            const { data, timestamp } = JSON.parse(item);
            // Cache expires after 24 hours
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                return data;
            }
        }
    } catch (e) {
        console.warn('Cache read error', e);
    }
    return null;
};

const saveToCache = (key: string, data: any) => {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Cache write error', e);
    }
};

const generatePortfolioHash = (portfolio: Portfolio) => {
    return `${portfolio.id}-${portfolio.holdings.length}-${portfolio.totalValue.toFixed(0)}-${portfolio.cashBalance.toFixed(0)}`;
}

// Helper to handle API errors
const handleGeminiError = (error: any, defaultMessage: string): string => {
    console.warn("Gemini API Error:", error);
    
    let errorStr = '';
    try {
        errorStr = JSON.stringify(error);
    } catch {
        errorStr = String(error);
    }

    if (
        errorStr.includes('429') || 
        errorStr.toLowerCase().includes('quota') || 
        errorStr.includes('RESOURCE_EXHAUSTED')
    ) {
        return "⚠️ AI Usage Limit Reached. Showing cached/fallback data.";
    }

    return defaultMessage;
};

interface PortfolioContextData {
    beta: number;
    yield: number;
    sectorWeights: Record<string, string>; // Percentage string
    costBasisSummary: string;
    recentTransactions: string[];
}

export const generatePortfolioInsight = async (portfolio: Portfolio, metrics?: PortfolioContextData): Promise<string> => {
  const hash = generatePortfolioHash(portfolio);
  const cacheKey = `insight_${hash}`;
  
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    // Prepare a summary of the portfolio including new P/E and Market Cap metrics
    const holdingsSummary = portfolio.holdings
      .map(h => `${h.symbol}: $${(h.shares * h.currentPrice).toFixed(0)} (P/E: ${h.peRatio || 'N/A'}, Mkt Cap: $${h.marketCap ? (h.marketCap / 1e9).toFixed(1) + 'B' : 'N/A'})`)
      .join(', ');

    let advancedContext = '';
    if (metrics) {
        advancedContext = `
        Advanced Metrics:
        - Portfolio Beta: ${metrics.beta.toFixed(2)}
        - Weighted Yield: ${metrics.yield.toFixed(2)}%
        - Sector Allocation: ${JSON.stringify(metrics.sectorWeights)}
        `;
    }

    const prompt = `
      Analyze the following investment portfolio summary for a daily executive briefing:
      
      Core Data:
      - Total Cash: $${portfolio.cashBalance}
      - Total Equity Value: $${portfolio.totalValue}
      - Holdings Details: ${holdingsSummary}

      ${advancedContext}

      Provide a professional, 3-4 sentence executive summary. 
      1. Comment on the valuation of holdings based on P/E ratios and Market Cap distribution.
      2. Mention any concentration risk.
      3. Suggest a strategic move (e.g., rebalancing, increasing defensive positions) based on current exposure.
      
      Adopt a high-end financial advisor persona. Be concise and actionable.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || "Unable to generate insight at this time.";
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
    return handleGeminiError(error, "AI Insight unavailable. Please check your API key configuration.");
  }
};

export const analyzeStockRisks = async (symbol: string): Promise<{ strengths: string[], risks: string[] }> => {
  const cacheKey = `risks_${symbol}`;
  const cached = getFromCache<{ strengths: string[], risks: string[] }>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Analyze ${symbol} for an investor. Provide 3 key distinct strengths (bull case) and 3 key distinct risks (bear case). Keep them concise.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned");
    const result = JSON.parse(text);
    saveToCache(cacheKey, result);
    return result;
  } catch (error) {
    handleGeminiError(error, "");
    return { 
      strengths: ["Strong market position", "Consistent revenue growth", "High brand value"], 
      risks: ["Regulatory challenges", "Market saturation", "Economic downturn impact"] 
    };
  }
};

export const analyzeStock = async (symbol: string): Promise<string> => {
  const cacheKey = `analysis_${symbol}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a concise fundamental analysis of ${symbol} in 100 words. Focus on recent growth catalysts and primary risks.`,
    });
    
    const text = response.text || "Analysis unavailable.";
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
      return handleGeminiError(error, "Analysis unavailable.");
  }
}
