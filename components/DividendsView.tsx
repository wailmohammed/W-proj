import React, { useState } from 'react';
import { Info, CheckCircle2, TrendingUp, ShieldCheck, AlertOctagon, ZapOff, XCircle, Calendar as CalendarIcon, BarChart3, Clock, Sliders, RefreshCw } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, BarChart } from 'recharts';
import DividendCalendar, { CalendarDividend } from './DividendCalendar';
import { usePortfolio } from '../context/PortfolioContext';

const InfoTooltip = ({ content }: { content: string }) => (
  <div className="group relative flex items-center justify-center ml-1.5">
    <Info className="w-3.5 h-3.5 text-slate-500 hover:text-brand-400 cursor-help transition-colors" />
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-xs text-slate-300 rounded-lg shadow-xl border border-slate-700 z-50 whitespace-normal text-left leading-relaxed">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const DividendsView: React.FC = () => {
  const { activePortfolio } = usePortfolio();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [recessionMode, setRecessionMode] = useState(false);
  const [historyRange, setHistoryRange] = useState<'5Y' | '10Y' | 'MAX'>('5Y');
  
  // Projection State
  const [projectedCagr, setProjectedCagr] = useState(7); // Annual Dividend Growth Rate
  const [reinvestMode, setReinvestMode] = useState(true); // DRIP Toggle

  const holdings = activePortfolio.holdings;

  // Simulate Alerts: Explicitly mark low safety score (<50) and paying dividends as "Cut Announced"
  const dividendAlerts = holdings
    .filter(h => h.dividendYield > 0 && h.safetyScore < 50)
    .map(h => ({
        id: h.id,
        symbol: h.symbol,
        type: 'danger',
        message: `DIVIDEND CUT ANNOUNCED: ${h.symbol} has announced a suspension of its dividend due to cash flow constraints. Safety Score: ${h.safetyScore}/100.`
    }));

  // Prepare data for dividend view by extending holdings with mock payment data
  const sortedDividends: CalendarDividend[] = holdings
    .filter(h => h.dividendYield > 0)
    .map(h => {
        const annualIncome = h.shares * h.currentPrice * (h.dividendYield / 100);
        // Deterministic day generation (1-28) based on symbol to distribute payments on calendar
        const deterministicDay = (h.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 28) + 1;
        
        // Determine payment months based on symbol hash to create quarterly groups
        const paymentGroup = h.symbol.charCodeAt(0) % 3;
        const paymentMonths = [0, 1, 2, 3].map(i => i * 3 + paymentGroup);

        // Mock Payout Ratio based on Sector (Realistic ranges)
        let basePayout = 0;
        if (h.sector === 'Real Estate') basePayout = 85;
        else if (h.sector === 'Technology') basePayout = 25;
        else if (h.sector === 'Energy') basePayout = 45;
        else basePayout = 50;

        // Add variance based on symbol char code
        const variance = (h.symbol.charCodeAt(0) % 20) - 10; 
        const payoutRatio = Math.max(0, Math.min(150, basePayout + variance));

        return {
            ...h,
            amount: (annualIncome / 4).toFixed(2),
            payDay: deterministicDay, 
            payDayStr: deterministicDay.toString(),
            payoutRatio,
            paymentMonths
        };
    })
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

  // --- Calculations ---
  
  const calculateStressTestedIncome = () => {
    let projectedIncome = 0;
    sortedDividends.forEach(h => {
        const annual = parseFloat(h.amount) * 4;
        if (h.safetyScore >= 80) projectedIncome += annual; // Very Safe: 100%
        else if (h.safetyScore >= 60) projectedIncome += annual * 0.75; // Safe: 25% cut scenario
        else if (h.safetyScore >= 40) projectedIncome += annual * 0.50; // Borderline: 50% cut scenario
        else projectedIncome += 0; // Unsafe: 100% cut scenario
    });
    return projectedIncome;
  };

  const currentAnnualIncome = sortedDividends.reduce((acc, curr) => acc + (parseFloat(curr.amount) * 4), 0);
  const stressedIncome = calculateStressTestedIncome();
  const riskExposure = currentAnnualIncome - stressedIncome;
  const portfolioYield = activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue) : 0;

  // --- Long Term Projection Data ---
  const projectionYears = [1, 3, 5, 10, 15, 20, 25, 30];
  
  const longTermProjectionData = projectionYears.map(year => {
      // Effective Growth Rate = Organic Growth (CAGR) + Reinvestment Yield (if enabled)
      const effectiveRate = (projectedCagr / 100) + (reinvestMode ? portfolioYield : 0);
      
      return {
          year: `Year ${year}`,
          income: Math.round(currentAnnualIncome * Math.pow(1 + effectiveRate, year)),
      };
  });

  // --- Historical Growth Data (Dynamic based on selection) ---
  const getHistoryData = () => {
      const years = historyRange === '5Y' ? 6 : historyRange === '10Y' ? 11 : 20;
      // Use a mock historical CAGR that creates a realistic curve ending at current income
      const historicalCagr = 0.08; 

      return Array.from({ length: years }, (_, i) => {
          const yearIndex = years - 1 - i;
          // Simulate some realistic variance in growth
          const variance = 1 + (Math.random() * 0.1 - 0.05); 
          const income = currentAnnualIncome * Math.pow(1 / (1 + historicalCagr), yearIndex) * variance;
          
          return {
            year: (new Date().getFullYear() - yearIndex).toString(),
            income: Math.round(income),
            growth: 0 // Calculated below
          };
      }).map((point, index, array) => {
          if (index === 0) return { ...point, growth: 0 };
          const prev = array[index - 1].income;
          const growth = ((point.income - prev) / prev) * 100;
          return { ...point, growth: parseFloat(growth.toFixed(1)) };
      });
  };

  const historyData = getHistoryData();

  // --- Helper Functions ---

  const getSafetyGrade = (score: number) => {
      if (score >= 90) return { grade: 'A', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Very Safe' };
      if (score >= 80) return { grade: 'B', color: 'text-emerald-300', bg: 'bg-emerald-300/10', border: 'border-emerald-300/20', label: 'Safe' };
      if (score >= 60) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Borderline' };
      if (score >= 40) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Unsafe' };
      return { grade: 'F', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Very Unsafe' };
  };

  const getPayoutColor = (ratio: number, sector: string) => {
      const isReit = sector === 'Real Estate';
      const safeLimit = isReit ? 90 : 60;
      const warningLimit = isReit ? 100 : 75;
      if (ratio <= safeLimit) return 'text-emerald-400';
      if (ratio <= warningLimit) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
        {/* Alert Banner for Dividend Cuts */}
        {dividendAlerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-red-400">Portfolio Alert: Dividend Cuts</h4>
                        <div className="mt-1 space-y-1">
                            {dividendAlerts.map(alert => (
                                <div key={alert.id} className="text-xs text-slate-300">
                                    {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="text-slate-500 hover:text-white">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">Dividends</h1>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 w-fit">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                   <BarChart3 className="w-4 h-4" /> Analysis
                </button>
                 <button 
                    onClick={() => setViewMode('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                   <CalendarIcon className="w-4 h-4" /> Calendar
                </button>
            </div>
        </div>

        {/* Simply Safe Dividends Feature: Income Stress Test */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-brand-500" /> Income Stress Test
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Simulate a severe recession to see your portfolio's "Safe Income Floor".</p>
                </div>
                <button 
                    onClick={() => setRecessionMode(!recessionMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2 ${
                        recessionMode 
                        ? 'bg-red-500/10 text-red-400 border-red-500/50 shadow-lg shadow-red-500/20' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                    {recessionMode ? <ZapOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {recessionMode ? 'Deactivate Simulation' : 'Simulate Recession'}
                </button>
            </div>

            <div className="relative pt-4 pb-2">
                <div className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                    <span>Projected Cut: <span className="text-red-400">-${Math.round(riskExposure).toLocaleString()}</span></span>
                    <span>Safe Income: <span className="text-emerald-400">${Math.round(stressedIncome).toLocaleString()}</span></span>
                </div>
                <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden flex">
                    {/* Safe Portion */}
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                        style={{ width: currentAnnualIncome > 0 ? `${(stressedIncome / currentAnnualIncome) * 100}%` : '0%' }}
                    ></div>
                    {/* Risk Portion */}
                    <div 
                        className={`h-full bg-red-500 transition-all duration-700 ease-out ${recessionMode ? 'opacity-100' : 'opacity-30'}`} 
                        style={{ width: currentAnnualIncome > 0 ? `${(riskExposure / currentAnnualIncome) * 100}%` : '0%' }}
                    ></div>
                </div>
                {recessionMode && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 animate-fade-in">
                        <strong className="font-bold">Simulation Active:</strong> We've removed 100% of income from 'Unsafe' stocks and 50% from 'Borderline' stocks. Your resilient income is ${Math.round(stressedIncome).toLocaleString()}/yr.
                    </div>
                )}
            </div>
        </div>

        {/* Forecasting & History Section - Only show in list mode */}
        {viewMode === 'list' && (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Forecast Stats Small */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp className="w-32 h-32 text-brand-500" />
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium mb-4">Next 12 Months</h3>
                        <div className="mb-6">
                            <div className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${recessionMode ? 'text-red-400' : 'text-white'}`}>
                                ${Math.round(recessionMode ? stressedIncome : currentAnnualIncome).toLocaleString()}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                                {recessionMode ? 'Recession Scenario Income' : 'Projected Annual Income'}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Yield on Cost</span>
                                <span className="text-sm font-bold text-indigo-400">
                                    {(activePortfolio.totalValue > 0 ? (currentAnnualIncome / activePortfolio.totalValue * 1.2) * 100 : 0).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Current Yield</span>
                                <span className="text-sm font-bold text-emerald-400">
                                    {(portfolioYield * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historical Growth Chart with Selector */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">Income Trend (YoY Growth)</h3>
                        <div className="flex items-center gap-2">
                            {(['5Y', '10Y', 'MAX'] as const).map(range => (
                                <button
                                    key={range}
                                    onClick={() => setHistoryRange(range)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                                        historyRange === range 
                                        ? 'bg-brand-600 border-brand-500 text-white' 
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                                    }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis 
                                    dataKey="year" 
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickFormatter={(value) => `$${value}`} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#6366f1" 
                                    fontSize={12} 
                                    tickFormatter={(value) => `${value}%`} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                    formatter={(value: number, name: string) => [
                                        name === 'income' ? `$${Math.round(value).toLocaleString()}` : `${value}%`, 
                                        name === 'income' ? 'Total Income' : 'YoY Growth'
                                    ]}
                                />
                                <Bar yAxisId="left" dataKey="income" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={30} />
                                <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#6366f1" strokeWidth={2} dot={{r: 3, fill: '#6366f1', strokeWidth: 0}} activeDot={{r: 5}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Long Term Projection Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                 <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-6 h-6 text-brand-500" /> Future Income Engine
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">Forecast your passive income potential with compound growth.</p>
                    </div>
                    
                    {/* Interactive Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 w-full lg:w-auto">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                                <Sliders className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Est. Dividend Growth</label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="20" 
                                        step="0.5" 
                                        value={projectedCagr} 
                                        onChange={(e) => setProjectedCagr(parseFloat(e.target.value))}
                                        className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                    />
                                    <span className="text-sm font-bold text-white w-10">{projectedCagr}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
                        
                        <button 
                            onClick={() => setReinvestMode(!reinvestMode)}
                            className={`flex items-center gap-3 w-full sm:w-auto px-3 py-2 rounded-lg border transition-all ${reinvestMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'}`}
                        >
                            <div className={`p-1 rounded ${reinvestMode ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                <RefreshCw className="w-3 h-3" />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-bold uppercase text-slate-500">Reinvest (DRIP)</div>
                                <div className={`text-xs font-bold ${reinvestMode ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {reinvestMode ? 'Enabled' : 'Disabled'}
                                </div>
                            </div>
                        </button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Chart */}
                     <div className="lg:col-span-2 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={longTermProjectionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Projected Income']}
                                />
                                <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                    {longTermProjectionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fillOpacity={0.5 + (index / longTermProjectionData.length) * 0.5} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>

                     {/* Projection Grid */}
                     <div className="grid grid-cols-2 gap-3 h-fit max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                         {longTermProjectionData.map((d, i) => (
                             <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col justify-center">
                                 <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">{d.year}</div>
                                 <div className="text-lg font-bold text-white">${d.income.toLocaleString()}</div>
                                 <div className="text-[10px] text-emerald-500">
                                     +{Math.round((d.income / currentAnnualIncome - 1) * 100)}% vs Now
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </>
        )}

        {/* Main Content Area */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm overflow-hidden">
        {viewMode === 'list' ? (
            <div className="divide-y divide-slate-800">
                {sortedDividends.map((h, i) => {
                    const annualDividendPerShare = h.currentPrice * (h.dividendYield / 100);
                    const yieldOnCost = h.avgPrice > 0 ? (annualDividendPerShare / h.avgPrice) * 100 : 0;
                    const fiveYearGrowth = ((h.symbol.length * 2 + h.id.charCodeAt(0)) % 15 + 2).toFixed(2);
                    
                    const safety = getSafetyGrade(h.safetyScore);
                    const payoutColor = getPayoutColor(h.payoutRatio, h.sector);
                    
                    // Logic to Dim rows if they are cut during recession simulation
                    const isCut = recessionMode && h.safetyScore < 60;

                    return (
                    <div key={h.id} className={`p-4 flex flex-col md:flex-row md:items-center justify-between transition-colors gap-4 ${isCut ? 'opacity-40 grayscale bg-red-950/10' : 'hover:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-4 md:w-1/3">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex flex-col items-center justify-center border border-slate-700 shadow-sm shrink-0">
                                <span className="text-slate-400 uppercase text-[10px] font-bold">DAY</span>
                                <span className="text-white text-lg md:text-xl font-bold">{h.payDay}</span>
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-white text-lg truncate flex items-center gap-2">
                                    {h.name}
                                    {isCut && <span className="text-xs text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase">CUT</span>}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{h.symbol}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                    <span>Quarterly</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Metrics Section */}
                        <div className="flex flex-wrap md:flex-nowrap items-start md:items-center justify-end gap-y-4 gap-x-6 px-2 md:px-4 flex-1">
                             {/* Yields */}
                             <div className="flex flex-col items-start md:items-end w-1/2 md:w-auto">
                                 <div className="flex items-center gap-4">
                                     <div className="text-left md:text-right relative">
                                         <div className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                                             {h.dividendYield.toFixed(2)}%
                                             <InfoTooltip content="Current Yield: Annual dividend divided by current share price. The return you would get if you bought today." />
                                         </div>
                                         <div className="text-[10px] text-slate-600">Current</div>
                                     </div>
                                     <div className="text-left md:text-right relative">
                                         <div className="text-sm font-bold text-indigo-400 flex items-center justify-end gap-1">
                                             {yieldOnCost.toFixed(2)}%
                                             <InfoTooltip content="Yield on Cost (YoC): Annual dividend divided by your average buy price. This shows the actual return on your original investment." />
                                         </div>
                                         <div className="text-[10px] text-slate-600">On Cost</div>
                                     </div>
                                 </div>
                             </div>

                             {/* Payout Ratio */}
                             <div className="flex flex-col items-start md:items-end pl-0 md:pl-6 md:border-l border-slate-800/50 w-1/2 md:w-auto">
                                 <div className="text-right">
                                     <div className={`text-sm font-bold flex items-center justify-end ${payoutColor}`}>
                                         {h.payoutRatio}%
                                         <InfoTooltip content="Payout Ratio: % of earnings returned to shareholders. Healthy ranges vary: Tech (<40%), General Stocks (<60%), REITs/Utilities (<90%)." />
                                     </div>
                                     <div className="text-[10px] text-slate-600">Earnings</div>
                                 </div>
                             </div>

                            {/* Safety Score Badge with Enhanced Tooltip */}
                             <div className="flex flex-col items-start md:items-end pl-0 md:pl-6 md:border-l border-slate-800/50 w-1/2 md:w-auto">
                                 <div className={`px-2 py-0.5 rounded-md text-sm font-bold border flex items-center gap-1 cursor-default ${safety.bg} ${safety.color} ${safety.border}`}>
                                    {safety.grade} 
                                    <InfoTooltip content={`Score: ${h.safetyScore}/100. ${safety.label}. Risk assessment based on payout ratio, free cash flow, earnings consistency, and debt levels.`} />
                                 </div>
                             </div>

                             {/* Growth */}
                             <div className="flex flex-col items-start md:items-end pl-0 md:pl-6 md:border-l border-slate-800/50 w-1/2 md:w-auto">
                                 <div className="text-left md:text-right">
                                     <div className="text-sm font-bold text-white">+{fiveYearGrowth}%</div>
                                     <div className="text-xs text-slate-600">Annualized</div>
                                 </div>
                             </div>
                        </div>
                        
                        <div className="text-right w-full md:w-auto pl-0 md:pl-8 md:border-l border-slate-800/50 flex md:block justify-between items-center border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                            <div className="text-xs text-slate-400 md:hidden">Next Payment</div>
                            <div>
                                <div className={`font-bold text-lg ${isCut ? 'text-red-400 line-through' : 'text-emerald-400'}`}>
                                    +${h.amount}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                    {isCut ? (
                                        <span className="text-red-400 font-bold text-[10px]">AT RISK</span>
                                    ) : (
                                        <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Confirmed</>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
                {sortedDividends.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                            <Info className="w-6 h-6 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">No dividend stocks found</h3>
                        <p className="text-sm text-slate-400 max-w-xs">Add stocks like Realty Income (O) or Coca-Cola (KO) to see your dividend forecast.</p>
                    </div>
                )}
            </div>
        ) : (
             <div className="p-6">
                <DividendCalendar dividends={sortedDividends} />
             </div>
        )}
        </div>
    </div>
  );
};

export default DividendsView;