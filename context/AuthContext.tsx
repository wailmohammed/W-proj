
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PlanTier, CryptoWallet, SubscriptionPlan, BrokerIntegration, BrokerProvider } from '../types';
import { DEFAULT_BROKER_PROVIDERS } from '../constants';

// --- Mock Data ---
const DEFAULT_WALLETS: CryptoWallet[] = [
  { id: '1', coin: 'Bitcoin', network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', isEnabled: true },
  { id: '2', coin: 'Ethereum', network: 'ERC20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', isEnabled: true },
  { id: '3', coin: 'USDT', network: 'TRC20', address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkGH8w', isEnabled: true },
  { id: '4', coin: 'Solana', network: 'Solana', address: 'HN7cABqLq46Es1jh92dQq0k75jEw2', isEnabled: true },
  { id: '5', coin: 'XRP', network: 'Ripple', address: 'rEb8TK3gBgk5auZkwc6sHnWR', isEnabled: true },
  { id: '6', coin: 'Dogecoin', network: 'Dogecoin', address: 'D86sc9E72x92h83s92c3', isEnabled: true },
];

const DEFAULT_PLANS: SubscriptionPlan[] = [
  { 
    id: 'Free', 
    name: 'Starter', 
    price: 0, 
    description: 'Essential tracking for beginners.',
    limits: { portfolios: 1, holdings: 15, connections: 0, watchlists: 1 },
    features: [
      '1 Portfolio (Manual Entry)',
      'Up to 15 Holdings',
      '1 Watchlist',
      'Basic Dividend Tracking',
      'Community Access'
    ] 
  },
  { 
    id: 'Pro', 
    name: 'Investor', 
    price: 15, 
    isPopular: true,
    description: 'Automated analytics for growing portfolios.',
    limits: { portfolios: 3, holdings: -1, connections: 5, watchlists: 3 },
    features: [
      '3 Portfolios',
      'Unlimited Holdings',
      '5 Broker Connections',
      '3 Watchlists',
      'Dividend Calendar & Safety Scores',
      'Future Wealth Projection',
      'Ad-free Experience'
    ] 
  },
  { 
    id: 'Ultimate', 
    name: 'Wealth Master', 
    price: 30, 
    description: 'Complete ecosystem for serious investors.',
    limits: { portfolios: -1, holdings: -1, connections: -1, watchlists: -1 },
    features: [
      'Unlimited Portfolios',
      'Unlimited Broker Connections',
      'Unlimited Watchlists',
      'AI-Powered Deep Insights',
      'Custom PDF Reports',
      'Tax Optimization Tools',
      'Priority VIP Support',
      'API Access'
    ] 
  }
];

const MOCK_USERS: User[] = [
  { id: 'super_wail', name: 'Wail Mohammed', email: 'wailafmohammed@gmail.com', role: 'SUPER_ADMIN', plan: 'Ultimate', joinedDate: '2023-01-01' },
  { id: 'admin_sys', name: 'System Admin', email: 'admin@wealthos.com', role: 'ADMIN', plan: 'Ultimate', joinedDate: '2023-02-15' },
  { id: 'user1', name: 'John Doe', email: 'user@example.com', role: 'USER', plan: 'Free', joinedDate: '2023-05-15' },
  { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', role: 'USER', plan: 'Pro', joinedDate: '2023-06-20' }
];

// --- Context Interface ---
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUserPlan: (plan: PlanTier) => void;
  
  // Broker Management (Admin)
  brokerProviders: BrokerProvider[];
  addBrokerProvider: (provider: BrokerProvider) => void;
  removeBrokerProvider: (id: string) => void;
  updateBrokerProvider: (id: string, updates: Partial<BrokerProvider>) => void;

  // Broker Integration (User)
  integrations: BrokerIntegration[];
  connectBroker: (providerId: string, name: string, type: 'Stock' | 'Crypto' | 'Mixed', logo: string, credentials: any) => Promise<boolean>;
  disconnectBroker: (id: string) => void;

  // Admin Methods
  wallets: CryptoWallet[];
  addWallet: (wallet: Omit<CryptoWallet, 'id'>) => void;
  removeWallet: (id: string) => void;
  toggleWallet: (id: string) => void;
  updateWallet: (id: string, updates: Partial<CryptoWallet>) => void;
  plans: SubscriptionPlan[];
  updatePlanPrice: (id: PlanTier, price: number) => void;
  
  // User Management
  allUsers: User[];
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Load Settings from LocalStorage
  const [wallets, setWallets] = useState<CryptoWallet[]>(() => {
      const saved = localStorage.getItem('wealthos_wallets');
      return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
      const saved = localStorage.getItem('wealthos_plans');
      return saved ? JSON.parse(saved) : DEFAULT_PLANS;
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('wealthos_users_db');
      return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [integrations, setIntegrations] = useState<BrokerIntegration[]>(() => {
      const saved = localStorage.getItem('wealthos_integrations');
      return saved ? JSON.parse(saved) : [];
  });

  const [brokerProviders, setBrokerProviders] = useState<BrokerProvider[]>(() => {
      const saved = localStorage.getItem('wealthos_broker_providers');
      return saved ? JSON.parse(saved) : DEFAULT_BROKER_PROVIDERS;
  });

  // Persistence Effects
  useEffect(() => {
    const storedUser = localStorage.getItem('wealthos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('wealthos_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
      localStorage.setItem('wealthos_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
      localStorage.setItem('wealthos_users_db', JSON.stringify(allUsers));
  }, [allUsers]);
  
  useEffect(() => {
      localStorage.setItem('wealthos_integrations', JSON.stringify(integrations));
  }, [integrations]);

  useEffect(() => {
      localStorage.setItem('wealthos_broker_providers', JSON.stringify(brokerProviders));
  }, [brokerProviders]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (cleanEmail === 'wailafmohammed@gmail.com') {
             if (cleanPass === 'Albasha@49#') {
                 const superAdminUser: User = { 
                    id: 'super_wail', 
                    name: 'Wail Mohammed', 
                    email: 'wailafmohammed@gmail.com', 
                    role: 'SUPER_ADMIN', 
                    plan: 'Ultimate', 
                    joinedDate: '2023-01-01' 
                 };
                 setUser(superAdminUser);
                 localStorage.setItem('wealthos_user', JSON.stringify(superAdminUser));
                 setAllUsers(prev => {
                    const filtered = prev.filter(u => u.email !== 'wailafmohammed@gmail.com');
                    return [superAdminUser, ...filtered];
                 });
                 resolve(true);
             } else {
                 resolve(false);
             }
             return;
        }

        const foundUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (foundUser) {
          if (foundUser.role === 'ADMIN' && cleanPass !== 'admin123') {
              resolve(false);
              return;
          }
          setUser(foundUser);
          localStorage.setItem('wealthos_user', JSON.stringify(foundUser));
          resolve(true);
        } else if (cleanEmail === 'admin@wealthos.com' && cleanPass === 'admin123') {
           const sysAdmin: User = { id: 'admin_sys', name: 'System Admin', email: 'admin@wealthos.com', role: 'ADMIN', plan: 'Ultimate', joinedDate: '2023-02-15' };
           setUser(sysAdmin);
           localStorage.setItem('wealthos_user', JSON.stringify(sysAdmin));
           setAllUsers(prev => [sysAdmin, ...prev]);
           resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  const loginWithGoogle = async () => {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => {
            const googleUser: User = {
                id: 'google_' + Math.random().toString(36).substr(2, 9),
                name: 'Google User',
                email: 'user@gmail.com',
                role: 'USER',
                plan: 'Free',
                joinedDate: new Date().toISOString().split('T')[0],
                avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIqC45...'
            };
            const existing = allUsers.find(u => u.email === googleUser.email);
            if (existing) {
                setUser(existing);
                localStorage.setItem('wealthos_user', JSON.stringify(existing));
            } else {
                setAllUsers(prev => [...prev, googleUser]);
                setUser(googleUser);
                localStorage.setItem('wealthos_user', JSON.stringify(googleUser));
            }
            resolve(true);
        }, 1000);
    });
  };

  const register = async (name: string, email: string, pass: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: 'USER',
          plan: 'Free',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setAllUsers(prev => [...prev, newUser]);
        setUser(newUser);
        localStorage.setItem('wealthos_user', JSON.stringify(newUser));
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealthos_user');
  };

  const updateUserPlan = (plan: PlanTier) => {
    if (user) {
      const updatedUser = { ...user, plan };
      setUser(updatedUser);
      localStorage.setItem('wealthos_user', JSON.stringify(updatedUser));
      setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  // --- Broker Provider Management (Admin) ---
  const addBrokerProvider = (provider: BrokerProvider) => {
      setBrokerProviders(prev => [...prev, provider]);
  };

  const removeBrokerProvider = (id: string) => {
      setBrokerProviders(prev => prev.filter(p => p.id !== id));
  };

  const updateBrokerProvider = (id: string, updates: Partial<BrokerProvider>) => {
      setBrokerProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // --- Broker Integration Methods (User) ---
  const connectBroker = async (providerId: string, name: string, type: 'Stock' | 'Crypto' | 'Mixed', logo: string, credentials: any) => {
      return new Promise<boolean>((resolve) => {
          setTimeout(() => {
              // Check if already connected to update credentials
              const existingIndex = integrations.findIndex(i => i.providerId === providerId);
              
              if (existingIndex >= 0) {
                  // Update existing
                  setIntegrations(prev => prev.map((item, idx) => idx === existingIndex ? {
                      ...item,
                      status: 'Connected',
                      lastSync: 'Just now',
                      apiCredentials: credentials // Mock saving credentials
                  } : item));
              } else {
                  // Create new
                  const newIntegration: BrokerIntegration = {
                      id: Math.random().toString(36).substr(2, 9),
                      providerId,
                      name,
                      type,
                      status: 'Connected',
                      lastSync: 'Just now',
                      logo,
                      apiCredentials: credentials // Mock saving credentials
                  };
                  setIntegrations(prev => [...prev, newIntegration]);
              }
              resolve(true);
          }, 1500);
      });
  };

  const disconnectBroker = (id: string) => {
      setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  // --- Admin Functions ---
  const addWallet = (wallet: Omit<CryptoWallet, 'id'>) => {
    const newWallet = { ...wallet, id: Math.random().toString(36).substr(2, 9) };
    setWallets(prev => [...prev, newWallet]);
  };

  const removeWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const toggleWallet = (id: string) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, isEnabled: !w.isEnabled } : w));
  };

  const updateWallet = (id: string, updates: Partial<CryptoWallet>) => {
    setWallets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const updatePlanPrice = (id: PlanTier, price: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, price } : p));
  };

  // --- User Management ---
  const deleteUser = (id: string) => {
      setAllUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateUserRole = (id: string, role: UserRole) => {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUserPlan,
      brokerProviders,
      addBrokerProvider,
      removeBrokerProvider,
      updateBrokerProvider,
      integrations,
      connectBroker,
      disconnectBroker,
      wallets,
      addWallet,
      removeWallet,
      toggleWallet,
      updateWallet,
      plans,
      updatePlanPrice,
      allUsers,
      deleteUser,
      updateUserRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
