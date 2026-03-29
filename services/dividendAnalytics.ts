/**
 * Dividend Analytics Service
 * Inspired by Snowball Analytics, Simply Safe Dividends, and Digrin
 * Provides dividend forecasting, safety analysis, and growth tracking
 */

import { Holding, Dividend, SnowflakeScore } from '../types';

export interface DividendForecast {
  symbol: string;
  annualDividend: number;
  quarterlyPayments: { quarter: string; amount: number; estimatedDate: string }[];
  projectedYield: number;
  growthRate: number;
  streak: number; // Years of consecutive increases
}

export interface DividendSafety {
  symbol: string;
  score: number; // 0-100
  rating: 'Very Safe' | 'Safe' | 'Borderline' | 'Unsafe' | 'Dangerous';
  payoutRatio: number;
  freeCashFlowPayout: number;
  debtToEquity: number;
  earningsGrowth: number;
  dividendGrowth5Y: number;
}

export interface PortfolioDividendSummary {
  totalAnnualDividends: number;
  averageYield: number;
  monthlyIncome: { month: string; income: number }[];
  topPayers: { symbol: string; amount: number; yield: number }[];
  dividendGrowthRate: number;
  safetyScore: number;
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
}

// Mock dividend database (in production, this would come from an API)
const DIVIDEND_DATABASE: Record<string, { 
  yield: number; 
  frequency: 'Monthly' | 'Quarterly' | 'Annually';
  payoutRatio: number;
  streak: number;
  growthRate: number;
  exDates: string[];
  payDates: string[];
  amounts: number[];
}> = {
  'AAPL': { yield: 0.52, frequency: 'Quarterly', payoutRatio: 15.2, streak: 12, growthRate: 7.5, exDates: ['2024-02-09', '2024-05-10', '2024-08-09', '2024-11-08'], payDates: ['2024-02-15', '2024-05-16', '2024-08-15', '2024-11-14'], amounts: [0.24, 0.25, 0.25, 0.25] },
  'MSFT': { yield: 0.72, frequency: 'Quarterly', payoutRatio: 25.8, streak: 21, growthRate: 10.2, exDates: ['2024-02-14', '2024-05-15', '2024-08-14', '2024-11-13'], payDates: ['2024-03-14', '2024-06-13', '2024-09-12', '2024-12-12'], amounts: [0.75, 0.75, 0.75, 0.75] },
  'JNJ': { yield: 2.95, frequency: 'Quarterly', payoutRatio: 45.3, streak: 62, growthRate: 5.8, exDates: ['2024-02-20', '2024-05-21', '2024-08-20', '2024-11-19'], payDates: ['2024-03-05', '2024-06-04', '2024-09-03', '2024-12-03'], amounts: [1.19, 1.19, 1.19, 1.19] },
  'KO': { yield: 3.12, frequency: 'Quarterly', payoutRatio: 68.5, streak: 62, growthRate: 3.2, exDates: ['2024-03-14', '2024-06-13', '2024-09-12', '2024-12-12'], payDates: ['2024-04-01', '2024-07-01', '2024-10-01', '2025-01-01'], amounts: [0.485, 0.485, 0.485, 0.485] },
  'PG': { yield: 2.38, frequency: 'Quarterly', payoutRatio: 58.2, streak: 68, growthRate: 4.5, exDates: ['2024-01-18', '2024-04-18', '2024-07-18', '2024-10-17'], payDates: ['2024-02-15', '2024-05-15', '2024-08-15', '2024-11-15'], amounts: [0.9407, 0.9407, 0.9407, 0.9407] },
  'VZ': { yield: 6.42, frequency: 'Quarterly', payoutRatio: 92.1, streak: 18, growthRate: 2.1, exDates: ['2024-01-09', '2024-04-09', '2024-07-09', '2024-10-08'], payDates: ['2024-02-01', '2024-05-01', '2024-08-01', '2024-11-01'], amounts: [0.6525, 0.6525, 0.6525, 0.6525] },
  'O': { yield: 5.85, frequency: 'Monthly', payoutRatio: 75.3, streak: 25, growthRate: 3.8, exDates: ['2024-01-02', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-03', '2024-07-01', '2024-08-01', '2024-09-02', '2024-10-01', '2024-11-01', '2024-12-02'], payDates: ['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15', '2024-05-15', '2024-06-17', '2024-07-15', '2024-08-15', '2024-09-16', '2024-10-15', '2024-11-15', '2024-12-16'], amounts: [0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565, 0.2565] },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Calculate dividend forecast for a holding
 */
export function calculateDividendForecast(holding: Holding): DividendForecast {
  const dbEntry = DIVIDEND_DATABASE[holding.symbol] || {
    yield: holding.dividendYield || 0,
    frequency: 'Quarterly' as const,
    payoutRatio: holding.payoutRatio || 50,
    streak: 0,
    growthRate: 3,
    exDates: [],
    payDates: [],
    amounts: []
  };

  const annualDividend = holding.currentPrice * (dbEntry.yield / 100);
  const quarterlyAmount = dbEntry.frequency === 'Monthly' ? annualDividend / 12 : annualDividend / 4;
  
  const quarterlyPayments = dbEntry.frequency === 'Monthly' 
    ? MONTHS.map((month, i) => ({
        quarter: `${month} 2024`,
        amount: quarterlyAmount,
        estimatedDate: `2024-${String(i + 1).padStart(2, '0')}-15`
      }))
    : ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => ({
        quarter: q,
        amount: quarterlyAmount,
        estimatedDate: dbEntry.payDates[i] || `2024-${String(i * 3 + 2).padStart(2, '0')}-15`
      }));

  return {
    symbol: holding.symbol,
    annualDividend,
    quarterlyPayments,
    projectedYield: dbEntry.yield,
    growthRate: dbEntry.growthRate,
    streak: dbEntry.streak
  };
}

/**
 * Calculate dividend safety score (inspired by Simply Safe Dividends)
 */
export function calculateDividendSafety(holding: Holding): DividendSafety {
  const dbEntry = DIVIDEND_DATABASE[holding.symbol];
  const payoutRatio = holding.payoutRatio || dbEntry?.payoutRatio || 50;
  const dividendGrowth = dbEntry?.growthRate || 3;
  
  // Safety scoring algorithm
  let score = 100;
  
  // Payout ratio impact (lower is better)
  if (payoutRatio > 90) score -= 40;
  else if (payoutRatio > 75) score -= 25;
  else if (payoutRatio > 60) score -= 15;
  else if (payoutRatio > 45) score -= 5;
  
  // Dividend streak bonus
  const streak = dbEntry?.streak || 0;
  if (streak >= 50) score += 20;
  else if (streak >= 25) score += 15;
  else if (streak >= 10) score += 10;
  else if (streak >= 5) score += 5;
  
  // Growth rate impact
  if (dividendGrowth < 0) score -= 20;
  else if (dividendGrowth < 2) score -= 5;
  else if (dividendGrowth > 8) score += 10;
  else if (dividendGrowth > 5) score += 5;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  let rating: DividendSafety['rating'] = 'Safe';
  if (score >= 80) rating = 'Very Safe';
  else if (score >= 60) rating = 'Safe';
  else if (score >= 40) rating = 'Borderline';
  else if (score >= 20) rating = 'Unsafe';
  else rating = 'Dangerous';

  return {
    symbol: holding.symbol,
    score,
    rating,
    payoutRatio,
    freeCashFlowPayout: payoutRatio * 0.85, // Estimate
    debtToEquity: holding.debtToEquity || 0.5,
    earningsGrowth: dividendGrowth * 1.2, // Estimate
    dividendGrowth5Y: dividendGrowth
  };
}

/**
 * Calculate portfolio-wide dividend summary
 */
export function calculatePortfolioDividends(holdings: Holding[]): PortfolioDividendSummary {
  if (!holdings || holdings.length === 0) {
    return {
      totalAnnualDividends: 0,
      averageYield: 0,
      monthlyIncome: MONTHS.map(m => ({ month: m, income: 0 })),
      topPayers: [],
      dividendGrowthRate: 0,
      safetyScore: 50,
      forecast: { nextMonth: 0, nextQuarter: 0, nextYear: 0 }
    };
  }

  let totalValue = 0;
  let totalAnnualDividends = 0;
  const monthlyIncome = new Array(12).fill(0);
  const dividendDetails: { symbol: string; amount: number; yield: number }[] = [];
  let totalSafetyScore = 0;
  let totalGrowthRate = 0;

  holdings.forEach(holding => {
    const value = holding.shares * holding.currentPrice;
    totalValue += value;
    
    const forecast = calculateDividendForecast(holding);
    const annualDiv = forecast.annualDividend * holding.shares;
    totalAnnualDividends += annualDiv;
    
    // Distribute to months based on payment schedule
    forecast.quarterlyPayments.forEach(payment => {
      const monthIndex = new Date(payment.estimatedDate).getMonth();
      if (!isNaN(monthIndex)) {
        monthlyIncome[monthIndex] += (payment.amount * holding.shares);
      }
    });
    
    if (annualDiv > 0) {
      dividendDetails.push({
        symbol: holding.symbol,
        amount: annualDiv,
        yield: forecast.projectedYield
      });
    }
    
    const safety = calculateDividendSafety(holding);
    totalSafetyScore += safety.score;
    totalGrowthRate += forecast.growthRate;
  });

  const averageYield = totalValue > 0 ? (totalAnnualDividends / totalValue) * 100 : 0;
  const topPayers = dividendDetails
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  const monthlyIncomeFormatted = MONTHS.map((month, i) => ({
    month,
    income: monthlyIncome[i]
  }));

  return {
    totalAnnualDividends,
    averageYield,
    monthlyIncome: monthlyIncomeFormatted,
    topPayers,
    dividendGrowthRate: holdings.length > 0 ? totalGrowthRate / holdings.length : 0,
    safetyScore: holdings.length > 0 ? Math.round(totalSafetyScore / holdings.length) : 50,
    forecast: {
      nextMonth: monthlyIncome[new Date().getMonth()],
      nextQuarter: monthlyIncome.slice(0, 3).reduce((a, b) => a + b, 0),
      nextYear: totalAnnualDividends
    }
  };
}

/**
 * Get dividend aristocrats and kings list
 */
export function getDividendAristocrats(): string[] {
  return Object.entries(DIVIDEND_DATABASE)
    .filter(([_, data]) => data.streak >= 25)
    .map(([symbol, _]) => symbol);
}

/**
 * Find high-yield safe dividends
 */
export function findHighYieldSafeDividends(minYield: number = 4, minSafety: number = 60): { symbol: string; yield: number; safety: number }[] {
  return Object.entries(DIVIDEND_DATABASE)
    .map(([symbol, data]) => {
      const mockHolding: Holding = {
        id: symbol,
        symbol,
        name: symbol,
        shares: 1,
        avgPrice: 100,
        currentPrice: 100,
        assetType: 'Stock',
        sector: 'Diversified',
        country: 'US',
        dividendYield: data.yield,
        payoutRatio: data.payoutRatio,
        safetyScore: 50,
        snowflake: { value: 3, future: 3, past: 3, health: 3, dividend: 3, total: 15 }
      };
      const safety = calculateDividendSafety(mockHolding);
      return { symbol, yield: data.yield, safety: safety.score };
    })
    .filter(item => item.yield >= minYield && item.safety >= minSafety)
    .sort((a, b) => b.yield - a.yield);
}
