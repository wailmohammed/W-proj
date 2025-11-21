
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, Activity, Loader2, Sparkles, BarChart3, Layers, Bell, Gauge, AlertCircle, Newspaper, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generatePortfolioInsight } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { MOCK_NEWS } from '../constants';

const DashboardView: React.FC = () => {
  const { activePortfolio, notifications } = usePortfolio();
  const { theme } = useTheme();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Auto-generate insight on mount/update
  useEffect(() => {
    const initInsight = async () => {
        setLoadingInsight(true);
        const text = await generatePortfolioInsight(activePortfolio);
        setInsight(text);
        setLoadingInsight(false);
    };
    if (activePortfolio.holdings.length > 0) {
        initInsight();
    } else {
        setInsight("Add assets to your portfolio to see AI insights.");
    }
  }, [activePortfolio.id, activePortfolio.holdings.length]);

  // Calculate total dividend income dynamically
  const annualDividendIncome = activePortfolio.holdings.reduce((acc, h) => {
      return acc + (h.shares * h.currentPrice * (h.dividendYield / 100));
  }, 0);

  // Snowball Analytics Style: Compound Projection Data
  const projectionData = Array.from({ length: 15 }, (_, i) => {
      const year = new Date().getFullYear() + i;
      const initialVal = activePortfolio.totalValue;
      const contributions = initialVal + (12000 * i); // Mock $1k/mo
      const growthRate = 0.08;
      const value = contributions * Math.pow(1 + growthRate, i);
      const dividendReinvest = value * 0.03; 
      return {
          year,
          contributions,
          value: Math.round(value + (dividendReinvest * i)),
          benchmark: Math.round(contributions * Math.pow(1.09, i)) // S&P 500 comparison
      };
  });

  // Market Mood Data (Mock)
  const marketMood = 65; // 0-100 Greed
  const moodData = [
      { name: 'Fear', value: 50, color: '#ef4444' },
      { name: 'Greed', value: 50, color: '#10b981' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your holistic financial operating system.</p>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Market Open
            </div>
            <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm">
                S&P 500: <span className="text-emerald-500 font-bold">+0.42%</span>
            </div>
        </div>
      </div>

      {/* Top Row: Mood & Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Market Mood Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-2 relative z-10">
                  <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Gauge className="w-4 h-4" /> Market Mood
                  </h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${marketMood > 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {marketMood > 75 ? 'Extreme Greed' : marketMood > 50 ? 'Greed' : marketMood > 25 ? 'Fear' : 'Extreme Fear'}
                  </span>
              </div>
              <div className="flex-1 flex items-center justify-center relative z-10">
                   <div className="relative w-48 h-24 overflow-hidden">
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border-[12px] border-slate-100 dark:border-slate-800 border-b-0 border-l-0 border-r-0" style={{ borderTopColor: 'transparent' }}></div>
                       {/* Gradient Arch using simple SVG */}
                       <svg viewBox="0 0 100 50" className="w-full h-full">
                           <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} strokeWidth="8" />
                           <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#moodGradient)" strokeWidth="8" strokeDasharray="126" strokeDashoffset={126 - (126 * (marketMood / 100))} strokeLinecap="round" />
                           <defs>
                               <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                                   <stop offset="0%" stopColor="#ef4444" />
                                   <stop offset="50%" stopColor="#eab308" />
                                   <stop offset="100%" stopColor="#10b981" />
                               </linearGradient>
                           </defs>
                       </svg>
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                           <div className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{marketMood}</div>
                       </div>
                   </div>
              </div>
          </div>

          {/* AI Analyst / Daily Briefing */}
          <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-0 opacity-10">
                  <Sparkles className="w-48 h-48 text-white rotate-12 translate-x-10 -translate-y-10" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                      <div className="flex items-center gap-2 mb-3">
                          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg">
                              <Activity className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-full border border-white/10">DAILY BRIEFING</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Portfolio Health Check</h3>
                  </div>
                  
                  {loadingInsight ? (
                    <div className="flex items-center gap-3 text-indigo-100">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-medium">Analyzing market correlation...</span>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-indigo-50 text-sm leading-relaxed">
                         {insight || "Your portfolio shows strong resilience today. Tech sector volatility is affecting your growth holdings, but high-yield assets are providing stability."}
                    </div>
                  )}
              </div>
          </div>
      </div>
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <Wallet className="w-24 h-24 text-brand-500" />
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Net Worth</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${(activePortfolio.totalValue + activePortfolio.cashBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-emerald-500 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 mt-3 bg-emerald-50 dark:bg-emerald-400/10 w-fit px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> +$2,430.50 (2.4%)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Cash Balance</div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${activePortfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-slate-500 text-xs mt-3 flex items-center gap-1">
             <AlertCircle className="w-3 h-3" /> Available to deploy
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
           <div className="text-slate-500 dark:text-slate-400 text-sm mb-1 font-medium">Annual Income</div>
           <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">${annualDividendIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
           <div className="text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1 mt-3 bg-brand-50 dark:bg-brand-400/10 w-fit px-2 py-1 rounded-full">
            <ArrowUpRight className="w-3 h-3" /> +12% YoY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Wealth Projection */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-500" /> Future Wealth Projection
                </h3>
                <div className="flex gap-2 text-xs">
                     <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><div className="w-3 h-3 bg-brand-500 rounded"></div> Portfolio</span>
                     <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><div className="w-3 h-3 bg-slate-400 dark:bg-slate-600 rounded"></div> Contributions</span>
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                        <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#1e293b" : "#e2e8f0"} vertical={false} />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickFormatter={(val) => `$${val/1000}k`} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                                borderColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                                color: theme === 'dark' ? '#f1f5f9' : '#0f172a', 
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Area type="monotone" dataKey="value" name="Projected Value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                        <Area type="monotone" dataKey="contributions" name="Total Invested" stroke={theme === 'dark' ? "#475569" : "#94a3b8"} fill="transparent" strokeDasharray="5 5" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Benchmarking */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                     <Layers className="w-4 h-4" /> Performance vs Peers
                </h3>
                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-700 dark:text-white font-bold">Your Portfolio</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">+18.4%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                            <div className="bg-brand-600 h-3 rounded-full shadow-lg shadow-brand-600/20" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">S&P 500</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">+14.2%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                            <div className="bg-slate-400 dark:bg-slate-600 h-3 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Top 10% of Users</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">+22.1%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                            <div className="bg-amber-400 dark:bg-amber-500/80 h-3 rounded-full shadow-lg shadow-amber-500/20" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/50 text-xs text-slate-500 leading-relaxed">
                    You are outperforming 72% of investors this month. Your tech allocation is the primary driver of this alpha.
                </div>
            </div>
        </div>
      </div>

      {/* News Feed Section */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-brand-500" /> Latest Market News
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_NEWS.map(news => (
                <div key={news.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:border-brand-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{news.source}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                            <span className="text-xs text-slate-400">{news.date}</span>
                        </div>
                        <a href={news.url} className="text-slate-400 hover:text-brand-500 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                        {news.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-auto">
                        {news.relatedSymbols.map(sym => (
                            <span key={sym} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {sym}
                            </span>
                        ))}
                        <div className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded ${
                            news.sentiment === 'Positive' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                            news.sentiment === 'Negative' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                            {news.sentiment}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
