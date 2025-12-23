

import React, { useState, useEffect } from 'react';
// Added Activity to imports from lucide-react to fix missing name error
import { Search, TrendingUp, AlertTriangle, CheckCircle, FileText, Sparkles, Loader2, Users, Briefcase, Lock, Plus, ExternalLink, Scale, BarChart, Newspaper, ThumbsUp, ThumbsDown, Eye, EyeOff, List, ChevronDown, PlusCircle, Check, Info, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Bar, Legend } from 'recharts';
import SnowflakeChart from './SnowflakeChart';
import { MOCK_MARKET_ASSETS, MOCK_NEWS } from '../constants';
import { analyzeStock, analyzeStockRisks } from '../services/geminiService';
import { usePortfolio } from '../context/PortfolioContext';

const ValuationGauge: React.FC<{ current: number, fair: number }> = ({ current, fair }) => {
    const isUndervalued = current < fair;
    const discount = Math.abs(((fair - current) / fair) * 100);
    const position = Math.min(100, Math.max(0, (current / (fair * 2)) * 100));

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-brand-500" /> Valuation Analysis
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isUndervalued ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isUndervalued ? `${discount.toFixed(0)}% Undervalued` : 'Overvalued'}
                </span>
            </div>

            <div className="relative pt-10 pb-4">
                <div className="h-4 w-full bg-slate-800 rounded-full flex overflow-hidden">
                    <div className="h-full bg-emerald-500/30 w-[40%]"></div>
                    <div className="h-full bg-slate-700/30 w-[20%]"></div>
                    <div className="h-full bg-red-500/30 w-[40%]"></div>
                </div>

                {/* Fair Value Marker */}
                <div className="absolute top-0 left-[50%] -translate-x-1/2 h-14 w-1 bg-white z-10">
                    <div className="absolute top-0 -translate-y-full -translate-x-1/2 bg-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg text-white whitespace-nowrap">
                        Fair Value: ${fair.toFixed(2)}
                    </div>
                </div>

                {/* Current Price Marker */}
                <div 
                    className="absolute top-0 transition-all duration-1000 h-14 w-1.5 bg-brand-500 z-20 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                    style={{ left: `${position}%` }}
                >
                    <div className="absolute bottom-0 translate-y-full -translate-x-1/2 bg-brand-600 text-[10px] font-bold px-2 py-1 rounded-lg text-white whitespace-nowrap mt-2">
                        Current: ${current.toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="mt-12 flex items-start gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    Intrinsic value calculated using a 2-stage Free Cash Flow to Equity (FCFE) model. 
                    Assumes a 5-year growth period of 12% and 8% terminal rate.
                </p>
            </div>
        </div>
    );
};

const ResearchView: React.FC = () => {
  const { selectedResearchSymbol, viewStock, openAddAssetModal, watchlists, activeWatchlistId, toggleWatchlist, createWatchlist, switchWatchlist } = usePortfolio();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(selectedResearchSymbol);

  const [isWatchlistMenuOpen, setIsWatchlistMenuOpen] = useState(false);
  const [isCreatingWatchlist, setIsCreatingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

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

  // Mocked Fair Value based on Snowflake (Simply Wall St Logic)
  const fairValueMultiplier = 1 + (asset.snowflake.value / 10);
  const fairValue = asset.currentPrice * fairValueMultiplier;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pt-4">
      <div className="relative max-w-xl mx-auto mb-10">
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input 
                type="text"
                placeholder="Search symbol, company, or ISIN..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-lg transition-all"
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
                        <img src={asset.logoUrl} alt={asset.symbol} className="w-14 h-14 rounded-2xl bg-white p-1 border border-slate-100" />
                    ) : (
                        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-2xl font-black text-white">{asset.symbol[0]}</div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{asset.symbol}</h1>
                        <div className="text-slate-500 font-medium text-sm">{asset.name}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mb-8 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                         <div className="text-xs text-slate-500 font-bold uppercase">Price</div>
                         <div className="text-2xl font-black text-slate-900 dark:text-white">${asset.currentPrice.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => openAddAssetModal(asset.symbol)} className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-600/20"><Plus className="w-4 h-4" /> Add</button>
                        <button onClick={() => toggleWatchlist(asset.symbol)} className={`flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl transition-all border ${isWatching ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                            {isWatching ? 'Watching' : 'Watchlist'}
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-slate-500 mb-6 text-center uppercase tracking-widest">Quality Audit</h3>
                    <SnowflakeChart data={asset.snowflake} height={250} />
                    <div className="text-center mt-6">
                        <div className="text-5xl font-black text-brand-500">{asset.snowflake.total}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Score / 25</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <ValuationGauge current={asset.currentPrice} fair={fairValue} />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500" /> Momentum & Risk
                    </h3>
                </div>
                {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-2" />
                        <p className="text-slate-500 text-xs">Analyzing 10-K Filings...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Strengths</h4>
                            {aiRisks?.strengths.map((str, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{str}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risks</h4>
                            {aiRisks?.risks.map((risk, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{risk}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" /> Business Profile
                </h3>
                {analyzing ? (
                    <div className="space-y-3"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6"></div><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4"></div></div>
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
