/**
 * Valuation & Financial Analysis Service
 * Inspired by Simply Wall St, Snowball Analytics, and Beanvest
 * Provides DCF valuation, relative valuation, and comprehensive financial health analysis
 */

import { Holding, SnowflakeScore, FinancialHealthData, Competitor, ValuationData } from '../types';

export interface DCFValuation {
  fairValue: number;
  currentPrice: number;
  upside: number; // Percentage
  status: 'Undervalued' | 'Fair Value' | 'Overvalued';
  assumptions: {
    growthRate: number;
    discountRate: number;
    terminalGrowthRate: number;
    years: number;
  };
  yearlyCashFlows: { year: number; cashFlow: number; presentValue: number }[];
}

export interface RelativeValuation {
  peRatio: number;
  industryAvgPE: number;
  pbRatio: number;
  industryAvgPB: number;
  psRatio: number;
  industryAvgPS: number;
  pegRatio: number;
  evToEbitda: number;
  conclusion: string;
}

export interface FinancialHealthMetrics {
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  interestCoverage: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  assetTurnover: number;
  inventoryTurnover?: number;
}

export interface GrowthMetrics {
  revenueGrowth1Y: number;
  revenueGrowth3Y: number;
  revenueGrowth5Y: number;
  earningsGrowth1Y: number;
  earningsGrowth3Y: number;
  earningsGrowth5Y: number;
  dividendGrowth1Y: number;
  dividendGrowth3Y: number;
  dividendGrowth5Y: number;
  bookValueGrowth5Y: number;
}

export interface PastPerformanceMetrics {
  totalReturn1Y: number;
  totalReturn3Y: number;
  totalReturn5Y: number;
  totalReturn10Y: number;
  annualizedReturn3Y: number;
  annualizedReturn5Y: number;
  volatility: number;
  beta: number;
  sharpeRatio: number;
}

