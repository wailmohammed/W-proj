
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart, Legend } from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { PieChart as PieIcon, List, Layers, Globe, Download, Map as MapIcon, History, TrendingUp, Scale, AlertCircle, RefreshCcw, LayoutGrid, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import SnowflakeChart from './SnowflakeChart';
import { Holding } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const PortfolioView: React.FC = () => {
  const { activePortfolio, viewStock } = usePortfolio();
  // Default to 'allocation' as requested
  const [viewMode, setViewMode] = useState<'allocation' | 'holdings' | 'transactions' | 'performance' | 'rebalancing'>('allocation');
  const [holdingViewType, setHoldingViewType] = useState<'list' | 'cards'>('cards');
  
  // Rebalancing State
  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});
  const [totalTarget, setTotalTarget] = useState(0);

  const holdings = activePortfolio.holdings;
  const transactions = activePortfolio.transactions || [];

  // Initialize targets from holdings
  useEffect(() => {
      const initialTargets: Record<string, number> = {};
      holdings.forEach(h => {
          initialTargets[h.id] = h.targetAllocation || 0;
      });
      setLocalTargets(initialTargets);
  }, [holdings]);

  // Update Total Target % sum
  useEffect(() => {
      const sum = Object.values(localTargets).reduce((a: number, b: number) => a + b, 0);
      setTotalTarget(sum);
  }, [localTargets]);

  const handleTargetChange = (id: string, val: string) => {
      const num = parseFloat(val);
      setLocalTargets(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  // --- Calculations ---

  // Portfolio Snowflake (Weighted Average)
  const calculatePortfolioSnowflake = () => {
    if (activePortfolio.totalValue === 0) return { value: 0, future: 0, past: 0, health: 0, dividend: 0, total: 0 };

    const acc = { value: 0, future: 0, past: 0, health: 0, dividend: 0, total: 0 };
    
    activePortfolio.holdings.forEach(h => {
        const weight = (h.shares * h.currentPrice) / activePortfolio.totalValue;
        acc.value += h.snowflake.value * weight;
        acc.future += h.snowflake.future * weight;
        acc.past += h.snowflake.past * weight;
        acc.health += h.snowflake.health * weight;
        acc.dividend += h.snowflake.dividend * weight;
        acc.total += h.snowflake.total * weight;
    });
    
    return {
        value: Math.round(acc.value),
        future: Math.round(acc.future),
        past: Math.round(acc.past),
        health: Math.round(acc.health),
        dividend: Math.round(acc.dividend),
        total: Math.round(acc.total)
    };
  };

  const portfolioSnowflake = calculatePortfolioSnowflake();

  // Calculate Allocation Data
  const sectorDataMap = new Map<string, number>();
  const assetDataMap = new Map<string, number>();
  const countryDataMap = new Map<string, number>();

  holdings.forEach(h => {
      const val = h.shares * h.currentPrice;
      sectorDataMap.set(h.sector, (sectorDataMap.get(h.sector) || 0) + val);
      assetDataMap.set(h.assetType, (assetDataMap.get(h.assetType) || 0) + val);
      countryDataMap.set(h.country, (countryDataMap.get(h.country) || 0) + val);
  });

  const sectorData = Array.from(sectorDataMap.entries()).map(([name, value]) => ({ name, value }));
  const assetData = Array.from(assetDataMap.entries()).map(([name, value]) => ({ name, value }));
  const countryData = Array.from(countryDataMap.entries()).map(([name, value]) => ({ name, value }));

  // Generate Mock Performance Data with Benchmark (1 Year / 365 Days)
  const generateChartData = () => {
      const data = [];
      // Simulate starting from 1 year ago
      let currentVal = activePortfolio.totalValue * 0.82; // Start ~18% lower
      let currentBench = activePortfolio.totalValue * 0.88; // S&P starts ~12% lower
      
      for(let i=0; i<365; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (365 - i));
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          // Daily movement simulation
          // Portfolio slightly more volatile
          const move = 1 + (Math.random() * 0.03 - 0.014); 
          // Benchmark smoother
          const benchMove = 1 + (Math.random() * 0.02 - 0.0095); 
          
          currentVal = currentVal * move;
          currentBench = currentBench * benchMove;
          
          // Smooth convergence to current actual value at the end
          if (i > 350) {
              currentVal = currentVal + (activePortfolio.totalValue - currentVal) / (365 - i);
          }

          data.push({
              date: dateStr,
              value: Math.round(currentVal),
              benchmark: Math.round(currentBench)
          });
      }
      return data;
  };
  
  const chartData = generateChartData();

  const handleExport = () => {
      const headers = ['Symbol,Name,Shares,AvgPrice,CurrentPrice,Value,Sector,Country'];
      const rows = holdings.map(h => 
        `${h.symbol},"${h.name}",${h.shares},${h.avgPrice},${h.currentPrice},${h.shares * h.currentPrice},${h.sector},${h.country}`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `wealthos_${activePortfolio.name.replace(/\s/g,'_')}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Helpers
  const getValuationStatus = (h: Holding) => {
      // 5 = Very Undervalued, 4 = Undervalued, 3 = Fair, 2 = Overvalued, 1 = Very Overvalued
      const score = h.snowflake.value;
      if(score >= 5) return { label: 'Significantly Undervalued', color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      if(score >= 4) return { label: 'Undervalued', color: 'text-emerald-300', bg: 'bg-emerald-300/10' };
      if(score === 3) return { label: 'Fair Value', color: 'text-slate-300', bg: 'bg-slate-700/50' };
      if(score === 2) return { label: 'Overvalued', color: 'text-amber-400', bg: 'bg-amber-400/10' };
      return { label: 'High Valuation', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  if (holdings.length === 0 && transactions.length === 0) {
      return (
          <div className="max-w-6xl mx-auto animate-fade-in text-center py-20">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="w-8 h-8 text-slate-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Portfolio is Empty</h2>
                  <p className="text-slate-400 mb-6">Start by adding your first transaction to track your wealth.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-20">
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-3">
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors"
            >
                <Download className="w-4 h-4" /> Export
            </button>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                <button 
                    onClick={() => setViewMode('allocation')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'allocation' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <PieIcon className="w-4 h-4" /> Allocation
                </button>
                <button 
                    onClick={() => setViewMode('performance')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'performance' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <History className="w-4 h-4" /> Performance
                </button>
                <button 
                    onClick={() => setViewMode('holdings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'holdings' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutGrid className="w-4 h-4" /> Overview
                </button>
                <button 
                    onClick={() => setViewMode('rebalancing')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'rebalancing' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <Scale className="w-4 h-4" /> Rebalancing
                </button>
                 <button 
                    onClick={() => setViewMode('transactions')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${viewMode === 'transactions' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                    <List className="w-4 h-4" /> History
                </button>
            </div>
        </div>
      </div>

      {/* ALLOCATION VIEW (Default) */}
      {viewMode === 'allocation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Sector Allocation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-500" /> Sector Exposure
                  </h3>
                  <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={sectorData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {sectorData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                                  ))}
                              </Pie>
                              <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                  formatter={(value: number) => `$${value.toLocaleString()}`}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-4">
                      {sectorData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="text-slate-300 truncate">{entry.name}</span>
                              <span className="text-slate-500 ml-auto">
                                {Math.round((entry.value / activePortfolio.totalValue) * 100)}%
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Geographical Allocation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-500" /> Geography
                  </h3>
                  <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={countryData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {countryData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                                  ))}
                              </Pie>
                              <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                  formatter={(value: number) => `$${value.toLocaleString()}`}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-4">
                      {countryData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}></div>
                              <span className="text-slate-300 truncate">{entry.name}</span>
                              <span className="text-slate-500 ml-auto">
                                {Math.round((entry.value / activePortfolio.totalValue) * 100)}%
                              </span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Asset Class */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <MapIcon className="w-5 h-5 text-amber-500" /> Asset Class
                  </h3>
                  <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={assetData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {assetData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                                  ))}
                              </Pie>
                              <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                  formatter={(value: number) => `$${value.toLocaleString()}`}
                              />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-4">
                      {assetData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[(index + 5) % COLORS.length] }}></div>
                              <span className="text-slate-300 truncate">{entry.name}</span>
                              <span className="text-slate-500 ml-auto">
                                {Math.round((entry.value / activePortfolio.totalValue) * 100)}%
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* PERFORMANCE VIEW (Composed with Benchmark) */}
      {viewMode === 'performance' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-fade-in">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Performance History
                        </h3>
                        <p className="text-sm text-slate-400">Comparison against S&P 500 Benchmark (1 Year)</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">${activePortfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-sm text-emerald-400 font-medium">+24.5% Past Year</div>
                    </div>
               </div>
               <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <defs>
                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                stroke="#64748b" 
                                fontSize={12} 
                                tickFormatter={(val) => `$${val/1000}k`} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                formatter={(value: number, name: string) => [
                                    `$${value.toLocaleString()}`, 
                                    name === 'value' ? 'My Portfolio' : 'S&P 500 Benchmark'
                                ]}
                                labelFormatter={(label) => label}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area type="monotone" dataKey="value" name="My Portfolio" stroke="#10b981" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                            <Line type="monotone" dataKey="benchmark" name="S&P 500 Benchmark" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
               </div>
          </div>
      )}

      {/* REBALANCING VIEW */}
      {viewMode === 'rebalancing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scale className="w-6 h-6 text-brand-500" /> Portfolio Rebalancing
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Define your strategy and see exactly what to trade.</p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
                       <div className="text-sm font-bold text-slate-400">Total Target Allocation:</div>
                       <div className={`text-lg font-bold ${Math.abs(totalTarget - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {totalTarget.toFixed(1)}%
                       </div>
                       {Math.abs(totalTarget - 100) >= 0.1 && (
                           <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                               <AlertCircle className="w-3 h-3" /> Must equal 100%
                           </div>
                       )}
                  </div>
              </div>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
                          <tr>
                              <th className="px-6 py-4">Asset</th>
                              <th className="px-6 py-4 text-right">Price</th>
                              <th className="px-6 py-4 text-right">Actual %</th>
                              <th className="px-6 py-4 text-right">Target %</th>
                              <th className="px-6 py-4 text-right">Drift</th>
                              <th className="px-6 py-4 text-right">Action Value</th>
                              <th className="px-6 py-4 text-center">Suggested Trade</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {holdings.map((h) => {
                              const value = h.shares * h.currentPrice;
                              const actualPct = (value / activePortfolio.totalValue) * 100;
                              const targetPct = localTargets[h.id] || 0;
                              const drift = actualPct - targetPct;
                              
                              // Calculate needed action
                              const targetValue = activePortfolio.totalValue * (targetPct / 100);
                              const diffValue = targetValue - value;
                              
                              // Visualizing Drift
                              const isDrifting = Math.abs(drift) > 1; // 1% tolerance
                              
                              return (
                                  <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                                              {h.symbol[0]}
                                          </div>
                                          <div>
                                              {h.symbol}
                                              <div className="text-xs text-slate-500 font-normal">{h.assetType}</div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right text-slate-300">${h.currentPrice.toLocaleString()}</td>
                                      <td className="px-6 py-4 text-right text-slate-200 font-medium">{actualPct.toFixed(1)}%</td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                              <input 
                                                type="number" 
                                                className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-white focus:border-brand-500 outline-none font-bold"
                                                value={targetPct}
                                                onChange={(e) => handleTargetChange(h.id, e.target.value)}
                                                step="0.1"
                                                min="0"
                                                max="100"
                                              />
                                              <span className="text-slate-500">%</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                                              Math.abs(drift) < 1 ? 'text-slate-500 bg-slate-800' : 
                                              drift > 0 ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'
                                          }`}>
                                              {drift > 0 ? '+' : ''}{drift.toFixed(1)}%
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-right font-mono text-slate-300">
                                          {diffValue > 0 ? '+' : ''}${diffValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                          {Math.abs(diffValue) < 100 ? (
                                              <span className="text-slate-500 text-xs flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> On Target</span>
                                          ) : diffValue > 0 ? (
                                              <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center justify-center gap-1 w-full max-w-[100px] mx-auto transition-colors">
                                                  <RefreshCcw className="w-3 h-3" /> Buy
                                              </button>
                                          ) : (
                                              <button className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center justify-center gap-1 w-full max-w-[100px] mx-auto transition-colors">
                                                  <RefreshCcw className="w-3 h-3" /> Sell
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* HOLDINGS & OVERVIEW */}
      {viewMode === 'holdings' && (
          <div className="space-y-8 animate-fade-in">
              
              {/* Portfolio Analysis Header */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Snowflake Summary */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          Portfolio Health
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">Aggregate score based on holdings weight</p>
                      <div className="w-[180px] h-[140px] -my-2">
                          <SnowflakeChart data={portfolioSnowflake} height={180} />
                      </div>
                      <div className="mt-2 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-400 font-bold uppercase">Total Score</span>
                          <span className="text-xl font-bold text-white">{portfolioSnowflake.total}/25</span>
                      </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                           <div className="text-slate-400 text-xs font-bold uppercase mb-1">Market Value</div>
                           <div className="text-2xl font-bold text-white">${activePortfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                           <div className="text-emerald-400 text-xs flex items-center gap-1 mt-1"><TrendingUp className="w-3 h-3" /> +12.4%</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                           <div className="text-slate-400 text-xs font-bold uppercase mb-1">Cash</div>
                           <div className="text-2xl font-bold text-white">${activePortfolio.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                           <div className="text-slate-500 text-xs mt-1">Available</div>
                      </div>
                       <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                           <div className="text-slate-400 text-xs font-bold uppercase mb-1">Div Yield</div>
                           <div className="text-2xl font-bold text-white">
                               {(holdings.reduce((a,b) => a + (b.dividendYield * (b.shares * b.currentPrice)), 0) / activePortfolio.totalValue).toFixed(2)}%
                           </div>
                           <div className="text-emerald-400 text-xs mt-1">Income focus</div>
                      </div>
                       <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                           <div className="text-slate-400 text-xs font-bold uppercase mb-1">Holdings</div>
                           <div className="text-2xl font-bold text-white">{holdings.length}</div>
                           <div className="text-slate-500 text-xs mt-1">Assets</div>
                      </div>
                  </div>
              </div>

              {/* Holdings List Controls */}
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Holdings</h2>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button 
                            onClick={() => setHoldingViewType('list')}
                            className={`p-2 rounded transition-colors ${holdingViewType === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setHoldingViewType('cards')}
                            className={`p-2 rounded transition-colors ${holdingViewType === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                  </div>
              </div>

              {/* CARD VIEW */}
              {holdingViewType === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {holdings.map(h => {
                          const valuation = getValuationStatus(h);
                          const value = h.shares * h.currentPrice;
                          const pl = value - (h.shares * h.avgPrice);
                          const plPercent = (pl / (h.shares * h.avgPrice)) * 100;

                          return (
                              <div key={h.id} onClick={() => viewStock(h.symbol)} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-brand-500/50 transition-all cursor-pointer group flex flex-col">
                                  {/* Card Header */}
                                  <div className="p-5 flex justify-between items-start border-b border-slate-800/50 bg-slate-950/30">
                                      <div className="flex items-center gap-3">
                                          {h.logoUrl ? (
                                              <img src={h.logoUrl} alt={h.symbol} className="w-10 h-10 rounded-lg bg-white p-1" />
                                          ) : (
                                              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-700">
                                                  {h.symbol[0]}
                                              </div>
                                          )}
                                          <div>
                                              <div className="font-bold text-white text-lg leading-none">{h.symbol}</div>
                                              <div className="text-xs text-slate-500 mt-1">{h.name}</div>
                                          </div>
                                      </div>
                                      <div className={`px-2 py-1 rounded text-[10px] font-bold border ${valuation.bg} ${valuation.color} border-${valuation.color.split('-')[1]}-500/20`}>
                                          {valuation.label}
                                      </div>
                                  </div>

                                  {/* Card Body */}
                                  <div className="p-5 grid grid-cols-2 gap-4 flex-1">
                                      <div className="space-y-4">
                                          <div>
                                              <div className="text-xs text-slate-500">Price</div>
                                              <div className="font-bold text-white">${h.currentPrice.toLocaleString()}</div>
                                          </div>
                                          <div>
                                              <div className="text-xs text-slate-500">Return</div>
                                              <div className={`font-bold flex items-center gap-1 ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                  {pl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                  {plPercent.toFixed(1)}%
                                              </div>
                                          </div>
                                          <div>
                                              <div className="text-xs text-slate-500">Value</div>
                                              <div className="font-bold text-white">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                          </div>
                                      </div>
                                      
                                      {/* Snowflake Mini Chart */}
                                      <div className="relative flex flex-col items-center justify-center">
                                          <div className="w-full h-24">
                                              <SnowflakeChart data={h.snowflake} height={100} />
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Health Score: <span className="text-white font-bold">{h.snowflake.total}</span></div>
                                      </div>
                                  </div>
                                  
                                  {/* Footer Metrics */}
                                  <div className="px-5 py-3 bg-slate-950/50 border-t border-slate-800 grid grid-cols-3 gap-2">
                                      <div className="text-center border-r border-slate-800/50">
                                          <div className="text-[10px] text-slate-500 uppercase">Yield</div>
                                          <div className="text-xs font-bold text-emerald-400">{h.dividendYield}%</div>
                                      </div>
                                      <div className="text-center border-r border-slate-800/50">
                                          <div className="text-[10px] text-slate-500 uppercase">P/E</div>
                                          <div className="text-xs font-bold text-slate-300">24.5x</div>
                                      </div>
                                      <div className="text-center">
                                          <div className="text-[10px] text-slate-500 uppercase">Mkt Cap</div>
                                          <div className="text-xs font-bold text-slate-300">$2.8T</div>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}

              {/* LIST VIEW */}
              {holdingViewType === 'list' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-center">Health</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Return</th>
                                    <th className="px-6 py-4 text-right">Value</th>
                                    <th className="px-6 py-4 text-center">Valuation</th>
                                    <th className="px-6 py-4 text-right">Alloc.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {holdings.map((h) => {
                                    const value = h.shares * h.currentPrice;
                                    const costBasis = h.shares * h.avgPrice;
                                    const pl = value - costBasis;
                                    const plPercent = costBasis > 0 ? (pl / costBasis) * 100 : 0;
                                    const weight = (value / activePortfolio.totalValue) * 100;
                                    const valuation = getValuationStatus(h);

                                    return (
                                        <tr 
                                            key={h.id} 
                                            onClick={() => viewStock(h.symbol)}
                                            className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {h.logoUrl ? (
                                                        <img src={h.logoUrl} alt={h.symbol} className="w-8 h-8 rounded-md bg-white p-0.5" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                                                            {h.symbol[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{h.symbol}</div>
                                                        <div className="text-slate-500 text-xs truncate max-w-[120px]">{h.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${h.snowflake.total >= 20 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : h.snowflake.total >= 15 ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                                                        {h.snowflake.total}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-200">
                                                ${h.currentPrice.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`font-bold ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {pl >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ${pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white">
                                                ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] px-2 py-1 rounded font-bold border ${valuation.bg} ${valuation.color} border-${valuation.color.split('-')[1]}-500/20`}>
                                                    {valuation.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm text-slate-300 font-medium">{weight.toFixed(1)}%</div>
                                                <div className="w-16 bg-slate-800 rounded-full h-1 ml-auto mt-1">
                                                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(weight, 100)}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                  </div>
              )}
          </div>
      )}

      {/* TRANSACTIONS VIEW */}
      {viewMode === 'transactions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg animate-fade-in">
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
                          <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Asset</th>
                              <th className="px-6 py-4 text-right">Quantity</th>
                              <th className="px-6 py-4 text-right">Price</th>
                              <th className="px-6 py-4 text-right">Total Value</th>
                              <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                                  <td className="px-6 py-4 text-slate-300 font-medium whitespace-nowrap">{tx.date}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                          tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                          tx.type === 'SELL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                      }`}>
                                          {tx.type}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 font-bold text-white">{tx.symbol}</td>
                                  <td className="px-6 py-4 text-right text-slate-300">{tx.shares}</td>
                                  <td className="px-6 py-4 text-right text-slate-400">${tx.price.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-right font-bold text-slate-200">${tx.totalValue.toLocaleString()}</td>
                                  <td className="px-6 py-4 text-center">
                                      <span className="text-xs text-emerald-500 flex items-center justify-center gap-1">
                                          ● Executed
                                      </span>
                                  </td>
                              </tr>
                          ))}
                          {transactions.length === 0 && (
                              <tr>
                                  <td colSpan={7} className="text-center py-12 text-slate-500">
                                      No transactions recorded yet.
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default PortfolioView;
