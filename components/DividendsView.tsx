
import React, { useState, useMemo } from 'react';
import { Info, CheckCircle2, TrendingUp, ShieldCheck, AlertOctagon, ZapOff, XCircle, Calendar as CalendarIcon, BarChart3, Clock, Sliders, RefreshCw, AlertTriangle, Wallet, BarChart2, ArrowDownUp, ArrowUp, ArrowDown, Droplets, ListFilter, LayoutGrid, X, Timer, MousePointerClick, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, BarChart } from 'recharts';
import DividendCalendar, { CalendarDividend } from './DividendCalendar';
import { usePortfolio } from '../context/PortfolioContext';

const getPayoutColor = (ratio: number) => {
    if (ratio < 60) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
    if (ratio <= 90) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
};

const getSafetyGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', label: 'Very Safe' };
    if (score >= 80) return { grade: 'B', color: 'text-emerald-500 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-300/10', border: 'border-emerald-100 dark:border-emerald-300/20', label: 'Safe' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-400/10', border: 'border-yellow-200 dark:border-yellow-400/20', label: 'Borderline' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-400/10', border: 'border-orange-200 dark:border-orange-400/20', label: 'Unsafe' };
    return { grade: 'F', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10', border: 'border-red-200 dark:border-red-400/20', label: 'Very Unsafe' };
};