// Mock financial database (in production, this would come from financial APIs)
const FINANCIAL_DATABASE: Record<string, {
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  psRatio: number;
  pegRatio: number;
  evToEbitda: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  interestCoverage: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  revenueGrowth: number[];
  earningsGrowth: number[];
  dividendGrowth: number[];
  totalReturns: number[];
  beta: number;
  volatility: number;
  freeCashFlow: number;
  sharesOutstanding: number;
  bookValue: number;
  sector: string;
  industry: string;
}> = {
  'AAPL': {
    marketCap: 2890000000000, peRatio: 28.5, pbRatio: 45.2, psRatio: 7.8, pegRatio: 2.1, evToEbitda: 22.3,
    currentRatio: 1.07, quickRatio: 0.98, debtToEquity: 1.78, interestCoverage: 28.5,
    roe: 147.5, roa: 27.8, grossMargin: 44.1, operatingMargin: 29.8, netMargin: 25.3,
    revenueGrowth: [2.8, 7.8, 11.2, 33.3, 5.5], earningsGrowth: [-2.8, 5.4, 64.9, 64.9, 3.9], dividendGrowth: [4.3, 5.6, 6.2, 7.0, 5.9],
    totalReturns: [48.2, 15.5, 75.8, 11.2, 12.5], beta: 1.24, volatility: 24.5,
    freeCashFlow: 99800000000, sharesOutstanding: 15552752000, bookValue: 4.2,
    sector: 'Technology', industry: 'Consumer Electronics'
  },
  'MSFT': {
    marketCap: 3100000000000, peRatio: 35.8, pbRatio: 12.5, psRatio: 12.8, pegRatio: 2.5, evToEbitda: 25.2,
    currentRatio: 1.77, quickRatio: 1.75, debtToEquity: 0.38, interestCoverage: 45.2,
    roe: 38.5, roa: 18.2, grossMargin: 69.8, operatingMargin: 42.5, netMargin: 36.7,
    revenueGrowth: [6.5, 12.1, 13.9, 17.5, 13.6], earningsGrowth: [9.8, 18.7, 38.4, 38.4, 10.2], dividendGrowth: [10.5, 10.2, 9.8, 9.5, 10.8],
    totalReturns: [56.8, 12.5, 52.3, 8.5, 15.2], beta: 0.89, volatility: 22.1,
    freeCashFlow: 72500000000, sharesOutstanding: 7432000000, bookValue: 28.5,
    sector: 'Technology', industry: 'Software'
  },
  'JNJ': {
    marketCap: 385000000000, peRatio: 15.2, pbRatio: 5.8, psRatio: 4.2, pegRatio: 2.8, evToEbitda: 12.5,
    currentRatio: 1.12, quickRatio: 0.85, debtToEquity: 0.48, interestCoverage: 18.5,
    roe: 25.8, roa: 10.5, grossMargin: 68.5, operatingMargin: 24.8, netMargin: 18.5,
    revenueGrowth: [-1.5, 1.2, 1.8, -3.5, 6.8], earningsGrowth: [-35.2, 8.5, 42.5, -8.5, 5.2], dividendGrowth: [5.8, 5.5, 5.9, 6.2, 5.5],
    totalReturns: [-5.2, 8.5, 12.5, 5.8, 8.2], beta: 0.55, volatility: 15.8,
    freeCashFlow: 18500000000, sharesOutstanding: 2425000000, bookValue: 26.8,
    sector: 'Healthcare', industry: 'Pharmaceuticals'
  },
  'KO': {
    marketCap: 268000000000, peRatio: 25.5, pbRatio: 10.2, psRatio: 5.8, pegRatio: 3.2, evToEbitda: 18.5,
    currentRatio: 1.15, quickRatio: 0.95, debtToEquity: 1.52, interestCoverage: 12.5,
    roe: 42.5, roa: 9.8, grossMargin: 59.8, operatingMargin: 28.5, netMargin: 22.8,
    revenueGrowth: [3.2, 5.8, 8.5, 11.2, 2.5], earningsGrowth: [5.2, 8.5, 12.5, 15.8, 3.8], dividendGrowth: [3.2, 3.5, 3.8, 3.5, 3.2],
    totalReturns: [8.5, 5.2, 15.8, 8.5, 5.5], beta: 0.62, volatility: 14.2,
    freeCashFlow: 9800000000, sharesOutstanding: 4325000000, bookValue: 6.2,
    sector: 'Consumer Defensive', industry: 'Beverages'
  },
  'PG': {
    marketCap: 385000000000, peRatio: 26.8, pbRatio: 8.5, psRatio: 4.8, pegRatio: 3.5, evToEbitda: 19.2,
    currentRatio: 0.85, quickRatio: 0.65, debtToEquity: 0.52, interestCoverage: 15.8,
    roe: 32.5, roa: 12.5, grossMargin: 52.5, operatingMargin: 24.5, netMargin: 18.2,
    revenueGrowth: [2.5, 4.8, 6.5, 8.2, 1.5], earningsGrowth: [4.5, 6.8, 9.5, 12.5, 3.5], dividendGrowth: [4.5, 4.8, 5.2, 5.5, 4.2],
    totalReturns: [12.5, 8.5, 18.5, 6.5, 8.8], beta: 0.48, volatility: 13.5,
    freeCashFlow: 15200000000, sharesOutstanding: 2385000000, bookValue: 18.5,
    sector: 'Consumer Defensive', industry: 'Household Products'
  },
  'VZ': {
    marketCap: 172000000000, peRatio: 8.5, pbRatio: 1.8, psRatio: 1.3, pegRatio: 1.5, evToEbitda: 7.2,
    currentRatio: 0.75, quickRatio: 0.68, debtToEquity: 1.85, interestCoverage: 4.5,
    roe: 22.5, roa: 5.8, grossMargin: 58.5, operatingMargin: 22.5, netMargin: 12.8,
    revenueGrowth: [-2.5, 0.5, 1.2, -1.8, 0.8], earningsGrowth: [-8.5, 2.5, 5.8, -5.2, 1.5], dividendGrowth: [2.1, 2.2, 2.0, 2.1, 2.0],
    totalReturns: [-8.5, 2.5, 8.5, -5.2, 2.8], beta: 0.42, volatility: 18.5,
    freeCashFlow: 18500000000, sharesOutstanding: 4205000000, bookValue: 22.5,
    sector: 'Communication Services', industry: 'Telecom Services'
  },
  'O': {
    marketCap: 45000000000, peRatio: 52.5, pbRatio: 1.5, psRatio: 15.8, pegRatio: 8.5, evToEbitda: 22.5,
    currentRatio: 2.85, quickRatio: 2.85, debtToEquity: 1.25, interestCoverage: 3.8,
    roe: 3.2, roa: 1.5, grossMargin: 92.5, operatingMargin: 28.5, netMargin: 22.5,
    revenueGrowth: [8.5, 12.5, 15.8, 18.5, 5.2], earningsGrowth: [5.2, 8.5, 12.5, 15.8, 3.5], dividendGrowth: [3.8, 4.2, 4.5, 4.0, 3.5],
    totalReturns: [5.2, 8.5, 12.5, 5.8, 8.2], beta: 0.72, volatility: 22.5,
    freeCashFlow: 1850000000, sharesOutstanding: 725000000, bookValue: 28.5,
    sector: 'Real Estate', industry: 'REIT - Retail'
  },
};

