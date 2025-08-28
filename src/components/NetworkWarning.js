import React from 'react';
import { useWallet } from '../context/WalletContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const NetworkWarning = () => {
  const { isConnected, isCorrectNetwork, currentNetwork, switchToBSC } = useWallet();

  // Don't show warning if wallet is not connected or if on correct network
  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToBSC(true); // Switch to BSC testnet for development
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const getNetworkName = () => {
    if (!currentNetwork) return 'Unknown Network';
    return currentNetwork.name;
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg border border-orange-400">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Wrong Network</h3>
            <p className="text-sm mb-2">
              You're connected to <span className="font-semibold">{getNetworkName()}</span>
            </p>
            <p className="text-sm mb-3">
              GOAT requires BSC (Binance Smart Chain) to function properly.
            </p>
            <button
              onClick={handleSwitchNetwork}
              className="w-full bg-white text-orange-600 hover:text-orange-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Switch to BSC Testnet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkWarning;
