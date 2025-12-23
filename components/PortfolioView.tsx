

import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
// Added CheckCircle2 to imports from lucide-react to fix missing name error
import { List, Layers, History, TrendingUp, LayoutGrid, Plus, Trash2, ArrowUpRight, ArrowDownRight, BarChart3, RefreshCw, Target, Activity, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import SnowflakeChart from './SnowflakeChart';
import { AssetType, Holding } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DATA_PERFORMANCE } from '../constants';

const RebalanceDashboard: React.FC = () => {
    const { activePortfolio, updateHolding } = usePortfolio();
    const holdings = activePortfolio.holdings;
    
    // Logic: Compare Actual Weight vs Target Allocation
    const rebalanceData = holdings.map(h => {
        const actualValue = h.shares * h.currentPrice;
        const actualWeight = (actualValue / activePortfolio.totalValue) * 100;
        const targetWeight = h.targetAllocation || 0;
        const drift = actualWeight - targetWeight;
        const tradeAmount = ((targetWeight / 100) * activePortfolio.totalValue) - actualValue;
        
        return { ...h, actualWeight, drift, tradeAmount };
    });

    const averageAccuracy = 100 - (rebalanceData.reduce((acc, curr) => acc + Math.abs(curr.drift), 0) / (holdings.length || 1));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Portfolio Accuracy</div>
                    <div className="relative inline-flex items-center justify-center mb-4">
                         <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * averageAccuracy) / 100} className="text-brand-500 transition-all duration-1000 ease-out" />
                         </svg>
                         <span className="absolute text-2xl font-black text-slate-900 dark:text-white">{averageAccuracy.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-slate-500">A higher score means your portfolio closely matches your strategy.</p>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-xl"><RefreshCw className="w-5 h-5 text-emerald-500" /></div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Smart Rebalance Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                        {rebalanceData.filter(d => Math.abs(d.drift) > 2).slice(0, 3).map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900 dark:text-white">{d.symbol}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${d.drift > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {d.drift > 0 ? 'Overweight' : 'Underweight'} {Math.abs(d.drift).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                        {d.tradeAmount > 0 ? 'BUY' : 'SELL'} ${Math.abs(d.tradeAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {rebalanceData.every(d => Math.abs(d.drift) <= 2) && (
                            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm py-4">
                                <CheckCircle2 className="w-5 h-5" /> Your portfolio is perfectly balanced.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="w-5 h-5 text-brand-500" /> Target Management</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Holding</th>
                                <th className="px-6 py-4 text-center">Actual %</th>
                                <th className="px-6 py-4 text-center">Target %</th>
                                <th className="px-6 py-4 text-center">Drift %</th>
                                <th className="px-6 py-4 text-right">Required Trade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {rebalanceData.map(d => (
                                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">{d.symbol}</div>
                                        <div className="text-[10px] text-slate-500">{d.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-600 dark:text-slate-400">{d.actualWeight.toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <input 
                                                type="number" 
                                                className="w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-center font-bold text-brand-500 focus:border-brand-500 outline-none"
                                                value={d.targetAllocation || 0}
                                                onChange={(e) => updateHolding(d.id, { targetAllocation: Number(e.target.value) })}
                                            />
                                            <span className="text-slate-400">%</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-center font-bold ${Math.abs(d.drift) > 5 ? 'text-red-500' : 'text-slate-500'}`}>
                                        {d.drift > 0 ? '+' : ''}{d.drift.toFixed(1)}%
                                    </td>
                                    <td className={`px-6 py-4 text-right font-black ${d.tradeAmount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {d.tradeAmount > 0 ? '+' : '-'}${Math.abs(d.tradeAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const PortfolioView: React.FC = () => {
  const { activePortfolio, viewStock, openAddAssetModal, deleteHolding } = usePortfolio();
  const [viewMode, setViewMode] = useState<'holdings' | 'performance' | 'rebalance'>('holdings');
  const [holdingViewType, setHoldingViewType] = useState<'list' | 'cards'>('cards');
  
  const holdings = activePortfolio?.holdings || [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-20 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => openAddAssetModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20">
                <Plus className="w-4 h-4" /> Add Asset
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button onClick={() => setViewMode('holdings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'holdings' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Holdings
                </button>
                <button onClick={() => setViewMode('rebalance')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'rebalance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Rebalance
                </button>
                <button onClick={() => setViewMode('performance')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'performance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Returns
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'rebalance' && <RebalanceDashboard />}

      {viewMode === 'holdings' && (
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Positions</div>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button onClick={() => setHoldingViewType('list')} className={`p-1.5 rounded transition-colors ${holdingViewType === 'list' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
                        <button onClick={() => setHoldingViewType('cards')} className={`p-1.5 rounded transition-colors ${holdingViewType === 'cards' ? 'bg-white dark:bg-slate-800 text-brand-500 shadow-sm' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                  </div>
              </div>

              {holdingViewType === 'cards' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {holdings.map(h => {
                          const value = h.shares * h.currentPrice;
                          const totalReturn = value - (h.shares * h.avgPrice);
                          return (
                              <div key={h.id} onClick={() => viewStock(h.symbol)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all cursor-pointer group shadow-sm flex flex-col">
                                  <div className="p-5 flex justify-between items-start border-b border-slate-50 dark:border-slate-800/50">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 dark:border-slate-700">{h.symbol[0]}</div>
                                          <div>
                                              <div className="font-bold text-slate-900 dark:text-white text-base leading-none">{h.symbol}</div>
                                              <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{h.assetType} • {h.shares.toFixed(2)} Units</div>
                                          </div>
                                      </div>
                                      <button onClick={(e) => { e.stopPropagation(); deleteHolding(h.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                  <div className="p-5 grid grid-cols-2 gap-4 flex-1">
                                      <div>
                                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Value</div>
                                          <div className="font-bold text-slate-900 dark:text-white text-lg">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                          <div className={`text-xs font-bold flex items-center gap-1 mt-1 ${totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                              {totalReturn >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                              ${Math.abs(totalReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                          </div>
                                      </div>
                                      <div className="h-24"><SnowflakeChart data={h.snowflake} height={100} /></div>
                                  </div>
                                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                                      <div className="text-left"><div className="text-[9px] text-slate-500 uppercase">Avg Price</div><div className="text-xs font-bold text-slate-700 dark:text-slate-300">${h.avgPrice.toFixed(2)}</div></div>
                                      <div className="text-right"><div className="text-[9px] text-slate-500 uppercase">Yield</div><div className="text-xs font-bold text-emerald-500">{h.dividendYield}%</div></div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Instrument</th>
                                    <th className="px-6 py-4 text-right">Qty</th>
                                    <th className="px-6 py-4 text-right">Avg Cost</th>
                                    <th className="px-6 py-4 text-right">Market Price</th>
                                    <th className="px-6 py-4 text-right">Total Value</th>
                                    <th className="px-6 py-4 text-right">Growth %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {holdings.map((h) => (
                                    <tr key={h.id} onClick={() => viewStock(h.symbol)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">{h.symbol[0]}</div>
                                            {h.symbol}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">{h.shares.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">${h.avgPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-brand-600 dark:text-brand-400 font-bold">${h.currentPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${(h.shares * h.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${(h.shares * h.currentPrice) >= (h.shares * h.avgPrice) ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {((h.shares * h.currentPrice - h.shares * h.avgPrice) / (h.shares * h.avgPrice || 1) * 100).toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </div>
              )}
          </div>
      )}

      {viewMode === 'performance' && (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Capital Growth
                      </h3>
                      <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={CHART_DATA_PERFORMANCE}>
                                  <defs>
                                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                                  <Area type="monotone" dataKey="portfolio" stroke="#6366f1" strokeWidth={4} fill="url(#colorPortfolio)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Total Gain</h3>
                          <div className="space-y-6">
                              <div>
                                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Unrealized P/L</div>
                                  <div className="text-4xl font-black text-emerald-500">+$12,450</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">1Y Return</div>
                                    <div className="text-xl font-bold text-brand-600">+14.2%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Volatility</div>
                                    <div className="text-xl font-bold text-amber-500">Low</div>
                                </div>
                              </div>
                          </div>
                      </div>
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-bold">ALPHA VS S&P 500</span>
                              <span className="font-bold text-emerald-500">+2.4%</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PortfolioView;
