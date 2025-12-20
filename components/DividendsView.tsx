
import React, { useState, useMemo } from 'react';
import { Info, CheckCircle2, TrendingUp, ShieldCheck, AlertOctagon, ZapOff, XCircle, Calendar as CalendarIcon, BarChart3, Clock, Sliders, RefreshCw, AlertTriangle, Wallet, BarChart2, ArrowDownUp, ArrowUp, ArrowDown, Droplets, ListFilter, LayoutGrid, X, Timer, MousePointerClick, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, BarChart } from 'recharts';
import DividendCalendar, { CalendarDividend } from './DividendCalendar';
import { usePortfolio } from '../context/PortfolioContext';

const getSafetyGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-400/20', label: 'Very Safe' };
    if (score >= 80) return { grade: 'B', color: 'text-emerald-500 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-300/10', border: 'border-emerald-100 dark:border-emerald-300/20', label: 'Safe' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-400/10', border: 'border-yellow-200 dark:border-yellow-400/20', label: 'Borderline' };
    if (score >= 40) return { grade: 'D', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-400/10', border: 'border-orange-200 dark:border-orange-400/20', label: 'Unsafe' };
    return { grade: 'F', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-400/10', border: 'border-red-200 dark:border-red-400/20', label: 'Very Unsafe' };
};

const getPayoutColor = (ratio: number, sector: string) => {
    const isReit = sector === 'Real Estate';
    const safeLimit = isReit ? 90 : 60;
    const warningLimit = isReit ? 100 : 90;
    if (ratio <= safeLimit) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20';
    if (ratio <= warningLimit) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
};

const DividendRow: React.FC<{ payment: CalendarDividend, isCut: boolean }> = ({ payment, isCut }) => {
    const safety = getSafetyGrade(payment.safetyScore);
    const payoutStyle = getPayoutColor(payment.payoutRatio, payment.sector);
    const snowflakeScore = payment.snowflake?.total || 0;

    const yoc = payment.avgPrice > 0 
        ? ((payment.currentPrice / payment.avgPrice) * payment.dividendYield).toFixed(2) 
        : payment.dividendYield.toFixed(2);
    
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
                              {isCut && <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 rounded uppercase">Cut</span>}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[140px] md:max-w-none flex items-center gap-1">
                              Yield: {payment.dividendYield}% • YoC: {yoc}%
                          </div>
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'capture'>('list');
  const [recessionMode, setRecessionMode] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'yield' | 'safety'>('date');
  
  const holdings = activePortfolio.holdings;

  const dividendData = useMemo(() => {
      const raw: CalendarDividend[] = holdings
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
        
      return { raw };
  }, [holdings]);

  const { raw: rawDividends } = dividendData;

  const totalAnnualIncome = rawDividends.reduce((acc, curr) => acc + (parseFloat(curr.amount) * 4), 0);
  const portfolioYield = activePortfolio.totalValue > 0 ? (totalAnnualIncome / activePortfolio.totalValue) * 100 : 0;
  const avgSafetyScore = rawDividends.length > 0 ? rawDividends.reduce((acc, d) => acc + d.safetyScore, 0) / rawDividends.length : 0;

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

  const sortedDividends = useMemo(() => {
      const data = [...rawDividends];
      if (sortBy === 'amount') return data.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      if (sortBy === 'yield') return data.sort((a, b) => b.dividendYield - a.dividendYield);
      if (sortBy === 'safety') return data.sort((a, b) => b.safetyScore - a.safetyScore);
      return data; 
  }, [rawDividends, sortBy]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dividends</h1>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
                <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                    <LayoutGrid className="w-4 h-4" /> List
                </button>
                <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                    <CalendarIcon className="w-4 h-4" /> Calendar
                </button>
            </div>
        </div>

        {/* Income Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Annual Income</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">${totalAnnualIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div className="mt-2 text-xs text-slate-500">Projected passive income NTM</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-100 dark:bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
                        <Percent className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Portfolio Yield</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{portfolioYield.toFixed(2)}%</div>
                <div className="mt-2 text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Average across all holdings
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dividend Safety</span>
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{avgSafetyScore.toFixed(0)}/100</div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Quality-weighted score
                </div>
            </div>
        </div>

        {viewMode === 'list' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ListFilter className="w-5 h-5 text-brand-500" /> Income Stream
                    </h3>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-brand-500 outline-none"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="yield">Sort by Yield</option>
                        <option value="safety">Sort by Safety</option>
                    </select>
                </div>

                <div className="space-y-6">
                    {sortBy === 'date' ? monthsList.map((month, idx) => month.payments.length > 0 && (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white">{month.name} {month.year}</h4>
                                <div className="text-emerald-500 font-bold font-mono">${month.totalIncome.toFixed(2)}</div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {month.payments.map(p => <DividendRow key={p.id} payment={p} isCut={false} />)}
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800/50">
                            {sortedDividends.map(p => <DividendRow key={p.id} payment={p} isCut={false} />)}
                        </div>
                    )}
                </div>
            </div>
        )}

        {viewMode === 'calendar' && (
             <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto">
                <div className="min-w-[700px]">
                    <DividendCalendar dividends={rawDividends} />
                </div>
             </div>
        )}
    </div>
  );
};

export default DividendsView;
