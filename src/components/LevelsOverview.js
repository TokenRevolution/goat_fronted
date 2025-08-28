import React from 'react';
import { 
  Trophy, 
  Crown,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { 
  POSITION_LEVELS,
  formatCurrency,
  formatPercentage,
  getLevelColor,
  getLevelBadgeColor
} from '../utils/goatBusinessLogic';

const LevelsOverview = ({ userLevel = null, className = "" }) => {
  const getCurrentUserLevel = () => {
    if (!userLevel) return -1;
    return userLevel.current?.id || 0;
  };

  const getLevelIcon = (levelId) => {
    if (levelId === 0) return <Users className="w-6 h-6" />;
    if (levelId <= 2) return <Star className="w-6 h-6" />;
    if (levelId <= 5) return <Trophy className="w-6 h-6" />;
    return <Crown className="w-6 h-6" />;
  };

  const isLevelUnlocked = (levelId) => {
    return getCurrentUserLevel() >= levelId;
  };

  const isCurrentLevel = (levelId) => {
    return getCurrentUserLevel() === levelId;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-goat-gold mr-3" />
          GOAT Position Levels
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Advance through 9 position levels, each with increasing benefits and requirements. 
          Build your network and earn higher returns as you progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {POSITION_LEVELS.map((level, index) => (
          <div
            key={level.id}
            className={`glass rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
              isCurrentLevel(level.id)
                ? 'border-2 border-goat-gold shadow-lg shadow-goat-gold/20'
                : isLevelUnlocked(level.id)
                ? 'border border-green-500/30 hover:border-green-500/50'
                : 'border border-gray-600/30 hover:border-gray-500/50'
            }`}
          >
            {/* Level Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getLevelBadgeColor(level.id)}`}>
                  {isLevelUnlocked(level.id) ? (
                    <span className={`${getLevelColor(level.id)}`}>
                      {getLevelIcon(level.id)}
                    </span>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${getLevelColor(level.id)}`}>
                    {level.name}
                  </h3>
                  <div className="text-xs text-gray-400">
                    Level {level.id} of 8
                  </div>
                </div>
              </div>
              
              {isCurrentLevel(level.id) && (
                <div className="bg-goat-gold text-black text-xs font-bold px-2 py-1 rounded-full">
                  CURRENT
                </div>
              )}
              
              {isLevelUnlocked(level.id) && !isCurrentLevel(level.id) && (
                <CheckCircle className="w-6 h-6 text-green-400" />
              )}
            </div>

            {/* Level Description */}
            <p className="text-sm text-gray-300 mb-4 min-h-[40px]">
              {level.description}
            </p>

            {/* Level Benefits */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Network Bonus
                </span>
                <span className={`font-semibold ${getLevelColor(level.id)}`}>
                  {level.networkBonus}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Max Multiplier
                </span>
                <span className={`font-semibold ${getLevelColor(level.id)}`}>
                  {level.maxMultiplier}x
                </span>
              </div>
              
              {level.sameLevel > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Same Level Bonus
                  </span>
                  <span className={`font-semibold ${getLevelColor(level.id)}`}>
                    {level.sameLevel}%
                  </span>
                </div>
              )}
            </div>

            {/* Requirements */}
            {level.id > 0 && (
              <div className="border-t border-gray-600/30 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Requirements</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Personal Deposit:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(level.personalDeposit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">First Line Revenue:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(level.firstLineRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Team Revenue:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(level.teamRevenue)}
                    </span>
                  </div>
                </div>
                
                {level.requirements && (
                  <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300">
                    {level.requirements}
                  </div>
                )}
              </div>
            )}

            {/* Next Level Arrow */}
            {level.id < POSITION_LEVELS.length - 1 && (
              <div className="flex justify-center mt-4">
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Return Rate Tiers Section */}
      <div className="mt-12">
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-goat-gold mr-2" />
            Capital Return Rate Tiers
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {[
              { range: "$0 - $100", rate: 0, color: "text-gray-400", bg: "bg-gray-500/20" },
              { range: "$100 - $500", rate: 5, color: "text-blue-400", bg: "bg-blue-500/20" },
              { range: "$500 - $1K", rate: 6, color: "text-green-400", bg: "bg-green-500/20" },
              { range: "$1K - $2.5K", rate: 7, color: "text-yellow-400", bg: "bg-yellow-500/20" },
              { range: "$2.5K - $5K", rate: 8, color: "text-orange-400", bg: "bg-orange-500/20" },
              { range: "$5K - $10K", rate: 9, color: "text-purple-400", bg: "bg-purple-500/20" },
              { range: "$10K+", rate: 10, color: "text-goat-gold", bg: "bg-goat-gold/20" }
            ].map((tier, index) => (
              <div key={index} className={`${tier.bg} rounded-lg p-4 text-center`}>
                <div className={`text-sm font-bold ${tier.color} mb-1`}>
                  {tier.range}
                </div>
                <div className={`text-2xl font-bold ${tier.color}`}>
                  {tier.rate}%
                </div>
                <div className="text-xs text-gray-400">
                  Annual Return
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>💰 Daily returns credited at 00:00 every day</p>
            <p className="mt-2">🚀 Higher deposits = Higher returns + Better position levels</p>
          </div>
        </div>
      </div>

      {/* Platform Information */}
      <div className="mt-8">
        <div className="glass rounded-xl p-6 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 border border-goat-gold/30">
          <h3 className="text-lg font-bold text-goat-gold mb-4 text-center">
            🐐 GOAT Platform Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-white font-semibold">Instant Deposits</div>
              <div className="text-gray-400">No minimum required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-white font-semibold">Daily Returns</div>
              <div className="text-gray-400">Automated at midnight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🌐</div>
              <div className="text-white font-semibold">Global Network</div>
              <div className="text-gray-400">Earn from your team</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-white font-semibold">9 Levels</div>
              <div className="text-gray-400">Progressive rewards</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelsOverview;