const INDUSTRY_AVERAGES: Record<string, { peRatio: number; pbRatio: number; psRatio: number; evToEbitda: number }> = {
  'Technology': { peRatio: 32.5, pbRatio: 15.8, psRatio: 8.5, evToEbitda: 22.5 },
  'Healthcare': { peRatio: 18.5, pbRatio: 6.5, psRatio: 4.8, evToEbitda: 14.5 },
  'Consumer Defensive': { peRatio: 22.5, pbRatio: 8.2, psRatio: 4.5, evToEbitda: 15.8 },
  'Communication Services': { peRatio: 15.8, pbRatio: 3.5, psRatio: 2.8, evToEbitda: 10.5 },
  'Real Estate': { peRatio: 35.5, pbRatio: 1.8, psRatio: 12.5, evToEbitda: 18.5 },
  'Financial Services': { peRatio: 12.5, pbRatio: 1.5, psRatio: 3.2, evToEbitda: 8.5 },
  'Energy': { peRatio: 10.5, pbRatio: 1.8, psRatio: 1.5, evToEbitda: 6.5 },
  'Industrials': { peRatio: 18.5, pbRatio: 3.5, psRatio: 2.2, evToEbitda: 12.5 },
};

/**
 * Calculate DCF (Discounted Cash Flow) Valuation
 * Simplified model for demonstration
 */
