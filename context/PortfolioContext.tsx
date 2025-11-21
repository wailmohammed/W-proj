

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Portfolio, Holding, PortfolioSummary, Transaction, Notification, ViewState, AssetType, Watchlist } from '../types';
import { MOCK_PORTFOLIOS_LIST, MOCK_PORTFOLIO, MOCK_MARKET_ASSETS } from '../constants';

interface PortfolioContextType {
  // Portfolio Data
  portfolios: PortfolioSummary[];
  activePortfolio: Portfolio;
  activePortfolioId: string;
  switchPortfolio: (id: string) => void;
  addNewPortfolio: (name: string, type: 'Stock' | 'Crypto' | 'Mixed') => void;
  
  // Transactions
  addTransaction: (assetId: string, type: 'BUY' | 'SELL', shares: number, price: number, date: string) => void;
  
  // Watchlists
  watchlists: Watchlist[];
  activeWatchlistId: string;
  toggleWatchlist: (symbol: string) => void;
  createWatchlist: (name: string) => void;
  switchWatchlist: (id: string) => void;

  // Navigation & Views
  activeView: ViewState;
  switchView: (view: ViewState) => void;
  selectedResearchSymbol: string;
  viewStock: (symbol: string) => void;
  
  // Notification System
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // UI State
  isAddAssetModalOpen: boolean;
  preSelectedAssetTicker: string | null;
  openAddAssetModal: (ticker?: string) => void;
  closeAddAssetModal: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [selectedResearchSymbol, setSelectedResearchSymbol] = useState<string>('AAPL');

  // Portfolio State
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>(MOCK_PORTFOLIOS_LIST);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('p1');
  const [activePortfolio, setActivePortfolio] = useState<Portfolio>(MOCK_PORTFOLIO);
  
