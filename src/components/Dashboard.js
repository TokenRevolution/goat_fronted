import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight,
  Calendar,
  Target,
  Download,
  Clock,
  Zap,
  Star,
  TrendingDown,
  Activity
} from 'lucide-react';
import { 
  calculateMonthlyReturn, 
  calculateDailyReturn,
  calculateAccumulatedEarnings,
  calculateRank, 
  calculateRankProgress, 
  formatCurrency,
  formatPercentage 
} from '../utils/platformUtils';

const Dashboard = () => {
  const { isConnected, account } = useWallet();
  const [userStats, setUserStats] = useState({
    totalDeposits: 2500,
    personalDeposits: 2500,
    monthlyEarnings: 375,
    dailyEarnings: 12.5,
    accumulatedEarnings: 187.5,
    totalReferrals: 12,
    networkValue: 45000,
    currentRank: 'Nuovo',
    rankLevel: 0,
    nextRankProgress: 50,
    lastCashout: '2024-01-10',
    pendingCashout: 0,
    totalCashouts: 8
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'deposit', amount: 500, date: '2024-01-15', status: 'completed', time: '14:30' },
    { type: 'referral_bonus', amount: 45, date: '2024-01-14', status: 'completed', time: '09:15' },
    { type: 'cashout', amount: 250, date: '2024-01-12', status: 'completed', time: '23:45' },
    { type: 'monthly_return', amount: 300, date: '2024-01-10', status: 'completed', time: '00:00' },
    { type: 'referral', amount: 1000, date: '2024-01-08', status: 'completed', time: '16:20' }
  ]);

  const [networkOverview, setNetworkOverview] = useState({
    directReferrals: 8,
    indirectReferrals: 4,
    totalNetworkDeposits: 45000,
    averageDeposit: 3750
  });

  useEffect(() => {
    if (!isConnected) {
      // Redirect or show connect wallet message
      return;
    }
    
    // In a real app, fetch user data from blockchain/API
    // For now, using mock data
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'deposit': return <DollarSign className="w-5 h-5 text-green-400" />;
      case 'referral_bonus': return <Users className="w-5 h-5 text-blue-400" />;
      case 'monthly_return': return <TrendingUp className="w-5 h-5 text-goat-gold" />;
      case 'cashout': return <Download className="w-5 h-5 text-orange-400" />;
      case 'referral': return <Users className="w-5 h-5 text-purple-400" />;
      default: return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-green-400';
      case 'referral_bonus': return 'text-blue-400';
      case 'monthly_return': return 'text-goat-gold';
      case 'cashout': return 'text-orange-400';
      case 'referral': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const handleCashout = async () => {
    if (userStats.accumulatedEarnings <= 0) {
      alert('No earnings available for cashout');
      return;
    }
    
    // In a real app, this would trigger a blockchain transaction
    alert(`Cashout requested for ${formatCurrency(userStats.accumulatedEarnings)}. Payment will arrive at midnight.`);
    
    // Update stats (in real app, this would come from blockchain)
    setUserStats(prev => ({
      ...prev,
      pendingCashout: prev.accumulatedEarnings,
      accumulatedEarnings: 0
    }));
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="glass rounded-2xl p-8 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 border border-goat-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 flex items-center">
                  <Trophy className="w-10 h-10 text-goat-gold mr-3" />
                  Dashboard
                </h1>
                <p className="text-gray-300 text-lg">Welcome back, GOAT Champion! 🐐</p>
                <p className="text-gray-400 mt-1">Here's your complete platform overview and earnings status</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Current Rank</div>
                <div className="text-2xl font-bold text-goat-gold">{userStats.currentRank}</div>
                <div className="text-xs text-gray-500">Level {userStats.rankLevel}/7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Personal Deposits</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(userStats.personalDeposits)}</p>
                <p className="text-xs text-green-400 mt-1">Total invested</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-goat-gold/20 hover:border-goat-gold/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Monthly Earnings</p>
                <p className="text-2xl font-bold text-goat-gold">{formatCurrency(userStats.monthlyEarnings)}</p>
                <p className="text-xs text-goat-gold mt-1">Per month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-goat-gold to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-blue-500/20 hover:border-blue-500/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Daily Earnings</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(userStats.dailyEarnings)}</p>
                <p className="text-xs text-blue-400 mt-1">Per day</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Accumulated</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(userStats.accumulatedEarnings)}</p>
                <p className="text-xs text-green-400 mt-1">Ready for cashout</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-purple-500/20 hover:border-purple-500/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{userStats.totalReferrals}</p>
                <p className="text-xs text-purple-400 mt-1">Network size</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-200 border border-blue-500/20 hover:border-blue-500/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Network Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(userStats.networkValue)}</p>
                <p className="text-xs text-blue-400 mt-1">Total network</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Cashout Section */}
        <div className="mb-8">
          <div className="glass rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-green-400 mr-3" />
                <h3 className="text-2xl font-bold text-white">Cashout Earnings</h3>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Last Cashout</div>
                <div className="text-green-400 font-semibold">{userStats.lastCashout}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-black/20 rounded-xl border border-green-500/20">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {formatCurrency(userStats.accumulatedEarnings)}
                </div>
                <div className="text-gray-300 font-medium">Available for Cashout</div>
                <div className="text-xs text-gray-400 mt-1">Accumulated daily returns</div>
              </div>
              
              <div className="text-center p-4 bg-black/20 rounded-xl border border-orange-500/20">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {formatCurrency(userStats.pendingCashout)}
                </div>
                <div className="text-gray-300 font-medium">Pending Payment</div>
                <div className="text-xs text-gray-400 mt-1">Arrives at midnight</div>
              </div>
              
              <div className="text-center p-4 bg-black/20 rounded-xl border border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {userStats.totalCashouts}
                </div>
                <div className="text-gray-300 font-medium">Total Cashouts</div>
                <div className="text-xs text-gray-400 mt-1">Successfully completed</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={handleCashout}
                disabled={userStats.accumulatedEarnings <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                <Download className="w-6 h-6 mr-2" />
                {userStats.accumulatedEarnings > 0 
                  ? `Cashout ${formatCurrency(userStats.accumulatedEarnings)}`
                  : 'No Earnings Available'
                }
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                Payments are processed at midnight after cashout request
              </div>
            </div>
          </div>
        </div>

        {/* Rank and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass rounded-xl p-6 border border-goat-gold/20 hover:border-goat-gold/40 transition-colors duration-200">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 text-goat-gold mr-2" />
              Current Rank
            </h3>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Trophy className="w-12 h-12 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-goat-gold mb-2">{userStats.currentRank}</h4>
              <p className="text-gray-400 mb-4">Level {userStats.rankLevel} of 7</p>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress to next rank</span>
                  <span className="text-goat-gold font-semibold">{userStats.nextRankProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-goat-gold to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${userStats.nextRankProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors duration-200">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              Network Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-400" />
                  Direct Referrals
                </span>
                <span className="text-white font-semibold bg-blue-500/20 px-3 py-1 rounded-full">
                  {networkOverview.directReferrals}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-purple-400" />
                  Indirect Referrals
                </span>
                <span className="text-white font-semibold bg-purple-500/20 px-3 py-1 rounded-full">
                  {networkOverview.indirectReferrals}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-400" />
                  Total Network Deposits
                </span>
                <span className="text-white font-semibold bg-green-500/20 px-3 py-1 rounded-full">
                  {formatCurrency(networkOverview.totalNetworkDeposits)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                <span className="text-gray-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-goat-gold" />
                  Personal Deposits
                </span>
                <span className="text-white font-semibold bg-goat-gold/20 px-3 py-1 rounded-full">
                  {formatCurrency(userStats.personalDeposits)}
                </span>
              </div>
              
              {/* Next Rank Requirements */}
              <div className="mt-6 p-4 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 rounded-lg border border-goat-gold/30">
                <h4 className="text-goat-gold font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Next Rank: Pulcini
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network Required:</span>
                    <span className="text-white font-semibold">$5,000 - $10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Personal Required:</span>
                    <span className="text-white font-semibold">$1,000</span>
                  </div>
                  <div className="text-center mt-3 p-2 bg-goat-gold/20 rounded border border-goat-gold/30">
                    <div className="text-goat-gold font-semibold">🎁 Reward: Free WeFi Card</div>
                    <div className="text-xs text-gray-400 mt-1">Decentralized multi-chain card</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-6 border border-gray-600/30">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-5 h-5 text-blue-400 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200 border border-gray-600/20">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-black/30 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className={`font-semibold ${getActivityColor(activity.type)}`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <span>{activity.date}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-lg">{formatCurrency(activity.amount)}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <p className={`text-sm ${activity.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {activity.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="glass rounded-xl p-6 text-center hover:scale-105 transition-all duration-200 border border-goat-gold/20 hover:border-goat-gold/40 group">
            <div className="w-16 h-16 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <DollarSign className="w-8 h-8 text-black" />
            </div>
            <h4 className="font-semibold text-white text-lg mb-2">Make Deposit</h4>
            <p className="text-sm text-gray-400">Add funds to your account</p>
            <div className="mt-3 text-xs text-goat-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Start earning daily returns →
            </div>
          </button>
          
          <button className="glass rounded-xl p-6 text-center hover:scale-105 transition-all duration-200 border border-blue-500/20 hover:border-blue-500/40 group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-semibold text-white text-lg mb-2">Invite Friends</h4>
            <p className="text-sm text-gray-400">Grow your network</p>
            <div className="mt-3 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Build your referral empire →
            </div>
          </button>
          
          <button className="glass rounded-xl p-6 text-center hover:scale-105 transition-all duration-200 border border-goat-gold/20 hover:border-goat-gold/40 group">
            <div className="w-16 h-16 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <Trophy className="w-8 h-8 text-black" />
            </div>
            <h4 className="font-semibold text-white text-lg mb-2">View Trophies</h4>
            <p className="text-sm text-gray-400">Check your achievements</p>
            <div className="mt-3 text-xs text-goat-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Unlock your next rank →
            </div>
          </button>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 mb-8">
          <div className="glass rounded-2xl p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-goat-gold mb-1">7</div>
                <div className="text-gray-400 text-sm">Trophy Levels</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
                <div className="text-gray-400 text-sm">Platform Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">∞</div>
                <div className="text-gray-400 text-sm">Earning Potential</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">🚀</div>
                <div className="text-gray-400 text-sm">GOAT Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
