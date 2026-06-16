/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import AtelierLogin from './components/AtelierLogin.jsx';
import PrivateDashboard from './components/PrivateDashboard.jsx';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [view, setView] = useState(() => {
    const savedSession = localStorage.getItem('curator_session_email');
    return savedSession ? 'dashboard' : 'landing';
  });
  
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('curator_session_email');
  });

  const [authMode, setAuthMode] = useState('login');

  const handleLoginSuccess = (email) => {
    localStorage.setItem('curator_session_email', email);
    setUserEmail(email);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('curator_session_email');
    localStorage.removeItem('auth_token');
    setUserEmail(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] antialiased">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LandingPage onEnterAtelier={(mode) => {
              setAuthMode(mode);
              setView('login');
            }} />
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AtelierLogin 
              initialMode={authMode}
              onLoginSuccess={handleLoginSuccess}
              onBackToLanding={() => setView('landing')}
            />
          </motion.div>
        )}

        {view === 'dashboard' && userEmail && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PrivateDashboard 
              userEmail={userEmail}
              onLogout={handleLogout}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