export function calculateDCFValuation(holding: Holding): DCFValuation {
  const dbEntry = FINANCIAL_DATABASE[holding.symbol];
  
  if (!dbEntry) {
    // Return basic estimate if no data
    return {
      fairValue: holding.currentPrice,
      currentPrice: holding.currentPrice,
      upside: 0,
      status: 'Fair Value',
      assumptions: { growthRate: 5, discountRate: 10, terminalGrowthRate: 2.5, years: 5 },
      yearlyCashFlows: []
    };
  }

  const assumptions = {
    growthRate: Math.min(15, Math.max(3, dbEntry.revenueGrowth[0] || 5)),
    discountRate: 10, // WACC approximation
    terminalGrowthRate: 2.5,
    years: 5
  };

  const freeCashFlow = dbEntry.freeCashFlow;
  const sharesOutstanding = dbEntry.sharesOutstanding;
  const currentFCFPerShare = freeCashFlow / sharesOutstanding;

  // Project future cash flows
  const yearlyCashFlows: { year: number; cashFlow: number; presentValue: number }[] = [];
  let totalPV = 0;

  for (let year = 1; year <= assumptions.years; year++) {
    const cashFlow = currentFCFPerShare * Math.pow(1 + assumptions.growthRate / 100, year);
    const presentValue = cashFlow / Math.pow(1 + assumptions.discountRate / 100, year);
    yearlyCashFlows.push({ year, cashFlow, presentValue });
    totalPV += presentValue;
  }

  // Calculate terminal value
  const terminalYearFCF = currentFCFPerShare * Math.pow(1 + assumptions.growthRate / 100, assumptions.years);
  const terminalValue = (terminalYearFCF * (1 + assumptions.terminalGrowthRate / 100)) / (assumptions.discountRate / 100 - assumptions.terminalGrowthRate / 100);
  const terminalPV = terminalValue / Math.pow(1 + assumptions.discountRate / 100, assumptions.years);

  const fairValue = totalPV + terminalPV;
  const upside = ((fairValue - holding.currentPrice) / holding.currentPrice) * 100;

  let status: DCFValuation['status'] = 'Fair Value';
  if (upside > 15) status = 'Undervalued';
  else if (upside < -15) status = 'Overvalued';

  return {
    fairValue: Math.round(fairValue * 100) / 100,
    currentPrice: holding.currentPrice,
    upside: Math.round(upside * 100) / 100,
    status,
    assumptions,
    yearlyCashFlows
  };
}

/**
 * Calculate Relative Valuation metrics
 */
export function calculateRelativeValuation(holding: Holding): RelativeValuation {
  const dbEntry = FINANCIAL_DATABASE[holding.symbol];
  
  if (!dbEntry) {
    return {
      peRatio: holding.peRatio || 0,
      industryAvgPE: 20,
      pbRatio: 0,
      industryAvgPB: 5,
      psRatio: 0,
      industryAvgPS: 3,
      pegRatio: 0,
      evToEbitda: 0,
      conclusion: 'Insufficient data for relative valuation'
    };
  }

  const industryAvg = INDUSTRY_AVERAGES[dbEntry.sector] || INDUSTRY_AVERAGES['Technology'];

  const conclusions: string[] = [];
  
  if (dbEntry.peRatio < industryAvg.peRatio * 0.8) conclusions.push('P/E suggests undervaluation');
  else if (dbEntry.peRatio > industryAvg.peRatio * 1.2) conclusions.push('P/E suggests overvaluation');
  else conclusions.push('P/E is in line with industry');

  if (dbEntry.pegRatio < 1.5) conclusions.push('PEG indicates good value relative to growth');
  else if (dbEntry.pegRatio > 3) conclusions.push('PEG suggests stock may be expensive');

  return {
    peRatio: dbEntry.peRatio,
    industryAvgPE: industryAvg.peRatio,
    pbRatio: dbEntry.pbRatio,
    industryAvgPB: industryAvg.pbRatio,
    psRatio: dbEntry.psRatio,
    industryAvgPS: industryAvg.psRatio,
    pegRatio: dbEntry.pegRatio,
    evToEbitda: dbEntry.evToEbitda,
    conclusion: conclusions.join('. ') + '.'
  };
}

/**
 * Calculate comprehensive financial health metrics
 */
export function calculateFinancialHealth(holding: Holding): FinancialHealthMetrics {
  const dbEntry = FINANCIAL_DATABASE[holding.symbol];
  
  if (!dbEntry) {
    return {
      currentRatio: 1.5,
      quickRatio: 1.2,
      debtToEquity: holding.debtToEquity || 0.5,
      interestCoverage: 10,
      roe: 15,
      roa: 8,
      grossMargin: 40,
      operatingMargin: 20,
      netMargin: 15,
      assetTurnover: 0.8,
      inventoryTurnover: 5
    };
  }

  return {
    currentRatio: dbEntry.currentRatio,
    quickRatio: dbEntry.quickRatio,
    debtToEquity: dbEntry.debtToEquity,
    interestCoverage: dbEntry.interestCoverage,
    roe: dbEntry.roe,
    roa: dbEntry.roa,
    grossMargin: dbEntry.grossMargin,
    operatingMargin: dbEntry.operatingMargin,
    netMargin: dbEntry.netMargin,
    assetTurnover: dbEntry.roa / dbEntry.netMargin * 100,
    inventoryTurnover: undefined
  };
}

