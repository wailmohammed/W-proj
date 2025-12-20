
import React, { useState } from 'react';
import { LayoutDashboard, PieChart, DollarSign, Search, Users, Settings, LogOut, Activity, ChevronDown, PlusCircle, Check, Shield, Bell, X, BarChart2, Landmark, Crown, Moon, Sun, Cloud, CloudOff, Star } from 'lucide-react';
import { ViewState } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const { 
      portfolios = [], 
      activePortfolioId, 
      activeView,
      switchView,
      openAddAssetModal
  } = usePortfolio();

  const safePortfolios = Array.isArray(portfolios) ? portfolios : [];
  const activePortfolio = safePortfolios.find(p => p.id === activePortfolioId) || safePortfolios[0] || { id: 'default', name: 'Main Wealth', type: 'Mixed' };
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'holdings', label: 'Holdings', icon: PieChart },
    { id: 'networth', label: 'Net Worth', icon: Landmark },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'dividends', label: 'Dividends', icon: DollarSign },
    { id: 'research', label: 'Research', icon: Search },
    { id: 'community', label: 'Community', icon: Users },
  ];

  const handleNavigation = (view: ViewState) => {
    switchView(view);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
            onClick={onClose} 
        />
      )}
      
      <div className={`flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-600/20">
                    <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">WealthOS</span>
             </div>
             <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="mb-8">
            <button 
                onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)} 
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-brand-500/30 transition-all group"
            >
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Active Portfolio</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{activePortfolio.name}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <button 
            onClick={() => { openAddAssetModal(); if(window.innerWidth < 768) onClose(); }} 
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95"
          >
              <PlusCircle className="w-4 h-4" /> Add Holding
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button 
                key={item.id} 
                onClick={() => handleNavigation(item.id as ViewState)} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeView === item.id ? 'bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-brand-500'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium rounded-lg">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
          <button onClick={() => handleNavigation('settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium rounded-lg">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
