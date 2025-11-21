
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PortfolioView from './components/PortfolioView';
import ResearchView from './components/ResearchView';
import CommunityView from './components/CommunityView';
import DashboardView from './components/DashboardView';
import DividendsView from './components/DividendsView';
import AnalyticsView from './components/AnalyticsView';
import SettingsView from './components/SettingsView';
import AdminView from './components/AdminView';
import NetWorthView from './components/NetWorthView';
import KnowledgeBaseView from './components/KnowledgeBaseView';
import AddAssetModal from './components/AddAssetModal';
import AIAssistant from './components/AIAssistant';
import Footer from './components/Footer';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2, Menu, Activity } from 'lucide-react';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Access Portfolio Context for view state and modal
  const portfolio = usePortfolio();
  const activeView = portfolio?.activeView || 'dashboard';
  const isAddAssetModalOpen = portfolio?.isAddAssetModalOpen || false;

  if (loading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-200">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                <div className="text-sm font-medium">Initializing WealthOS...</div>
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return authView === 'login' 
      ? <Login onRegisterClick={() => setAuthView('register')} />
      : <Register onLoginClick={() => setAuthView('login')} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent relative flex flex-col">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-brand-600 p-1.5 rounded-lg">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">WealthOS</span>
                </div>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {activeView.replace('-', ' ')}
            </div>
        </div>

        <div className="flex-1 p-4 md:p-8 pb-0">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'networth' && <NetWorthView />}
          {activeView === 'holdings' && <PortfolioView />}
          {activeView === 'research' && <ResearchView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'community' && <CommunityView />}
          {activeView === 'dividends' && <DividendsView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView === 'admin' && <AdminView />}
          {activeView === 'knowledge-base' && <KnowledgeBaseView />}
        </div>
        
        <Footer />
      </main>

      {/* Global Modals & Overlay Components */}
      {isAddAssetModalOpen && <AddAssetModal />}
      <AIAssistant />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <ThemeProvider>
          <AuthenticatedApp />
        </ThemeProvider>
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;
