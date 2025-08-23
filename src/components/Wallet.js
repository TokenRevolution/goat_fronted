import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Wallet as WalletIcon, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Download
} from 'lucide-react';
import { formatCurrency } from '../utils/platformUtils';

const Wallet = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    chainId, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();
  
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletStats, setWalletStats] = useState({
    totalDeposits: 5500,
    totalEarnings: 1275,
    availableBalance: 1275,
    pendingReturns: 450,
    totalWithdrawn: 0
  });

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'deposit',
      amount: 1000,
      hash: '0x1234...abcd',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'confirmed',
      fee: 0.005
    },
    {
      id: 2,
      type: 'earning',
      amount: 150,
      hash: '0x5678...efgh',
      timestamp: '2024-01-14T15:45:00Z',
      status: 'confirmed',
      fee: 0
    },
    {
      id: 3,
      type: 'referral_bonus',
      amount: 75,
      hash: '0x9abc...ijkl',
      timestamp: '2024-01-12T09:20:00Z',
      status: 'confirmed',
      fee: 0
    },
    {
      id: 4,
      type: 'deposit',
      amount: 2500,
      hash: '0xdef0...mnop',
      timestamp: '2024-01-10T14:15:00Z',
      status: 'confirmed',
      fee: 0.012
    },
    {
      id: 5,
      type: 'earning',
      amount: 300,
      hash: '0x1111...qrst',
      timestamp: '2024-01-08T11:00:00Z',
      status: 'pending',
      fee: 0
    }
  ]);

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  const refreshBalance = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'earning':
        return <TrendingUp className="w-5 h-5 text-goat-gold" />;
      case 'referral_bonus':
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'withdraw':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'earning':
        return 'text-goat-gold';
      case 'referral_bonus':
        return 'text-blue-400';
      case 'withdraw':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 56:
        return 'BSC Mainnet';
      case 137:
        return 'Polygon';
      case 42161:
        return 'Arbitrum';
      default:
        return `Network ${chainId}`;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to view balance and transactions</p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-bold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Wallet</h1>
          <p className="text-xl text-gray-300">Manage your funds and view transaction history</p>
        </div>

        {/* Wallet Info */}
        <div className="glass rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Wallet Information</h2>
            <button
              onClick={refreshBalance}
              disabled={isRefreshing}
              className="p-2 bg-goat-gold/20 hover:bg-goat-gold/30 rounded-lg transition-colors duration-200"
            >
              <RefreshCw className={`w-5 h-5 text-goat-gold ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Wallet Address</label>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono">{account}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-1">Address copied to clipboard!</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Network</label>
                <span className="text-white">{getNetworkName(chainId)}</span>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Native Balance</label>
                <span className="text-2xl font-bold text-goat-gold">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-32 h-32 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center">
                <WalletIcon className="w-16 h-16 text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Deposits</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(walletStats.totalDeposits)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-goat-gold">{formatCurrency(walletStats.totalEarnings)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-goat-gold" />
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(walletStats.availableBalance)}</p>
              </div>
              <WalletIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Returns</p>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(walletStats.pendingReturns)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200 group">
            <Send className="w-8 h-8 text-goat-gold mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-lg font-semibold text-white mb-2">Make Deposit</h3>
            <p className="text-gray-400 text-sm">Add funds to your GOAT account</p>
          </button>

          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200 group">
            <Download className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-lg font-semibold text-white mb-2">Withdraw</h3>
            <p className="text-gray-400 text-sm">Withdraw your earnings</p>
          </button>

          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200 group">
            <ExternalLink className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h3 className="text-lg font-semibold text-white mb-2">View on Explorer</h3>
            <p className="text-gray-400 text-sm">Check transactions on blockchain</p>
          </button>
        </div>

        {/* Transaction History */}
        <div className="glass rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-3">Type</th>
                  <th className="text-left text-gray-400 py-3">Amount</th>
                  <th className="text-left text-gray-400 py-3">Status</th>
                  <th className="text-left text-gray-400 py-3">Date</th>
                  <th className="text-left text-gray-400 py-3">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-700/50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.type)}
                        <span className={`font-medium ${getTransactionColor(tx.type)}`}>
                          {tx.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div>
                        <span className="text-white font-semibold">
                          {formatCurrency(tx.amount)}
                        </span>
                        {tx.fee > 0 && (
                          <div className="text-gray-400 text-sm">
                            Fee: {tx.fee} ETH
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tx.status)}
                        <span className={`text-sm capitalize ${
                          tx.status === 'confirmed' ? 'text-green-400' :
                          tx.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">
                      {formatDate(tx.timestamp)}
                    </td>
                    <td className="py-4">
                      <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-200">
                        <span className="font-mono text-sm">{tx.hash}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>

        {/* Disconnect Wallet */}
        <div className="mt-8 text-center">
          <button
            onClick={disconnectWallet}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