/**
 * Calculate growth metrics
 */
export function calculateGrowthMetrics(holding: Holding): GrowthMetrics {
  const dbEntry = FINANCIAL_DATABASE[holding.symbol];
  
  if (!dbEntry) {
    return {
      revenueGrowth1Y: 5, revenueGrowth3Y: 8, revenueGrowth5Y: 10,
      earningsGrowth1Y: 5, earningsGrowth3Y: 8, earningsGrowth5Y: 10,
      dividendGrowth1Y: 3, dividendGrowth3Y: 4, dividendGrowth5Y: 5,
      bookValueGrowth5Y: 6
    };
  }

  const avg = (arr: number[], n: number) => arr.slice(0, n).reduce((a, b) => a + b, 0) / Math.min(n, arr.length);

  return {
    revenueGrowth1Y: dbEntry.revenueGrowth[0] || 5,
    revenueGrowth3Y: avg(dbEntry.revenueGrowth, 3),
    revenueGrowth5Y: avg(dbEntry.revenueGrowth, 5),
    earningsGrowth1Y: dbEntry.earningsGrowth[0] || 5,
    earningsGrowth3Y: avg(dbEntry.earningsGrowth, 3),
    earningsGrowth5Y: avg(dbEntry.earningsGrowth, 5),
    dividendGrowth1Y: dbEntry.dividendGrowth[0] || 3,
    dividendGrowth3Y: avg(dbEntry.dividendGrowth, 3),
    dividendGrowth5Y: avg(dbEntry.dividendGrowth, 5),
    bookValueGrowth5Y: 6
  };
}

/**
 * Calculate past performance metrics
 */
export function calculatePastPerformance(holding: Holding): PastPerformanceMetrics {
  const dbEntry = FINANCIAL_DATABASE[holding.symbol];
  
  if (!dbEntry) {
    return {
      totalReturn1Y: 10, totalReturn3Y: 30, totalReturn5Y: 50, totalReturn10Y: 120,
      annualizedReturn3Y: 9, annualizedReturn5Y: 8.5,
      volatility: 20, beta: 1, sharpeRatio: 0.8
    };
  }

  const returns = dbEntry.totalReturns;
  const annualized = (totalReturn: number, years: number) => Math.pow(1 + totalReturn / 100, 1 / years) * 100 - 100;

  return {
    totalReturn1Y: returns[0] || 10,
    totalReturn3Y: returns.slice(0, 3).reduce((a, b) => a + b, 0),
    totalReturn5Y: returns.reduce((a, b) => a + b, 0),
    totalReturn10Y: returns.reduce((a, b) => a + b, 0) * 2,
    annualizedReturn3Y: annualized(returns.slice(0, 3).reduce((a, b) => a + b, 0), 3),
    annualizedReturn5Y: annualized(returns.reduce((a, b) => a + b, 0), 5),
    volatility: dbEntry.volatility,
    beta: dbEntry.beta,
    sharpeRatio: (annualized(returns.slice(0, 3).reduce((a, b) => a + b, 0), 3) - 2) / dbEntry.volatility * 100
  };
}

/**
 * Calculate comprehensive snowflake score (inspired by Snowball Analytics)
 */
