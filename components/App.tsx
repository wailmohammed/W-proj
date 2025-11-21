
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
import { Loader2 } from 'lucide-react';

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Access Portfolio Context for view state and modal
  // We use optional chaining or check availability because PortfolioContext might not be ready if Auth is loading
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
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent relative flex flex-col">
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
