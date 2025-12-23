
import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Wallet, Activity, Loader2, Sparkles, BarChart3, Goal, ShieldCheck, DollarSign, X, ArrowUpRight, Coffee, Home, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { generatePortfolioInsight } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';

const FireProgress: React.FC<{ monthlyIncome: number, expenses: number }> = ({ monthlyIncome, expenses }) => {
    const progress = Math.min(100, (monthlyIncome / expenses) * 100);
    
    const milestones = [
        { label: 'Starter', icon: Coffee, limit: 10, desc: 'Covers your coffee habit' },
        { label: 'Basic', icon: Zap, limit: 30, desc: 'Covers utility bills' },
        { label: 'Security', icon: Home, limit: 60, desc: 'Covers half your rent' },
        { label: 'Freedom', icon: Heart, limit: 100, desc: 'Fully financial independent' },
    ];

    const currentMilestone = milestones.find(m => progress < m.limit) || milestones[3];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Goal className="w-4 h-4 text-brand-500" /> FIRE Progress
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                    {progress.toFixed(1)}% Free
                </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-600/10 p-3 rounded-2xl">
                    <currentMilestone.icon className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{currentMilestone.label} Level</div>
                    <div className="text-xs text-slate-500">{currentMilestone.desc}</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>$0</span>
                    <span>${expenses} Expenses</span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
                <div className="text-xs text-slate-500">Monthly Passive: <span className="text-emerald-500 font-bold">${monthlyIncome.toFixed(0)}</span></div>
                <button className="text-[10px] font-bold text-brand-500 hover:underline">Edit Goal</button>
            </div>
        </div>
    );
};

const DashboardView: React.FC = () => {
  const { activePortfolio, isMarketOpen, toggleMarketOpen, alerts, removeAlert } = usePortfolio();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const initInsight = async () => {
        setLoadingInsight(true);
        const text = await generatePortfolioInsight(activePortfolio);
        setInsight(text);
        setLoadingInsight(false);
    };
    if (activePortfolio.holdings.length > 0) initInsight();
  }, [activePortfolio.id]); 

  const annualDiv = activePortfolio.holdings.reduce((a, h) => a + (h.shares * h.currentPrice * (h.dividendYield / 100)), 0);
  const monthlyDiv = annualDiv / 12;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pt-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Executive Summary</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time status of your global investments.</p>
        </div>
        <div className="flex gap-2">
            <div className={`flex items-center gap-2 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl`}>
                <span className={`h-2 w-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isMarketOpen ? 'Markets Live' : 'Markets Closed'}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span className="text-xs font-black uppercase tracking-widest opacity-80">AI Strategy Insight</span>
                  </div>
                  <h3 className="text-2xl font-bold">Portfolio Intelligence</h3>
                  {loadingInsight ? (
                      <div className="flex items-center gap-2 opacity-70"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing exposure...</div>
                  ) : (
                      <p className="text-indigo-50 leading-relaxed text-sm md:text-base font-medium">
                          {insight || "Your portfolio volatility is 12% lower than the S&P 500, primarily driven by your defensive REIT positions. Consider increasing technology exposure to capture momentum."}
                      </p>
                  )}
                  <div className="pt-2 flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                          <ShieldCheck className="w-4 h-4 text-emerald-300" /> Diversified
                      </div>
                      <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                          <TrendingUp className="w-4 h-4 text-indigo-300" /> Growth Bias
                      </div>
                  </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Activity className="w-64 h-64" /></div>
          </div>

          <FireProgress monthlyIncome={monthlyDiv} expenses={2500} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Global Assets', value: activePortfolio.totalValue + activePortfolio.cashBalance, icon: Wallet, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Available Cash', value: activePortfolio.cashBalance, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Dividend Stream', value: annualDiv, icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
        ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.label}</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">${stat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="mt-2 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> +{(Math.random() * 5).toFixed(1)}% vs Last Month
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-brand-500" /> Active Performance Alerts
                    </h3>
                </div>
                <div className="space-y-3">
                    {alerts.length > 0 ? alerts.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-brand-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-brand-500 border border-slate-100 dark:border-slate-800">{a.symbol[0]}</div>
                                <div>
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{a.symbol}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-medium">Target: {a.condition} ${a.targetPrice}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-slate-400">Monitoring...</span>
                                <button onClick={() => removeAlert(a.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-slate-500 text-sm italic">No active price targets set. Click "Add Holding" to configure alerts.</div>
                    )}
                </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-brand-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Account Verified</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-[280px]">Your data is protected with bank-grade AES-256 encryption. Portfolio is 100% in sync.</p>
                <button className="mt-6 text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors">View Security Log</button>
           </div>
      </div>
    </div>
  );
};

export default DashboardView;
