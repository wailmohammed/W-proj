
import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { List, Layers, History, TrendingUp, LayoutGrid, Plus, Trash2, ArrowUpRight, ArrowDownRight, BarChart3, TrendingDown } from 'lucide-react';
import SnowflakeChart from './SnowflakeChart';
import { AssetType, Holding } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_DATA_PERFORMANCE } from '../constants';

const PortfolioView: React.FC = () => {
  const { activePortfolio, viewStock, openAddAssetModal, deleteHolding } = usePortfolio();
  const [viewMode, setViewMode] = useState<'holdings' | 'performance'>('holdings');
  const [holdingViewType, setHoldingViewType] = useState<'list' | 'cards'>('cards');
  
  const holdings = activePortfolio?.holdings || [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-20 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Portfolio</h1>
        <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => openAddAssetModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-600 text-white hover:bg-brand-500 transition-all shadow-lg shadow-brand-600/20">
                <Plus className="w-4 h-4" /> Add Asset
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button onClick={() => setViewMode('holdings')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'holdings' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Layers className="w-4 h-4" /> Holdings
                </button>
                <button onClick={() => setViewMode('performance')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'performance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    <History className="w-4 h-4" /> Performance
                </button>
            </div>
        </div>
      </div>

      {viewMode === 'holdings' && (
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your Assets</div>
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
                              <div key={h.id} onClick={() => viewStock(h.symbol)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-brand-500/50 transition-all cursor-pointer group shadow-sm flex flex-col">
                                  <div className="p-5 flex justify-between items-start border-b border-slate-50 dark:border-slate-800/50">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 dark:border-slate-700">{h.symbol[0]}</div>
                                          <div>
                                              <div className="font-bold text-slate-900 dark:text-white text-base leading-none">{h.symbol}</div>
                                              <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">{h.assetType} • {h.shares.toFixed(2)} Shares</div>
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
                                      <div className="text-left"><div className="text-[9px] text-slate-500 uppercase">Avg Cost</div><div className="text-xs font-bold text-slate-700 dark:text-slate-300">${h.avgPrice.toFixed(2)}</div></div>
                                      <div className="text-right"><div className="text-[9px] text-slate-500 uppercase">Div Yield</div><div className="text-xs font-bold text-emerald-500">{h.dividendYield}%</div></div>
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
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Shares</th>
                                    <th className="px-6 py-4 text-right">Avg Cost</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Market Value</th>
                                    <th className="px-6 py-4 text-right">Return</th>
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
                                        <td className="px-6 py-4 text-right font-mono text-brand-600 dark:text-brand-400 font-bold">${h.currentPrice.toFixed(2)}</td>
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Portfolio Growth
                      </h3>
                      <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={CHART_DATA_PERFORMANCE}>
                                  <defs>
                                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                  <YAxis hide />
                                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                                  <Area type="monotone" dataKey="portfolio" stroke="#6366f1" strokeWidth={3} fill="url(#colorPortfolio)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Summary</h3>
                          <div className="space-y-4">
                              <div>
                                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total Gain</div>
                                  <div className="text-3xl font-black text-emerald-500">+$12,450</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Annualized Return</div>
                                  <div className="text-3xl font-black text-brand-600 dark:text-brand-400">+14.2%</div>
                              </div>
                          </div>
                      </div>
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Best Asset</span>
                              <span className="font-bold text-emerald-500">AAPL (+18%)</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white">Asset Gain/Loss Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Symbol</th>
                                    <th className="px-6 py-4 text-right">Cost Basis</th>
                                    <th className="px-6 py-4 text-right">Market Val</th>
                                    <th className="px-6 py-4 text-right">Profit/Loss</th>
                                    <th className="px-6 py-4 text-right">Weight</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {holdings.map((h) => {
                                    const cost = h.shares * h.avgPrice;
                                    const value = h.shares * h.currentPrice;
                                    const pl = value - cost;
                                    const weight = (value / activePortfolio.totalValue) * 100;
                                    return (
                                        <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{h.symbol}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">${cost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${value.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                            <td className={`px-6 py-4 text-right font-black ${pl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {pl >= 0 ? '+' : ''}${Math.abs(pl).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-500 font-mono">{weight.toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PortfolioView;
