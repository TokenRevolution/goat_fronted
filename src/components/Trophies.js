import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { goatApi } from '../api/goat';
import LevelsOverview from './LevelsOverview';
import { 
  Trophy, 
  Star, 
  Target,
  Users,
  TrendingUp,
  DollarSign,
  Crown,
  Info
} from 'lucide-react';
import { 
  calculateUserLevel,
  calculateDailyReturn,
  formatCurrency,
  POSITION_LEVELS
} from '../utils/goatBusinessLogic';

const Trophies = () => {
  const { isConnected, account } = useWallet();
  const [userStats, setUserStats] = useState({
    personalDeposit: 0,
    firstLineRevenue: 0,
    teamRevenue: 0,
    totalReferrals: 0
  });
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !account) {
      setLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Use new GOAT API to get user position data
        const positionResponse = await goatApi.getUserPosition(account);

        if (positionResponse.success && positionResponse.position) {
          const { position } = positionResponse;
          
          const stats = {
            personalDeposit: position.userStats.personalDeposit,
            firstLineRevenue: position.userStats.firstLineRevenue,
            teamRevenue: position.userStats.teamRevenue,
            totalReferrals: 0, // Will be enhanced later
            teamStructure: {}
          };

          setUserStats(stats);
          setUserLevel(position);
        } else {
          // Fallback to default values
          const defaultStats = {
            personalDeposit: 0,
            firstLineRevenue: 0,
            teamRevenue: 0,
            totalReferrals: 0,
            teamStructure: {}
          };
          
          setUserStats(defaultStats);
          
          // Set default level (Cliente)
          const defaultLevel = {
            current: {
              level_id: 0,
              name: 'Cliente',
              description: 'Livello base - può fare massimo x3 del capitale proprio',
              network_bonus_rate: 0.1000,
              max_multiplier: 3.0
            },
            next: null,
            progress: 0,
            isMaxLevel: false,
            userStats: defaultStats
          };
          
          setUserLevel(defaultLevel);
        }

      } catch (error) {
        console.error('[DEBUG] Trophies: Error loading user data:', error);
        // Set fallback data on error
        const fallbackStats = {
          personalDeposit: 0,
          firstLineRevenue: 0,
          teamRevenue: 0,
          totalReferrals: 0,
          teamStructure: {}
        };
        setUserStats(fallbackStats);
        setUserLevel({
          current: { level_id: 0, name: 'Cliente', network_bonus_rate: 0.1000, max_multiplier: 3.0 },
          progress: 0,
          isMaxLevel: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isConnected, account]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your GOAT position levels</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-300">Loading your GOAT journey...</h2>
        </div>
      </div>
    );
  }

  const returnInfo = calculateDailyReturn(userStats.personalDeposit);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with User's Current Status */}
        <div className="mb-8">
          <div className="glass rounded-2xl p-6 lg:p-8 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 border border-goat-gold/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 flex items-center">
                  <Crown className="w-10 h-10 text-goat-gold mr-3" />
                  Your GOAT Journey
                </h1>
                <p className="text-gray-300 text-lg">
                  Track your progress through the GOAT position levels and unlock increasing rewards.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <div className="text-2xl font-bold text-goat-gold">
                    {userLevel?.current?.name || 'Cliente'}
                  </div>
                  <div className="text-sm text-gray-400">Current Position</div>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {returnInfo.tier.rate}%
                  </div>
                  <div className="text-sm text-gray-400">Return Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Level Summary */}
        {userLevel && (
          <div className="mb-8">
            <div className="glass rounded-xl p-6 border border-blue-500/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="w-6 h-6 text-blue-400 mr-2" />
                Your Current Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(userStats.personalDeposit)}
                  </div>
                  <div className="text-sm text-gray-400">Personal Deposit</div>
                </div>
                
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(userStats.teamRevenue)}
                  </div>
                  <div className="text-sm text-gray-400">Team Revenue</div>
                </div>
                
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {userLevel.current.networkBonus}%
                  </div>
                  <div className="text-sm text-gray-400">Network Bonus</div>
                </div>
                
                <div className="text-center p-4 bg-black/20 rounded-lg">
                  <Target className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">
                    {userLevel.current.maxMultiplier}x
                  </div>
                  <div className="text-sm text-gray-400">Max Multiplier</div>
                </div>
              </div>

              {/* Progress to Next Level */}
              {!userLevel.isMaxLevel && (
                <div className="mt-6 p-4 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 rounded-lg border border-goat-gold/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-goat-gold">
                      Progress to {userLevel.next.name}
                    </h3>
                    <span className="text-goat-gold font-bold">
                      {Math.round(userLevel.progress.overall)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-goat-gold to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userLevel.progress.overall}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {userLevel.next.requirements}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="mb-8">
          <div className="glass rounded-xl p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-blue-400 mb-2">How GOAT Levels Work</h3>
                <div className="space-y-2 text-gray-300">
                  <p>🏆 <strong>9 Position Levels:</strong> Start as Cliente and advance to Position 8</p>
                  <p>💰 <strong>Return Rates:</strong> Earn 0% to 10% annual returns based on deposit amount</p>
                  <p>🌐 <strong>Network Bonuses:</strong> Earn 10% to 50% from your team's production</p>
                  <p>⏰ <strong>Daily Credits:</strong> All earnings are credited at 00:00 every day</p>
                  <p>🎯 <strong>Requirements:</strong> Each level has specific deposit, team, and structure requirements</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Levels Overview Component */}
        <LevelsOverview userLevel={userLevel} />
      </div>
    </div>
  );
};

export default Trophies;