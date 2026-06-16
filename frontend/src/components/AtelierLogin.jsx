/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Mail, Lock, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function AtelierLogin({ initialMode = 'login', onLoginSuccess, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRequested, setIsRequested] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Username is required.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Password is required.');
      return;
    }
    
    setIsRequested(true);
    try {
      if (isRegisterMode) {
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        
        const registerData = await registerRes.json();
        if (!registerRes.ok) {
          throw new Error(registerData.message || 'Registration failed');
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
      
      localStorage.setItem('auth_token', data.token);
      setErrorMessage('');
      onLoginSuccess(email);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to authenticate');
    } finally {
      setIsRequested(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] relative flex flex-col justify-between overflow-hidden selection:bg-primary/20 selection:text-primary-fixed">
      {/* Background overlay resembling dark bookcase atmosphere */}
      <div className="absolute inset-0 z-10 pointer-events-none" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')" 
        }} 
      />

      {/* Header */}
      <header className="w-full h-20 px-6 md:px-16 flex items-center relative z-20">
        <span 
          onClick={onBackToLanding}
          className="font-serif text-2xl font-bold tracking-tight text-primary cursor-pointer hover:text-primary-fixed transition-colors"
        >
          WebStash
        </span>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-20">
        <div className="w-full max-w-lg glass-card rounded-2xl p-10 relative overflow-hidden bg-[#1a0f00]/75">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          {/* Tab Selector */}
          <div className="flex border-b border-outline-variant/20 mb-8 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => { setIsRegisterMode(false); setErrorMessage(''); }}
              className={`flex-grow pb-3 text-center uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${!isRegisterMode ? 'text-primary border-b-2 border-primary font-semibold font-bold' : 'text-[#d1c5b4]/40 hover:text-[#d1c5b4]'}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(true); setErrorMessage(''); }}
              className={`flex-grow pb-3 text-center uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${isRegisterMode ? 'text-primary border-b-2 border-primary font-semibold font-bold' : 'text-[#d1c5b4]/40 hover:text-[#d1c5b4]'}`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          <div className="text-center mb-8 space-y-3">
            <h1 className="font-serif text-4xl text-[#e5e2e1] tracking-tight">
              {isRegisterMode ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-[#d1c5b4]/60 tracking-wider">
              {isRegisterMode ? 'Sign up to start saving and organizing your bookmarks with AI.' : 'Sign in to access your bookmarks and AI summaries.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fixed-height error container to prevent layout shift */}
            <div className="min-h-[42px]">
              {errorMessage && (
                <div className="bg-red-950/40 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded text-center animate-fade-in-up">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Email / Username Field */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono tracking-[0.2em] text-[#d1c5b4]/50 uppercase">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-[#d1c5b4]/40">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com or username"
                  className="w-full bg-[#0e0e0e]/80 border border-outline-variant/40 rounded-lg py-3 px-11 text-sm text-[#e5e2e1] placeholder-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-mono tracking-[0.2em] text-[#d1c5b4]/50 uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-[#d1c5b4]/40">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#0e0e0e]/80 border border-outline-variant/40 rounded-lg py-3 px-11 text-sm text-[#e5e2e1] placeholder-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300 font-mono"
                />
              </div>
            </div>

            {/* Sign In / Register Button */}
            <button 
              type="submit"
              disabled={isRequested}
              className="w-full bg-primary text-on-primary font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-fixed transition-all duration-300 active:scale-95 text-xs tracking-[0.15em] inner-glow cursor-pointer uppercase disabled:opacity-50"
            >
              <span>{isRequested ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer bottom spacing */}
      <footer className="w-full py-6 relative z-20" />
    </div>
  );
}
