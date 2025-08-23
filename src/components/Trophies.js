import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Trophy, 
  Star, 
  Crown, 
  Medal, 
  Award,
  Target,
  Lock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { 
  calculateRank, 
  calculateRankProgress, 
  getTrophyInfo,
  formatCurrency 
} from '../utils/platformUtils';

const Trophies = () => {
  const { isConnected, account } = useWallet();
  const [userProgress, setUserProgress] = useState({
    currentLevel: 0,
    totalNetworkDeposits: 2500,
    unlockedTrophies: [0],
    achievements: {
      firstDeposit: true,
      firstReferral: false,
      monthlyGoal: false,
      networkBuilder: false,
      topEarner: false,
      seriesChampion: false,
      goatLegend: false
    }
  });

  const trophyLevels = [
    {
      id: 0,
      name: 'Nuovo',
      requirement: '< $5,000 Network',
      personalDeposit: '$0',
      requiredAmount: 5000,
      personalRequired: 0,
      icon: '⚽',
      color: 'from-gray-400 to-gray-600',
      description: 'Welcome to GOAT platform',
      benefits: ['Basic Access', 'Entry Level Features', 'Starter Badge'],
      unlocked: true
    },
    {
      id: 1,
      name: 'Pulcini',
      requirement: '$5K - $10K Network',
      personalDeposit: '$1,000',
      requiredAmount: 10000,
      personalRequired: 1000,
      icon: '🥉',
      color: 'from-green-400 to-green-600',
      description: 'First steps in the football world',
      benefits: ['8-10% Monthly Returns', 'Basic Network Access', 'Bronze Trophy', '🎁 Carta WeFi Gratuita'],
      unlocked: false
    },
    {
      id: 2,
      name: 'Esordienti',
      requirement: '$10K - $20K Network',
      personalDeposit: '$3,000',
      requiredAmount: 20000,
      personalRequired: 3000,
      icon: '🥈',
      color: 'from-blue-400 to-blue-600',
      description: 'Rising talent in the game',
      benefits: ['10-12% Monthly Returns', 'Enhanced Network Tools', 'Silver Trophy'],
      unlocked: false
    },
    {
      id: 3,
      name: 'Juniores',
      requirement: '$20K - $80K Network',
      personalDeposit: '$10,000',
      requiredAmount: 80000,
      personalRequired: 10000,
      icon: '🥇',
      color: 'from-purple-400 to-purple-600',
      description: 'Junior champion level',
      benefits: ['12% Monthly Returns', 'Advanced Analytics', 'Gold Trophy'],
      unlocked: false
    },
    {
      id: 4,
      name: 'Eccellenza',
      requirement: '$80K - $150K Network',
      personalDeposit: '$15,000',
      requiredAmount: 150000,
      personalRequired: 15000,
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-600',
      description: 'Excellence in performance',
      benefits: ['12-15% Monthly Returns', 'Premium Support', 'Excellence Trophy'],
      unlocked: false
    },
    {
      id: 5,
      name: 'Serie C',
      requirement: '$150K - $500K Network',
      personalDeposit: '$25,000',
      requiredAmount: 500000,
      personalRequired: 25000,
      icon: '🏅',
      color: 'from-orange-400 to-orange-600',
      description: 'Professional league level',
      benefits: ['15% Monthly Returns', 'VIP Access', 'Professional Medal'],
      unlocked: false
    },
    {
      id: 6,
      name: 'Serie B',
      requirement: '$500K - $1.5M Network',
      personalDeposit: '$50,000',
      requiredAmount: 1500000,
      personalRequired: 50000,
      icon: '👑',
      color: 'from-red-400 to-red-600',
      description: 'Elite championship status',
      benefits: ['15% Monthly Returns', 'Elite Network', 'Championship Crown'],
      unlocked: false
    },
    {
      id: 7,
      name: 'Serie A',
      requirement: '$1.5M+ Network',
      personalDeposit: '$100,000',
      requiredAmount: Infinity,
      personalRequired: 100000,
      icon: '💎',
      color: 'from-goat-gold to-orange-500',
      description: 'Greatest of All Time',
      benefits: ['15% Monthly Returns', 'GOAT Status', 'Diamond Trophy', 'Exclusive Events'],
      unlocked: false
    }
  ];

  const achievements = [
    {
      id: 'firstDeposit',
      name: 'First Goal',
      description: 'Make your first deposit',
      icon: Target,
      color: 'text-green-400',
      unlocked: userProgress.achievements.firstDeposit
    },
    {
      id: 'firstReferral',
      name: 'Team Player',
      description: 'Invite your first referral',
      icon: Star,
      color: 'text-blue-400',
      unlocked: userProgress.achievements.firstReferral
    },
    {
      id: 'monthlyGoal',
      name: 'Monthly Star',
      description: 'Reach monthly earning goal',
      icon: Medal,
      color: 'text-purple-400',
      unlocked: userProgress.achievements.monthlyGoal
    },
    {
      id: 'networkBuilder',
      name: 'Network Builder',
      description: 'Build a network of 10+ referrals',
      icon: Award,
      color: 'text-yellow-400',
      unlocked: userProgress.achievements.networkBuilder
    },
    {
      id: 'topEarner',
      name: 'Top Earner',
      description: 'Earn $10,000+ in bonuses',
      icon: Crown,
      color: 'text-orange-400',
      unlocked: userProgress.achievements.topEarner
    },
    {
      id: 'seriesChampion',
      name: 'Series Champion',
      description: 'Reach Serie B level',
      icon: Trophy,
      color: 'text-red-400',
      unlocked: userProgress.achievements.seriesChampion
    },
    {
      id: 'goatLegend',
      name: 'GOAT Legend',
      description: 'Achieve Serie A status',
      icon: Crown,
      color: 'text-goat-gold',
      unlocked: userProgress.achievements.goatLegend
    }
  ];

  useEffect(() => {
    if (!isConnected) return;
    
    // Update trophy unlock status based on user progress
    const updatedLevels = trophyLevels.map(level => ({
      ...level,
      unlocked: userProgress.unlockedTrophies.includes(level.id)
    }));
    
    // In a real app, fetch user progress from blockchain/API
  }, [isConnected, userProgress]);

  const getCurrentProgress = () => {
    const currentTrophy = trophyLevels.find(trophy => trophy.id === userProgress.currentLevel);
    const nextTrophy = trophyLevels.find(trophy => trophy.id === userProgress.currentLevel + 1);
    
    if (!nextTrophy) return { progress: 100, remaining: 0 };
    
    const progress = (userProgress.totalNetworkDeposits / nextTrophy.requiredAmount) * 100;
    const remaining = nextTrophy.requiredAmount - userProgress.totalNetworkDeposits;
    
    return { progress: Math.min(progress, 100), remaining };
  };

  const { progress, remaining } = getCurrentProgress();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your trophies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Trophy Collection</h1>
          <p className="text-xl text-gray-300">Climb the ranks and collect all 7 legendary trophies</p>
        </div>

        {/* Current Progress */}
        <div className="glass rounded-xl p-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Your Current Progress</h2>
            
            <div className="flex items-center justify-center mb-6">
              <div className="text-6xl mr-4">
                {trophyLevels[userProgress.currentLevel - 1]?.icon}
              </div>
              <div className="text-left">
                <h3 className="text-3xl font-bold text-goat-gold">
                  {trophyLevels[userProgress.currentLevel - 1]?.name}
                </h3>
                <p className="text-gray-300">Level {userProgress.currentLevel} of 7</p>
                <p className="text-gray-400">
                  Network Value: {formatCurrency(userProgress.totalNetworkDeposits)}
                </p>
              </div>
            </div>

            {userProgress.currentLevel < 7 && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress to next trophy</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-goat-gold to-orange-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">
                  {formatCurrency(remaining)} remaining to unlock {trophyLevels[userProgress.currentLevel]?.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trophy Levels */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Trophy Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trophyLevels.map((trophy) => (
              <div 
                key={trophy.id} 
                className={`glass rounded-xl p-6 text-center trophy-container ${
                  trophy.unlocked ? 'trophy-shine' : 'opacity-60'
                }`}
              >
                <div className="relative">
                  {!trophy.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className={`text-6xl mb-4 ${!trophy.unlocked ? 'grayscale' : ''}`}>
                    {trophy.icon}
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${
                  trophy.unlocked ? 'text-goat-gold' : 'text-gray-400'
                }`}>
                  {trophy.name}
                </h3>
                
                <div className="mb-3">
                  <p className="text-gray-400 text-sm">{trophy.requirement}</p>
                  <p className="text-gray-400 text-xs">Personal: {trophy.personalDeposit}</p>
                </div>
                <p className="text-gray-300 text-sm mb-4">{trophy.description}</p>
                
                <div className="space-y-1">
                  {trophy.benefits.map((benefit, index) => (
                    <div key={index} className="text-xs text-gray-400 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
                      {benefit}
                    </div>
                  ))}
                </div>
                
                {trophy.unlocked && (
                  <div className="mt-4 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <span className="text-green-400 text-xs font-medium">UNLOCKED</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-8">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.id} 
                  className={`glass rounded-xl p-6 ${
                    achievement.unlocked ? 'border-goat-gold/30' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-goat-gold to-orange-500' 
                        : 'bg-gray-600'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-black' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                      
                      {achievement.unlocked && (
                        <div className="mt-2 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-green-400 text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trophy Stats */}
        <div className="mt-16 glass rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Trophy Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-goat-gold mb-2">
                {userProgress.unlockedTrophies.length}
              </div>
              <div className="text-gray-400">Trophies Unlocked</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {achievements.filter(a => a.unlocked).length}
              </div>
              <div className="text-gray-400">Achievements</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {userProgress.currentLevel}
              </div>
              <div className="text-gray-400">Current Level</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {progress.toFixed(0)}%
              </div>
              <div className="text-gray-400">Progress to Next</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trophies;
