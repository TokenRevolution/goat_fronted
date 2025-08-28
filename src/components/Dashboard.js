import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { goatApi } from '../api';
import { makeApiRequest, cancelUserRequests } from '../utils/ApiManager';

const Dashboard = () => {
  console.log('[DEBUG] Dashboard: Component mounting...');
  const { isConnected, account } = useWallet();
  console.log('[DEBUG] Dashboard: isConnected =', isConnected, 'account =', account);
  const [userStats, setUserStats] = useState({
    totalDeposits: 0,
    personalDeposits: 0,
    monthlyEarnings: 0,
    dailyEarnings: 0,
    accumulatedEarnings: 0,
    totalReferrals: 0,
    networkValue: 0,
    currentRank: 'Pulcini',
    rankLevel: 1,
    nextRankProgress: 0,
    lastCashout: null,
    pendingCashout: 0,
    totalCashouts: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [networkOverview, setNetworkOverview] = useState({
    directReferrals: 0,
    indirectReferrals: 0,
    totalNetworkDeposits: 0,
    averageDeposit: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs for managing API calls and preventing race conditions
  const abortControllerRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const lastFetchParams = useRef({ isConnected: null, account: null });

  // Serialized fetch function using Global API Manager to prevent rate limiting
  const fetchDashboardData = useCallback(async (isConnected, account) => {
    // Cancel any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check if this is the same as the last fetch to avoid duplicates
    const paramsChanged = lastFetchParams.current.isConnected !== isConnected || 
                         lastFetchParams.current.account !== account;
    
    if (!paramsChanged) {
      console.log('[DEBUG] Dashboard: Skipping duplicate fetch request');
      return;
    }

    lastFetchParams.current = { isConnected, account };

    if (!isConnected) {
      console.log('[DEBUG] Dashboard: Not connected, setting loading to false');
      setLoading(false);
      return;
    }

    if (!account) {
      console.log('[DEBUG] Dashboard: No account available, setting loading to false');
      setLoading(false);
      return;
    }

    // Cancel any existing requests for this user before starting new ones
    cancelUserRequests(account);

    // Debounce the actual API call by 500ms
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('[DEBUG] Dashboard: Starting serialized fetch for account:', account);
        setLoading(true);
        setError(null);

        // Make API calls ONE AT A TIME using the global rate limiter
        // Priority: 1=highest, 10=normal, 20=lowest
        
        console.log('[DEBUG] Dashboard: Fetching deposits...');
        const depositsResponse = await makeApiRequest(
          `deposits_${account}`,
          () => goatApi.deposits.getDepositStats(account),
          1 // Highest priority
        );

        console.log('[DEBUG] Dashboard: Fetching referrals...');
        const referralsResponse = await makeApiRequest(
          `referrals_${account}`,
          () => goatApi.referrals.getReferralStats(account),
          2
        );

        console.log('[DEBUG] Dashboard: Fetching trophies...');
        const trophiesResponse = await makeApiRequest(
          `trophies_${account}`,
          () => goatApi.trophies.getUserTrophies(account),
          3
        );

        console.log('[DEBUG] Dashboard: Fetching transactions...');
        const transactionsResponse = await makeApiRequest(
          `transactions_${account}`,
          () => goatApi.wallet.getTransactions(account, 1, 5),
          4 // Lowest priority
        );

        console.log('[DEBUG] Dashboard: All API responses received successfully');

        // Update user stats
        setUserStats(prevStats => ({
          ...prevStats,
          totalDeposits: depositsResponse.stats?.totalDeposits || 0,
          personalDeposits: depositsResponse.stats?.totalDeposits || 0,
          monthlyEarnings: depositsResponse.stats?.monthlyReturn || 0,
          dailyEarnings: depositsResponse.stats?.dailyReturn || 0,
          accumulatedEarnings: depositsResponse.stats?.accumulatedEarnings || 0,
          totalReferrals: referralsResponse.stats?.totalReferrals || 0,
          networkValue: referralsResponse.stats?.networkValue || 0,
          currentRank: trophiesResponse.currentLevel || 'Pulcini',
          rankLevel: trophiesResponse.currentLevel || 1,
          nextRankProgress: trophiesResponse.nextTrophy?.progress || 0
        }));

        // Update network overview
        setNetworkOverview({
          directReferrals: referralsResponse.stats?.directReferrals || 0,
          indirectReferrals: referralsResponse.stats?.indirectReferrals || 0,
          totalNetworkDeposits: referralsResponse.stats?.networkValue || 0,
          averageDeposit: referralsResponse.stats?.averageDepositPerReferral || 0
        });

        // Update recent activity with transactions
        if (transactionsResponse.transactions) {
          setRecentActivity(transactionsResponse.transactions.map(tx => ({
            type: tx.type,
            amount: tx.amount,
            date: new Date(tx.created_at).toISOString().split('T')[0],
            status: tx.status,
            time: new Date(tx.created_at).toLocaleTimeString()
          })));
        }

        console.log('[DEBUG] Dashboard: Data updated successfully');

      } catch (error) {
        if (error.message === 'Request cancelled' || error.message === 'All requests cancelled') {
          console.log('[DEBUG] Dashboard: Request was cancelled');
          return;
        }

        console.error('[DEBUG] Dashboard: Error fetching dashboard data:', error);
        
        // Check for rate limiting error
        if (error.message && error.message.includes('Too many requests')) {
          setError('Loading data... The system is busy, please wait...');
        } else {
          setError(error.message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  }, []);

  // Effect with correct dependencies and cleanup
  useEffect(() => {
    console.log('[DEBUG] Dashboard: useEffect triggered - isConnected:', isConnected, 'account:', account);
    
    fetchDashboardData(isConnected, account);

    // Cleanup function
    return () => {
      console.log('[DEBUG] Dashboard: Cleaning up...');
      
      // Clear timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      
      // Cancel any API requests for this user
      if (account) {
        cancelUserRequests(account);
      }
    };
  }, [isConnected, account, fetchDashboardData]); // ✅ Correct dependencies!

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-300">Loading dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl text-gray-300 mb-2">Error loading dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-goat-gold text-black rounded-lg hover:bg-opacity-80"
          >
            Retry
          </button>
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
          <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 border border-goat-gold/20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-goat-gold mr-3" />
                    <span>Dashboard</span>
                  </div>
                </h1>
                <p className="text-gray-300 text-base sm:text-lg">Welcome back, GOAT Champion! 🐐</p>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">Here's your complete platform overview and earnings status</p>
              </div>
              <div className="text-center lg:text-right w-full lg:w-auto">
                <div className="text-sm text-gray-400 mb-1">Current Rank</div>
                <div className="text-xl sm:text-2xl font-bold text-goat-gold">{userStats.currentRank}</div>
                <div className="text-xs text-gray-500">Level {userStats.rankLevel}/7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Personal Deposits</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">{formatCurrency(userStats.personalDeposits)}</p>
                <p className="text-xs text-green-400 mt-1">Total invested</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-goat-gold/20 hover:border-goat-gold/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Monthly Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-goat-gold truncate">{formatCurrency(userStats.monthlyEarnings)}</p>
                <p className="text-xs text-goat-gold mt-1">Per month</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-goat-gold to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-blue-500/20 hover:border-blue-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Daily Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400 truncate">{formatCurrency(userStats.dailyEarnings)}</p>
                <p className="text-xs text-blue-400 mt-1">Per day</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Accumulated</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400 truncate">{formatCurrency(userStats.accumulatedEarnings)}</p>
                <p className="text-xs text-green-400 mt-1">Ready for cashout</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-purple-500/20 hover:border-purple-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Total Referrals</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{userStats.totalReferrals}</p>
                <p className="text-xs text-purple-400 mt-1">Network size</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-blue-500/20 hover:border-blue-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Network Value</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">{formatCurrency(userStats.networkValue)}</p>
                <p className="text-xs text-blue-400 mt-1">Total network</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Cashout Section */}
        <div className="mb-8">
          <div className="glass rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mr-3" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">Cashout Earnings</h3>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <div className="text-sm text-gray-400">Last Cashout</div>
                <div className="text-green-400 font-semibold">{userStats.lastCashout}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-green-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                  {formatCurrency(userStats.accumulatedEarnings)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Available for Cashout</div>
                <div className="text-xs text-gray-400 mt-1">Accumulated daily returns</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-orange-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-2">
                  {formatCurrency(userStats.pendingCashout)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Pending Payment</div>
                <div className="text-xs text-gray-400 mt-1">Arrives at midnight</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-blue-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                  {userStats.totalCashouts}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Total Cashouts</div>
                <div className="text-xs text-gray-400 mt-1">Successfully completed</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={handleCashout}
                disabled={userStats.accumulatedEarnings <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <span className="truncate">
                  {userStats.accumulatedEarnings > 0 
                    ? `Cashout ${formatCurrency(userStats.accumulatedEarnings)}`
                    : 'No Earnings Available'
                  }
                </span>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="glass rounded-xl p-4 sm:p-6 border border-goat-gold/20 hover:border-goat-gold/40 transition-colors duration-200">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-goat-gold mr-2" />
              Current Rank
            </h3>
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-goat-gold mb-2">{userStats.currentRank}</h4>
              <p className="text-gray-400 mb-4 text-sm sm:text-base">Level {userStats.rankLevel} of 7</p>
              
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

          <div className="glass rounded-xl p-4 sm:p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors duration-200">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
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
        <div className="glass rounded-xl p-4 sm:p-6 border border-gray-600/30">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors duration-200 border border-gray-600/20 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 bg-black/30 rounded-lg flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${getActivityColor(activity.type)} text-sm sm:text-base`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 mt-1">
                      <span>{activity.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{activity.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end space-x-4 sm:space-x-0 sm:space-y-1">
                  <p className="text-white font-semibold text-base sm:text-lg">{formatCurrency(activity.amount)}</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'completed' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <p className={`text-xs sm:text-sm ${activity.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {activity.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <button className="glass rounded-xl p-4 sm:p-6 text-center hover:scale-105 transition-all duration-200 border border-goat-gold/20 hover:border-goat-gold/40 group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">Make Deposit</h4>
            <p className="text-xs sm:text-sm text-gray-400">Add funds to your account</p>
            <div className="mt-2 sm:mt-3 text-xs text-goat-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Start earning daily returns →
            </div>
          </button>
          
          <button className="glass rounded-xl p-4 sm:p-6 text-center hover:scale-105 transition-all duration-200 border border-blue-500/20 hover:border-blue-500/40 group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">Invite Friends</h4>
            <p className="text-sm text-gray-400">Grow your network</p>
            <div className="mt-2 sm:mt-3 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Build your referral empire →
            </div>
          </button>
          
          <button className="glass rounded-xl p-4 sm:p-6 text-center hover:scale-105 transition-all duration-200 border border-goat-gold/20 hover:border-goat-gold/40 group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
            </div>
            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">View Trophies</h4>
            <p className="text-sm text-gray-400">Check your achievements</p>
            <div className="mt-2 sm:mt-3 text-xs text-goat-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Unlock your next rank →
            </div>
          </button>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 mb-8">
          <div className="glass rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 text-center">
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
