
import React, { useState } from 'react';
import { Search, BookOpen, ArrowLeft, FileText, Rocket, PieChart, CreditCard, Shield, ChevronRight, Briefcase, UploadCloud, DollarSign, BarChart2, RefreshCw, HelpCircle, AlertTriangle, Globe, Settings } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  articles: Article[];
}

const KB_DATA: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    description: 'New to WealthOS? Start here to set up your account and first portfolio.',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        content: (
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>Welcome to WealthOS! This guide will help you set up your account and start tracking your investments in minutes.</p>
            
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">1. Registration & Trial</h3>
                <p>After registration, you get <strong>full access</strong> to all functions of WealthOS for 14 days. The only limitation is that you can add up to 2 portfolios during the trial. No credit card is required to start.</p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">2. Create your first Portfolio</h3>
                <p>Upon logging in, you will be prompted to create a portfolio. You have three main options:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Connect Broker (Recommended):</strong> Automatically syncs your historical and new transactions. We support 100+ institutions including Interactive Brokers, Robinhood, and Binance.</li>
                    <li><strong>Import from File:</strong> Upload a CSV or Excel file exported from your broker.</li>
                    <li><strong>Manual Entry:</strong> Add transactions one by one. Best for custom assets or private equity.</li>
                </ul>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg">
                <p className="text-sm"><strong>Tip:</strong> You can create multiple portfolios (e.g., "Retirement", "Speculative", "Kids") to track different goals separately.</p>
            </div>
          </div>
        )
      },
      {
        id: 'connect-broker',
        title: 'Connecting a Brokerage Account',
        content: (
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>WealthOS uses secure third-party aggregators (like Plaid, Yodlee, and SnapTrade) to connect to your financial institutions.</p>
            
            <h3 className="text-lg font-bold text-white">How to connect:</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Go to <strong>Settings</strong> &gt; <strong>Integrations</strong>.</li>
              <li>Click <strong>Connect New Account</strong>.</li>
              <li>Search for your broker (e.g., Fidelity, Robinhood, Binance).</li>
              <li>Enter your broker login credentials in the secure popup window.</li>
              <li>Allow a few minutes for the initial sync to complete.</li>
            </ol>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mt-4">
                <h4 className="text-amber-400 font-bold mb-2 text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Security Note</h4>
                <p className="text-xs text-amber-200/80">
                    WealthOS never sees or stores your broker password. The connection acts as a read-only feed, meaning we cannot execute trades or withdraw funds.
                </p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'portfolio-management',
    title: 'Portfolio Management',
    icon: Briefcase,
    description: 'Transactions, cash tracking, splits, and custom assets.',
    articles: [
      {
        id: 'corporate-actions',
        title: 'Stock Splits, Mergers & Spinoffs',
        content: (
          <div className="space-y-5 text-slate-300 leading-relaxed">
            <p>Handling corporate actions correctly is vital for accurate performance history.</p>
            
            <h3 className="text-lg font-bold text-white">Stock Splits</h3>
            <p>
                WealthOS automatically detects most major stock splits (e.g., AAPL 4-to-1). 
                Your historical share count and price will be adjusted retroactively to preserve the correct return calculations. 
                If a split is missing, contact support.
            </p>

            <h3 className="text-lg font-bold text-white mt-4">Mergers & Acquisitions</h3>
            <p>
                If a company you own is acquired for cash:
                <br/>
                1. Add a <strong>SELL</strong> transaction for the old ticker on the merger date.
                <br/>
                2. The price should be the acquisition price per share.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-4">Spinoffs</h3>
            <p>
                For spinoffs, you generally receive shares of a new company. You should treat this as a "Buy" of the new company with a cost basis of $0 (or the specific allocated cost basis provided by your broker's tax documents).
            </p>
          </div>
        )
      },
      {
        id: 'multi-currency',
        title: 'Multi-Currency Portfolios',
        content: (
          <div className="space-y-5 text-slate-300 leading-relaxed">
            <p>WealthOS supports holding assets in different currencies within a single portfolio.</p>
            
            <h3 className="text-lg font-bold text-white">How it works</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Base Currency:</strong> Each portfolio has a main currency (e.g., USD). All totals are converted to this currency for the dashboard.</li>
                <li><strong>Asset Currency:</strong> You can hold UK stocks (GBP), European ETFs (EUR), or Crypto (USD/USDT) side-by-side.</li>
                <li><strong>Exchange Rates:</strong> We use end-of-day forex rates to value your foreign holdings daily.</li>
            </ul>
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-2">
                <p className="text-sm text-blue-200">
                    <strong>Tip:</strong> When adding a manual transaction for a foreign stock, you can specify the exchange rate used at the time of trade for precise cost-basis tracking.
                </p>
            </div>
          </div>
        )
      },
      {
        id: 'csv-import',
        title: 'Importing Data via CSV',
        content: (
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>If your broker isn't supported for auto-sync, or if you prefer manual control, you can import your transaction history via CSV.</p>
            
            <h3 className="text-lg font-bold text-white">Supported Formats</h3>
            <p>We support generic CSV imports as well as specific formats from major brokers like Schwab, Degiro, and Trading212.</p>

            <h3 className="text-lg font-bold text-white">CSV Columns Required</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-slate-700">
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th className="p-3 border border-slate-700">Column Header</th>
                            <th className="p-3 border border-slate-700">Description</th>
                            <th className="p-3 border border-slate-700">Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-3 border border-slate-700 font-mono">Symbol</td>
                            <td className="p-3 border border-slate-700">Ticker symbol</td>
                            <td className="p-3 border border-slate-700">AAPL</td>
                        </tr>
                         <tr>
                            <td className="p-3 border border-slate-700 font-mono">Date</td>
                            <td className="p-3 border border-slate-700">Transaction date</td>
                            <td className="p-3 border border-slate-700">2023-10-25</td>
                        </tr>
                         <tr>
                            <td className="p-3 border border-slate-700 font-mono">Type</td>
                            <td className="p-3 border border-slate-700">Buy, Sell, Dividend</td>
                            <td className="p-3 border border-slate-700">Buy</td>
                        </tr>
                         <tr>
                            <td className="p-3 border border-slate-700 font-mono">Quantity</td>
                            <td className="p-3 border border-slate-700">Number of shares</td>
                            <td className="p-3 border border-slate-700">10.5</td>
                        </tr>
                         <tr>
                            <td className="p-3 border border-slate-700 font-mono">Price</td>
                            <td className="p-3 border border-slate-700">Price per share</td>
                            <td className="p-3 border border-slate-700">150.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    icon: BarChart2,
    description: 'Understanding Snowflake scores, Performance metrics, and Dividends.',
    articles: [
      {
        id: 'snowflake-score',
        title: 'The WealthOS Snowflake Score',
        content: (
          <div className="space-y-5 text-slate-300 leading-relaxed">
            <p>The Snowflake is a visual snapshot of your portfolio's health across 5 key dimensions. A larger, fuller shape indicates a higher quality portfolio.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <strong className="text-white block mb-1">1. Value</strong>
                    Is the stock undervalued compared to its fair value (DCF)?
                 </div>
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <strong className="text-white block mb-1">2. Future</strong>
                    What are the analyst growth forecasts for earnings and revenue?
                 </div>
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <strong className="text-white block mb-1">3. Past</strong>
                    Does the company have a track record of quality earnings?
                 </div>
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <strong className="text-white block mb-1">4. Health</strong>
                    Is the balance sheet strong? (Debt/Equity ratio analysis)
                 </div>
                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <strong className="text-white block mb-1">5. Dividend</strong>
                    Is the dividend yield consistent, growing, and sustainable?
                 </div>
            </div>
            <p>Each axis is scored out of 5, giving a total possible score of 25.</p>
          </div>
        )
      },
      {
        id: 'twr-vs-mwr',
        title: 'Performance: TWR vs MWR',
        content: (
          <div className="space-y-5 text-slate-300 leading-relaxed">
            <p>We provide two ways to calculate returns. Understanding the difference helps you evaluate your performance accurately.</p>

            <h3 className="text-lg font-bold text-white">Time-Weighted Return (TWR)</h3>
            <p>
                TWR measures the performance of your portfolio's assets <strong>excluding the impact of your deposits and withdrawals</strong>. 
                It answers the question: <em>"How well did my investment strategy perform?"</em>
                <br/>
                <span className="text-xs text-slate-500">Best for: Comparing your performance against benchmarks like the S&P 500.</span>
            </p>

            <h3 className="text-lg font-bold text-white mt-4">Money-Weighted Return (MWR) / IRR</h3>
            <p>
                MWR takes into account the <strong>timing and size of your cash flows</strong>. If you deposited a large amount of money right before a market crash, your MWR will be lower than your TWR because you deployed capital at a bad time.
                <br/>
                It answers the question: <em>"What is the actual return on the money I put in?"</em>
            </p>
          </div>
        )
      },
      {
        id: 'dividend-safety',
        title: 'Dividend Safety Ratings',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>We assign a Safety Score (0-100) to every dividend-paying stock to assess the risk of a cut.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="text-emerald-400 font-bold">Very Safe (80-100):</span> Extremely unlikely to cut. Strong cash flow coverage.</li>
              <li><span className="text-emerald-300 font-bold">Safe (60-79):</span> Stable payout ratio. Low risk of cut in normal economic conditions.</li>
              <li><span className="text-amber-400 font-bold">Borderline (41-59):</span> Payout ratio is getting high. Monitor closely during recessions.</li>
              <li><span className="text-red-400 font-bold">Unsafe (0-40):</span> High risk of suspension or cut. Dividend often exceeds free cash flow.</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: AlertTriangle,
    description: 'Common issues with syncing, data, and missing values.',
    articles: [
      {
        id: 'sync-issues',
        title: 'Why doesn\'t my portfolio match my broker?',
        content: (
          <div className="space-y-5 text-slate-300 leading-relaxed">
            <p>Discrepancies between WealthOS and your broker can happen for a few reasons:</p>
            
            <h3 className="text-lg font-bold text-white">1. Sync Delay</h3>
            <p>Brokers typically update their API data once per day (usually overnight). If you made a trade today, it might not appear in WealthOS until tomorrow morning.</p>
            
            <h3 className="text-lg font-bold text-white">2. Missing Cost Basis</h3>
            <p>Sometimes, brokers do not send the original purchase price of historical lots. You can manually edit the "Average Price" of any holding by clicking on it in the Holdings view.</p>
            
            <h3 className="text-lg font-bold text-white">3. Cash Settlements</h3>
            <p>Trades often take T+2 days to settle. Your "Cash Balance" might reflect the settled cash, whereas your broker UI might show "Buying Power".</p>
          </div>
        )
      },
      {
        id: 'missing-dividends',
        title: 'Missing Dividend Payments',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>If a dividend payment is missing from your dashboard:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Check the Pay Date:</strong> Companies declare an "Ex-Date" and a "Pay Date". The cash is not received until the Pay Date, which can be weeks later.</li>
                <li><strong>Broker Lag:</strong> It may take 24-48 hours for the broker to report the cash transaction via the API.</li>
                <li><strong>Manual Entry:</strong> You can always manually add a dividend transaction via the "Add Transaction" button if needed.</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    icon: CreditCard,
    description: 'Plans, payments, and crypto support.',
    articles: [
      {
        id: 'plans-pricing',
        title: 'Plans & Pricing',
        content: (
           <div className="space-y-4 text-slate-300 leading-relaxed">
             <p>WealthOS offers three tiers to suit different investor needs:</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="border border-slate-700 p-4 rounded-lg">
                     <strong className="text-white block text-lg">Starter (Free)</strong>
                     <span className="text-xs">1 Portfolio, 15 Holdings. Manual entry only.</span>
                 </div>
                 <div className="border border-brand-500/50 bg-brand-500/10 p-4 rounded-lg">
                     <strong className="text-white block text-lg">Investor ($15/mo)</strong>
                     <span className="text-xs">3 Portfolios, Unlimited Holdings, Auto-sync, Dividend Calendar.</span>
                 </div>
                 <div className="border border-amber-500/50 bg-amber-500/10 p-4 rounded-lg">
                     <strong className="text-white block text-lg">Master ($30/mo)</strong>
                     <span className="text-xs">Unlimited everything. AI Insights, Tax Tools, VIP Support.</span>
                 </div>
             </div>
           </div>
        )
      },
      {
        id: 'crypto-payments',
        title: 'Paying with Crypto',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>WealthOS is a crypto-native platform. We accept subscription payments in:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bitcoin (BTC)</li>
              <li>Ethereum (ETH)</li>
              <li>USDT (TRC20)</li>
              <li>Solana (SOL)</li>
            </ul>
            <p>To upgrade, go to <strong>Settings > Subscription</strong>, select a plan, and choose your preferred wallet to generate a payment address. Your plan will activate automatically once the transaction is confirmed on the blockchain.</p>
          </div>
        )
      },
      {
        id: 'cancel-policy',
        title: 'Cancellation & Refunds',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <h3 className="text-lg font-bold text-white">Cancellation</h3>
            <p>You can cancel your subscription at any time. Since we use non-recurring crypto payments, simply <strong>do not renew</strong> your plan at the end of the billing cycle. Your paid features will remain active until the term expires.</p>
            
            <h3 className="text-lg font-bold text-white">Refunds</h3>
            <p>We offer a 7-day money-back guarantee for first-time subscribers. If you are not satisfied, contact support for a full refund.</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Shield,
    description: 'How we protect your data and anonymity.',
    articles: [
      {
        id: 'encryption',
        title: 'How is my data protected?',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>We use bank-grade security measures to protect your information.</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Encryption:</strong> All data in transit is encrypted via HTTPS (TLS 1.3). Data at rest is encrypted using AES-256.</li>
                <li><strong>Depersonalization:</strong> Your financial data is stored separately from your personal identity information.</li>
                <li><strong>No Credential Storage:</strong> We never store your broker passwords. We rely on secure tokens from providers like Plaid.</li>
            </ul>
          </div>
        )
      },
      {
        id: 'privacy-policy',
        title: 'Does WealthOS sell my data?',
        content: (
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p className="text-lg text-white font-bold">No. We do not sell your data.</p>
            <p>Our business model is simple: we sell a premium subscription to you. We do not monetize your data by selling it to hedge funds, advertisers, or third parties.</p>
            <p>You can export or delete your data at any time from the Settings menu.</p>
          </div>
        )
      }
    ]
  }
];

const KnowledgeBaseView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filter logic for search
  const filteredCategories = searchTerm 
    ? KB_DATA.map(cat => ({
        ...cat,
        articles: cat.articles.filter(art => 
          art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
          cat.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.articles.length > 0)
    : KB_DATA;

  const handleBack = () => {
    if (selectedArticle) setSelectedArticle(null);
    else setSelectedCategory(null);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-20">
      
      {/* Header & Search */}
      <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 to-transparent"></div>
        <div className="absolute top-0 right-0 p-12 opacity-10">
             <HelpCircle className="w-64 h-64 text-brand-500" />
        </div>
        
        <div className="relative z-10 px-4">
            <h1 className="text-4xl font-bold text-white mb-2">How can we help you?</h1>
            <p className="text-slate-400 mb-8">Search our knowledge base for tutorials, guides, and FAQs.</p>
            
            <div className="max-w-xl mx-auto">
            <div className="relative group">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-hover:text-brand-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search e.g. 'connecting broker' or 'dividend tracking'"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all shadow-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      {(selectedCategory || selectedArticle) && (
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-brand-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {selectedArticle ? selectedCategory?.title : 'Categories'}
        </button>
      )}

      {/* View: Search Results or Categories */}
      {!selectedCategory && !searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KB_DATA.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="bg-slate-900 border border-slate-800 hover:border-brand-500/50 p-6 rounded-xl text-left transition-all group hover:bg-slate-800/50 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-800 group-hover:bg-brand-500/10 flex items-center justify-center mb-4 transition-colors border border-slate-700 group-hover:border-brand-500/30">
                <cat.icon className="w-6 h-6 text-slate-400 group-hover:text-brand-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{cat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{cat.description}</p>
              <div className="mt-6 text-sm text-brand-600 font-bold flex items-center gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                View {cat.articles.length} articles <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* View: Filtered Results (Search) */}
      {searchTerm && (
        <div className="space-y-8">
          {filteredCategories.map(cat => (
             <div key={cat.id}>
               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <cat.icon className="w-5 h-5 text-brand-500" /> {cat.title}
               </h3>
               <div className="grid gap-3">
                 {cat.articles.map(art => (
                   <button 
                     key={art.id}
                     onClick={() => {
                       setSelectedCategory(KB_DATA.find(c => c.id === cat.id) || null);
                       setSelectedArticle(art);
                       setSearchTerm('');
                     }}
                     className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-left group hover:border-slate-700"
                   >
                     <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                        <span className="font-medium text-slate-200 group-hover:text-white transition-colors">{art.title}</span>
                     </div>
                     <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                   </button>
                 ))}
               </div>
             </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-bold text-lg">No results found</h3>
              <p className="text-slate-500 text-sm mt-1">We couldn't find any articles matching "{searchTerm}".</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-brand-400 hover:text-brand-300 text-sm font-bold">Clear Search</button>
            </div>
          )}
        </div>
      )}

      {/* View: Selected Category */}
      {selectedCategory && !selectedArticle && !searchTerm && (
        <div className="animate-fade-in">
           <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <selectedCategory.icon className="w-8 h-8 text-brand-500" />
             {selectedCategory.title}
           </h2>
           <p className="text-slate-400 mb-8 text-lg">{selectedCategory.description}</p>
           
           <div className="grid gap-3">
             {selectedCategory.articles.map(art => (
               <button 
                 key={art.id}
                 onClick={() => setSelectedArticle(art)}
                 className="flex items-center gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-left group hover:border-brand-500/30 hover:shadow-lg"
               >
                 <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-colors">
                    <FileText className="w-6 h-6 text-slate-500 group-hover:text-brand-500 transition-colors" />
                 </div>
                 <div className="flex-1">
                    <span className="block font-bold text-lg text-slate-200 group-hover:text-white transition-colors mb-1">{art.title}</span>
                    <span className="text-sm text-slate-500 group-hover:text-slate-400">Read article &rarr;</span>
                 </div>
               </button>
             ))}
           </div>
        </div>
      )}

      {/* View: Selected Article */}
      {selectedArticle && !searchTerm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 animate-fade-in-up shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">{selectedArticle.title}</h1>
          
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-a:text-brand-400 hover:prose-a:text-brand-300 prose-strong:text-white prose-li:marker:text-slate-500">
             {selectedArticle.content}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <HelpCircle className="w-5 h-5" />
                 </div>
                 <div>
                     <div className="text-sm font-bold text-white">Still need help?</div>
                     <a href="mailto:support@wealthos.com" className="text-xs text-brand-400 hover:underline">Contact Support</a>
                 </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Was this helpful?</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 hover:bg-brand-600 hover:text-white hover:border-brand-500 transition-all font-medium">Yes</button>
                <button className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium">No</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseView;
