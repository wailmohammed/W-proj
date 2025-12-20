
import React, { useState, useEffect } from 'react';
import { TrendingUp, Wallet, Activity, Loader2, Sparkles, BarChart3, AlertCircle, Trash2, Plus, Bell, ShieldCheck, DollarSign, X, ArrowUpRight, ArrowDownRight, Megaphone } from 'lucide-react';
import { generatePortfolioInsight } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';

const StockTicker: React.FC<{ holdings: any[] }> = ({ holdings }) => {
    if (!holdings || holdings.length === 0) return null;
    return (
        <div className="w-full bg-slate-950 border-b border-slate-800 overflow-hidden py-2 flex items-center relative z-0">
            <div className="flex animate-scroll whitespace-nowrap">
                {[...holdings, ...holdings, ...holdings].map((h, i) => (
                    <div key={`${h.id}-${i}`} className="flex items-center gap-3 px-8 border-r border-slate-800/50">
                        <span className="font-bold text-slate-300 text-xs">{h.symbol}</span>
                        <span className="text-white text-xs font-mono">${h.currentPrice.toFixed(2)}</span>
                        <span className={`text-[10px] font-bold ${Math.random() > 0.4 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Math.random() > 0.4 ? '+' : '-'}{(Math.random() * 2).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
            <style>{`.animate-scroll { animation: scroll 60s linear infinite; } @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33%); } }`}</style>
        </div>
    );
};

const DashboardView: React.FC = () => {
  const { activePortfolio, isMarketOpen, toggleMarketOpen, alerts, addAlert, removeAlert } = usePortfolio();
  const { theme } = useTheme();
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ symbol: '', price: '', condition: 'ABOVE' as 'ABOVE' | 'BELOW' });

  useEffect(() => {
    const initInsight = async () => {
        setLoadingInsight(true);
        const text = await generatePortfolioInsight(activePortfolio);
        setInsight(text);
        setLoadingInsight(false);
    };
    if (activePortfolio.holdings.length > 0) initInsight();
  }, [activePortfolio.id]); 

  const handleCreateAlert = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAlert.symbol && newAlert.price) {
          addAlert(newAlert.symbol.toUpperCase(), parseFloat(newAlert.price), newAlert.condition);
          setNewAlert({ symbol: '', price: '', condition: 'ABOVE' });
          setIsAddingAlert(false);
      }
  };

  const annualDiv = activePortfolio.holdings.reduce((a, h) => a + (h.shares * h.currentPrice * (h.dividendYield / 100)), 0);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10 px-4 md:px-0">
      <div className="-mx-4 md:-mx-8 mb-6 border-b border-slate-200 dark:border-slate-800">
          <StockTicker holdings={activePortfolio.holdings} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Holistic view of your financial empire.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={toggleMarketOpen} className={`flex items-center gap-2 text-xs font-bold border px-4 py-2 rounded-xl transition-all ${isMarketOpen ? 'bg-white dark:bg-slate-900 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                <span className={`h-2 w-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isMarketOpen ? 'Market Open' : 'Market Closed'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl transition-all hover:shadow-brand-500/20">
              <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span className="text-xs font-black uppercase tracking-widest opacity-80">AI Portfolio Analyst</span>
                  </div>
                  <h3 className="text-2xl font-bold">Executive Briefing</h3>
                  {loadingInsight ? <div className="flex items-center gap-2 opacity-70"><Loader2 className="w-4 h-4 animate-spin" /> Deep scanning positions...</div> : <p className="text-indigo-50 leading-relaxed text-sm md:text-base font-medium">{insight || "Your portfolio beta is trending lower as you diversify into defensive sectors. Dividend sustainability remains top-tier."}</p>}
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Activity className="w-48 h-48" /></div>
          </div>

          {/* Active Alerts Management Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-500" /> My Alerts
                  </h3>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
                      {alerts.map(a => (
                          <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-brand-300 dark:hover:border-brand-900/50 transition-all">
                              <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">{a.symbol}</span>
                                  <span className="text-[10px] text-slate-500 font-medium">{a.condition} ${a.targetPrice}</span>
                              </div>
                              <button onClick={() => removeAlert(a.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      ))}
                      {alerts.length === 0 && <div className="text-xs text-slate-500 italic py-6 text-center">No price targets set.</div>}
                  </div>
              </div>
              <button onClick={() => setIsAddingAlert(true)} className="w-full mt-4 py-3 bg-brand-600 text-white rounded-2xl text-xs font-bold hover:bg-brand-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20">
                  <Plus className="w-4 h-4" /> Create Target Alert
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Net Worth', value: activePortfolio.totalValue + activePortfolio.cashBalance, icon: Wallet, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { label: 'Available Cash', value: activePortfolio.cashBalance, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Annual Dividends', value: annualDiv, icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
        ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm transition-all hover:scale-[1.02] hover:border-brand-200 dark:hover:border-brand-900">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.label}</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">${stat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
        ))}
      </div>

      {isAddingAlert && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl animate-fade-in-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                        <Bell className="w-5 h-5 text-brand-500" /> New Alert
                      </h3>
                      <button onClick={() => setIsAddingAlert(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={handleCreateAlert} className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Ticker</label>
                          <input required type="text" placeholder="AAPL" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" value={newAlert.symbol} onChange={e => setNewAlert({...newAlert, symbol: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Condition</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none" value={newAlert.condition} onChange={e => setNewAlert({...newAlert, condition: e.target.value as any})}>
                                <option value="ABOVE">Above</option>
                                <option value="BELOW">Below</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Price ($)</label>
                            <input required type="number" step="any" placeholder="0.00" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-brand-500" value={newAlert.price} onChange={e => setNewAlert({...newAlert, price: e.target.value})} />
                          </div>
                      </div>
                      <button type="submit" className="w-full mt-4 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/20 hover:bg-brand-500 transition-all">
                        Create Price Alert
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default DashboardView;
