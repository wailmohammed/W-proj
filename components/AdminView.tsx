
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Trash2, Plus, X, Wallet, Users, DollarSign, Crown, LayoutGrid, Lock, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { CryptoWallet, PlanTier, BrokerProvider } from '../types';

const AdminView: React.FC = () => {
  const { 
      user: currentUser, 
      wallets, 
      addWallet, 
      removeWallet, 
      toggleWallet, 
      plans, 
      updatePlanPrice, 
      allUsers,
      deleteUser,
      updateUserRole,
      brokerProviders,
      addBrokerProvider,
      removeBrokerProvider,
      updateBrokerProvider
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'users' | 'plans' | 'brokers'>('overview');
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);
  const [isAddBrokerModalOpen, setIsAddBrokerModalOpen] = useState(false);
  
  // New Wallet Form State
  const [newCoin, setNewCoin] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // New Broker Form State
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerType, setNewBrokerType] = useState<'Stock' | 'Crypto' | 'Mixed'>('Stock');
  const [newBrokerLogo, setNewBrokerLogo] = useState('');

  // SUPER_ADMIN (Wail) is Top Level with Payment Control
  // ADMIN is Secondary with No Payment Control
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    addWallet({
        coin: newCoin,
        network: newNetwork,
        address: newAddress,
        isEnabled: true
    });
    setIsAddWalletModalOpen(false);
    setNewCoin('');
    setNewNetwork('');
    setNewAddress('');
  };

  const handleAddBroker = (e: React.FormEvent) => {
      e.preventDefault();
      const id = newBrokerName.toLowerCase().replace(/\s+/g, '-');
      addBrokerProvider({
          id,
          name: newBrokerName,
          type: newBrokerType,
          logo: newBrokerLogo || 'https://logo.clearbit.com/google.com', // Default fallback
          isEnabled: true
      });
      setIsAddBrokerModalOpen(false);
      setNewBrokerName('');
      setNewBrokerType('Stock');
      setNewBrokerLogo('');
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    {isSuperAdmin ? <Crown className="w-8 h-8 text-amber-400" /> : <Shield className="w-8 h-8 text-brand-500" />} 
                    {isSuperAdmin ? 'Super Admin Control Center' : 'Admin Dashboard'}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {isSuperAdmin 
                        ? 'Full system access: Manage Users, Projects, Brokers, and Payment Systems.' 
                        : 'Manage Users and Projects. Payment settings are restricted.'}
                </p>
            </div>
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <LayoutGrid className="w-4 h-4" /> Overview
                </button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Users className="w-4 h-4" /> Users
                </button>
                 <button onClick={() => setActiveTab('brokers')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'brokers' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <LinkIcon className="w-4 h-4" /> Brokers
                </button>
                {isSuperAdmin && (
                    <>
                        <button onClick={() => setActiveTab('wallets')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'wallets' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <Wallet className="w-4 h-4" /> Payments
                        </button>
                        <button onClick={() => setActiveTab('plans')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'plans' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                            <DollarSign className="w-4 h-4" /> Plans
                        </button>
                    </>
                )}
            </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Users</div>
                    <div className="text-4xl font-bold text-white">{allUsers.length}</div>
                    <div className="text-emerald-400 text-sm mt-2 flex items-center gap-1"><TrendingUpIcon className="w-4 h-4" /> +12% this month</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Active Subscriptions</div>
                    <div className="text-4xl font-bold text-white">{allUsers.filter(u => u.plan !== 'Free').length}</div>
                    {isSuperAdmin ? (
                        <div className="text-indigo-400 text-sm mt-2">
                            ${allUsers.reduce((acc, curr) => acc + (plans.find(p => p.id === curr.plan)?.price || 0), 0)} / mo revenue
                        </div>
                    ) : (
                         <div className="text-slate-500 text-xs mt-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Revenue hidden</div>
                    )}
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Supported Brokers</div>
                    <div className="text-4xl font-bold text-emerald-400">{brokerProviders.length}</div>
                    <div className="text-slate-500 text-sm mt-2">Integrations available</div>
                </div>
            </div>
        )}

        {/* BROKERS TAB */}
        {activeTab === 'brokers' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white">Brokerage Integrations</h3>
                        <p className="text-xs text-slate-400">Manage the list of supported brokers that users can connect to.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddBrokerModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Broker
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brokerProviders.map(provider => (
                        <div key={provider.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-colors">
                             <div className="flex items-center gap-3">
                                <img src={provider.logo} alt={provider.name} className="w-10 h-10 rounded-lg bg-white p-1 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                                <div>
                                    <div className="font-bold text-white text-sm">{provider.name}</div>
                                    <div className="text-xs text-slate-500">{provider.type}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => updateBrokerProvider(provider.id, { isEnabled: !provider.isEnabled })}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${provider.isEnabled ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}
                                >
                                    {provider.isEnabled ? 'Active' : 'Disabled'}
                                </button>
                                <button 
                                    onClick={() => removeBrokerProvider(provider.id)}
                                    className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* WALLETS TAB (SUPER ADMIN ONLY) */}
        {activeTab === 'wallets' && isSuperAdmin && (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-white">Crypto Wallets</h2>
                        <p className="text-sm text-slate-400">Manage payment addresses shown to users.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddWalletModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Wallet
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {wallets.map(wallet => (
                        <div key={wallet.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${wallet.isEnabled ? 'bg-slate-800 text-white' : 'bg-slate-950 text-slate-600'}`}>
                                    {wallet.coin[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        {wallet.coin} <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{wallet.network}</span>
                                        {!wallet.isEnabled && <span className="text-xs text-red-400">(Disabled)</span>}
                                    </div>
                                    <div className="text-sm text-slate-500 font-mono mt-1 break-all">{wallet.address}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => toggleWallet(wallet.id)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${wallet.isEnabled ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
                                >
                                    {wallet.isEnabled ? 'Disable' : 'Enable'}
                                </button>
                                <button 
                                    onClick={() => removeWallet(wallet.id)}
                                    className="p-2 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">User Management</h3>
                    <div className="text-xs text-slate-500 italic">
                        {isSuperAdmin ? 'Full Access' : 'Restricted Access (Cannot modify Super Admins)'}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {allUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${u.role === 'SUPER_ADMIN' ? 'bg-amber-600' : u.role === 'ADMIN' ? 'bg-brand-600' : 'bg-slate-700'}`}>
                                                {u.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{u.name}</div>
                                                <div className="text-slate-500 text-xs">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-fit ${
                                            u.role === 'SUPER_ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                            u.role === 'ADMIN' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 
                                            'bg-slate-800 text-slate-300'
                                        }`}>
                                            {u.role === 'SUPER_ADMIN' && <Crown className="w-3 h-3" />}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                            u.plan === 'Ultimate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            u.plan === 'Pro' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                            {u.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{u.joinedDate}</td>
                                    <td className="px-6 py-4 text-right">
                                        {(isSuperAdmin || (u.role === 'USER')) && u.id !== currentUser?.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                {u.role === 'USER' && (
                                                    <>
                                                        {isSuperAdmin && (
                                                            <button 
                                                                onClick={() => updateUserRole(u.id, 'SUPER_ADMIN')}
                                                                className="text-amber-400 hover:text-amber-300 text-xs font-bold px-2 py-1 bg-amber-400/10 rounded hover:bg-amber-400/20 transition-colors"
                                                            >
                                                                Make Super
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => updateUserRole(u.id, 'ADMIN')}
                                                            className="text-brand-400 hover:text-brand-300 text-xs font-bold px-2 py-1 bg-brand-400/10 rounded hover:bg-brand-400/20 transition-colors"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    </>
                                                )}
                                                {(u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') && isSuperAdmin && (
                                                    <button 
                                                        onClick={() => updateUserRole(u.id, 'USER')}
                                                        className="text-slate-400 hover:text-slate-300 text-xs font-bold px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        if(confirm('Are you sure you want to delete this user?')) deleteUser(u.id);
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-600 cursor-not-allowed flex items-center justify-end gap-1">
                                                <Lock className="w-3 h-3" /> Protected
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* PLANS TAB (SUPER ADMIN ONLY) */}
        {activeTab === 'plans' && isSuperAdmin && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                            {plan.id === 'Ultimate' && <div className="text-xs bg-amber-500 text-slate-900 px-2 py-1 rounded font-bold">Premium</div>}
                        </div>
                        <div className="flex items-end gap-1 mb-6">
                             <span className="text-3xl font-bold text-white">${plan.price}</span>
                             <span className="text-slate-500 mb-1">/mo</span>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-400 uppercase font-bold text-[10px]">Ports</div>
                                <div className="text-white font-bold">{plan.limits.portfolios === -1 ? 'Unl' : plan.limits.portfolios}</div>
                            </div>
                             <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-400 uppercase font-bold text-[10px]">Holds</div>
                                <div className="text-white font-bold">{plan.limits.holdings === -1 ? 'Unl' : plan.limits.holdings}</div>
                            </div>
                             <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-400 uppercase font-bold text-[10px]">Conns</div>
                                <div className="text-white font-bold">{plan.limits.connections === -1 ? 'Unl' : plan.limits.connections}</div>
                            </div>
                            <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                <div className="text-slate-400 uppercase font-bold text-[10px]">Watch</div>
                                <div className="text-white font-bold">{plan.limits.watchlists === -1 ? 'Unl' : plan.limits.watchlists}</div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Update Price</div>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="bg-slate-950 border border-slate-700 rounded px-3 py-2 w-full text-white focus:border-brand-500 outline-none"
                                    defaultValue={plan.price}
                                    onBlur={(e) => updatePlanPrice(plan.id as PlanTier, Number(e.target.value))}
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                             {plan.features.slice(0, 3).map((f, i) => (
                                 <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                     <CheckCircle className="w-4 h-4 text-brand-500" /> {f}
                                 </div>
                             ))}
                             <div className="text-xs text-slate-500 pt-2">+ More features...</div>
                         </div>
                    </div>
                ))}
             </div>
        )}

        {/* Add Wallet Modal */}
        {isAddWalletModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Add Crypto Wallet</h3>
                        <button onClick={() => setIsAddWalletModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <form onSubmit={handleAddWallet} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Coin Name</label>
                            <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. Bitcoin" value={newCoin} onChange={e => setNewCoin(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Network</label>
                            <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. ERC20, BEP20" value={newNetwork} onChange={e => setNewNetwork(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Wallet Address</label>
                            <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono" placeholder="0x..." value={newAddress} onChange={e => setNewAddress(e.target.value)} />
                        </div>
                        <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg mt-2">Add Wallet</button>
                    </form>
                </div>
            </div>
        )}

        {/* Add Broker Modal */}
        {isAddBrokerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Add Brokerage Provider</h3>
                        <button onClick={() => setIsAddBrokerModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <form onSubmit={handleAddBroker} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Broker Name</label>
                            <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="e.g. Charles Schwab" value={newBrokerName} onChange={e => setNewBrokerName(e.target.value)} />
                        </div>
                         <div>
                            <label className="block text-sm text-slate-400 mb-1">Platform Type</label>
                            <select 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                value={newBrokerType} 
                                onChange={(e) => setNewBrokerType(e.target.value as any)}
                            >
                                <option value="Stock">Stock Broker</option>
                                <option value="Crypto">Crypto Exchange</option>
                                <option value="Mixed">Mixed / Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Logo URL</label>
                            <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" placeholder="https://..." value={newBrokerLogo} onChange={e => setNewBrokerLogo(e.target.value)} />
                             <div className="mt-2 text-xs text-slate-500">Tip: Use clearbit logo API or a direct image link.</div>
                        </div>
                        <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg mt-2">Create Provider</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

function TrendingUpIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    )
}

export default AdminView;
