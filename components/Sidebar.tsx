
import React, { useState } from 'react';
import { LayoutDashboard, PieChart, DollarSign, Search, Users, Settings, LogOut, Activity, ChevronDown, PlusCircle, Check, Shield, Bell, X, BarChart2, Landmark, Crown, Moon, Sun } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar: React.FC = () => {
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Use Portfolio Context for Global State
  const { 
      portfolios, 
      activePortfolioId, 
      switchPortfolio, 
      openAddAssetModal,
      notifications,
      markAsRead,
      clearNotifications,
      activeView,
      switchView
  } = usePortfolio();

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'networth', label: 'Net Worth', icon: Landmark }, // New Item
    { id: 'holdings', label: 'Portfolio', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'dividends', label: 'Dividends', icon: DollarSign },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'community', label: 'Community', icon: Users },
  ];

  // Both roles access the panel, but Super Admin sees "Super Admin" label
  const isAdminAccess = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0 z-10 transition-colors duration-300">
      <div className="p-4">
        {/* Portfolio Switcher */}
        <div className="relative mb-4">
          <button 
            onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
          >
            <div className="bg-brand-600 p-2.5 rounded-lg shadow-lg shadow-brand-600/20 group-hover:shadow-brand-500/40 transition-all">
                <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">WealthOS</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{activePortfolio.name}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Portfolio Dropdown */}
          {isPortfolioMenuOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
              <div className="p-2 space-y-1">
                {portfolios.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchPortfolio(p.id);
                      setIsPortfolioMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      activePortfolioId === p.id 
                        ? 'bg-brand-50 text-brand-600 dark:bg-indigo-600/10 dark:text-indigo-400' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.type}</span>
                    </div>
                    {activePortfolioId === p.id && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950/30">
                 <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <PlusCircle className="w-4 h-4" />
                    Create Portfolio
                 </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Add Button */}
        <button 
            onClick={() => openAddAssetModal()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-lg transition-all mb-2"
        >
            <PlusCircle className="w-4 h-4 text-brand-600 dark:text-emerald-400" /> Add Transaction
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => switchView(item.id as ViewState)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              activeView === item.id
                ? 'bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-500 shadow-sm border border-slate-200 dark:border-slate-700/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-brand-600 dark:text-brand-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
        
        {/* Admin Link for BOTH Roles */}
        {isAdminAccess && (
            <button
                onClick={() => switchView('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mt-4 border border-dashed border-brand-200 dark:border-brand-500/30 ${
                  activeView === 'admin'
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                    : 'text-brand-500/80 hover:bg-brand-50 dark:hover:bg-brand-900/10'
                }`}
            >
                {user?.role === 'SUPER_ADMIN' ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                <span className="font-medium">
                    {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin Panel'}
                </span>
            </button>
        )}
      </nav>

      {/* Bottom Section with Notifications & Settings */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 relative">
        
        {/* Notification Bell */}
        <div className="mb-1 px-1">
             <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="w-5 h-5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        )}
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Notifications</span>
                </div>
                {unreadCount > 0 && (
                    <span className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold px-1.5 py-0.5 rounded">{unreadCount}</span>
                )}
             </button>
        </div>

        {/* Notifications Popover */}
        {isNotifOpen && (
            <div className="absolute bottom-full left-4 w-[300px] mb-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in-up">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Alerts & Updates</span>
                    {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white">Clear All</button>
                    )}
                </div>
                <div className="max-h-[240px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">No new notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => markAsRead(n.id)}
                                className={`p-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${n.read ? 'opacity-50' : 'bg-slate-50 dark:bg-slate-800/20'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold ${n.type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : n.type === 'warning' ? 'text-amber-500 dark:text-amber-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                        {n.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-600">{n.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          onClick={() => switchView('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeView === 'settings'
             ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
             : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
