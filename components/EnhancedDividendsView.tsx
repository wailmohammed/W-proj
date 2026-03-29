/**
 * Enhanced Dividends View Component
 * Inspired by Snowball Analytics, Simply Safe Dividends, and Digrin
 * Features: Dividend forecasting, safety scores, calendar, and growth tracking
 */

import React, { useState, useMemo } from 'react';
import { Holding } from '../types';
import { 
  calculatePortfolioDividends, 
  calculateDividendForecast, 
  calculateDividendSafety,
  findHighYieldSafeDividends,
  getDividendAristocrats
} from '../services/dividendAnalytics';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, DollarSign, Calendar, Shield, Award, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';

interface EnhancedDividendsViewProps {
  holdings: Holding[];
  portfolioTotalValue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const EnhancedDividendsView: React.FC<EnhancedDividendsViewProps> = ({ 
  holdings, 
  portfolioTotalValue 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'safety' | 'aristocrats'>('overview');

  const dividendSummary = useMemo(() => 
    calculatePortfolioDividends(holdings), 
    [holdings]
  );

  const dividendHoldings = useMemo(() => 
    holdings.filter(h => h.dividendYield > 0),
    [holdings]
  );

  const safetyData = useMemo(() => 
    dividendHoldings.map(h => calculateDividendSafety(h)),
    [dividendHoldings]
  );

  const aristocrats = useMemo(() => getDividendAristocrats(), []);
  const highYieldSafe = useMemo(() => findHighYieldSafeDividends(4, 60), []);

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    if (score >= 20) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSafetyRating = (score: number) => {
    if (score >= 80) return 'Very Safe';
    if (score >= 60) return 'Safe';
    if (score >= 40) return 'Borderline';
    if (score >= 20) return 'Unsafe';
    return 'Dangerous';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Annual Dividends</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${dividendSummary.totalAnnualDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio Yield</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dividendSummary.averageYield.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Safety Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dividendSummary.safetyScore}/100
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Div Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dividendSummary.dividendGrowthRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'forecast', label: 'Forecast', icon: Calendar },
            { id: 'safety', label: 'Safety Analysis', icon: Shield },
            { id: 'aristocrats', label: 'Aristocrats', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Monthly Income Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Dividend Income</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dividendSummary.monthlyIncome}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Income']}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Payers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Dividend Payers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Div</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yield</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dividendSummary.topPayers.map((payer, idx) => (
                    <tr key={payer.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{payer.symbol}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">${payer.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{payer.yield.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {((payer.amount / dividendSummary.totalAnnualDividends) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">Next Month</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${dividendSummary.forecast.nextMonth.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">Next Quarter</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ${dividendSummary.forecast.nextQuarter.toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300">Next Year</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                ${dividendSummary.forecast.nextYear.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-4">
          {dividendHoldings.map(holding => {
            const forecast = calculateDividendForecast(holding);
            return (
              <div key={holding.symbol} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{holding.symbol}</h3>
                    <p className="text-sm text-gray-500">{holding.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${forecast.annualDividend.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">annual • {forecast.projectedYield.toFixed(2)}% yield</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Streak</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{forecast.streak} yrs</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Growth Rate</p>
                    <p className="text-lg font-bold text-green-600">{forecast.growthRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Frequency</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{forecast.quarterlyPayments.length === 12 ? 'Monthly' : 'Quarterly'}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500">Per Share</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${(forecast.annualDividend / holding.currentPrice).toFixed(4)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Schedule</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {forecast.quarterlyPayments.slice(0, 6).map((payment, idx) => (
                      <div key={idx} className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-400">{payment.quarter}</p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">${payment.amount.toFixed(3)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-4">
          {safetyData.map(safety => (
            <div key={safety.symbol} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getSafetyColor(safety.score)}`}>
                    {getSafetyRating(safety.score)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{safety.symbol}</h3>
                    <p className="text-sm text-gray-500">Safety Score: {safety.score}/100</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payout Ratio</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{safety.payoutRatio.toFixed(1)}%</p>
                  {safety.payoutRatio > 80 && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" /> High
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">FCF Payout</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{safety.freeCashFlowPayout.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Debt/Equity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{safety.debtToEquity.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">5Y Div Growth</p>
                  <p className="text-lg font-semibold text-green-600">{safety.dividendGrowth5Y.toFixed(1)}%</p>
                </div>
              </div>

              {/* Safety Score Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0</span>
                  <span>Safety Score</span>
                  <span>100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      safety.score >= 80 ? 'bg-green-500' :
                      safety.score >= 60 ? 'bg-blue-500' :
                      safety.score >= 40 ? 'bg-yellow-500' :
                      safety.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${safety.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'aristocrats' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Dividend Aristocrats & Kings</h3>
            <p className="text-indigo-100">Companies with 25+ years of consecutive dividend increases</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aristocrats.map(symbol => {
              const holding = holdings.find(h => h.symbol === symbol);
              if (!holding) return null;
              const safety = safetyData.find(s => s.symbol === symbol);
              const forecast = calculateDividendForecast(holding);
              
              return (
                <div key={symbol} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol}</h4>
                      <p className="text-sm text-gray-500">{holding.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{forecast.streak}</p>
                      <p className="text-xs text-gray-500">years</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="text-xs text-gray-500">Yield</p>
                      <p className="text-sm font-semibold">{forecast.projectedYield.toFixed(2)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="text-xs text-gray-500">Growth</p>
                      <p className="text-sm font-semibold text-green-600">{forecast.growthRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <p className="text-xs text-gray-500">Safety</p>
                      <p className="text-sm font-semibold">{safety?.score || 50}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* High Yield Safe Picks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">High Yield & Safe (≥4%, Score ≥60)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highYieldSafe.map(item => (
                <div key={item.symbol} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">{item.symbol}</span>
                    <span className="text-green-600 font-bold">{item.yield.toFixed(2)}%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Safety: {item.safety}/100</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
