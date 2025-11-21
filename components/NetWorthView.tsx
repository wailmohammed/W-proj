
import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Car, Home, Watch, TrendingUp, DollarSign, Landmark, CreditCard, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const NetWorthView: React.FC = () => {
  const { activePortfolio } = usePortfolio();

  const manualAssets = activePortfolio.manualAssets || [];
  const liabilities = activePortfolio.liabilities || [];

  const totalAssetsValue = activePortfolio.totalValue + activePortfolio.cashBalance + manualAssets.reduce((acc, curr) => acc + curr.value, 0);
  const totalLiabilitiesValue = liabilities.reduce((acc, curr) => acc + curr.amount, 0);
  const netWorth = totalAssetsValue - totalLiabilitiesValue;

  // Mock Net Worth History
  const netWorthHistory = [
      { date: 'Jan', assets: totalAssetsValue * 0.9, liabilities: totalLiabilitiesValue * 1.05, netWorth: totalAssetsValue * 0.9 - totalLiabilitiesValue * 1.05 },
      { date: 'Feb', assets: totalAssetsValue * 0.92, liabilities: totalLiabilitiesValue * 1.04, netWorth: totalAssetsValue * 0.92 - totalLiabilitiesValue * 1.04 },
      { date: 'Mar', assets: totalAssetsValue * 0.94, liabilities: totalLiabilitiesValue * 1.03, netWorth: totalAssetsValue * 0.94 - totalLiabilitiesValue * 1.03 },
      { date: 'Apr', assets: totalAssetsValue * 0.95, liabilities: totalLiabilitiesValue * 1.02, netWorth: totalAssetsValue * 0.95 - totalLiabilitiesValue * 1.02 },
      { date: 'May', assets: totalAssetsValue * 0.98, liabilities: totalLiabilitiesValue * 1.01, netWorth: totalAssetsValue * 0.98 - totalLiabilitiesValue * 1.01 },
      { date: 'Jun', assets: totalAssetsValue, liabilities: totalLiabilitiesValue, netWorth: netWorth },
  ];

  const getAssetIcon = (type: string) => {
      switch (type) {
          case 'Real Estate': return <Home className="w-5 h-5 text-emerald-500" />;
          case 'Vehicle': return <Car className="w-5 h-5 text-blue-500" />;
          case 'Art/Collectibles': return <Watch className="w-5 h-5 text-amber-500" />;
          default: return <DollarSign className="w-5 h-5 text-slate-500" />;
      }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-12">
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Total Net Worth</h1>
                <p className="text-slate-400 text-sm mt-1">Track everything you own and owe in one place.</p>
            </div>
            <div className="text-right">
                <div className="text-4xl font-bold text-white">${netWorth.toLocaleString()}</div>
                <div className="text-emerald-400 text-sm font-bold flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" /> +12.4% YTD
                </div>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthHistory}>
                    <defs>
                        <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${Math.round(value).toLocaleString()}`, 'Net Worth']}
                    />
                    <Area type="monotone" dataKey="netWorth" stroke="#6366f1" fillOpacity={1} fill="url(#colorNw)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ASSETS COLUMN */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Assets
                    <span className="ml-auto text-emerald-400">${totalAssetsValue.toLocaleString()}</span>
                </h2>

                {/* Liquid Assets Group */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">Liquid Investments</div>
                    <div className="divide-y divide-slate-800">
                         <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                     <TrendingUp className="w-4 h-4" />
                                 </div>
                                 <span className="font-bold text-white">Stock Portfolio</span>
                             </div>
                             <div className="font-bold text-white">${activePortfolio.totalValue.toLocaleString()}</div>
                         </div>
                         <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                     <DollarSign className="w-4 h-4" />
                                 </div>
                                 <span className="font-bold text-white">Cash</span>
                             </div>
                             <div className="font-bold text-white">${activePortfolio.cashBalance.toLocaleString()}</div>
                         </div>
                    </div>
                </div>

                {/* Physical/Manual Assets Group */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-950 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 flex justify-between">
                        <span>Physical & Alternative</span>
                        <button className="text-brand-400 hover:text-brand-300 text-[10px]">+ Add Asset</button>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {manualAssets.map(asset => (
                             <div key={asset.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-brand-500/50 transition-colors">
                                        {getAssetIcon(asset.type)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{asset.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            {asset.purchasePrice && <span>Bot: ${asset.purchasePrice.toLocaleString()}</span>}
                                            {asset.purchaseDate && <span>• {asset.purchaseDate}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">${asset.value.toLocaleString()}</div>
                                    {asset.purchasePrice && (
                                        <div className={`text-xs font-bold ${asset.value >= asset.purchasePrice ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {asset.value >= asset.purchasePrice ? '+' : ''}{((asset.value - asset.purchasePrice) / asset.purchasePrice * 100).toFixed(1)}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIABILITIES COLUMN */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CreditCard className="w-5 h-5 text-red-500" /> Liabilities
                    <span className="ml-auto text-red-400">-${totalLiabilitiesValue.toLocaleString()}</span>
                </h2>

                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                     <div className="bg-slate-950 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 flex justify-between">
                        <span>Loans & Debt</span>
                        <button className="text-brand-400 hover:text-brand-300 text-[10px]">+ Add Liability</button>
                    </div>
                    <div className="divide-y divide-slate-800">
                        {liabilities.map(liab => (
                            <div key={liab.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-900/20 border border-red-500/20 flex items-center justify-center">
                                        {liab.type === 'Mortgage' ? <Landmark className="w-4 h-4 text-red-400" /> : <CreditCard className="w-4 h-4 text-red-400" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{liab.name}</div>
                                        <div className="text-xs text-slate-500">{liab.interestRate}% APR • ${liab.monthlyPayment}/mo</div>
                                    </div>
                                </div>
                                <div className="font-bold text-white">-${liab.amount.toLocaleString()}</div>
                            </div>
                        ))}
                         {liabilities.length === 0 && (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                Debt free! Add a mortgage or loan to track it.
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/20 flex gap-3 items-start">
                    <Percent className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-indigo-400">Liquidity Analysis</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            Your <span className="text-white font-medium">Asset-to-Liability Ratio</span> is <span className="text-white font-medium">{(totalAssetsValue / (totalLiabilitiesValue || 1)).toFixed(2)}</span>. 
                            A ratio above 2.0 is considered healthy for long-term wealth building.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

export default NetWorthView;
