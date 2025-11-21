
import React, { useState } from 'react';
import { MOCK_POSTS, MOCK_MARKET_ASSETS } from '../constants';
import { MessageSquare, Heart, Share2, TrendingUp, Users, Zap, ArrowRight, ArrowUpRight, ArrowDownRight, Sparkles, Send } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SocialPost } from '../types';

const CommunityView: React.FC = () => {
  const { viewStock, switchView } = usePortfolio();
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
  const [newPostContent, setNewPostContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Helper to find asset details
  const getAssetDetails = (ticker: string) => {
      const cleanTicker = ticker.replace('$', '');
      return MOCK_MARKET_ASSETS.find(a => a.symbol === cleanTicker);
  };

  const handlePost = () => {
      if (!newPostContent.trim()) return;

      // Extract tickers (simple regex for $TICKER)
      const tickers = (newPostContent.match(/\$[A-Z]+/g) || []).map(t => t.replace('$', ''));

      const newPost: SocialPost = {
          id: Date.now().toString(),
          user: 'You',
          avatar: 'https://ui-avatars.com/api/?name=You&background=6366f1&color=fff',
          content: newPostContent,
          timestamp: 'Just now',
          likes: 0,
          comments: 0,
          tickers: tickers
      };

      setPosts([newPost, ...posts]);
      setNewPostContent('');
  };

  const handleLike = (postId: string) => {
      const isLiked = likedPosts.has(postId);
      
      // Update local liked set
      const newLiked = new Set(likedPosts);
      if (isLiked) newLiked.delete(postId);
      else newLiked.add(postId);
      setLikedPosts(newLiked);

      // Update posts array with increment/decrement
      setPosts(posts.map(p => {
          if (p.id === postId) {
              return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1 };
          }
          return p;
      }));
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-20">
      
      {/* Featured Insights Carousel */}
      <section>
          <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" /> Daily Insights
              </h2>
              <button onClick={() => switchView('research')} className="text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div onClick={() => viewStock('NVDA')} className="relative h-48 rounded-2xl p-6 flex flex-col justify-end overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 transition-transform duration-500 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded text-[10px] font-bold text-white mb-2 border border-white/10">MARKET MOVER</div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1">Tech Sector Rebounds</h3>
                      <p className="text-indigo-100 text-xs line-clamp-2">Nasdaq futures are up 1.2% pre-market as AI stocks lead the charge.</p>
                  </div>
              </div>

              <div onClick={() => viewStock('O')} className="relative h-48 rounded-2xl p-6 flex flex-col justify-end overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 transition-transform duration-500 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded text-[10px] font-bold text-white mb-2 border border-white/10">DIVIDEND GEM</div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1">Realty Income (O) Analysis</h3>
                      <p className="text-emerald-100 text-xs line-clamp-2">Why the 6% yield might be the safest bet in this high-rate environment.</p>
                  </div>
              </div>

              <div onClick={() => viewStock('TSLA')} className="relative h-48 rounded-2xl p-6 flex flex-col justify-end overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 transition-transform duration-500 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-md w-fit px-2 py-1 rounded text-[10px] font-bold text-white mb-2 border border-white/10">EARNINGS WATCH</div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1">Tesla Q3 Preview</h3>
                      <p className="text-amber-100 text-xs line-clamp-2">Margins are in focus. What analysts are expecting from the EV giant.</p>
                  </div>
              </div>
          </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Discussion</h2>
            
            {/* Create Post */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-600/20 shrink-0">YO</div>
                    <input 
                        type="text" 
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your investment thoughts (use $TICKER)..." 
                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-slate-900 dark:text-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                    />
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><TrendingUp className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Zap className="w-4 h-4" /></button>
                    </div>
                    <button 
                        onClick={handlePost}
                        disabled={!newPostContent.trim()}
                        className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Post <Send className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-brand-200 dark:hover:border-slate-700 transition-all shadow-sm animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img src={post.avatar} alt={post.user} className="w-11 h-11 rounded-full border-2 border-slate-100 dark:border-slate-800" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                        {post.user}
                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-medium">Pro</span>
                                    </div>
                                    <div className="text-xs text-slate-500">{post.timestamp}</div>
                                </div>
                            </div>
                            <button className="text-brand-600 dark:text-brand-400 text-xs font-bold hover:bg-brand-50 dark:hover:bg-brand-900/20 px-3 py-1.5 rounded-lg transition-colors">
                                + Follow
                            </button>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                            {post.content.split(' ').map((word, i) => 
                                word.startsWith('$') ? 
                                <button key={i} onClick={() => viewStock(word.replace('$', ''))} className="text-brand-600 dark:text-brand-400 font-bold cursor-pointer hover:underline">{word} </button> : 
                                word.startsWith('#') ? <span key={i} className="text-brand-600 dark:text-brand-400 font-bold">{word} </span> :
                                word + ' '
                            )}
                        </p>

                        {/* Rich Asset Snapshot Cards */}
                        {post.tickers && post.tickers.length > 0 && (
                            <div className="flex flex-col gap-2 mb-4">
                                {post.tickers.map(ticker => {
                                    const asset = getAssetDetails(ticker);
                                    if (!asset) return null;
                                    // Mock change
                                    const isPositive = Math.random() > 0.4;
                                    const change = (Math.random() * 3).toFixed(2);
                                    
                                    return (
                                        <div key={ticker} onClick={() => viewStock(ticker)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group cursor-pointer hover:border-brand-300 dark:hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {asset.logoUrl ? (
                                                    <img src={asset.logoUrl} className="w-10 h-10 rounded-lg bg-white p-1 object-contain border border-slate-200 dark:border-slate-800" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                        {asset.symbol[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                                                    <div className="text-xs text-slate-500">{asset.assetType} • {asset.sector}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-900 dark:text-white">${asset.currentPrice}</div>
                                                <div className={`text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                    {change}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <button 
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-2 transition-colors text-sm group ${likedPosts.has(post.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
                            >
                                <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-red-500' : 'group-hover:fill-red-500'}`} /> {post.likes}
                            </button>
                            <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm">
                                <MessageSquare className="w-5 h-5" /> {post.comments}
                            </button>
                            <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors text-sm ml-auto">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sidebar: Trending & Discovery */}
        <div className="space-y-6">
            
            {/* Trending Assets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-500" /> Trending Assets
                </h3>
                <div className="space-y-2">
                    {[
                        { s: 'NVDA', n: 'Nvidia', v: '+5.4%', p: 460.12 },
                        { s: 'PLTR', n: 'Palantir', v: '+3.2%', p: 17.40 },
                        { s: 'AMD', n: 'Adv Micro Dev', v: '-1.1%', p: 102.33 },
                        { s: 'TSLA', n: 'Tesla', v: '+1.8%', p: 242.50 },
                        { s: 'COIN', n: 'Coinbase', v: '+4.5%', p: 85.20 },
                    ].map((item) => (
                        <div key={item.s} onClick={() => viewStock(item.s)} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 group-hover:border-brand-500/50">
                                    {item.s[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-200 text-sm">{item.s}</div>
                                    <div className="text-slate-500 text-[10px]">${item.p}</div>
                                </div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg ${item.v.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {item.v}
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={() => switchView('research')} className="w-full mt-4 py-2.5 text-sm text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/20 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors flex items-center justify-center gap-2">
                    View Market <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Top Portfolios */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-500" /> Top Portfolios
                </h3>
                <div className="space-y-3">
                    {[
                        { name: 'Dividend King', ret: '+24%', risk: 'Low' },
                        { name: 'Tech Aggressive', ret: '+56%', risk: 'High' },
                        { name: 'All Weather', ret: '+12%', risk: 'Med' },
                    ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-500 transition-colors">{p.name}</div>
                                    <div className="text-[10px] text-slate-500">{p.risk} Risk</div>
                                </div>
                            </div>
                            <div className="text-emerald-500 text-sm font-bold">
                                {p.ret}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityView;
