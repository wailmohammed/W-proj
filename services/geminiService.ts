
import { GoogleGenAI, Type } from "@google/genai";
import { Portfolio } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Persistent Cache Helpers to prevent 429s across reloads
const CACHE_PREFIX = 'wealthos_cache_v2_';

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

    if (errorStr.includes('Failed to fetch')) {
        return "⚠️ Connection to AI servers failed. Check your internet connection.";
    }

    return defaultMessage;
};

interface PortfolioContextData {
    beta: number;
    yield: number;
    sectorWeights: Record<string, string>; // Percentage string
}

export const generatePortfolioInsight = async (portfolio: Portfolio, metrics?: PortfolioContextData): Promise<string> => {
  const hash = generatePortfolioHash(portfolio);
  const cacheKey = `insight_${hash}`;
  
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    // Prepare a summary of the portfolio including deep financial metrics
    const holdingsSummary = portfolio.holdings
      .map(h => `${h.symbol}: Value $${(h.shares * h.currentPrice).toFixed(0)} (P/E: ${h.peRatio || 'N/A'}, D/E: ${h.debtToEquity || 'N/A'}, Margin: ${h.profitMargin || 'N/A'}%, Mkt Cap: $${h.marketCap ? (h.marketCap / 1e9).toFixed(1) + 'B' : 'N/A'})`)
      .join('\n');

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
      Analyze the following investment portfolio summary for a professional executive briefing:
      
      Core Data:
      - Total Cash: $${portfolio.cashBalance}
      - Total Equity Value: $${portfolio.totalValue}
      - Holdings Details: 
      ${holdingsSummary}

      ${advancedContext}

      Provide a high-end financial advisor executive summary (3-4 sentences):
      1. Analyze the fundamental quality of the holdings based on P/E ratios and profit margins.
      2. Critique the balance sheet health (Debt-to-Equity exposure).
      3. Recommend a strategic optimization (e.g., rotation, defensive hedging, or momentum capture).
      
      Maintain a sophisticated, institutional-grade tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    const text = response.text || "Unable to generate insight at this time.";
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
    return handleGeminiError(error, "AI Insight unavailable. Please check your network or API settings.");
  }
};

export const analyzeStockRisks = async (symbol: string): Promise<{ strengths: string[], risks: string[] }> => {
  const cacheKey = `risks_v2_${symbol}`;
  const cached = getFromCache<{ strengths: string[], risks: string[] }>(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Analyze ${symbol} for a sophisticated investor. List 3 strengths and 3 risks focusing on fundamental analysis, cash flow, and market positioning. Return in JSON format.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } }
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
      strengths: ["Dominant market presence", "Strong balance sheet", "High switching costs"], 
      risks: ["Macroeconomic headwinds", "Regulatory pressure", "Intense competition"] 
    };
  }
};

export const analyzeStock = async (symbol: string): Promise<string> => {
  const cacheKey = `analysis_v2_${symbol}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze ${symbol} financials (P/E, margins, debt) and provide a concise fundamental outlook in 100 words.`,
    });
    
    const text = response.text || "Analysis unavailable.";
    saveToCache(cacheKey, text);
    return text;
  } catch (error) {
      return handleGeminiError(error, "Analysis unavailable.");
  }
}
