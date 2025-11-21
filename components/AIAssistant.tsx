
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { usePortfolio } from '../context/PortfolioContext';
import { MessageSquare, X, Send, Loader2, Sparkles, Bot, ChevronDown } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hello! I am WealthGPT, your personal investment assistant. I have full context of your portfolio. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activePortfolio } = usePortfolio();
  const [chatSession, setChatSession] = useState<Chat | null>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Initialize Chat Session with System Instruction containing Portfolio Context
  useEffect(() => {
    if (isOpen && !chatSession) {
        const portfolioContext = `
            CURRENT PORTFOLIO CONTEXT:
            Total Value: $${activePortfolio.totalValue.toFixed(2)}
            Cash Balance: $${activePortfolio.cashBalance.toFixed(2)}
            Holdings:
            ${activePortfolio.holdings.map(h => 
                `- ${h.symbol} (${h.name}): ${h.shares} shares @ $${h.currentPrice}. Total: $${(h.shares * h.currentPrice).toFixed(2)}. Asset Class: ${h.assetType}. Sector: ${h.sector}. Profit/Loss: ${((h.currentPrice - h.avgPrice) / h.avgPrice * 100).toFixed(2)}%`
            ).join('\n')}
        `;

        const session = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are WealthOS AI, an elite financial assistant embedded in a wealth management dashboard. 
                You are helpful, professional, and concise.
                You have access to the user's portfolio data provided below. 
                Always refer to specific numbers from the portfolio when answering questions.
                If the user asks for specific financial advice, provide general educational information but add a disclaimer.
                
                ${portfolioContext}`
            }
        });
        setChatSession(session);
    }
  }, [isOpen, activePortfolio]); // Re-init if portfolio changes significantly, though realistically we might want to just append context.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        // Use streaming for a better UX
        const resultStream = await chatSession.sendMessageStream({ message: userMsg });
        
        let fullResponse = "";
        setMessages(prev => [...prev, { role: 'model', text: "" }]); // Placeholder

        for await (const chunk of resultStream) {
            const c = chunk as GenerateContentResponse;
            const text = c.text;
            if (text) {
                fullResponse += text;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].text = fullResponse;
                    return newMsgs;
                });
            }
        }
    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
        {/* Floating Toggle Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-300 shadow-2xl shadow-brand-600/40 ${isOpen ? 'w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:text-white' : 'w-14 h-14 rounded-full bg-brand-600 text-white hover:bg-brand-500 hover:scale-105'}`}
        >
            {isOpen ? <ChevronDown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </button>

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-24 right-6 z-40 w-[380px] h-[600px] max-h-[calc(100vh-120px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">WealthGPT</h3>
                            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                                <span className="text-xs text-slate-400">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-950/50 border-t border-slate-800">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about your portfolio..."
                            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-500 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    <div className="text-[10px] text-center text-slate-600 mt-2">
                        AI can make mistakes. Verify important financial info.
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default AIAssistant;
