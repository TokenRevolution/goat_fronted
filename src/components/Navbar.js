import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import WalletConnectModal from './WalletConnectModal';
import { Trophy, Wallet, Users, Home, BarChart3, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { 
    isConnected, 
    account, 
    connectWalletConnect, 
    disconnectWallet, 
    switchWallet, 
    reconnectWallet, 
    providerType, 
    username 
  } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Deposit', href: '/deposit', icon: Wallet },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Trophies', href: '/trophies', icon: Trophy },
  ];

  const handleWalletAction = async () => {
    if (isConnected) {
      console.log('[DEBUG] Navbar: Disconnecting wallet');
      await disconnectWallet();
    } else {
      console.log('[DEBUG] Navbar: Opening wallet selection modal...');
      setIsWalletModalOpen(true);
    }
  };

  const handleConnectWallet = async () => {
    console.log('[DEBUG] Navbar: Connecting wallet via WalletConnect...');
    setIsWalletModalOpen(false);
    
    const result = await connectWalletConnect();
    console.log('[DEBUG] Navbar: Wallet connection result:', result);
    
    // Handle registration redirect - this will be handled by Home.js useEffect
    if (result?.success && result?.isRegistered === false) {
      console.log('[DEBUG] Navbar: User not registered, Home.js will handle redirect');
    } else if (result?.success && result?.isRegistered === true) {
      console.log('[DEBUG] Navbar: User already registered');
    } else {
      console.log('[DEBUG] Navbar: Wallet connection failed');
    }
  };

  const handleSwitchWallet = async () => {
    console.log('[DEBUG] Navbar: Switching wallet...');
    setIsWalletModalOpen(false);
    
    const result = await switchWallet();
    console.log('[DEBUG] Navbar: Wallet switch result:', result);
  };

  const handleReconnectWallet = async () => {
    console.log('[DEBUG] Navbar: Reconnecting wallet...');
    
    const result = await reconnectWallet();
    console.log('[DEBUG] Navbar: Wallet reconnect result:', result);
  };

  const getWalletDisplayName = () => {
    if (!providerType) return 'Unknown';
    
    switch (providerType) {
      case 'metamask-direct':
        return 'MetaMask';
      case 'unified':
        return 'WalletConnect';
      default:
        return 'Wallet';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-goat-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-bold gradient-text">GOAT</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-goat-gold bg-goat-gold/10 border border-goat-gold/20'
                      : 'text-gray-300 hover:text-goat-gold hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  {username ? (
                    <span className="text-goat-gold font-semibold">{username}</span>
                  ) : (
                    <span className="text-gray-300">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                  )}
                </div>
                <button
                  onClick={handleWalletAction}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletAction}
                className="px-6 py-2 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-goat-gold p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-goat-gold/20">
          <div className="px-4 py-6 space-y-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-goat-gold bg-goat-gold/10 border border-goat-gold/20'
                      : 'text-gray-300 hover:text-goat-gold hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-gray-700">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="text-sm px-4">
                    {username ? (
                      <span className="text-goat-gold font-semibold">{username}</span>
                    ) : (
                      <span className="text-gray-300">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      handleWalletAction();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleWalletAction();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-2 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-semibold rounded-lg transition-all duration-200"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
    
    {/* Wallet Connection Modal */}
    <WalletConnectModal
      isOpen={isWalletModalOpen}
      onClose={() => setIsWalletModalOpen(false)}
      onConnectWallet={handleConnectWallet}
      onSwitchWallet={handleSwitchWallet}
      onReconnectWallet={handleReconnectWallet}
      isConnected={isConnected}
      currentProvider={providerType}
      walletDisplayName={getWalletDisplayName()}
    />
    </>
  );
};

export default Navbar;