  // Watchlists State
  const [watchlists, setWatchlists] = useState<Watchlist[]>([
      { id: 'w1', name: 'My Watchlist', symbols: ['TSLA', 'GOOGL'] }
  ]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('w1');

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', type: 'info', title: 'Dividend Received', message: 'Received $12.40 from $O (Realty Income)', timestamp: '2h ago', read: false },
    { id: 'n2', type: 'warning', title: 'Price Alert', message: '$TSLA dropped below $220 target.', timestamp: '5h ago', read: false }
  ]);

  // Modal State
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [preSelectedAssetTicker, setPreSelectedAssetTicker] = useState<string | null>(null);

  // Recalculate totals when holdings change
  useEffect(() => {
    const totalValue = activePortfolio.holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    setActivePortfolio(prev => ({ ...prev, totalValue }));
  }, [activePortfolio.holdings]);

  const switchPortfolio = (id: string) => {
    setActivePortfolioId(id);
    const summary = portfolios.find(p => p.id === id);
    if (summary) {
        // In a real app, fetch the specific portfolio data here
        setActivePortfolio(prev => ({
            ...prev,
            id: summary.id,
            name: summary.name,
            // For demo purposes, we randomize value slightly to simulate different portfolios
            totalValue: prev.totalValue * (0.8 + Math.random() * 0.4),
            transactions: prev.transactions || [] // Ensure transactions exist
        }));
    }
  };

  const addNewPortfolio = (name: string, type: 'Stock' | 'Crypto' | 'Mixed') => {
      const newId = `p${Date.now()}`;
      const newSummary: PortfolioSummary = { id: newId, name, type };
      
      setPortfolios(prev => [...prev, newSummary]);
      
      // Simulate generating holdings for the new portfolio
      if (name.includes('Broker') || name.includes('Exchange')) {
         const mockHoldings = MOCK_MARKET_ASSETS.slice(0, 5).map(a => ({
             ...a,
             shares: Math.floor(Math.random() * 50) + 1,
             id: Math.random().toString(36).substr(2, 9)
         }));
         
         // Add notification
         setNotifications(prev => [{
             id: Date.now().toString(),
             type: 'success',
             title: 'Integration Successful',
             message: `Successfully synced ${mockHoldings.length} holdings from ${name}.`,
             timestamp: 'Just now',
             read: false
         }, ...prev]);

         // Switch to it if it's the active one (logic could be added here)
      }
  };

  const switchView = (view: ViewState) => {
      setActiveView(view);
  };

  const viewStock = (symbol: string) => {
      setSelectedResearchSymbol(symbol);
      setActiveView('research');
  };

  const addTransaction = (assetId: string, type: 'BUY' | 'SELL', shares: number, price: number, date: string) => {
    const marketAsset = MOCK_MARKET_ASSETS.find(a => a.id === assetId);
    if (!marketAsset) return;

    setActivePortfolio(prev => {
        const existingHoldingIndex = prev.holdings.findIndex(h => h.symbol === marketAsset.symbol);
        let newHoldings = [...prev.holdings];
        let cashImpact = shares * price;

        if (type === 'BUY') {
             if (existingHoldingIndex >= 0) {
                 const h = newHoldings[existingHoldingIndex];
                 const totalCost = (h.shares * h.avgPrice) + (shares * price);
                 const totalShares = h.shares + shares;
                 newHoldings[existingHoldingIndex] = {
                     ...h,
                     shares: totalShares,
                     avgPrice: totalCost / totalShares
                 };
             } else {
                 newHoldings.push({
                     ...marketAsset,
                     shares: shares,
                     avgPrice: price,
                     id: Math.random().toString(36).substr(2, 9)
                 });
             }
        } else {
             if (existingHoldingIndex >= 0) {
                 const h = newHoldings[existingHoldingIndex];
                 const remainingShares = h.shares - shares;
                 if (remainingShares <= 0) {
                     newHoldings.splice(existingHoldingIndex, 1);
                 } else {
                     newHoldings[existingHoldingIndex] = { ...h, shares: remainingShares };
                 }
             }
        }

        const newNotif: Notification = {
            id: Date.now().toString(),
            type: 'success',
            title: 'Transaction Successful',
            message: `${type} ${shares} shares of ${marketAsset.symbol} at $${price}`,
            timestamp: 'Just now',
            read: false
        };
        setNotifications(curr => [newNotif, ...curr]);

        // Create transaction record
        const newTx: Transaction = {
            id: Date.now().toString(),
            date,
            type,
            symbol: marketAsset.symbol,
            shares,
            price,
            totalValue: shares * price
        };

        return {
            ...prev,
            holdings: newHoldings,
            transactions: [newTx, ...(prev.transactions || [])], // Append new transaction to history
            cashBalance: type === 'BUY' ? prev.cashBalance - cashImpact : prev.cashBalance + cashImpact
        };
    });
  };

  const toggleWatchlist = (symbol: string) => {
      setWatchlists(prev => {
          const activeListIndex = prev.findIndex(w => w.id === activeWatchlistId);
          if (activeListIndex === -1) return prev;

          const activeList = prev[activeListIndex];
          const exists = activeList.symbols.includes(symbol);
          
          const updatedList = {
              ...activeList,
              symbols: exists ? activeList.symbols.filter(s => s !== symbol) : [...activeList.symbols, symbol]
          };
          
          const newLists = [...prev];
          newLists[activeListIndex] = updatedList;

          if (!exists) {
              setNotifications(curr => [{
                  id: Date.now().toString(),
                  type: 'success',
                  title: 'Added to Watchlist',
                  message: `${symbol} has been added to ${activeList.name}.`,
                  timestamp: 'Just now',
                  read: false
              }, ...curr]);
          }

          return newLists;
      });
  };

  const createWatchlist = (name: string) => {
      const newId = `w${Date.now()}`;
      const newList: Watchlist = { id: newId, name, symbols: [] };
      setWatchlists(prev => [...prev, newList]);
      setActiveWatchlistId(newId);
      
      setNotifications(curr => [{
          id: Date.now().toString(),
          type: 'success',
          title: 'Watchlist Created',
          message: `New watchlist "${name}" has been created.`,
          timestamp: 'Just now',
          read: false
      }, ...curr]);
  };

  const switchWatchlist = (id: string) => {
      setActiveWatchlistId(id);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const openAddAssetModal = (ticker?: string) => {
      setPreSelectedAssetTicker(ticker || null);
      setIsAddAssetModalOpen(true);
  };
  
  const closeAddAssetModal = () => {
      setIsAddAssetModalOpen(false);
      setPreSelectedAssetTicker(null);
  };

  return (
    <PortfolioContext.Provider value={{
      portfolios,
      activePortfolio,
      activePortfolioId,
      switchPortfolio,
      addNewPortfolio,
      addTransaction,
      activeView,
      switchView,
      selectedResearchSymbol,
      viewStock,
      notifications,
      markAsRead,
      clearNotifications,
      isAddAssetModalOpen,
      preSelectedAssetTicker,
      openAddAssetModal,
      closeAddAssetModal,
      watchlists,
      activeWatchlistId,
      toggleWatchlist,
      createWatchlist,
      switchWatchlist
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
