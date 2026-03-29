/**
 * Portfolio Optimization & Rebalancing Service
 * Inspired by Passiv, Getquin, and Blossom Social
 * Provides target allocation management, rebalancing recommendations, and portfolio analytics
 */

import { Holding, Portfolio, Transaction } from '../types';

export interface TargetAllocation {
  symbol: string;
  name: string;
  targetPercentage: number; // 0-100
  currentPercentage: number; // 0-100
  deviation: number; // Percentage points from target
  action: 'BUY' | 'SELL' | 'HOLD';
  recommendedShares?: number;
  estimatedValue?: number;
}

export interface RebalanceRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL';
  currentShares: number;
  recommendedShares: number;
  sharesToTrade: number;
  currentValue: number;
  targetValue: number;
  deviationPercent: number;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface PortfolioAnalytics {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  
  // Allocation
  sectorAllocation: { sector: string; percentage: number; value: number }[];
  assetTypeAllocation: { type: string; percentage: number; value: number }[];
  countryAllocation: { country: string; percentage: number; value: number }[];
  topHoldings: { symbol: string; name: string; percentage: number; value: number }[];
  
  // Risk Metrics
  concentrationRisk: 'Low' | 'Medium' | 'High';
  largestHoldingPercent: number;
  top5HoldingsPercent: number;
  diversificationScore: number; // 0-100
  
  // Performance
  bestPerformer: { symbol: string; gainPercent: number } | null;
  worstPerformer: { symbol: string; lossPercent: number } | null;
}

export interface DriftThreshold {
  absolute: number; // e.g., 5 means 5% absolute drift triggers rebalance
  relative: number; // e.g., 0.2 means 20% relative drift triggers rebalance
}

const DEFAULT_DRIFT_THRESHOLD: DriftThreshold = { absolute: 5, relative: 0.2 };

/**
 * Calculate current portfolio allocation percentages
 */
export function calculateAllocation(holdings: Holding[]): { 
  totalValue: number; 
  allocations: Map<string, number>;
  holdingsWithPercentages: { symbol: string; value: number; percentage: number }[];
} {
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const allocations = new Map<string, number>();
  const holdingsWithPercentages: { symbol: string; value: number; percentage: number }[] = [];

  if (totalValue === 0) {
    return { totalValue: 0, allocations, holdingsWithPercentages: [] };
  }

  holdings.forEach(holding => {
    const value = holding.shares * holding.currentPrice;
    const percentage = (value / totalValue) * 100;
    allocations.set(holding.symbol, percentage);
    holdingsWithPercentages.push({
      symbol: holding.symbol,
      value,
      percentage: Math.round(percentage * 100) / 100
    });
  });

  return { totalValue, allocations, holdingsWithPercentages };
}

/**
 * Calculate target allocations based on user preferences or equal weight
 */
export function calculateTargetAllocations(
  holdings: Holding[], 
  customTargets?: Record<string, number>
): TargetAllocation[] {
  const { totalValue, holdingsWithPercentages } = calculateAllocation(holdings);
  
  if (totalValue === 0 || holdings.length === 0) {
    return [];
  }

  // If no custom targets, use equal weight
  let targets: Record<string, number> = {};
  if (customTargets && Object.keys(customTargets).length > 0) {
    targets = customTargets;
  } else {
    const equalWeight = 100 / holdings.length;
    holdings.forEach(h => {
      targets[h.symbol] = equalWeight;
    });
  }

  return holdingsWithPercentages.map(h => {
    const targetPercentage = targets[h.symbol] || 0;
    const deviation = h.percentage - targetPercentage;
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let recommendedShares = 0;
    let estimatedValue = 0;

    if (deviation > 3) { // More than 3% overweight
      action = 'SELL';
      const targetValue = (targetPercentage / 100) * totalValue;
      const excessValue = h.value - targetValue;
      recommendedShares = Math.floor(excessValue / h.holding?.currentPrice || 1);
      estimatedValue = excessValue;
    } else if (deviation < -3) { // More than 3% underweight
      action = 'BUY';
      const targetValue = (targetPercentage / 100) * totalValue;
      const deficitValue = targetValue - h.value;
      const holding = holdings.find(hold => hold.symbol === h.symbol);
      if (holding) {
        recommendedShares = Math.floor(deficitValue / holding.currentPrice);
        estimatedValue = deficitValue;
      }
    }

    return {
      symbol: h.symbol,
      name: h.symbol,
      targetPercentage: Math.round(targetPercentage * 100) / 100,
      currentPercentage: h.percentage,
      deviation: Math.round(deviation * 100) / 100,
      action,
      recommendedShares,
      estimatedValue
    };
  });
}

/**
 * Generate rebalancing recommendations
 */
