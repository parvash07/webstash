/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Shield, BookOpen, Diamond, Infinity as InfinityIcon, ArrowRight, Sparkles, Search, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage({ onEnterAtelier }) {
  const [activeQuery, setActiveQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryResults, setQueryResults] = useState([]);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');

  const placeholderText = "Find that article about healthy meal prep ideas you saved last week...";
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder((prev) => prev + placeholderText.charAt(index));
      index++;
      if (index >= placeholderText.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const handleDemoQuery = (e) => {
    e.preventDefault();
    const query = activeQuery.trim() || typedPlaceholder;
    setIsProcessing(true);
    setQueryResults([]);
    
    setTimeout(() => {
      setIsProcessing(false);
      if (query.toLowerCase().includes('recipe') || query.toLowerCase().includes('cook') || query.toLowerCase().includes('meal') || query.toLowerCase().includes('food') || query === placeholderText) {
        setQueryResults(["Quick Healthy Dinner Recipes", "Mediterranean Meal Prep Guide"]);
      } else if (query.toLowerCase().includes('tech') || query.toLowerCase().includes('code') || query.toLowerCase().includes('programming')) {
        setQueryResults(["React Best Practices 2024", "Python Data Science Tutorial"]);
      } else {
        setQueryResults(["Interesting Article You Saved", "Bookmarked Research Paper"]);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] overflow-x-hidden selection:bg-primary/20 selection:text-primary-fixed">
      {/* Landing Header */}
      <header className="w-full h-20 border-b border-outline-variant/30 sticky top-0 z-50 bg-[#131313]/85 backdrop-blur-xl">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 h-full flex items-center justify-between">
          <span className="font-serif text-2xl font-bold tracking-tight text-primary">WebStash</span>

          <div className="flex items-center gap-3">
            <button 
              id="landing-signin-btn"
              onClick={() => onEnterAtelier('login')}
              className="border border-primary-container/30 text-primary hover:border-primary px-4 py-2 rounded font-semibold text-xs tracking-widest transition-all duration-300 active:scale-95 hover:bg-primary/5 cursor-pointer flex items-center gap-2 uppercase font-mono"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button 
              id="landing-register-btn"
              onClick={() => onEnterAtelier('register')}
              className="bg-primary text-on-primary hover:bg-primary-fixed px-4 py-2 rounded font-semibold text-xs tracking-widest transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2 uppercase font-mono shadow-[0_0_15px_rgba(212,168,75,0.15)]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-16 pt-24 pb-32 max-w-[1280px] mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 pointer-events-none opacity-40" />
        
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-primary tracking-[0.3em] font-sans text-xs font-semibold uppercase mb-6"
        >
          Smart Bookmarking, Powered by AI
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl md:text-6xl font-bold text-[#e5e2e1] tracking-tight leading-[1.1] max-w-4xl mb-8"
        >
          Save, Organize, and{' '}
          <span className="italic text-primary font-normal">Instantly Find What You Bookmark.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#d1c5b4]/80 font-sans text-lg md:text-xl max-w-2xl leading-relaxed mb-12"
        >
          Stop losing tabs and forgetting why you saved them. WebStash automatically summarizes every link you save,
          adds smart tags, and uses AI semantic search so you can find anything in seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <button 
            onClick={() => onEnterAtelier('register')}
            className="w-full sm:w-auto bg-primary text-on-primary font-semibold px-8 py-4 rounded font-sans tracking-widest hover:bg-primary-fixed transition-all duration-300 shadow-[0_0_20px_rgba(212,168,75,0.15)] active:scale-95 inner-glow cursor-pointer uppercase text-xs"
          >
            Get Started Free
          </button>
          
          <button 
            onClick={() => {
              document.getElementById('art-of-retrieval')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto border border-primary/20 text-primary hover:border-primary/60 px-8 py-4 rounded font-sans tracking-widest transition-all duration-300 bg-transparent cursor-pointer"
          >
            How It Works
          </button>
        </motion.div>
      </section>

      {/* Interactive Search Demo */}
      <section id="art-of-retrieval" className="py-24 px-6 md:px-16 max-w-[1280px] mx-auto border-t border-outline-variant/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#e5e2e1] leading-tight">
              Smart Search That Understands You
            </h2>
            <p className="text-[#d1c5b4]/80 text-base leading-relaxed font-sans">
              Normal bookmark search only matches keywords. WebStash uses AI to understand what you actually mean. Search by topic, vibe, or even a vague description — and it'll find exactly what you need.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-primary-container/20 p-2 rounded border border-primary/20 mt-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-[#e5e2e1] text-sm">AI-Powered Semantic Search</h4>
                  <p className="text-sm text-[#d1c5b4]/60 mt-1 leading-relaxed">Can't remember the exact title? Describe what it was about and AI finds it instantly.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary-container/20 p-2 rounded border border-primary/20 mt-1">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-[#e5e2e1] text-sm">Auto-Generated Summaries</h4>
                  <p className="text-sm text-[#d1c5b4]/60 mt-1 leading-relaxed">Every link you save gets an AI summary, so you remember why you saved it without re-reading.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <div className="glass-card rounded-xl overflow-hidden p-8 border border-primary-container/10 select-none">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                <span className="text-xs font-mono text-primary tracking-[0.1em] uppercase">Try AI Search</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                  <div className="w-2 h-2 rounded-full bg-green-400/50" />
                </div>
              </div>

              <form onSubmit={handleDemoQuery} className="space-y-6">
                <div className="relative">
                  <input 
                    type="text"
                    value={activeQuery}
                    onChange={(e) => setActiveQuery(e.target.value)}
                    placeholder={activeQuery ? "" : typedPlaceholder}
                    className="w-full bg-[#131313]/90 border border-outline-variant/40 rounded-lg py-4 px-5 pr-12 text-[#e5e2e1] font-sans placeholder-on-surface-variant/40 focus:outline-none focus:border-primary transition-all duration-300"
                  />
                  <button type="submit" className="absolute right-4 top-[14px] text-primary hover:text-primary-fixed transition-colors">
                    <Search className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant/50 font-mono">Status: Ready</span>
                  <button 
                    type="submit" 
                    className="bg-primary-container/20 hover:bg-primary-container/40 border border-primary-container/40 text-primary-fixed px-4 py-1.5 rounded transition-all duration-300 disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Loader / Output */}
              <div className="mt-8 pt-6 border-t border-outline-variant/30 min-h-[100px] flex flex-col justify-center">
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center space-y-4 animate-loading-pulse">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono text-[#d1c5b4] tracking-[0.15em] uppercase">Searching your bookmarks...</span>
                  </div>
                )}

                {!isProcessing && queryResults.length === 0 && (
                  <div className="text-center text-[#d1c5b4]/40 font-serif italic text-sm">
                    Type a search above to see AI-powered results in action.
                  </div>
                )}

                {!isProcessing && queryResults.length > 0 && (
                  <div className="animate-fade-in-up">
                    <div className="text-xs font-mono text-[#d1c5b4]/50 mb-3 tracking-[0.1em] uppercase">Results:</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {queryResults.map((result, idx) => (
                        <div 
                          key={idx} 
                          className="flex-1 bg-[#1a0f00]/60 border border-primary/20 hover:border-primary/60 p-4 rounded-lg flex items-center justify-between transition-colors duration-300 cursor-pointer"
                          onClick={() => onEnterAtelier('login')}
                        >
                          <span className="font-serif text-sm text-[#e5e2e1]">{result}</span>
                          <ArrowRight className="w-4 h-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features section */}
      <section className="py-24 px-6 md:px-16 max-w-[1280px] mx-auto border-t border-outline-variant/20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">Everything You Need to Manage Bookmarks</h2>
          <p className="text-on-surface-variant/70 text-sm tracking-widest uppercase">AI-powered organization, zero effort required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="text-primary border border-primary/20 w-fit p-3 rounded bg-primary-container/10 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#e5e2e1] mb-3">Private & Secure</h3>
              <p className="text-xs text-[#d1c5b4]/70 leading-relaxed font-sans">
                Your bookmarks, summaries, and tags are private by default. Only you can see what you save.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-[260px] md:col-span-1 lg:col-span-2 relative overflow-hidden group">
            <div>
              <div className="text-primary border border-primary/20 w-fit p-3 rounded bg-primary-container/10 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#e5e2e1] mb-3">AI Summaries for Every Link</h3>
              <p className="text-xs text-[#d1c5b4]/70 leading-relaxed font-sans max-w-md">
                Tired of forgetting why you bookmarked something? Every link gets an instant AI summary, so you always remember the key points without re-reading.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-primary font-semibold hover:text-primary-fixed cursor-pointer" onClick={() => onEnterAtelier('login')}>
              <span>BROWSE YOUR BOOKMARKS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-8 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="text-primary border border-primary/20 w-fit p-3 rounded bg-primary-container/10 mb-6">
                <Diamond className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#e5e2e1] mb-3">Smart Auto-Tagging</h3>
              <p className="text-xs text-[#d1c5b4]/70 leading-relaxed font-sans">
                WebStash automatically tags your bookmarks with relevant keywords, so you can search and filter without lifting a finger.
              </p>
            </div>
          </div>
        </div>

        {/* Unlimited bookmarks card */}
        <div className="mt-8">
          <div className="glass-card rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex gap-4 items-center">
              <div className="text-primary border border-primary/20 p-3 rounded bg-primary-container/10">
                <InfinityIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-[#e5e2e1]">Unlimited Bookmarks</h3>
                <p className="text-xs text-[#d1c5b4]/70 leading-relaxed font-sans">No limits on how many links you save, tag, or summarize. Your collection grows with you.</p>
              </div>
            </div>
            <button 
              onClick={() => onEnterAtelier('login')}
              className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-6 py-3 rounded text-xs font-semibold tracking-widest uppercase transition-colors shrink-0 cursor-pointer"
            >
              Access Bookmarks
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action bottom */}
      <section className="py-24 px-6 md:px-16 max-w-[1280px] mx-auto border-t border-outline-variant/20 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#e5e2e1] tracking-tight">Never Lose a Bookmark Again.</h2>
          <p className="text-[#d1c5b4]/70 text-base max-w-md mx-auto leading-relaxed">WebStash uses AI to automatically summarize, tag, and organize every link you save. Find anything instantly.</p>
          
          <button 
            onClick={() => onEnterAtelier('register')}
            className="bg-primary text-on-primary font-semibold px-8 py-4 rounded tracking-widest hover:bg-primary-fixed transition-all duration-300 shadow-[0_0_20px_rgba(212,168,75,0.1)] active:scale-95 cursor-pointer"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="w-full py-12 border-t border-outline-variant/10 bg-[#0e0e0e] text-xs text-on-surface-variant/40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-serif text-sm font-semibold text-primary">WebStash</span>

          <span className="font-mono text-[10px]">© 2024 WebStash. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
