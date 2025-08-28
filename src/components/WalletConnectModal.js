import React from 'react';
import { X, Smartphone, Monitor, AlertTriangle } from 'lucide-react';

const WalletConnectModal = ({ 
  isOpen, 
  onClose, 
  onConnectWallet, 
  onSwitchWallet, 
  onReconnectWallet,
  isConnected = false, 
  currentProvider = null, 
  walletDisplayName = null 
}) => {
  if (!isOpen) return null;

  // Check if WalletConnect is configured
  const projectIdFromEnv = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
  const projectId = projectIdFromEnv || '2ba67e006f17083c559e3b0340e07812'; // Fallback hardcoded
  
  const isWalletConnectConfigured = projectId && 
    projectId !== 'your-project-id-here' &&
    projectId.length > 10;
    
  if (!projectIdFromEnv) {
    console.log('[DEBUG] WalletConnectModal - Using hardcoded Project ID (env not loaded)');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-goat-dark to-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isConnected ? 'Wallet Manager' : 'Connect Wallet'}
            </h2>
            {isConnected && walletDisplayName ? (
              <div className="mt-1">
                <p className="text-sm text-gray-400">
                  Currently connected via: <span className="text-goat-gold font-semibold">{walletDisplayName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can switch to another wallet or reconnect
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Connect to browser extensions, mobile wallets & more
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wallet Actions */}
        <div className="space-y-4">
          {!isConnected ? (
            /* Connect Wallet Option */
            <button
              onClick={isWalletConnectConfigured ? onConnectWallet : undefined}
              disabled={!isWalletConnectConfigured}
              className={`w-full p-6 rounded-lg border transition-all duration-300 
                       flex flex-col items-center text-center group relative
                       ${isWalletConnectConfigured 
                         ? 'border-gray-600 hover:border-goat-gold bg-gray-800 hover:bg-gray-700 cursor-pointer' 
                         : 'border-gray-700 bg-gray-900 cursor-not-allowed opacity-60'
                       }`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                             ${isWalletConnectConfigured ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'}`}>
                  {isWalletConnectConfigured ? (
                    <div className="flex">
                      <Monitor className="w-6 h-6 text-white mr-1" />
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="text-left">
                  <div className={`text-xl font-bold ${isWalletConnectConfigured ? 'text-white' : 'text-gray-400'}`}>
                    Connect Wallet
                  </div>
                  <div className="text-gray-400 text-sm">
                    {isWalletConnectConfigured 
                      ? 'Universal wallet connection' 
                      : 'Configuration required'
                    }
                  </div>
                </div>
              </div>
              
              {isWalletConnectConfigured && (
                <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-orange-400" />
                      <span>Browser Extensions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      <span>Mobile Wallets</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask 
                      ? '✅ MetaMask detected - will connect directly'
                      : 'MetaMask, Trust Wallet, Rainbow, Coinbase Wallet & 300+ more'
                    }
                  </p>
                </div>
              )}
              
              {isWalletConnectConfigured && (
                <div className="mt-4 text-goat-gold group-hover:text-yellow-300 transition-colors font-semibold">
                  Choose Your Wallet →
                </div>
              )}
            </button>
          ) : (
            /* Connected - Show Switch and Reconnect Options */
            <>
              <button
                onClick={onSwitchWallet}
                className="w-full p-4 rounded-lg border border-goat-gold bg-gradient-to-r from-goat-gold/10 to-yellow-500/10 
                         hover:from-goat-gold/20 hover:to-yellow-500/20 transition-all duration-300 
                         flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-goat-gold to-yellow-500 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Switch Wallet</div>
                    <div className="text-gray-400 text-sm">Connect to a different wallet</div>
                  </div>
                </div>
                <div className="text-goat-gold group-hover:text-yellow-300 transition-colors">
                  ↔
                </div>
              </button>
              
              <button
                onClick={onReconnectWallet}
                className="w-full p-4 rounded-lg border border-gray-600 hover:border-blue-500 
                         bg-gray-800 hover:bg-gray-700 transition-all duration-300 
                         flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <div className="text-white text-lg">↻</div>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Reconnect</div>
                    <div className="text-gray-400 text-sm">Refresh current connection</div>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                  →
                </div>
              </button>
            </>
          )}
          
          {/* Configuration Notice */}
          {!isWalletConnectConfigured && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="text-yellow-200 font-medium mb-1">WalletConnect Setup Required</div>
                  <div className="text-yellow-300 text-xs space-y-1">
                    <div>1. Visit <span className="font-mono bg-yellow-900/50 px-1 rounded">cloud.walletconnect.com</span></div>
                    <div>2. Create a free project</div>
                    <div>3. Copy your Project ID</div>
                    <div>4. Create <span className="font-mono bg-yellow-900/50 px-1 rounded">.env</span> file with:</div>
                    <div className="font-mono bg-yellow-900/50 px-2 py-1 rounded mt-1 text-xs">
                      REACT_APP_WALLETCONNECT_PROJECT_ID=your-project-id
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isConnected 
              ? `Managing ${walletDisplayName} connection • Switch or reconnect anytime`
              : 'One click connects to any wallet - browser extensions or mobile apps'
            }
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {isConnected
              ? 'Enhanced wallet management • Secure & Reliable'
              : 'Powered by WalletConnect • Secure & Universal'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;