export function generateRebalanceRecommendations(
  portfolio: Portfolio,
  threshold: DriftThreshold = DEFAULT_DRIFT_THRESHOLD
): RebalanceRecommendation[] {
  const { totalValue, holdingsWithPercentages } = calculateAllocation(portfolio.holdings);
  const recommendations: RebalanceRecommendation[] = [];

  if (totalValue === 0) {
    return [];
  }

  // Calculate target allocations (equal weight or based on existing targets)
  const targets = new Map<string, number>();
  const holdingsWithTargets = portfolio.holdings.map(h => {
    const target = h.targetAllocation ?? (100 / portfolio.holdings.length);
    targets.set(h.symbol, target);
    return { ...h, targetAllocation: target };
  });

  holdingsWithTargets.forEach(holding => {
    const currentValue = holding.shares * holding.currentPrice;
    const currentPercent = (currentValue / totalValue) * 100;
    const targetPercent = holding.targetAllocation || 0;
    
    const absoluteDeviation = Math.abs(currentPercent - targetPercent);
    const relativeDeviation = targetPercent > 0 ? absoluteDeviation / targetPercent : absoluteDeviation;

    // Check if rebalancing is needed based on thresholds
    if (absoluteDeviation >= threshold.absolute || relativeDeviation >= threshold.relative) {
      const targetValue = (targetPercent / 100) * totalValue;
      const valueDifference = targetValue - currentValue;
      const sharesToTrade = Math.abs(Math.floor(valueDifference / holding.currentPrice));

      if (sharesToTrade > 0) {
        const action = valueDifference > 0 ? 'BUY' : 'SELL';
        const priority = absoluteDeviation > 10 ? 'High' : absoluteDeviation > 5 ? 'Medium' : 'Low';

        recommendations.push({
          symbol: holding.symbol,
          action,
          currentShares: holding.shares,
          recommendedShares: action === 'BUY' ? holding.shares + sharesToTrade : holding.shares - sharesToTrade,
          sharesToTrade,
          currentValue,
          targetValue,
          deviationPercent: Math.round((currentPercent - targetPercent) * 100) / 100,
          priority,
          reason: `${action === 'BUY' ? 'Underweight' : 'Overweight'} by ${Math.round(absoluteDeviation)}%`
        });
      }
    }
  });

  // Sort by priority and deviation
  return recommendations.sort((a, b) => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return Math.abs(b.deviationPercent) - Math.abs(a.deviationPercent);
  });
}

/**
 * Calculate comprehensive portfolio analytics
 */
export function calculatePortfolioAnalytics(portfolio: Portfolio): PortfolioAnalytics {
  const holdings = portfolio.holdings;
  
  if (!holdings || holdings.length === 0) {
    return {
      totalValue: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      sectorAllocation: [],
      assetTypeAllocation: [],
      countryAllocation: [],
      topHoldings: [],
      concentrationRisk: 'Low',
      largestHoldingPercent: 0,
      top5HoldingsPercent: 0,
      diversificationScore: 0,
      bestPerformer: null,
      worstPerformer: null
    };
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Sector allocation
  const sectorMap = new Map<string, number>();
  holdings.forEach(h => {
    const value = h.shares * h.currentPrice;
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + value);
  });
  const sectorAllocation = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    sector,
    percentage: Math.round((value / totalValue) * 100 * 100) / 100,
    value: Math.round(value)
  })).sort((a, b) => b.value - a.value);

  // Asset type allocation
  const assetTypeMap = new Map<string, number>();
  holdings.forEach(h => {
    const value = h.shares * h.currentPrice;
    assetTypeMap.set(h.assetType, (assetTypeMap.get(h.assetType) || 0) + value);
  });
  const assetTypeAllocation = Array.from(assetTypeMap.entries()).map(([type, value]) => ({
    type,
    percentage: Math.round((value / totalValue) * 100 * 100) / 100,
    value: Math.round(value)
  })).sort((a, b) => b.value - a.value);

  // Country allocation
  const countryMap = new Map<string, number>();
  holdings.forEach(h => {
    const value = h.shares * h.currentPrice;
    countryMap.set(h.country, (countryMap.get(h.country) || 0) + value);
  });
  const countryAllocation = Array.from(countryMap.entries()).map(([country, value]) => ({
    country,
    percentage: Math.round((value / totalValue) * 100 * 100) / 100,
    value: Math.round(value)
  })).sort((a, b) => b.value - a.value);

  // Top holdings
  const holdingsWithValue = holdings.map(h => ({
    symbol: h.symbol,
    name: h.name,
    value: h.shares * h.currentPrice,
    percentage: ((h.shares * h.currentPrice) / totalValue) * 100
  })).sort((a, b) => b.value - a.value);

  const topHoldings = holdingsWithValue.slice(0, 5).map(h => ({
    symbol: h.symbol,
    name: h.name,
    percentage: Math.round(h.percentage * 100) / 100,
    value: Math.round(h.value)
  }));

  // Concentration risk
  const largestHoldingPercent = holdingsWithValue.length > 0 ? holdingsWithValue[0].percentage : 0;
  const top5HoldingsPercent = holdingsWithValue.slice(0, 5).reduce((sum, h) => sum + h.percentage, 0);
  
  let concentrationRisk: 'Low' | 'Medium' | 'High' = 'Low';
  if (largestHoldingPercent > 25 || top5HoldingsPercent > 75) concentrationRisk = 'High';
  else if (largestHoldingPercent > 15 || top5HoldingsPercent > 60) concentrationRisk = 'Medium';

  // Diversification score (0-100)
  let diversificationScore = 100;
  diversificationScore -= Math.min(30, largestHoldingPercent); // Penalize large positions
  diversificationScore -= Math.min(20, (top5HoldingsPercent - 50) * 0.5); // Penalize concentration
  diversificationScore -= Math.max(0, (5 - holdings.length) * 5); // Penalize few holdings
  diversificationScore -= Math.max(0, (3 - sectorAllocation.length) * 10); // Penalize sector concentration
  diversificationScore = Math.max(0, Math.min(100, diversificationScore));

  // Best and worst performers
  const performers = holdings.map(h => ({
    symbol: h.symbol,
    gainPercent: ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100
  })).filter(p => Number.isFinite(p.gainPercent));

  const bestPerformer = performers.length > 0 
    ? performers.reduce((best, curr) => curr.gainPercent > best.gainPercent ? curr : best)
    : null;
  
  const worstPerformer = performers.length > 0
    ? performers.reduce((worst, curr) => curr.gainPercent < worst.gainPercent ? curr : worst)
    : null;

  return {
    totalValue: Math.round(totalValue * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
    dayChange: 0, // Would need previous day data
    dayChangePercent: 0,
    sectorAllocation,
    assetTypeAllocation,
    countryAllocation,
    topHoldings,
    concentrationRisk,
    largestHoldingPercent: Math.round(largestHoldingPercent * 100) / 100,
    top5HoldingsPercent: Math.round(top5HoldingsPercent * 100) / 100,
    diversificationScore: Math.round(diversificationScore),
    bestPerformer: bestPerformer ? { ...bestPerformer, gainPercent: Math.round(bestPerformer.gainPercent * 100) / 100 } : null,
    worstPerformer: worstPerformer ? { ...worstPerformer, lossPercent: Math.round(Math.abs(worstPerformer.gainPercent) * 100) / 100 } : null
  };
}

