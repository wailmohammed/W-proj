
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, FunctionDeclaration, Type } from "@google/genai";
import { usePortfolio } from '../context/PortfolioContext';
import { MessageSquare, X, Send, Loader2, Bot, ChevronDown, CheckCircle2, Sparkles, TrendingUp, Activity } from 'lucide-react';
import { MOCK_MARKET_ASSETS } from '../constants';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string; isTool?: boolean }[]>([
    { role: 'model', text: 'WealthGPT Pro active. I have analyzed your portfolio beta, debt-to-equity ratios, and cash flow sustainability. How can I assist with your investment strategy today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activePortfolio, addTransaction } = usePortfolio();
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const addTransactionTool: FunctionDeclaration = {
    name: 'addTransaction',
    description: 'Add a new transaction (Buy or Sell) to the portfolio.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symbol: { type: Type.STRING, description: 'The stock ticker symbol (e.g., AAPL, TSLA)' },
        type: { type: Type.STRING, description: 'The type of transaction', enum: ['BUY', 'SELL'] },
        shares: { type: Type.NUMBER, description: 'Number of shares' },
        price: { type: Type.NUMBER, description: 'Price per share in USD' },
      },
      required: ['symbol', 'type', 'shares', 'price']
    }
  };

  useEffect(() => {
    if (isOpen && !chatSession) {
        const holdings = activePortfolio.holdings;
        // Fix: Explicitly type totalVal to ensure it is treated as a number in arithmetic operations
        const totalVal: number = activePortfolio.totalValue || 1;
        
        // Calculate Advanced Portfolio Metrics for AI Context
        // Fix: Explicitly type the accumulator in reduce to prevent inference issues that cause arithmetic errors
        const sectorWeights = holdings.reduce((acc: Record<string, number>, h) => {
            acc[h.sector] = (acc[h.sector] || 0) + (h.shares * h.currentPrice);
            return acc;
        }, {} as Record<string, number>);

        // Simulated Advanced Health Metrics based on snowflake data
        // Fix: Explicitly type the accumulator as number for avgHealth calculation
        const avgHealth = holdings.reduce((a: number, b) => a + b.snowflake.health, 0) / (holdings.length || 1);
        const debtToEquity = (2.8 - (avgHealth / 4)).toFixed(2); // Simulated D/E ratio
        const portfolioBeta = 1.12; // Simulated Beta
        // Fix: Explicitly type the accumulator as number for annualIncome calculation
        const annualIncome = holdings.reduce((a: number, h) => a + (h.shares * h.currentPrice * (h.dividendYield/100)), 0);
        const yieldPercentage = ((annualIncome / totalVal) * 100).toFixed(2);
        
        const portfolioContext = `
            USER PORTFOLIO DATA:
            Name: ${activePortfolio.name}
            Total Value: $${activePortfolio.totalValue.toLocaleString()}
            Current Yield: ${yieldPercentage}%
            Estimated Annual Dividend Income: $${annualIncome.toLocaleString()}
            Portfolio Beta: ${portfolioBeta}
            Weighted Debt-to-Equity Ratio: ${debtToEquity}
            
            SECTOR ALLOCATION:
            ${Object.entries(sectorWeights).map(([k, v]) => `- ${k}: ${((Number(v) / totalVal) * 100).toFixed(1)}%`).join('\n')}
            
            HOLDINGS:
            ${holdings.map(h => `- ${h.symbol}: ${h.shares} shares @ $${h.currentPrice}. Dividend Safety: ${h.safetyScore}/100. Snowflake Score: ${h.snowflake.total}/25.`).join('\n')}
        `;

        const session = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: `You are WealthOS AI, a elite financial advisor. 
                Use the user's specific financial data provided to give deep, personalized insights. 
                Focus on: Risk analysis (Beta), Financial Health (Debt-to-Equity), and Dividend Sustainability.
                Be precise, data-driven, and actionable. If the user wants to adjust positions, use the addTransaction tool.
                
                ${portfolioContext}`,
                tools: [{ functionDeclarations: [addTransactionTool] }],
                thinkingConfig: { thinkingBudget: 16000 }
            }
        });
        setChatSession(session);
    }
  }, [isOpen, activePortfolio.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        const result = await chatSession.sendMessage({ message: userMsg });
        const functionCalls = result.functionCalls;

        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === 'addTransaction') {
                    const args = call.args as any;
                    const marketAsset = MOCK_MARKET_ASSETS.find(a => a.symbol === args.symbol.toUpperCase());
                    if (marketAsset) {
                      addTransaction(marketAsset.id, args.type, args.shares, args.price, new Date().toISOString().split('T')[0]);
                      const confirmText = `✅ Successfully executed: ${args.type} ${args.shares} shares of ${args.symbol} at $${args.price}. Your portfolio has been updated.`;
                      setMessages(prev => [...prev, { role: 'model', text: confirmText, isTool: true }]);
                    }
                }
            }
        }
        
        if (result.text) {
            setMessages(prev => [...prev, { role: 'model', text: result.text! }]);
        }
    } catch (error) {
        console.error("AI Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I encountered an error analyzing your data. Please try again in a moment." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-300 shadow-2xl ${isOpen ? 'w-12 h-12 rounded-full bg-slate-800 text-slate-400' : 'w-16 h-16 rounded-2xl bg-brand-600 text-white hover:scale-110 hover:rotate-3'}`}
        >
            {isOpen ? <ChevronDown className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
        </button>

        {isOpen && (
            <div className="fixed inset-0 z-[60] md:inset-auto md:bottom-24 md:right-6 w-full h-full md:w-[420px] md:h-[650px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">WealthGPT Pro</h3>
                            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Personalized Insight Active
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-none shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-2 p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 w-fit animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">WealthGPT is thinking...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your risk exposure..."
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-3 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading} 
                            className="p-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        )}
    </>
  );
};

export default AIAssistant;
