
import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { List, Layers, History, TrendingUp, LayoutGrid, Plus, Trash2, ArrowUpRight, ArrowDownRight, BarChart3, RefreshCw, Target, Activity, ChevronRight, AlertCircle, CheckCircle2, Scale, Clock, PieChart as PieChartIcon, Wallet, Briefcase, Globe, Zap, Info, MoreHorizontal } from 'lucide-react';
import SnowflakeChart from './SnowflakeChart';
import { AssetType, Holding } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { CHART_DATA_PERFORMANCE, BENCHMARK_DATA } from '../constants';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Institutional-grade Dashboard (Pro View)
const ProView: React.FC = () => {
    const { activePortfolio } = usePortfolio();
    const holdings = activePortfolio.holdings;
    
    const assetAllocation = useMemo(() => {
        const data: Record<string, number> = {};
        holdings.forEach(h => {
            data[h.assetType] = (data[h.assetType] || 0) + (h.shares * h.currentPrice);
        });
        return Object.entries(data).map(([name, value]) => ({ name, value }));
    }, [holdings]);

    const sectorAllocation = useMemo(() => {
        const data: Record<string, number> = {};
        holdings.forEach(h => {
            data[h.sector] = (data[h.sector] || 0) + (h.shares * h.currentPrice);
        });
        return Object.entries(data).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
    }, [holdings]);

    const totalEquity = activePortfolio.totalValue;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in pb-10">
            <div className="lg:col-span-3 space-y-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
                        Strategic Pulse <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-900 dark:text-white leading-none">10</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-2">Regions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-emerald-500 leading-none">3.</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-2">Brokers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-brand-500 leading-none">10</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-2">Currs</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Master Targets</div>
                    <div className="h-[160px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={assetAllocation} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={6} dataKey="value">
                                    {assetAllocation.map((entry, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-lg font-black text-slate-900 dark:text-white">{(totalEquity/1000).toFixed(0)}k</span>
                         </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        {assetAllocation.slice(0, 3).map((a, i) => (
                            <div key={a.name} className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-500 uppercase">{a.name}</span>
                                <span className="text-slate-900 dark:text-white">{((a.value / (totalEquity || 1)) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Growth Analytics</h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equity Benchmark vs Market Average</div>
                        </div>
                        <div className="flex gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                            {['6M', '1Y', '3Y'].map(t => (
                                <button key={t} className={`px-3 py-1 text-[9px] font-black rounded-lg transition-all ${t === '1Y' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA_PERFORMANCE}>
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `$${v/1000}k`} />
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px'}} />
                                <Area type="monotone" dataKey="portfolio" stroke="#6366f1" strokeWidth={3} fill="url(#chartGrad)" />
                                <Line type="monotone" dataKey="sp500" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Momentum Heat</div>
                        <div className="h-[100px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BENCHMARK_DATA.slice(-8)}>
                                    <Bar dataKey="portfolio" fill="#10b981" radius={[2, 2, 0, 0]} />
                                </BarChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Risk Variance</div>
                        <div className="h-[100px]">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={BENCHMARK_DATA.slice(-8)}>
                                    <Area type="step" dataKey="nasdaq" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                                </AreaChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Concentration</div>
                    <div className="h-[180px] relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sectorAllocation} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={8} dataKey="value">
                                    {sectorAllocation.map((entry, index) => <Cell key={`s-${index}`} fill={COLORS[(index+2) % COLORS.length]} stroke="none" />)}
                                </Pie>
                            </PieChart>
                         </ResponsiveContainer>
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-lg font-black text-slate-900 dark:text-white">100%</span>
                         </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        {sectorAllocation.slice(0, 3).map((s, i) => (
                            <div key={s.name} className="flex items-center justify-between text-[10px] font-bold">
                                <span className="text-slate-500 uppercase">{s.name}</span>
                                <span className="text-slate-900 dark:text-white">{((s.value / (totalEquity || 1)) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-brand-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <Zap className="absolute top-0 right-0 w-20 h-20 text-white/10 -mr-2 -mt-2" />
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Health Shield</div>
                    <div className="text-2xl font-black mb-4">EXCELLENT</div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black opacity-80 uppercase"><span>Efficiency</span><span>95%</span></div>
                            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white w-[95%]"></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reverted Clean Overview (Old Data + Chart)
const PortfolioOverview: React.FC = () => {
    const { activePortfolio } = usePortfolio();
    const holdings = activePortfolio.holdings;
    
    const totalEquity = activePortfolio.totalValue;
    const totalGain = holdings.reduce((acc, h) => acc + (h.shares * (h.currentPrice - h.avgPrice)), 0);
    const gainPercent = totalEquity > 0 ? (totalGain / (totalEquity - totalGain)) * 100 : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500"><TrendingUp className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Net Return</span>
                    </div>
                    <div className={`text-3xl font-black ${totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {totalGain >= 0 ? '+' : '-'}${Math.abs(totalGain).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className={`text-sm font-bold mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {gainPercent.toFixed(2)}% Lifetime Growth
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><PieChartIcon className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Asset Diversity</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {new Set(holdings.map(h => h.sector)).size} Sectors
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Spread across {holdings.length} assets</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-all hover:translate-y-[-4px]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Globe className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Geography</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {new Set(holdings.map(h => h.country)).size} Countries
                    </div>
                    <div className="text-sm text-slate-400 mt-1 font-medium">Global exposure level high</div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Capital Appreciation</h3>
                    <p className="text-sm text-slate-500">Historical performance relative to cost basis</p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <Activity className="w-5 h-5 text-brand-500" />
                  </div>
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA_PERFORMANCE}>
                            <defs>
                                <linearGradient id="colorOverview" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff'}} />
                            <Area type="monotone" dataKey="portfolio" stroke="#6366f1" strokeWidth={4} fill="url(#colorOverview)" animationDuration={1500} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const RebalanceDashboard: React.FC = () => {
    const { activePortfolio, updateHolding } = usePortfolio();
    const holdings = activePortfolio.holdings;
    
    const rebalanceData = useMemo(() => {
        return holdings.map(h => {
            const actualValue = h.shares * h.currentPrice;
            const actualWeight = activePortfolio.totalValue > 0 ? (actualValue / activePortfolio.totalValue) * 100 : 0;
            const targetWeight = h.targetAllocation || 0;
            const drift = actualWeight - targetWeight;
            const tradeAmount = ((targetWeight / 100) * activePortfolio.totalValue) - actualValue;
            
            return { ...h, actualWeight, drift, tradeAmount };
        });
    }, [holdings, activePortfolio.totalValue]);

    const averageAccuracy = useMemo(() => {
        if (rebalanceData.length === 0) return 100;
        const totalDrift = rebalanceData.reduce((acc, curr) => acc + Math.abs(curr.drift), 0);
        return Math.max(0, 100 - (totalDrift / rebalanceData.length));
    }, [rebalanceData]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm text-center">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Portfolio Alignment</div>
                    <div className="relative inline-flex items-center justify-center mb-4">
                         <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * averageAccuracy) / 100} className="text-brand-500 transition-all duration-1000 ease-out" />
                         </svg>
                         <span className="absolute text-2xl font-black text-slate-900 dark:text-white">{averageAccuracy.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-slate-500">How well your current positions align with your strategy targets.</p>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-500/10 rounded-xl"><Scale className="w-5 h-5 text-brand-500" /></div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Actionable Rebalance Steps</h3>
                    </div>
                    <div className="space-y-3">
                        {rebalanceData.filter(d => Math.abs(d.drift) > 1).slice(0, 3).map(d => (
                            <div key={d.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${d.tradeAmount > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {d.tradeAmount > 0 ? 'B' : 'S'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 dark:text-white">{d.symbol}</div>
                                        <div className="text-[10px] text-slate-500">Current: {d.actualWeight.toFixed(1)}% | Target: {d.targetAllocation}%</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black ${d.tradeAmount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {d.tradeAmount > 0 ? 'BUY' : 'SELL'} ${Math.abs(d.tradeAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {rebalanceData.every(d => Math.abs(d.drift) <= 1) && (
                            <div className="flex flex-col items-center justify-center gap-2 text-emerald-500 font-bold text-sm py-6">
                                <CheckCircle2 className="w-10 h-10" /> 
                                <span>Portfolio is perfectly optimized.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Target className="w-5 h-5 text-brand-500" /> Target Management</h3>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full">
                        Total Target: {rebalanceData.reduce((acc, h) => acc + (h.targetAllocation || 0), 0)}%
                    </div>
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
  const [viewMode, setViewMode] = useState<'overview' | 'pro' | 'holdings' | 'performance' | 'rebalance'>('overview');
  const [holdingViewType, setHoldingViewType] = useState<'list' | 'cards'>('cards');
  const [performanceTimeframe, setPerformanceTimeframe] = useState<'1M' | '6M' | 'YTD' | '1Y' | 'ALL'>('1Y');
  
  const holdings = activePortfolio?.holdings || [];

  const filteredPerformanceData = useMemo(() => {
    const data = [...BENCHMARK_DATA];
    const timeframeMap = { '1M': 4, '6M': 6, 'YTD': 8, '1Y': 12, 'ALL': 24 };
    const sliceCount = timeframeMap[performanceTimeframe];
    return data.slice(-sliceCount);
  }, [performanceTimeframe]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-20 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => openAddAssetModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20">
                <Plus className="w-4 h-4" /> Add Asset
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                <button onClick={() => setViewMode('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'overview' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Overview
                </button>
                <button onClick={() => setViewMode('pro')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'pro' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Pro View
                </button>
                <button onClick={() => setViewMode('holdings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'holdings' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Holdings
                </button>
                <button onClick={() => setViewMode('rebalance')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'rebalance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Rebalance
                </button>
                <button onClick={() => setViewMode('performance')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === 'performance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    Performance
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'overview' && <PortfolioOverview />}
      {viewMode === 'pro' && <ProView />}
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
                                      <div className="text-left"><div className="text-[9px] text-slate-500 uppercase">PE Ratio</div><div className="text-xs font-bold text-slate-700 dark:text-slate-300">{h.peRatio || 'N/A'}</div></div>
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
                                    <th className="px-6 py-4 text-right">PE Ratio</th>
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
                                        <td className="px-6 py-4 text-right font-mono text-brand-600 dark:text-brand-400 font-bold">{h.peRatio || 'N/A'}</td>
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-500" /> Capital Growth vs S&P 500
                          </h3>
                          <p className="text-sm text-slate-500">How your portfolio stacks up against the benchmark</p>
                      </div>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          {(['1M', '6M', 'YTD', '1Y', 'ALL'] as const).map(tf => (
                              <button key={tf} onClick={() => setPerformanceTimeframe(tf)} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${performanceTimeframe === tf ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{tf}</button>
                          ))}
                      </div>
                  </div>
                  <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={filteredPerformanceData}>
                              <defs>
                                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} tick={{fill: '#94a3b8', fontSize: 12}} />
                              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} formatter={(v) => [`${Number(v).toFixed(2)}%`]} />
                              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                              <Area name="Portfolio" type="monotone" dataKey="portfolio" stroke="#6366f1" strokeWidth={4} fill="url(#colorPortfolio)" />
                              <Line name="S&P 500" type="monotone" dataKey="sp500" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PortfolioView;
