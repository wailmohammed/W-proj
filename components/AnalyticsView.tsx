
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, AreaChart, Area } from 'recharts';
import { usePortfolio } from '../context/PortfolioContext';
import { TrendingUp, Target, ShieldCheck, Calendar, Zap, LayoutGrid, Info, BarChart2, Activity } from 'lucide-react';
import SnowflakeChart from './SnowflakeChart';
import { BENCHMARK_DATA } from '../constants';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const AnalyticsView: React.FC = () => {
  const { activePortfolio } = usePortfolio();
  const { holdings } = activePortfolio;
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | 'YTD' | '1Y' | 'ALL'>('1Y');
  const [benchmark, setBenchmark] = useState<'sp500' | 'nasdaq'>('sp500');

  // Multi-benchmark comparison data generator based on selected timeframe
  const comparisonData = useMemo(() => {
    let points = 12;
    if (timeframe === '1M') points = 4;
    if (timeframe === '6M') points = 6;
    if (timeframe === 'ALL') points = 24;

    const data = BENCHMARK_DATA.slice(-points);
    return data;
  }, [timeframe]);

  const benchmarkConfig = { 
    sp500: { name: 'S&P 500', color: '#94a3b8' }, 
    nasdaq: { name: 'NASDAQ-100', color: '#6366f1' } 
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-20 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Portfolio Analytics</h1>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
              {['1M', '6M', 'YTD', '1Y', 'ALL'].map(tf => (
                  <button 
                    key={tf} 
                    onClick={() => setTimeframe(tf as any)} 
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${timeframe === tf ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {tf}
                  </button>
              ))}
          </div>
      </div>

      {/* Index Benchmarking Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" /> Relative Performance
                  </h3>
                  <p className="text-sm text-slate-500">Benchmark your portfolio against major market indices</p>
              </div>
              <div className="flex flex-wrap gap-2">
                  {(['sp500', 'nasdaq'] as const).map(b => (
                      <button 
                        key={b} 
                        onClick={() => setBenchmark(b)} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${benchmark === b ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20' : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}
                      >
                          {benchmarkConfig[b].name}
                      </button>
                  ))}
              </div>
          </div>

          <div className="h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={comparisonData}>
                      <defs>
                        <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                        itemStyle={{ fontWeight: 'bold' }} 
                        formatter={(val: number) => [`${val}%`]} 
                      />
                      <Legend verticalAlign="top" height={40} iconType="circle" />
                      <Area type="monotone" dataKey="portfolio" name="My Portfolio" stroke="#10b981" strokeWidth={3} fill="url(#colorPortfolio)" />
                      <Line type="monotone" dataKey={benchmark} name={benchmarkConfig[benchmark].name} stroke={benchmarkConfig[benchmark].color} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> Sector Diversification
              </h3>
              <div className="space-y-4">
                  {holdings.reduce((acc, h) => {
                      const existing = acc.find(x => x.name === h.sector);
                      const weight = (h.shares * h.currentPrice) / activePortfolio.totalValue * 100;
                      if (existing) existing.value += weight;
                      else acc.push({ name: h.sector, value: weight });
                      return acc;
                  }, [] as { name: string, value: number }[])
                  .sort((a, b) => b.value - a.value)
                  .map((s, i) => (
                      <div key={s.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700 dark:text-slate-300">{s.name}</span>
                              <span className="text-slate-500">{s.value.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 transition-all duration-1000" 
                                style={{ width: `${s.value}%`, backgroundColor: COLORS[i % COLORS.length] }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" /> Quality Audit
              </h3>
              <div className="h-[240px] flex items-center justify-center">
                  <SnowflakeChart data={activePortfolio.holdings[0]?.snowflake || { value: 3, future: 3, past: 3, health: 3, dividend: 3, total: 15 }} height={240} />
              </div>
              <p className="text-center text-xs text-slate-500 mt-4">Composite quality score based on growth, value, and safety metrics.</p>
          </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
