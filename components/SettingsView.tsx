
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { User, Shield, CreditCard, LogOut, CheckCircle, Copy, Check, X, Loader2, Link as LinkIcon, Plus, RefreshCw, FileSpreadsheet, UploadCloud, Briefcase, Layers, Network, Eye, Edit2 } from 'lucide-react';
import { PlanTier, CryptoWallet } from '../types';

const SettingsView: React.FC = () => {
  const { user, logout, plans, wallets, updateUserPlan, integrations, connectBroker, disconnectBroker, brokerProviders } = useAuth();
  const { addNewPortfolio } = usePortfolio();
  const [activeSection, setActiveSection] = useState<'profile' | 'billing' | 'security' | 'integrations'>('profile');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);

  const activeProvider = brokerProviders.find(p => p.id === selectedProviderId);

  const handleConnectSuccess = (providerId: string, name: string, type: string, logo: string, credentials: any) => {
      // 1. Add to Auth Context Integrations list (Also handles updates)
      connectBroker(providerId, name, type as any, logo, credentials);
      
      // 2. Simulate syncing data only if it's a NEW connection (not an update)
      if (!integrations.find(i => i.providerId === providerId)) {
        addNewPortfolio(name, type as any);
      }
      
      setShowConnectModal(false);
  };

  const openEditModal = (integration: { providerId: string }) => {
      setSelectedProviderId(integration.providerId);
      setShowConnectModal(true);
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="space-y-2">
            <button 
                onClick={() => setActiveSection('profile')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <User className="w-5 h-5" /> Profile
            </button>
            <button 
                onClick={() => setActiveSection('integrations')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'integrations' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <LinkIcon className="w-5 h-5" /> Integrations
            </button>
            <button 
                onClick={() => setActiveSection('billing')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'billing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <CreditCard className="w-5 h-5" /> Subscription
            </button>
            <button 
                onClick={() => setActiveSection('security')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeSection === 'security' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
                <Shield className="w-5 h-5" /> Security
            </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
            
            {/* PROFILE SECTION */}
            {activeSection === 'profile' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Profile Details</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-3xl font-bold text-white">
                            {user?.name[0]}
                        </div>
                        <div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white text-sm px-4 py-2 rounded-lg border border-slate-700 transition-colors">
                                Change Avatar
                            </button>
                            <div className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size 800K</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                            <input type="text" defaultValue={user?.name} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                            <input type="email" defaultValue={user?.email} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" disabled />
                        </div>
                    </div>
                    <div className="pt-4">
                        <button className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            )}

            {/* INTEGRATIONS SECTION */}
            {activeSection === 'integrations' && (
                <div className="space-y-8">
                     {/* Connected Integrations */}
                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> Connected Accounts
                        </h2>
                        {integrations.length > 0 ? (
                            <div className="space-y-4">
                                {integrations.map(integration => (
                                    <div key={integration.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            {integration.logo ? (
                                                <img src={integration.logo} alt={integration.name} className="w-10 h-10 rounded-lg bg-white p-1 object-contain" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                                                    <FileSpreadsheet className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white">{integration.name}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${integration.status === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                    {integration.status}
                                                    <span className="text-slate-600">•</span>
                                                    Last synced: {integration.lastSync}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="p-2 text-slate-400 hover:text-brand-400 transition-colors" title="Sync Now">
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(integration)}
                                                className="p-2 text-slate-400 hover:text-brand-400 transition-colors" 
                                                title="Edit Credentials"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => disconnectBroker(integration.id)}
                                                className="px-3 py-1.5 text-xs font-bold text-red-400 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No brokerage accounts connected yet. Connect one below to sync your portfolio automatically.
                            </div>
                        )}
                     </div>

                     {/* Available Providers */}
                     <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-brand-500" /> Connect New Account
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Manual Import Card */}
                            <button 
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-4 p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group text-left"
                            >
                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-brand-500/50">
                                    <FileSpreadsheet className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white group-hover:text-brand-400 transition-colors">Manual Import</div>
                                    <div className="text-xs text-slate-500">CSV / Excel Upload</div>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                    Import
                                </div>
                            </button>

                            {/* API Providers from Context */}
                            {brokerProviders.filter(p => p.isEnabled && !integrations.find(i => i.providerId === p.id)).map(provider => (
                                <button 
                                    key={provider.id}
                                    onClick={() => {
                                        setSelectedProviderId(provider.id);
                                        setShowConnectModal(true);
                                    }}
                                    className="flex items-center gap-4 p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group text-left"
                                >
                                    <img src={provider.logo} alt={provider.name} className="w-12 h-12 rounded-lg bg-white p-1 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                                    <div className="flex-1">
                                        <div className="font-bold text-white group-hover:text-brand-400 transition-colors">{provider.name}</div>
                                        <div className="text-xs text-slate-500">{provider.type}</div>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                        Connect
                                    </div>
                                </button>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4">Security</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Current Password</label>
                            <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">New Password</label>
                            <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-between items-center">
                        <button className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                            Update Password
                        </button>
                        <button onClick={logout} className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign out of all devices
                        </button>
                    </div>
                </div>
            )}

            {/* BILLING / SUBSCRIPTION SECTION */}
            {activeSection === 'billing' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex justify-between items-center">
                        <div>
                            <div className="text-sm text-slate-400">Current Plan</div>
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                {user?.plan} Tier
                                {user?.plan !== 'Free' && <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">Active</span>}
                            </div>
                            {user?.plan === 'Free' ? (
                                <div className="text-sm text-slate-500 mt-1">Upgrade to unlock advanced analytics and automatic syncing.</div>
                            ) : (
                                <div className="text-sm text-emerald-400 mt-1">Next billing date: Oct 24, 2023</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className={`relative bg-slate-900 border rounded-xl p-6 flex flex-col transition-all ${user?.plan === plan.id ? 'border-brand-500 shadow-lg shadow-brand-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                                {plan.isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>}
                                <div className="mb-4 text-center border-b border-slate-800 pb-4">
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                                    <div className="flex items-end justify-center gap-1 mt-3">
                                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                                        <span className="text-slate-500 mb-1">/mo</span>
                                    </div>
                                </div>
                                
                                {/* Limits Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Briefcase className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.portfolios === -1 ? '∞' : plan.limits.portfolios}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Ports</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Layers className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.holdings === -1 ? '∞' : plan.limits.holdings}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Holds</div>
                                    </div>
                                     <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Network className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.connections === -1 ? '∞' : plan.limits.connections}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Conns</div>
                                    </div>
                                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                                        <Eye className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                        <div className="text-xs font-bold text-white">{plan.limits.watchlists === -1 ? '∞' : plan.limits.watchlists}</div>
                                        <div className="text-[9px] text-slate-500 uppercase">Watch</div>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                            <CheckCircle className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                                            <span className="leading-tight text-xs">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    disabled={user?.plan === plan.id}
                                    onClick={() => {
                                        setSelectedPlan(plan.id);
                                        setShowPaymentModal(true);
                                    }}
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${user?.plan === plan.id ? 'bg-slate-800 text-slate-500 cursor-default' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
                                >
                                    {user?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Manual Import Modal */}
        {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-brand-600/20 p-2 rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Import Portfolio Data</h3>
                        </div>
                        <button onClick={() => setShowImportModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                    </div>
                    <div className="p-8">
                        <div className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/50 group">
                            <UploadCloud className="w-16 h-16 text-slate-600 group-hover:text-brand-500 mb-4 transition-colors" />
                            <p className="text-lg font-medium text-white mb-2">Drop your CSV file here</p>
                            <p className="text-sm text-slate-500 mb-6">or click to browse from your computer</p>
                            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                                Select File
                            </button>
                        </div>
                        <div className="mt-6 flex justify-between items-center text-xs text-slate-500">
                            <div>Supported formats: .CSV, .XLSX</div>
                            <button className="text-brand-400 hover:underline">Download Template</button>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                        <button 
                            onClick={() => setShowImportModal(false)}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                         <button 
                            onClick={() => {
                                handleConnectSuccess('manual_import', 'Manual Import', 'Mixed', '', {});
                                setShowImportModal(false);
                            }}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-colors"
                        >
                            Import Data
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Connect Broker Modal */}
        {showConnectModal && activeProvider && (
            <ConnectBrokerModal 
                provider={activeProvider}
                onClose={() => setShowConnectModal(false)}
                onSuccess={(credentials) => handleConnectSuccess(
                    activeProvider.id, 
                    activeProvider.name, 
                    activeProvider.type, 
                    activeProvider.logo,
                    credentials
                )}
                existingCredentials={integrations.find(i => i.providerId === activeProvider.id)?.apiCredentials}
            />
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
            <PaymentModal 
                planId={selectedPlan} 
                wallets={wallets.filter(w => w.isEnabled)}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={(planId) => {
                    updateUserPlan(planId);
                    setShowPaymentModal(false);
                    setActiveSection('billing');
                }}
                price={plans.find(p => p.id === selectedPlan)?.price || 0}
            />
        )}
      </div>
    </div>
  );
};

const ConnectBrokerModal: React.FC<{
    provider: { id: string, name: string, type: string, logo: string },
    onClose: () => void,
    onSuccess: (creds: any) => void,
    existingCredentials?: { apiKey: string, apiSecret?: string }
}> = ({ provider, onClose, onSuccess, existingCredentials }) => {
    const [apiKey, setApiKey] = useState(existingCredentials?.apiKey || '');
    const [apiSecret, setApiSecret] = useState(existingCredentials?.apiSecret || '');
    const [connecting, setConnecting] = useState(false);

    const isEditing = !!existingCredentials;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setConnecting(true);
        // Simulate connection delay
        setTimeout(() => {
            onSuccess({ apiKey, apiSecret });
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src={provider.logo} alt={provider.name} className="w-8 h-8 rounded bg-white p-0.5 object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40'} />
                        <h3 className="text-xl font-bold text-white">{isEditing ? 'Update' : 'Connect'} {provider.name}</h3>
                    </div>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {provider.type === 'Crypto' ? (
                        <>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300 mb-4">
                                API Keys are stored securely. Please ensure you have enabled "Read Only" permissions on your exchange.
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">API Key</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={apiKey}
                                    onChange={e => setApiKey(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none font-mono text-sm" 
                                    placeholder="Enter your public API key" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1.5">API Secret</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={apiSecret}
                                    onChange={e => setApiSecret(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none font-mono text-sm" 
                                    placeholder="Enter your secret key" 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-slate-400 text-sm mb-6">
                                You will be redirected to {provider.name} to authorize WealthOS to access your portfolio data securely.
                            </p>
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 mb-4">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="h-px w-12 bg-slate-700"></div>
                                    <img src={provider.logo} className="w-10 h-10 rounded-full bg-white p-1" alt="" />
                                </div>
                                <div className="mt-3 text-xs text-slate-500">Secure OAuth 2.0 Connection</div>
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={connecting}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {connecting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> {isEditing ? 'Updating...' : 'Connecting...'}</>
                        ) : (
                            `${isEditing ? 'Update' : 'Connect'} ${provider.name}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

const PaymentModal: React.FC<{ 
    planId: PlanTier, 
    wallets: CryptoWallet[], 
    onClose: () => void, 
    onSuccess: (id: PlanTier) => void,
    price: number
}> = ({ planId, wallets, onClose, onSuccess, price }) => {
    const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id);
    const [step, setStep] = useState<'select' | 'payment' | 'confirming'>('select');
    
    const activeWallet = wallets.find(w => w.id === selectedWalletId);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // In a real app, show a toast
    };

    const handleConfirm = () => {
        setStep('confirming');
        // Simulate network check
        setTimeout(() => {
            onSuccess(planId);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Subscribe to {planId}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    {step === 'select' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-sm text-slate-400">Total to pay</div>
                                <div className="text-4xl font-bold text-white mt-1">${price.toFixed(2)}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-3">Select Payment Method (Crypto Only)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {wallets.map(w => (
                                        <button 
                                            key={w.id}
                                            onClick={() => setSelectedWalletId(w.id)}
                                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedWalletId === w.id ? 'bg-brand-600/10 border-brand-500 ring-1 ring-brand-500' : 'bg-slate-950 border-slate-700 hover:border-slate-600'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                                                {w.coin[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{w.coin}</div>
                                                <div className="text-[10px] text-slate-500">{w.network}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setStep('payment')}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 'payment' && activeWallet && (
                         <div className="space-y-6">
                             <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                                 <div className="text-sm text-slate-400 mb-2">Send exactly <span className="text-white font-bold">${price.toFixed(2)}</span> equivalent in {activeWallet.coin} to:</div>
                                 <div className="bg-white p-2 inline-block rounded-lg mb-4">
                                     {/* Placeholder QR */}
                                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeWallet.address}`} alt="QR" className="w-32 h-32" />
                                 </div>
                                 <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-3">
                                     <code className="text-xs text-slate-300 break-all font-mono">{activeWallet.address}</code>
                                     <button onClick={() => handleCopy(activeWallet.address)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                                         <Copy className="w-4 h-4" />
                                     </button>
                                 </div>
                                 <div className="text-xs text-amber-400 mt-3 flex items-center justify-center gap-1">
                                     <CheckCircle className="w-3 h-3" /> Ensure you send on {activeWallet.network} network
                                 </div>
                             </div>

                             <button 
                                onClick={handleConfirm}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                I have sent the payment
                            </button>
                             <button 
                                onClick={() => setStep('select')}
                                className="w-full text-slate-400 text-sm hover:text-white mt-2"
                            >
                                Go Back
                            </button>
                         </div>
                    )}

                    {step === 'confirming' && (
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Verifying Transaction...</h3>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">Please wait while we confirm your payment on the blockchain. Do not close this window.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsView;