const DividendRow: React.FC<{ payment: CalendarDividend, isCut: boolean }> = ({ payment, isCut }) => {
    const safety = getSafetyGrade(payment.safetyScore);
    const payoutStyle = getPayoutColor(payment.payoutRatio);

    return (
      <div className={`p-4 md:px-6 md:py-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isCut ? 'opacity-50 grayscale' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center justify-between w-full md:w-auto md:min-w-[220px]">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm shrink-0">
                          <span className="text-[8px] uppercase">Pay Day</span>
                          <span className="text-slate-900 dark:text-white text-xs md:text-sm">{payment.payDay}</span>
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{payment.symbol}</span>
                              {isCut && <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 rounded uppercase shadow-sm">Suspended</span>}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[140px] md:max-w-none">Yield: {payment.dividendYield}% • Safety: {payment.safetyScore}/100</div>
                      </div>
                  </div>
                  <div className="text-right md:hidden">
                      <div className="text-[10px] text-slate-500 uppercase mb-0.5">Est. Pay</div>
                      <div className={`font-bold font-mono ${isCut ? 'text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                          ${payment.amount}
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 md:gap-6 w-full md:flex-1 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/50 md:border-0">
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                      <div className="text-center min-w-[70px]">
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Payout</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${payoutStyle}`}>
                              {payment.payoutRatio}%
                          </span>
                      </div>
                      <div className="text-center min-w-[70px]">
                          <div className="text-[9px] text-slate-500 uppercase mb-1">Safety</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${safety.color} ${safety.bg} ${safety.border}`}>
                              {safety.grade}
                          </span>
                      </div>
                  </div>

                  <div className="hidden md:block text-right pl-6 border-l border-slate-100 dark:border-slate-800 min-w-[100px]">
                      <div className="text-[10px] text-slate-500 uppercase mb-1">Est. Payment</div>
                      <div className={`font-bold font-mono text-lg ${isCut ? 'text-red-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                          ${payment.amount}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
};

const DividendsView: React.FC = () => {
  const { activePortfolio } = usePortfolio();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [recessionMode, setRecessionMode] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'yield' | 'safety'>('date');
  const [projectedCagr, setProjectedCagr] = useState(7);
  const [reinvestMode, setReinvestMode] = useState(true);

  const holdings = activePortfolio.holdings;

  const rawDividends = useMemo(() => {
      return holdings
        .filter(h => h.dividendYield > 0)
        .map(h => {
            const annualIncome = h.shares * h.currentPrice * (h.dividendYield / 100);
            const deterministicDay = (h.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 28) + 1;
            const paymentGroup = h.symbol.charCodeAt(0) % 3;
            const paymentMonths = [0, 1, 2, 3].map(i => i * 3 + paymentGroup);
            let basePayout = h.sector === 'Real Estate' ? 85 : h.sector === 'Technology' ? 25 : 50;
            const payoutRatio = Math.max(0, Math.min(150, basePayout + (h.symbol.charCodeAt(0) % 20) - 10));

            return {
                ...h,
                amount: (annualIncome / 4).toFixed(2),
                payDay: deterministicDay, 
                payDayStr: deterministicDay.toString(),
                payoutRatio,
                paymentMonths
            };
        });
  }, [holdings]);

  const currentAnnualIncome = rawDividends.reduce((acc, curr) => acc + (parseFloat(curr.amount) * 4), 0);
  const portfolioYield = activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue) * 100 : 0;
  
  const stressedIncome = rawDividends.reduce((acc, curr) => {
      const isRisky = curr.safetyScore < 60;
      return acc + (isRisky ? 0 : parseFloat(curr.amount) * 4);
  }, 0);

  const monthsList = useMemo(() => {
      const currentMonthIndex = new Date().getMonth();
      return Array.from({ length: 12 }, (_, i) => {
          const monthIndex = (currentMonthIndex + i) % 12;
          const monthName = new Date(2023, monthIndex, 1).toLocaleString('default', { month: 'long' });
          const yearOffset = (currentMonthIndex + i) >= 12 ? 1 : 0;
          const year = new Date().getFullYear() + yearOffset;
          const payments = rawDividends.filter(d => d.paymentMonths.includes(monthIndex)).sort((a, b) => a.payDay - b.payDay);
          const totalIncome = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
          return { name: monthName, year, payments, totalIncome };
      });
  }, [rawDividends]);

  // Historical Bar Chart Data
  const historyData = useMemo(() => {
    const months = ["Oct 23", "Nov 23", "Dec 23", "Jan 24", "Feb 24", "Mar 24", "Apr 24", "May 24", "Jun 24", "Jul 24", "Aug 24", "Sep 24"];
    return months.map((m, i) => ({
      name: m,
      income: (currentAnnualIncome / 12) * (0.8 + Math.random() * 0.4)
    }));
  }, [currentAnnualIncome]);

  const sortedDividends = useMemo(() => {
      const data = [...rawDividends];
      if (sortBy === 'amount') return data.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      if (sortBy === 'yield') return data.sort((a, b) => b.dividendYield - a.dividendYield);
      if (sortBy === 'safety') return data.sort((a, b) => b.safetyScore - a.safetyScore);
      return data; 
  }, [rawDividends, sortBy]);

  const projectionData = useMemo(() => {
      const years = [1, 5, 10, 15, 20, 30];
      const baseIncome = recessionMode ? stressedIncome : currentAnnualIncome;
      return years.map(y => {
          const effectiveGrowth = (projectedCagr / 100) + (reinvestMode ? (portfolioYield / 100) : 0);
          return {
              year: `Yr ${y}`,
              income: Math.round(baseIncome * Math.pow(1 + effectiveGrowth, y))
          };
      });
  }, [recessionMode, stressedIncome, currentAnnualIncome, projectedCagr, reinvestMode, portfolioYield]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dividends</h1>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
                <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                    Analysis
                </button>
                <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                    Calendar
                </button>
            </div>
        </div>

        {/* Historical Performance Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-500" /> 12-Month Income History
            </h3>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                        <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} cursor={{fill: '#f1f5f9', opacity: 0.05}} />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 border rounded-2xl p-6 transition-all ${recessionMode ? 'bg-red-50 dark:bg-red-950/10 border-red-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${recessionMode ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                            {recessionMode ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                            Income Stress Test
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Sustainability audit for market downturns.</p>
                    </div>
                    <button onClick={() => setRecessionMode(!recessionMode)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${recessionMode ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
                        {recessionMode ? 'Restore Normal' : 'Simulate Recession'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Annual Income</div>
                        <div className={`text-2xl font-black ${recessionMode ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            ${(recessionMode ? stressedIncome : currentAnnualIncome).toLocaleString()}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Portfolio Yield</div>
                        <div className="text-2xl font-black text-emerald-500">{portfolioYield.toFixed(2)}%</div>
                    </div>
                </div>
            </div>

            {/* Forecaster with DRIP Toggle */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-brand-500" /> DRIP Forecast
                </h3>
                <div className="h-32 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectionData}>
                            <Bar dataKey="income" fill="#6366f1" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <RefreshCw className={`w-3.5 h-3.5 ${reinvestMode ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dividend Reinvestment</span>
                        </div>
                        <button onClick={() => setReinvestMode(!reinvestMode)} className={`w-10 h-5 rounded-full relative transition-colors ${reinvestMode ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${reinvestMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {viewMode === 'list' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ListFilter className="w-5 h-5 text-brand-500" /> Schedule
                    </h3>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-brand-500 outline-none">
                        <option value="date">📅 Sort by Date</option>
                        <option value="yield">📈 Sort by Yield (High)</option>
                        <option value="safety">🛡️ Sort by Safety Score</option>
                        <option value="amount">💰 Sort by Amount</option>
                    </select>
                </div>

                <div className="space-y-6">
                    {sortBy === 'date' ? monthsList.map((month, idx) => month.payments.length > 0 && (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">{month.name} {month.year}</h4>
                                <div className="text-emerald-500 font-bold font-mono text-sm">${month.totalIncome.toFixed(2)}</div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {month.payments.map(p => <DividendRow key={p.id} payment={p} isCut={recessionMode && p.safetyScore < 60} />)}
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                            {sortedDividends.map(p => <DividendRow key={p.id} payment={p} isCut={recessionMode && p.safetyScore < 60} />)}
                        </div>
                    )}
                </div>
            </div>
        )}

        {viewMode === 'calendar' && (
             <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <DividendCalendar dividends={rawDividends} />
             </div>
        )}
    </div>
  );
};

export default DividendsView;
