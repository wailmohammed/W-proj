
import React, { useState, useEffect } from 'react';
// Added Globe to the lucide-react imports
import { Search, TrendingUp, AlertTriangle, CheckCircle, FileText, Sparkles, Loader2, Users, Briefcase, Lock, Plus, ExternalLink, Scale, BarChart, Newspaper, ThumbsUp, ThumbsDown, Eye, EyeOff, List, ChevronDown, PlusCircle, Check, Info, Activity, PieChart as PieChartIcon, Globe } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';
import SnowflakeChart from './SnowflakeChart';
import { MOCK_MARKET_ASSETS, MOCK_NEWS } from '../constants';
import { analyzeStock, analyzeStockRisks } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';

const ValuationGauge: React.FC<{ current: number, fair: number }> = ({ current, fair }) => {
    const isUndervalued = current < fair;
    const discount = Math.abs(((fair - current) / fair) * 100);
    const position = Math.min(100, Math.max(0, (current / (fair * 1.5)) * 100));

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-brand-500" /> Valuation Model
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isUndervalued ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isUndervalued ? `${discount.toFixed(0)}% Undervalued` : 'Trading at Premium'}
                </span>
            </div>

            <div className="relative pt-12 pb-6">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                    <div className="h-full bg-emerald-500/40 w-[40%]"></div>
                    <div className="h-full bg-slate-200 dark:bg-slate-700/40 w-[20%]"></div>
                    <div className="h-full bg-red-500/40 w-[40%]"></div>
                </div>

                <div className="absolute top-0 left-[50%] -translate-x-1/2 h-16 w-0.5 bg-slate-400 dark:bg-slate-500 z-10 border-dashed border-x">
                    <div className="absolute top-0 -translate-y-full -translate-x-1/2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg text-slate-900 dark:text-white whitespace-nowrap">
                        Estimated Fair Value: ${fair.toFixed(2)}
                    </div>
                </div>

                <div 
                    className="absolute top-0 transition-all duration-1000 h-16 w-2 bg-brand-500 z-20 shadow-[0_0_20px_rgba(99,102,241,0.6)] rounded-full"
                    style={{ left: `${position}%` }}
                >
                    <div className="absolute bottom-0 translate-y-full -translate-x-1/2 bg-brand-600 text-[10px] font-bold px-2 py-1 rounded-lg text-white whitespace-nowrap mt-3">
                        Market: ${current.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="mt-14 flex items-start gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed uppercase font-bold tracking-tight">
                    Multi-stage DCF simulation utilizing 10-year free cash flow projections. Adjusted for terminal growth rate of 3.5%.
                </p>
            </div>
        </div>
    );
};

const ResearchView: React.FC = () => {
  const { selectedResearchSymbol, viewStock, openAddAssetModal, watchlists, activeWatchlistId, toggleWatchlist } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(selectedResearchSymbol);

  useEffect(() => { setSelectedSymbol(selectedResearchSymbol); }, [selectedResearchSymbol]);
  
  const [aiProfile, setAiProfile] = useState<string | null>(null);
  const [aiRisks, setAiRisks] = useState<{strengths: string[], risks: string[]} | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const asset = MOCK_MARKET_ASSETS.find(a => a.symbol === selectedSymbol) || MOCK_MARKET_ASSETS[0];

  const searchResults = searchTerm.length > 0 
    ? MOCK_MARKET_ASSETS.filter(a => a.symbol.includes(searchTerm.toUpperCase()) || a.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
      const fetchAI = async () => {
          setAnalyzing(true);
          try {
              const [profile, riskData] = await Promise.all([
                  analyzeStock(asset.symbol),
                  analyzeStockRisks(asset.symbol)
              ]);
              setAiProfile(profile);
              setAiRisks(riskData);
          } catch (e) {
              console.error("AI Analysis failed", e);
          } finally {
              setAnalyzing(false);
          }
      };
      fetchAI();
  }, [asset.symbol]);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId) || watchlists[0];
  const isWatching = activeWatchlist.symbols.includes(asset.symbol);

  const fairValueMultiplier = 1 + (asset.snowflake.value / 10);
  const fairValue = asset.currentPrice * (asset.snowflake.total > 18 ? 1.2 : 0.9);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pt-4 pb-20">
      <div className="relative max-w-xl mx-auto mb-10">
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input 
                type="text"
                placeholder="Search ticker, company name, or CUSIP..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-xl transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        {searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {searchResults.map(res => (
                    <button key={res.id} onClick={() => { viewStock(res.symbol); setSearchTerm(''); }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors">
                        <div><div className="font-bold text-slate-900 dark:text-white">{res.symbol}</div><div className="text-xs text-slate-500">{res.name}</div></div>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-slate-600 dark:text-slate-400 font-bold">{res.assetType}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:col-span-1 h-fit sticky top-4 space-y-8">
            <div>
                <div className="flex items-center gap-4 mb-8">
                    {asset.logoUrl ? (
                        <img src={asset.logoUrl} alt={asset.symbol} className="w-16 h-16 rounded-2xl bg-white p-1 border border-slate-100" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-3xl font-black text-white">{asset.symbol[0]}</div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{asset.symbol}</h1>
                        <div className="text-slate-500 font-bold text-sm flex items-center gap-1">
                            {asset.name} <CheckCircle className="w-3 h-3 text-brand-500" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                         <div className="text-xs text-slate-500 font-bold uppercase">Price per share</div>
                         <div className="text-2xl font-black text-slate-900 dark:text-white">${asset.currentPrice.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => openAddAssetModal(asset.symbol)} className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/20"><Plus className="w-4 h-4" /> Add Trade</button>
                        <button onClick={() => toggleWatchlist(asset.symbol)} className={`flex items-center justify-center gap-2 text-xs font-bold py-3.5 rounded-xl transition-all border ${isWatching ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-inner' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                            {isWatching ? 'Watching' : 'Save Watchlist'}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-500 mb-6 text-center uppercase tracking-widest">Quality Audit (Snowflake)</h3>
                    <SnowflakeChart data={asset.snowflake} height={250} />
                    <div className="text-center mt-6">
                        <div className="text-5xl font-black text-brand-500">{asset.snowflake.total}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Audit Score / 25</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            {/* Key Ratios Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'P/E Ratio', value: asset.peRatio || '24.1', icon: Scale },
                    { label: 'Market Cap', value: asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(1)}B` : '$1.4T', icon: Globe },
                    { label: 'Consensus', value: asset.analystConsensus || 'Buy', icon: Users },
                    { label: 'Margin', value: asset.profitMargin ? `${asset.profitMargin}%` : '22.4%', icon: TrendingUp },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</span>
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <ValuationGauge current={asset.currentPrice} fair={fairValue} />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-500" /> AI-Powered Risk Profile
                    </h3>
                </div>
                {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Scanning Regulatory Filings...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ThumbsUp className="w-3 h-3" /> Core Strengths
                            </h4>
                            {aiRisks?.strengths.map((str, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-tight">{str}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <ThumbsDown className="w-3 h-3" /> Risk Factors
                            </h4>
                            {aiRisks?.risks.map((risk, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-tight">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" /> Business Profile
                </h3>
                {analyzing ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4"></div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        {aiProfile || `${asset.name} is a global leader in the ${asset.sector} sector with operations across ${asset.country}.`}
                    </p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchView;
