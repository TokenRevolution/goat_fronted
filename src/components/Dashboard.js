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
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Network,
  TrendingUp as TrendingUpAlt,
  Coins,
  Shield
} from 'lucide-react';
import { 
  calculatePersonalCapitalReturns,
  calculatePersonalCapitalReturnsFromDeposits,
  calculateDailyNetworkEarnings,
  getTimeUntilCashout,
  getTimeUntilDailyCredit,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercentage,
  getLevelColor,
  getLevelBadgeColor
} from '../utils/goatBusinessLogic';
import { goatApi } from '../api/goat';

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
    averageDeposit: 0,
    // Nuove informazioni del sistema aggiornato
    networkBonusBreakdown: [],
    cashoutLimitInfo: null,
    differenceBonus: 0,
    sameLevelBonus: 0,
    isEarningLimited: false,
    originalDailyEarnings: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Real-time personal capital returns (updated every second)
  const [realTimeReturns, setRealTimeReturns] = useState(null);
  
  // Simplified fetch function for dashboard data
  const fetchDashboardData = useCallback(async (isConnected, account) => {
    if (!isConnected || !account) {
      console.log('[DEBUG] Dashboard: Not connected or no account, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('[DEBUG] Dashboard: Fetching dashboard data for account:', account);
      setLoading(true);
      setError(null);

      // Fetch data from GOAT API
      const dashboardResponse = await goatApi.getUserDashboardData(account);

      if (!dashboardResponse.success || !dashboardResponse.data) {
        throw new Error('Failed to fetch dashboard data');
      }

      const { position, deposits, earnings, network } = dashboardResponse.data;

      // DEBUG: Log delle API response
      console.log('[DEBUG] Dashboard: Full API response data:', dashboardResponse.data);
      console.log('[DEBUG] Dashboard: Position data:', position);
      console.log('[DEBUG] Dashboard: Deposits data:', deposits);
      console.log('[DEBUG] Dashboard: Earnings data:', earnings);
      console.log('[DEBUG] Dashboard: Network data:', network);
      console.log('[DEBUG] Dashboard: NUOVE INFO - networkBonusBreakdown:', network?.networkBonusBreakdown);
      console.log('[DEBUG] Dashboard: NUOVE INFO - cashoutLimitInfo:', network?.cashoutLimitInfo);
      console.log('[DEBUG] Dashboard: NUOVE INFO - differenceBonus:', network?.differenceBonus);
      console.log('[DEBUG] Dashboard: NUOVE INFO - sameLevelBonusAmount:', network?.sameLevelBonusAmount);

      // Calculate DUAL CREDIT SYSTEM earnings - use ALL individual deposits for precise calculation
      let personalCapitalReturns;
      
      if (deposits.individualDeposits && deposits.individualDeposits.length > 0) {
        console.log('[💰 DASHBOARD] Using NEW multi-deposit calculation...');
        console.log('[💰 DASHBOARD] Individual deposits:', deposits.individualDeposits);
        personalCapitalReturns = calculatePersonalCapitalReturnsFromDeposits(
          deposits.individualDeposits, 
          deposits.totalDeposits
        );
      } else {
        console.log('[💰 DASHBOARD] Fallback to legacy single-deposit calculation...');
        personalCapitalReturns = calculatePersonalCapitalReturns(deposits.totalDeposits, deposits.mostRecentDepositDate);
      }
      
      // Store deposit data for real-time updates
      personalCapitalReturns.mostRecentDepositDate = deposits.mostRecentDepositDate;
      personalCapitalReturns.individualDeposits = deposits.individualDeposits;
      const dailyNetworkEarnings = calculateDailyNetworkEarnings(position.current, network.teamRevenue, network.sameLevelRevenue || 0);
      const cashoutCountdown = getTimeUntilCashout();
      const networkCreditCountdown = getTimeUntilDailyCredit();

      // DEBUG: Log dei calcoli
      console.log('[DEBUG] Dashboard: personalCapitalReturns:', personalCapitalReturns);
      console.log('[DEBUG] Dashboard: dailyNetworkEarnings:', dailyNetworkEarnings);

      // Update user stats with data
      const newStats = {
        ...userStats,
        totalDeposits: deposits.totalDeposits,
        personalDeposits: deposits.totalDeposits,
        monthlyEarnings: deposits.monthlyReturn,
        // BUSINESS LOGIC: Personal deposits = monthly cashout only, daily earnings = from network only
        dailyEarnings: network.dailyNetworkEarnings || 0,
        accumulatedEarnings: network.accumulatedNetworkEarnings || 0,
        
        // DUAL CREDIT SYSTEM DATA
        personalCapitalReturns,
        dailyNetworkEarnings,
        cashoutCountdown,
        networkCreditCountdown,
        
        totalReferrals: network.directReferrals || 0,
        networkValue: network.teamRevenue,
        currentRank: position.current.name,
        rankLevel: position.current.level_id,
        nextRankProgress: position.progress 
          ? (position.progress.personalDepositProgress + position.progress.firstLineProgress + position.progress.teamRevenueProgress) / 3 * 100
          : 0,
        returnRate: deposits.returnRate,
        returnTier: deposits.returnTier,
        canEarn: deposits.canEarn,
        maxCashout: earnings.maxCashout,
        multiplier: position.current.max_multiplier,
        networkBonus: (position.current.network_bonus_rate || 0) * network.teamRevenue,
        sameLevelBonus: (position.current.same_level_bonus_rate || 0) * network.teamRevenue,
        userLevel: position // Store complete level info with available levels
      };
      
      // DEBUG: Log del nuovo stato
      console.log('[DEBUG] Dashboard: New userStats being set:', newStats);
      console.log('[DEBUG] Dashboard: teamDeposits (networkValue) will be:', newStats.networkValue);
      console.log('[DEBUG] Dashboard: totalReferrals will be:', newStats.totalReferrals);
      console.log('[DEBUG] Dashboard: networkBonus will be:', newStats.networkBonus);
      
      setUserStats(newStats);

      // Update network overview con tutte le nuove informazioni
      const newNetworkOverview = {
        directReferrals: network.directReferrals || 0,
        indirectReferrals: (network.totalNetworkSize || 0) - (network.directReferrals || 0),
        totalNetworkDeposits: network.teamRevenue || 0,
        firstLineDeposits: network.firstLineRevenue || 0,
        averageDeposit: network.directReferrals > 0 ? (network.firstLineRevenue || 0) / network.directReferrals : 0,
        dailyNetworkEarnings: network.dailyNetworkEarnings || 0,
        accumulatedNetworkEarnings: network.accumulatedNetworkEarnings || 0,
        // NUOVE INFORMAZIONI dal sistema aggiornato
        networkBonusBreakdown: network.networkBonusBreakdown || [],
        cashoutLimitInfo: network.cashoutLimitInfo || null,
        differenceBonus: network.differenceBonus || 0,
        sameLevelBonus: network.sameLevelBonusAmount || 0,
        isEarningLimited: network.isEarningLimited || false,
        originalDailyEarnings: network.originalDailyEarnings || (network.dailyNetworkEarnings || 0)
      };
      
      // DEBUG: Log del network overview
      console.log('[DEBUG] Dashboard: New networkOverview being set:', newNetworkOverview);
      console.log('[DEBUG] Dashboard: totalTeamDeposits will be:', newNetworkOverview.totalNetworkDeposits);
      console.log('[DEBUG] Dashboard: firstLineDeposits will be:', newNetworkOverview.firstLineDeposits);
      
      setNetworkOverview(newNetworkOverview);

      // Create recent activity from earnings
      if (earnings.recent && earnings.recent.length > 0) {
        setRecentActivity(earnings.recent.map(earning => ({
          type: 'daily_return',
          amount: earning.total_earnings,
          date: earning.date,
          status: 'completed',
          time: '00:00'
        })));
      }

      console.log('[DEBUG] Dashboard: Data updated successfully');

    } catch (error) {
      console.error('[DEBUG] Dashboard: Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to load dashboard data when wallet connects
  useEffect(() => {
    console.log('[DEBUG] Dashboard: useEffect triggered - isConnected:', isConnected, 'account:', account);
    
    if (isConnected && account) {
      fetchDashboardData(isConnected, account);
    }
  }, [isConnected, account, fetchDashboardData]);

  // Effect for real-time updates of personal capital returns (every second)
  useEffect(() => {
    if (!userStats.personalDeposits || !userStats.personalCapitalReturns) return;
    
    const individualDeposits = userStats.personalCapitalReturns.individualDeposits;
    const mostRecentDepositDate = userStats.personalCapitalReturns.mostRecentDepositDate;
    
    // Update real-time returns immediately
    const updateRealTimeReturns = () => {
      let realTimeData;
      
      if (individualDeposits && individualDeposits.length > 0) {
        console.log('[⏱️ REAL-TIME] Using multi-deposit calculation...');
        realTimeData = calculatePersonalCapitalReturnsFromDeposits(individualDeposits, userStats.personalDeposits);
      } else if (mostRecentDepositDate) {
        console.log('[⏱️ REAL-TIME] Using legacy single-deposit calculation...');
        realTimeData = calculatePersonalCapitalReturns(userStats.personalDeposits, mostRecentDepositDate);
      } else {
        console.log('[⏱️ REAL-TIME] No deposit data available');
        return;
      }
      
      setRealTimeReturns(realTimeData);
      console.log('[⏱️ REAL-TIME] Updated accumulated amount:', formatCurrencyPrecise(realTimeData.accumulatedAmount, 6));
      console.log('[⏱️ REAL-TIME] Days accumulated:', realTimeData.daysAccumulated.toFixed(6));
    };
    
    // Initial update
    updateRealTimeReturns();
    
    // Set up timer to update every second
    const timer = setInterval(updateRealTimeReturns, 1000);
    
    // Cleanup timer on unmount or dependency change
    return () => {
      clearInterval(timer);
    };
  }, [userStats.personalDeposits, userStats.personalCapitalReturns]);

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
    const accumulatedAmount = realTimeReturns?.accumulatedAmount || userStats.personalCapitalReturns?.accumulatedAmount || 0;
    
    if (accumulatedAmount <= 0) {
      alert('No personal capital returns available for cashout');
      return;
    }
    
    // In a real app, this would trigger a blockchain transaction
    alert(`Cashout requested for ${formatCurrencyPrecise(accumulatedAmount, 6)}. Payment will arrive at midnight.`);
    
    // Update stats (in real app, this would come from blockchain)
    setUserStats(prev => ({
      ...prev,
      pendingCashout: accumulatedAmount,
      personalCapitalReturns: {
        ...prev.personalCapitalReturns,
        accumulatedAmount: 0
      }
    }));
    
    // Reset real-time returns
    setRealTimeReturns(null);
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
                <div className="text-sm text-gray-400 mb-1">Current Position</div>
                <div className={`text-xl sm:text-2xl font-bold ${getLevelColor(userStats.rankLevel)}`}>
                  {userStats.currentRank}
                </div>
                <div className="text-xs text-gray-500">
                  {userStats.returnRate > 0 ? `${userStats.returnRate}% Monthly Return` : 'No Return Yet'}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getLevelBadgeColor(userStats.rankLevel)}`}>
                  {userStats.returnTier}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 1 - GOAT Business Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Personal Deposits</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">{formatCurrency(userStats.personalDeposits)}</p>
                <p className="text-xs text-green-400 mt-1">
                  {userStats.canEarn ? `${userStats.returnRate}% Monthly Return` : 'Need $100 to earn'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-goat-gold/20 hover:border-goat-gold/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Daily Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-goat-gold truncate">
                  {userStats.canEarn ? formatCurrency(userStats.dailyEarnings) : '$0.00'}
                </p>
                <p className="text-xs text-goat-gold mt-1">
                  {userStats.canEarn ? 'Credited at 00:00' : 'Increase deposit to earn'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-goat-gold to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-purple-500/20 hover:border-purple-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Cashout Limit</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-400 truncate">
                  {networkOverview.cashoutLimitInfo ? 
                    formatCurrency(networkOverview.cashoutLimitInfo.remainingEarnings) : 
                    formatCurrency(userStats.maxCashout || 0)
                  }
                </p>
                <p className="text-xs text-purple-400 mt-1">
                  {networkOverview.cashoutLimitInfo ? 
                    `${networkOverview.cashoutLimitInfo.maxMultiplier}x limit - Remaining` :
                    `${userStats.multiplier}x your deposit`
                  }
                </p>
                {networkOverview.isEarningLimited && (
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 text-orange-400 mr-1" />
                    <span className="text-xs text-orange-400">Earnings limited</span>
                  </div>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 2 - Network & Bonuses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-green-500/20 hover:border-green-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Monthly Return</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400 truncate">
                  {userStats.canEarn ? formatCurrency(userStats.monthlyEarnings) : '$0.00'}
                </p>
                <p className="text-xs text-green-400 mt-1">
                  {userStats.canEarn ? `${userStats.returnTier} tier` : 'No tier yet'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-blue-500/20 hover:border-blue-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Network Bonus</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400 truncate">{formatCurrency(userStats.networkBonus || 0)}</p>
                <p className="text-xs text-blue-400 mt-1">
                  {userStats.userLevel?.current?.networkBonus || 0}% from team
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 hover:scale-105 transition-transform duration-200 border border-orange-500/20 hover:border-orange-500/40">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm font-medium">Team Deposit</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-400 truncate">{formatCurrency(userStats.networkValue)}</p>
                <p className="text-xs text-orange-400 mt-1">Total team deposits</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* DUAL CREDIT SYSTEM - Personal Capital & Network Earnings */}
        <div className="mb-8 space-y-6">
          
          {/* Personal Capital Returns - Monthly Cashout */}
          <div className="glass rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <Download className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mr-3" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Personal Capital Returns</h3>
                  <p className="text-sm text-gray-400">Monthly cashout system</p>
                </div>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <div className="text-sm text-gray-400">Next Cashout</div>
                <div className="text-green-400 font-semibold">
                  {userStats.cashoutCountdown?.days || 0} days
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-green-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                  {realTimeReturns ? 
                    formatCurrencyPrecise(realTimeReturns.accumulatedAmount, 6) : 
                    formatCurrencyPrecise(userStats.personalCapitalReturns?.accumulatedAmount || 0, 6)
                  }
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Accumulated Returns</div>
                <div className="text-xs text-gray-400 mt-1">
                  {realTimeReturns ? 
                    `${realTimeReturns.daysAccumulated.toFixed(6)} days accumulated` :
                    `${userStats.personalCapitalReturns?.daysAccumulated || 0} days accumulated`
                  }
                </div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-yellow-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                  {realTimeReturns ? 
                    formatCurrencyPrecise(realTimeReturns.dailyAmount, 6) : 
                    formatCurrencyPrecise(userStats.personalCapitalReturns?.dailyAmount || 0, 6)
                  }
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Daily Rate</div>
                <div className="text-xs text-gray-400 mt-1">
                  {userStats.personalCapitalReturns?.rate || 0}% monthly
                </div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-blue-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                  {formatCurrency(userStats.maxCashout || 0)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Max Cashout</div>
                <div className="text-xs text-gray-400 mt-1">
                  {userStats.multiplier || 0}x limit
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <button
                onClick={handleCashout}
                disabled={(realTimeReturns?.accumulatedAmount || userStats.personalCapitalReturns?.accumulatedAmount || 0) <= 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center w-full sm:w-auto justify-center"
              >
                <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                <span className="truncate">
                  Request Monthly Cashout
                </span>
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-2" />
                Monthly cashouts available on the 1st of each month
              </div>
            </div>
          </div>

          {/* Daily Network Earnings - Credited Daily */}
          <div className="glass rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mr-3" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Network Earnings</h3>
                  <p className="text-sm text-gray-400">Daily credits at 00:00</p>
                </div>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <div className="text-sm text-gray-400">Next Credit</div>
                <div className="text-blue-400 font-semibold">
                  {userStats.networkCreditCountdown?.hours || 0}h {userStats.networkCreditCountdown?.minutes || 0}m
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-blue-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                  {formatCurrency(userStats.dailyEarnings || 0)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Daily Network Earnings</div>
                <div className="text-xs text-gray-400 mt-1">From your network deposits</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-purple-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
                  {formatCurrency(userStats.accumulatedEarnings || 0)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Accumulated Earnings</div>
                <div className="text-xs text-gray-400 mt-1">Total earnings to date</div>
              </div>
              
              <div className="text-center p-3 sm:p-4 bg-black/20 rounded-xl border border-cyan-500/20">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
                  {formatCurrency(networkOverview.totalNetworkDeposits || 0)}
                </div>
                <div className="text-gray-300 font-medium text-sm sm:text-base">Total Team Deposits</div>
                <div className="text-xs text-gray-400 mt-1">
                  {((userStats.userLevel?.current?.network_bonus_rate || 0) * 100).toFixed(1)}% bonus rate
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-black/20 rounded-xl px-4 py-2 border border-blue-500/20">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">
                  Next credit automatically processed at 00:00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Bonus Breakdown - NUOVA SEZIONE */}
        {networkOverview.networkBonusBreakdown && networkOverview.networkBonusBreakdown.length > 0 && (
          <div className="mb-8">
            <div className="glass rounded-xl p-4 sm:p-6 border border-cyan-500/20">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center">
                <Network className="w-5 h-5 text-cyan-400 mr-2" />
                Network Bonus Breakdown
                <span className="ml-auto text-sm text-gray-400">
                  Daily: {formatCurrencyPrecise(networkOverview.differenceBonus + networkOverview.sameLevelBonus, 6)}
                </span>
              </h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-black/20 rounded-xl border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    {formatCurrencyPrecise(networkOverview.differenceBonus, 6)}
                  </div>
                  <div className="text-sm text-gray-300">Difference Bonus</div>
                  <div className="text-xs text-gray-500">From level differences on accumulated</div>
                </div>
                
                <div className="text-center p-4 bg-black/20 rounded-xl border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400 mb-2">
                    {formatCurrencyPrecise(networkOverview.sameLevelBonus, 6)}
                  </div>
                  <div className="text-sm text-gray-300">Same Level Bonus</div>
                  <div className="text-xs text-gray-500">From equal levels on accumulated</div>
                </div>
                
                <div className="text-center p-4 bg-black/20 rounded-xl border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {networkOverview.networkBonusBreakdown.length}
                  </div>
                  <div className="text-sm text-gray-300">Active Users</div>
                  <div className="text-xs text-gray-500">In your network</div>
                </div>
              </div>
              
              {/* Detailed Breakdown */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {networkOverview.networkBonusBreakdown.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        user.bonusType === 'difference' ? 'bg-green-500/20 text-green-400' :
                        user.bonusType === 'same_level' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        L{user.level}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.username}</div>
                        <div className="text-xs text-gray-400">
                          {formatCurrencyPrecise(user.deposits, 6)} deposits • {formatCurrencyPrecise(user.dailyProduction, 6)}/day potential
                        </div>
                        {/* NEW: Show real accumulated returns with 6 decimals */}
                        <div className="text-xs text-cyan-400">
                          💰 Accumulated: {formatCurrencyPrecise(user.accumulatedReturns || 0, 6)} ({(user.daysAccumulated || 0).toFixed(6)} days)
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        user.bonusType === 'difference' ? 'text-green-400' :
                        user.bonusType === 'same_level' ? 'text-blue-400' :
                        'text-gray-400'
                      }`}>
                        {user.calculatedBonus > 0 ? formatCurrencyPrecise(user.calculatedBonus, 6) : '$0.000000'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.bonusType === 'difference' && `${(user.bonusDifference * 100).toFixed(2)}% on accumulated`}
                        {user.bonusType === 'same_level' && 'Same level on accumulated'}
                        {user.bonusType === 'none' && 'No bonus'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {networkOverview.isEarningLimited && (
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mr-2" />
                    <span className="text-sm text-orange-400">
                      Daily earnings limited to {formatCurrency(networkOverview.originalDailyEarnings)} → {formatCurrency(networkOverview.dailyNetworkEarnings)} due to cashout limit
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Position Level and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          <div className="glass rounded-xl p-4 sm:p-6 border border-goat-gold/20 hover:border-goat-gold/40 transition-colors duration-200">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-goat-gold mr-2" />
              Current Position
            </h3>
            <div className="text-center">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${getLevelBadgeColor(userStats.rankLevel)}`}>
                <Trophy className={`w-10 h-10 sm:w-12 sm:h-12 ${userStats.rankLevel > 0 ? 'text-black' : 'text-white'}`} />
              </div>
              <h4 className={`text-xl sm:text-2xl font-bold mb-2 ${getLevelColor(userStats.rankLevel)}`}>
                {userStats.currentRank}
              </h4>
              <p className="text-gray-400 mb-2 text-sm sm:text-base">
                {userStats.userLevel?.current?.description || 'Base level position'}
              </p>
              <div className={`inline-block px-3 py-1 rounded-full text-xs ${getLevelBadgeColor(userStats.rankLevel)}`}>
                {userStats.userLevel?.current?.networkBonus || 0}% Network Bonus
              </div>
              
              {!userStats.userLevel?.isMaxLevel && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progress to {userStats.userLevel?.progress?.nextLevel || "Next Level"}</span>
                    <span className="text-goat-gold font-semibold">{Math.round(userStats.nextRankProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-goat-gold to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${userStats.nextRankProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6 border border-blue-500/20 hover:border-blue-500/40 transition-colors duration-200">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
              Next Level Progress
            </h3>
            {userStats.userLevel?.isMaxLevel ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏆</div>
                <h4 className="text-xl font-bold text-goat-gold mb-2">Maximum Level Reached!</h4>
                <p className="text-gray-400">You've achieved the highest position in GOAT Platform</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Next Level Info */}
                <div className="text-center mb-4 p-4 bg-black/20 rounded-xl border border-blue-500/20">
                  <h4 className={`text-lg font-bold ${getLevelColor(userStats.userLevel?.current?.level_id + 1 || 1)} mb-2`}>
                    {userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.name || `Posizione ${userStats.userLevel?.current?.level_id + 1}`}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.description || 'Next level requirements'}
                  </p>
                  
                  {/* Bonus Rate Upgrade */}
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Current Bonus</div>
                      <div className="text-lg font-bold text-goat-gold">
                        {(userStats.userLevel?.current?.network_bonus_rate * 100 || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Next Level Bonus</div>
                      <div className="text-lg font-bold text-green-400">
                        {((userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.network_bonus_rate || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Progress */}
                <div className="space-y-3">
                  {/* Personal Deposits */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Personal Deposits</span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(userStats.personalDeposits)} / {formatCurrency(userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_personal_deposit || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (userStats.personalDeposits / (userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_personal_deposit || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* First Line Revenue */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">First Line Revenue</span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(networkOverview.firstLineDeposits)} / {formatCurrency(userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_first_line_revenue || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (networkOverview.firstLineDeposits / (userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_first_line_revenue || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Team Deposits */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Team Deposits</span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(networkOverview.totalNetworkDeposits)} / {formatCurrency(userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_team_deposit || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, (networkOverview.totalNetworkDeposits / (userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.required_team_deposit || 1)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Qualification Requirements (se applicabili) */}
                {userStats.userLevel?.current?.level_id >= 1 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Info className="w-4 h-4 text-yellow-400 mr-2" />
                      <span className="text-sm text-yellow-400 font-medium">Special Requirements</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.requirements_text || 
                       `Position ${userStats.userLevel?.current?.level_id + 1} requires special qualifications`}
                    </p>
                  </div>
                )}

                {userStats.userLevel?.progress?.requirements?.map((req, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{req.name}</span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(req.current)} / {formatCurrency(req.required)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, req.progress)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-blue-400">
                      {Math.round(req.progress)}% Complete
                    </div>
                  </div>
                ))}
                
                {/* Next Level Benefits */}
                <div className="mt-6 p-4 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 rounded-lg border border-goat-gold/30">
                  <h4 className="text-goat-gold font-semibold mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Level Benefits
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Network Bonus:</span>
                      <span className="text-goat-gold font-semibold">
                        {((userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.network_bonus_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Max Multiplier:</span>
                      <span className="text-goat-gold font-semibold">
                        {userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.max_multiplier || 0}x
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Same Level Bonus:</span>
                      <span className="text-goat-gold font-semibold">
                        {((userStats.userLevel?.available?.[userStats.userLevel?.current?.level_id + 1]?.same_level_bonus_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          
          <button className="glass rounded-xl p-4 sm:p-6 text-center hover:scale-105 transition-all duration-200 border border-cyan-500/20 hover:border-cyan-500/40 group">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg transition-shadow duration-200">
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h4 className="font-semibold text-white text-base sm:text-lg mb-2">View Network</h4>
            <p className="text-sm text-gray-400">Complete network overview</p>
            <div className="mt-2 sm:mt-3 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {networkOverview.networkBonusBreakdown.length} active users →
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

        {/* GOAT Platform Stats */}
        <div className="mt-12 mb-8">
          <div className="glass rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-600/30">
            <h3 className="text-center text-lg font-bold text-white mb-6">GOAT Platform Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-goat-gold mb-1">9</div>
                <div className="text-gray-400 text-sm">Position Levels</div>
                <div className="text-xs text-gray-500 mt-1">Cliente to Position 8</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400 mb-1">10%</div>
                <div className="text-gray-400 text-sm">Max Return Rate</div>
                <div className="text-xs text-gray-500 mt-1">At $10K+ deposits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400 mb-1">50%</div>
                <div className="text-gray-400 text-sm">Max Network Bonus</div>
                <div className="text-xs text-gray-500 mt-1">At Position 8</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400 mb-1">00:00</div>
                <div className="text-gray-400 text-sm">Daily Credits</div>
                <div className="text-xs text-gray-500 mt-1">Every midnight</div>
              </div>
            </div>
            
            {/* Return Rate Tiers */}
            <div className="mt-8 border-t border-gray-600/30 pt-6">
              <h4 className="text-center text-sm font-semibold text-gray-300 mb-4">Return Rate Tiers</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 text-center">
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-gray-400">$0-$100</div>
                  <div className="text-xs text-gray-500">0%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-blue-400">$100-$500</div>
                  <div className="text-xs text-blue-300">5%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-green-400">$500-$1K</div>
                  <div className="text-xs text-green-300">6%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-yellow-400">$1K-$2.5K</div>
                  <div className="text-xs text-yellow-300">7%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-orange-400">$2.5K-$5K</div>
                  <div className="text-xs text-orange-300">8%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-purple-400">$5K-$10K</div>
                  <div className="text-xs text-purple-300">9%</div>
                </div>
                <div className="p-2 bg-black/20 rounded">
                  <div className="text-sm font-bold text-goat-gold">$10K+</div>
                  <div className="text-xs text-goat-gold">10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
