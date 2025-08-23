import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Deposit from './components/Deposit';
import Referrals from './components/Referrals';
import Trophies from './components/Trophies';
import Wallet from './components/Wallet';
import { WalletProvider } from './context/WalletContext';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-goat-dark to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold text-goat-gold mb-2">GOAT</h1>
          <p className="text-xl text-gray-300">Greatest of All Time</p>
          <p className="text-gray-400 mt-2">Loading your football journey...</p>
        </div>
      </div>
    );
  }

  return (
    <WalletProvider>
      <Router>
        <div className="App min-h-screen bg-gradient-to-br from-goat-dark to-gray-900">
          <Navbar />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/trophies" element={<Trophies />} />
              <Route path="/wallet" element={<Wallet />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
