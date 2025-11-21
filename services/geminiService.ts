
import { GoogleGenAI, Type } from "@google/genai";
import { Portfolio } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple cache to prevent 429s
const portfolioInsightCache: Record<string, { hash: string, insight: string }> = {};

const generatePortfolioHash = (portfolio: Portfolio) => {
    return `${portfolio.id}-${portfolio.holdings.length}-${portfolio.totalValue.toFixed(0)}-${portfolio.cashBalance.toFixed(0)}`;
}

// Helper to handle API errors
const handleGeminiError = (error: any, defaultMessage: string): string => {
    console.error("Gemini API Error:", error);
    
    let errorStr = '';
    try {
        errorStr = JSON.stringify(error);
    } catch {
        errorStr = String(error);
    }

    // Check for Quota Exceeded / Rate Limit (429)
    if (
        errorStr.includes('429') || 
        errorStr.toLowerCase().includes('quota') || 
        errorStr.includes('RESOURCE_EXHAUSTED')
    ) {
        return "⚠️ AI Usage Limit Reached. Please try again in a few minutes.";
    }

    return defaultMessage;
};

export const generatePortfolioInsight = async (portfolio: Portfolio): Promise<string> => {
  const hash = generatePortfolioHash(portfolio);
  
  // Return cached version if available and portfolio hasn't changed significantly
  if (portfolioInsightCache[portfolio.id]?.hash === hash) {
      return portfolioInsightCache[portfolio.id].insight;
  }

  try {
    // Prepare a summary of the portfolio for the prompt
    const holdingsSummary = portfolio.holdings
      .map(h => `${h.symbol} (${h.assetType}): $${(h.shares * h.currentPrice).toFixed(2)}`)
      .join(', ');

    const prompt = `
      Analyze the following investment portfolio summary:
      Total Cash: $${portfolio.cashBalance}
      Holdings: ${holdingsSummary}

      Provide a brief, 3-sentence executive summary of this portfolio's risk profile and potential areas for diversification. 
      Adopt a professional, financial advisor persona. Do not give specific financial advice, but rather structural observations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || "Unable to generate insight at this time.";
    
    // Cache the result
    portfolioInsightCache[portfolio.id] = { hash, insight: text };
    
    return text;
  } catch (error) {
    return handleGeminiError(error, "AI Insight unavailable. Please check your API key configuration.");
  }
};

export const analyzeStockRisks = async (symbol: string): Promise<{ strengths: string[], risks: string[] }> => {
  try {
    const prompt = `Analyze ${symbol} for an investor. Provide 3 key distinct strengths (bull case) and 3 key distinct risks (bear case). Keep them concise.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    if (!text) return { strengths: [], risks: [] };
    return JSON.parse(text);
  } catch (error) {
    // Log the specific error for debugging, including quota issues
    handleGeminiError(error, "");
    
    // Fallback to generic data on error (including rate limit) to keep UI intact
    return { 
      strengths: ["Strong market position", "Consistent revenue growth", "High brand value"], 
      risks: ["Regulatory challenges", "Market saturation", "Economic downturn impact"] 
    };
  }
};

export const analyzeStock = async (symbol: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a concise fundamental analysis of ${symbol} in 100 words. Focus on recent growth catalysts and primary risks.`,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
      return handleGeminiError(error, "Analysis unavailable.");
  }
}
