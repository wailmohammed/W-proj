# WealthOS 🚀

**Your Complete Dividend Growth Investing & Portfolio Management Platform**

Inspired by industry leaders like Snowball Analytics, Simply Wall St, Passiv, and more - WealthOS combines the best features of premium investment platforms into one free, open-source solution.

## ✨ Key Features

### 📊 Dividend Analytics (Snowball Analytics Style)
- **Dividend Forecasting**: Predict future dividend payments with quarterly/monthly schedules
- **Safety Scores**: 0-100 dividend safety rating based on payout ratio, streak, and growth
- **Monthly Income Calendar**: Visualize your dividend income stream month-by-month
- **Aristocrats Tracking**: Identify dividend aristocrats (25+ years) and kings (50+ years)
- **High-Yield Screener**: Find safe high-yield opportunities (≥4% yield, ≥60 safety score)

### 💰 Valuation Analysis (Simply Wall St Style)
- **DCF Valuation**: Discounted Cash Flow analysis with customizable assumptions
- **Relative Valuation**: P/E, P/B, P/S, PEG, EV/EBITDA vs industry averages
- **Financial Health Metrics**: Current ratio, debt/equity, ROE, margins, and more
- **Growth Analysis**: Revenue, earnings, dividend growth rates (1Y, 3Y, 5Y)
- **Past Performance**: Total returns, volatility, beta, Sharpe ratio
- **Snowflake Score**: Comprehensive 5-dimension scoring (Value, Future, Past, Health, Dividend)

### 🎯 Portfolio Optimization (Passiv Style)
- **Target Allocation Management**: Set and track target percentages per holding
- **Smart Rebalancing**: Get buy/sell recommendations based on drift thresholds
- **Portfolio Analytics**: Sector, asset type, country allocation breakdowns
- **Concentration Risk Assessment**: Diversification scoring and risk warnings
- **Trade Simulation**: Preview allocation impact before executing trades
- **Optimal Investment Calculator**: Allocate new investments efficiently to reach targets

### 🤖 AI-Powered Insights
- Google Gemini integration for intelligent analysis
- Automated portfolio reports
- Stock research summaries
- Market sentiment analysis

### 🌐 Social Features (Blossom Social Style)
- Community discussions
- Share portfolio performance (opt-in)
- Model portfolios from experts

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6
- **Visualization**: Recharts for beautiful charts
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys in .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
wealthos/
├── services/
│   ├── dividendAnalytics.ts    # Dividend forecasting & safety
│   ├── valuationService.ts     # DCF & financial analysis
│   ├── portfolioOptimizer.ts   # Rebalancing & analytics
│   ├── geminiService.ts        # AI integration
│   └── marketData.ts           # Market data fetching
├── components/
│   ├── EnhancedDividendsView.tsx  # Advanced dividend dashboard
│   ├── ResearchView.tsx           # Stock research with valuation
│   ├── PortfolioView.tsx          # Portfolio management
│   └── AnalyticsView.tsx          # Portfolio analytics
├── context/
│   ├── PortfolioContext.tsx       # Global state
│   └── AuthContext.tsx            # Authentication
└── types.ts                       # TypeScript definitions
```

## 📚 Documentation

- [Enhancement Plan](./ENHANCEMENT_PLAN.md) - Full roadmap and feature list
- [Integration Guide](./INTEGRATION_EXAMPLE.md) - How to use new services
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Recent improvements

## 🔐 Security

- API keys stored in environment variables (never committed)
- Supabase Row Level Security for data protection
- OAuth support for broker integrations
- HTTPS everywhere in production

## 📊 Inspired By

WealthOS combines the best features from:
- **Snowball Analytics** - Snowflake scores, dividend safety
- **Simply Wall St** - Visual analysis, DCF valuation
- **Simply Safe Dividends** - Dividend safety scores
- **Digrin** - Dividend growth tracking
- **Passiv** - Portfolio rebalancing
- **Getquin** - Portfolio analytics
- **Beanvest** - Portfolio scoring
- **Blossom Social** - Social investing

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

## 🗺️ Roadmap

### Q1 2025 ✅
- [x] Core analytics services
- [x] Enhanced dividend view
- [ ] Full component integration
- [ ] Testing suite

### Q2 2025
- [ ] Real-time market data API
- [ ] Mobile-responsive improvements
- [ ] AI insights feature
- [ ] Beta launch

### Q3 2025
- [ ] Social features
- [ ] Broker integrations
- [ ] Tax optimization tools
- [ ] Public launch

---

**Built with ❤️ for dividend growth investors**
