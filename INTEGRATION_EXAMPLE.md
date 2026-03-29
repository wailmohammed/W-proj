# Integration Guide: Using New Services

This guide shows how to integrate the new enhanced services into your existing components.

## 1. Enhanced Dividends View

Replace or augment your existing `DividendsView.tsx`:

```tsx
import { EnhancedDividendsView } from './EnhancedDividendsView';
import { usePortfolio } from '../context/PortfolioContext';

export const DividendsPage = () => {
  const { activePortfolio } = usePortfolio();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dividend Analysis</h1>
      <EnhancedDividendsView 
        holdings={activePortfolio.holdings}
        portfolioTotalValue={activePortfolio.totalValue}
      />
    </div>
  );
};
```

## 2. Add Valuation to Research View

```tsx
import { 
  calculateDCFValuation, 
  calculateRelativeValuation,
  calculateSnowflakeScore,
  getCompetitorAnalysis
} from '../services/valuationService';

// In your ResearchView component:
const holding = // ... get from portfolio
const dcf = calculateDCFValuation(holding);
const relative = calculateRelativeValuation(holding);
const snowflake = calculateSnowflakeScore(holding);
const competitors = getCompetitorAnalysis(holding.symbol);

// Use in UI:
<div>
  <h3>Valuation: {dcf.status}</h3>
  <p>Fair Value: ${dcf.fairValue} ({dcf.upside > 0 ? '+' : ''}{dcf.upside}%)</p>
  
  <h3>Snowflake Score: {snowflake.total}/25</h3>
  {/* Render snowflake radar chart */}
</div>
```

## 3. Portfolio Rebalancing Tab

```tsx
import { 
  generateRebalanceRecommendations,
  calculatePortfolioAnalytics,
  calculateTargetAllocations
} from '../services/portfolioOptimizer';

const RebalanceTab = ({ portfolio }) => {
  const recommendations = generateRebalanceRecommendations(portfolio);
  const analytics = calculatePortfolioAnalytics(portfolio);
  
  return (
    <div>
      <h2>Portfolio Analytics</h2>
      <p>Diversification Score: {analytics.diversificationScore}/100</p>
      <p>Concentration Risk: {analytics.concentrationRisk}</p>
      
      <h2>Rebalancing Recommendations</h2>
      {recommendations.map(rec => (
        <div key={rec.symbol}>
          <span>{rec.action}</span>
          <span>{rec.sharesToTrade} shares of {rec.symbol}</span>
          <span className={rec.priority === 'High' ? 'text-red-500' : ''}>
            {rec.reason}
          </span>
        </div>
      ))}
    </div>
  );
};
```

## 4. Update Holdings with Snowflake Scores

In your `PortfolioContext.tsx`, enhance holdings when they're loaded:

```tsx
import { calculateSnowflakeScore } from '../services/valuationService';

// When mapping holdings from DB:
const mappedHoldings: Holding[] = holdingsData.map(h => {
  const baseHolding = { /* ... existing mapping ... */ };
  
  // Calculate and add snowflake score
  const snowflake = calculateSnowflakeScore(baseHolding);
  
  return {
    ...baseHolding,
    snowflake
  };
});
```

## 5. Add Dividend Safety Warnings

```tsx
import { calculateDividendSafety } from '../services/dividendAnalytics';

const HoldingCard = ({ holding }) => {
  const safety = calculateDividendSafety(holding);
  
  return (
    <div>
      <h3>{holding.symbol}</h3>
      <p>Yield: {holding.dividendYield}%</p>
      
      {safety.score < 40 && (
        <div className="bg-red-100 text-red-800 p-2 rounded">
          ⚠️ Dividend at risk! Safety Score: {safety.score}/100
        </div>
      )}
      
      {safety.payoutRatio > 80 && (
        <div className="bg-yellow-100 text-yellow-800 p-2 rounded">
          High payout ratio: {safety.payoutRatio.toFixed(1)}%
        </div>
      )}
    </div>
  );
};
```

## 6. New Investment Allocation Helper

```tsx
import { calculateOptimalBuyAmounts } from '../services/portfolioOptimizer';

const NewInvestmentModal = ({ portfolio, amount }) => {
  const allocation = calculateOptimalBuyAmounts(portfolio, amount);
  
  return (
    <div>
      <h3>Optimal Allocation for ${amount}</h3>
      {allocation.map(item => (
        <div key={item.symbol}>
          <span>{item.symbol}</span>
          <span>{item.shares} shares</span>
          <span>${item.amount}</span>
          <span>New allocation: {item.newAllocation}%</span>
        </div>
      ))}
    </div>
  );
};
```

## API Reference

### Dividend Analytics

```typescript
calculatePortfolioDividends(holdings: Holding[]): PortfolioDividendSummary
calculateDividendForecast(holding: Holding): DividendForecast
calculateDividendSafety(holding: Holding): DividendSafety
getDividendAristocrats(): string[]
findHighYieldSafeDividends(minYield?: number, minSafety?: number): Array<{symbol, yield, safety}>
```

### Valuation Service

```typescript
calculateDCFValuation(holding: Holding): DCFValuation
calculateRelativeValuation(holding: Holding): RelativeValuation
calculateFinancialHealth(holding: Holding): FinancialHealthMetrics
calculateGrowthMetrics(holding: Holding): GrowthMetrics
calculatePastPerformance(holding: Holding): PastPerformanceMetrics
calculateSnowflakeScore(holding: Holding): SnowflakeScore
getCompetitorAnalysis(symbol: string): Competitor[]
getComprehensiveValuation(holding: Holding): ValuationData
```

### Portfolio Optimizer

```typescript
calculateAllocation(holdings: Holding[]): { totalValue, allocations, holdingsWithPercentages }
calculateTargetAllocations(holdings, customTargets?): TargetAllocation[]
generateRebalanceRecommendations(portfolio, threshold?): RebalanceRecommendation[]
calculatePortfolioAnalytics(portfolio: Portfolio): PortfolioAnalytics
simulateTradeImpact(portfolio, symbol, shares, action): TradeImpact
calculateOptimalBuyAmounts(portfolio, investmentAmount, targets?): OptimalAllocation[]
```

## Best Practices

1. **Memoize Expensive Calculations**
   ```tsx
   const analytics = useMemo(() => 
     calculatePortfolioAnalytics(portfolio),
     [portfolio]
   );
   ```

2. **Handle Missing Data Gracefully**
   ```tsx
   const safety = calculateDividendSafety(holding);
   if (!safety || safety.score === 0) {
     return <span>No dividend data available</span>;
   }
   ```

3. **Batch Updates**
   When updating multiple holdings, batch the calculations to avoid unnecessary re-renders.

4. **Cache Results**
   For expensive operations like DCF, consider caching results per holding symbol.

## Testing

```tsx
import { describe, it, expect } from 'vitest';
import { calculateSnowflakeScore } from '../services/valuationService';

describe('Snowflake Score', () => {
  it('calculates valid score', () => {
    const mockHolding = { /* ... */ };
    const score = calculateSnowflakeScore(mockHolding);
    
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(25);
  });
});
```