/**
 * Simulate the impact of a trade on portfolio allocation
 */
export function simulateTradeImpact(
  portfolio: Portfolio,
  symbol: string,
  shares: number,
  action: 'BUY' | 'SELL'
): { 
  beforeAllocation: number; 
  afterAllocation: number; 
  newTotalValue: number;
  pricePerShare: number;
} {
  const holding = portfolio.holdings.find(h => h.symbol === symbol);
  if (!holding) {
    return { beforeAllocation: 0, afterAllocation: 0, newTotalValue: portfolio.totalValue, pricePerShare: 0 };
  }

  const { totalValue } = calculateAllocation(portfolio.holdings);
  const currentValue = holding.shares * holding.currentPrice;
  const beforeAllocation = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

  const tradeValue = shares * holding.currentPrice;
  const newTotalValue = action === 'BUY' ? totalValue + tradeValue : totalValue - tradeValue;
  const newValue = action === 'BUY' ? currentValue + tradeValue : currentValue - tradeValue;
  const afterAllocation = newTotalValue > 0 ? (newValue / newTotalValue) * 100 : 0;

  return {
    beforeAllocation: Math.round(beforeAllocation * 100) / 100,
    afterAllocation: Math.round(afterAllocation * 100) / 100,
    newTotalValue: Math.round(newTotalValue * 100) / 100,
    pricePerShare: holding.currentPrice
  };
}

/**
 * Calculate optimal buy amounts to reach target allocation
 */
export function calculateOptimalBuyAmounts(
  portfolio: Portfolio,
  investmentAmount: number,
  targets?: Record<string, number>
): { symbol: string; amount: number; shares: number; newAllocation: number }[] {
  const { totalValue } = calculateAllocation(portfolio.holdings);
  const newTotalValue = totalValue + investmentAmount;
  
  const allocations = targets && Object.keys(targets).length > 0 
    ? targets 
    : Object.fromEntries(portfolio.holdings.map(h => [h.symbol, 100 / portfolio.holdings.length]));

  return portfolio.holdings.map(holding => {
    const targetPercent = allocations[holding.symbol] || 0;
    const targetValue = (targetPercent / 100) * newTotalValue;
    const currentValue = holding.shares * holding.currentPrice;
    const amountToAdd = Math.max(0, targetValue - currentValue);
    const shares = amountToAdd > 0 ? Math.floor(amountToAdd / holding.currentPrice) : 0;
    const actualAmount = shares * holding.currentPrice;
    const newAllocation = newTotalValue > 0 ? ((currentValue + actualAmount) / newTotalValue) * 100 : 0;

    return {
      symbol: holding.symbol,
      amount: Math.round(actualAmount * 100) / 100,
      shares,
      newAllocation: Math.round(newAllocation * 100) / 100
    };
  }).filter(item => item.amount > 0);
}
