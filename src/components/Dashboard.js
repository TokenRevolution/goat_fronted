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
  Target
} from 'lucide-react';
import { 
  calculateMonthlyReturn, 
  calculateRank, 
  calculateRankProgress, 
  formatCurrency,
  formatPercentage 
} from '../utils/platformUtils';

const Dashboard = () => {
  const { isConnected, account } = useWallet();
  const [userStats, setUserStats] = useState({
    totalDeposits: 2500,
    monthlyEarnings: 375,
    totalReferrals: 12,
    networkValue: 45000,
    currentRank: 'Juniores',
    rankLevel: 3,
    nextRankProgress: 65
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'deposit', amount: 500, date: '2024-01-15', status: 'completed' },
    { type: 'referral_bonus', amount: 45, date: '2024-01-14', status: 'completed' },
    { type: 'monthly_return', amount: 300, date: '2024-01-10', status: 'completed' },
    { type: 'referral', amount: 1000, date: '2024-01-08', status: 'completed' }
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
      case 'referral': return <Users className="w-5 h-5 text-purple-400" />;
      default: return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'deposit': return 'text-green-400';
      case 'referral_bonus': return 'text-blue-400';
      case 'monthly_return': return 'text-goat-gold';
      case 'referral': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your GOAT platform overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Deposits</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(userStats.totalDeposits)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Earnings</p>
                <p className="text-2xl font-bold text-goat-gold">{formatCurrency(userStats.monthlyEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-goat-gold to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Referrals</p>
                <p className="text-2xl font-bold text-white">{userStats.totalReferrals}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Network Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(userStats.networkValue)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Rank and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Current Rank</h3>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-black" />
              </div>
              <h4 className="text-2xl font-bold text-goat-gold mb-2">{userStats.currentRank}</h4>
              <p className="text-gray-400 mb-4">Level {userStats.rankLevel} of 7</p>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress to next rank</span>
                  <span>{userStats.nextRankProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-goat-gold to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userStats.nextRankProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Network Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Direct Referrals</span>
                <span className="text-white font-semibold">{networkOverview.directReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Indirect Referrals</span>
                <span className="text-white font-semibold">{networkOverview.indirectReferrals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Network Deposits</span>
                <span className="text-white font-semibold">{formatCurrency(networkOverview.totalNetworkDeposits)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Deposit</span>
                <span className="text-white font-semibold">{formatCurrency(networkOverview.averageDeposit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className={`font-semibold ${getActivityColor(activity.type)}`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(activity.amount)}</p>
                  <p className="text-sm text-green-400">{activity.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200">
            <DollarSign className="w-8 h-8 text-goat-gold mx-auto mb-2" />
            <h4 className="font-semibold text-white">Make Deposit</h4>
            <p className="text-sm text-gray-400">Add funds to your account</p>
          </button>
          
          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h4 className="font-semibold text-white">Invite Friends</h4>
            <p className="text-sm text-gray-400">Grow your network</p>
          </button>
          
          <button className="glass rounded-xl p-6 text-center hover:bg-white/5 transition-all duration-200">
            <Trophy className="w-8 h-8 text-goat-gold mx-auto mb-2" />
            <h4 className="font-semibold text-white">View Trophies</h4>
            <p className="text-sm text-gray-400">Check your achievements</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