export function calculateSnowflakeScore(holding: Holding): SnowflakeScore {
  const health = calculateFinancialHealth(holding);
  const growth = calculateGrowthMetrics(holding);
  const past = calculatePastPerformance(holding);
  const dcf = calculateDCFValuation(holding);
  
  // Value Score (0-5)
  let valueScore = 3;
  if (dcf.status === 'Undervalued') valueScore = 5;
  else if (dcf.upside > 5) valueScore = 4;
  else if (dcf.status === 'Overvalued') valueScore = 1;
  else if (dcf.upside < -5) valueScore = 2;

  // Future Score (0-5) - Based on growth estimates
  let futureScore = 3;
  const avgGrowth = (growth.revenueGrowth3Y + growth.earningsGrowth3Y) / 2;
  if (avgGrowth > 15) futureScore = 5;
  else if (avgGrowth > 10) futureScore = 4;
  else if (avgGrowth > 5) futureScore = 3;
  else if (avgGrowth > 0) futureScore = 2;
  else futureScore = 1;

  // Past Score (0-5) - Based on historical performance
  let pastScore = 3;
  if (past.totalReturn5Y > 100 && past.annualizedReturn5Y > 12) pastScore = 5;
  else if (past.totalReturn5Y > 50 && past.annualizedReturn5Y > 8) pastScore = 4;
  else if (past.totalReturn5Y > 20) pastScore = 3;
  else if (past.totalReturn5Y > 0) pastScore = 2;
  else pastScore = 1;

  // Health Score (0-5) - Based on financial health
  let healthScore = 3;
  if (health.currentRatio > 1.5 && health.debtToEquity < 0.5 && health.roe > 20) healthScore = 5;
  else if (health.currentRatio > 1.2 && health.debtToEquity < 1 && health.roe > 15) healthScore = 4;
  else if (health.currentRatio > 1 && health.debtToEquity < 1.5) healthScore = 3;
  else if (health.currentRatio > 0.8) healthScore = 2;
  else healthScore = 1;

  // Dividend Score (0-5) - Based on dividend metrics
  let dividendScore = 3;
  const divYield = holding.dividendYield || 0;
  const payoutRatio = holding.payoutRatio || 50;
  if (divYield > 4 && payoutRatio < 60) dividendScore = 5;
  else if (divYield > 2 && payoutRatio < 70) dividendScore = 4;
  else if (divYield > 1 && payoutRatio < 80) dividendScore = 3;
  else if (divYield > 0) dividendScore = 2;
  else dividendScore = 0;

  const total = valueScore + futureScore + pastScore + healthScore + dividendScore;

  return {
    value: valueScore,
    future: futureScore,
    past: pastScore,
    health: healthScore,
    dividend: dividendScore,
    total
  };
}

/**
 * Get competitor analysis
 */
export function getCompetitorAnalysis(symbol: string): Competitor[] {
  const dbEntry = FINANCIAL_DATABASE[symbol];
  if (!dbEntry) return [];

  const competitors: Competitor[] = [];
  const sameIndustry = Object.entries(FINANCIAL_DATABASE).filter(([s, data]) => 
    s !== symbol && data.industry === dbEntry.industry
  );

  sameIndustry.slice(0, 4).forEach(([compSymbol, compData]) => {
    competitors.push({
      symbol: compSymbol,
      name: compSymbol,
      marketCap: formatMarketCap(compData.marketCap),
      peRatio: compData.peRatio,
      dividendYield: 2.5, // Would need separate dividend data
      revenueGrowth: compData.revenueGrowth[0] || 5
    });
  });

  // Fill with industry averages if not enough competitors
  while (competitors.length < 4) {
    const industryAvg = INDUSTRY_AVERAGES[dbEntry.sector] || INDUSTRY_AVERAGES['Technology'];
    competitors.push({
      symbol: 'IND_AVG',
      name: 'Industry Average',
      marketCap: '-',
      peRatio: industryAvg.peRatio,
      dividendYield: 2,
      revenueGrowth: 5
    });
  }

  return competitors;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap}`;
}

/**
 * Get comprehensive valuation data for a holding
 */
export function getComprehensiveValuation(holding: Holding): ValuationData {
  const dcf = calculateDCFValuation(holding);
  
  return {
    fairValue: dcf.fairValue,
    currentPrice: holding.currentPrice,
    discount: Math.round(dcf.upside),
    status: dcf.status
  };
}
