import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  Users, 
  Copy, 
  Share2, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  UserPlus,
  Network,
  Gift,
  ExternalLink
} from 'lucide-react';
import { 
  generateReferralCode, 
  calculateReferralBonus, 
  formatCurrency,
  formatPercentage 
} from '../utils/platformUtils';
import { goatApi } from '../api/goat';
import { referralsApi } from '../api/referrals';

const Referrals = () => {
  const { isConnected, account } = useWallet();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkTree, setNetworkTree] = useState([]);
  const [bonusCalculations, setBonusCalculations] = useState([]);

  useEffect(() => {
    if (isConnected && account) {
      setReferralCode(generateReferralCode(account));
    }
  }, [isConnected, account]);

  // Load referral data when connected
  useEffect(() => {
    const loadReferralData = async () => {
      if (!isConnected || !account) {
        setLoading(false);
        return;
      }

      try {
        console.log('[DEBUG] Referrals: Loading data for account:', account);
        setLoading(true);
        setError(null);

        // Get dashboard data which includes network info
        const dashboardResponse = await goatApi.getUserDashboardData(account);
        
        if (dashboardResponse.success && dashboardResponse.data) {
          const { network } = dashboardResponse.data;
          
          // Update referral stats from dashboard data
          setReferralStats({
            totalReferrals: network.directReferrals || 0,
            activeReferrals: network.directReferrals || 0,
            totalEarnings: network.referralEarnings || 0,
            monthlyEarnings: network.monthlyReferralEarnings || 0
          });
          
          // Create network tree from referral data (if available)
          if (network.referrals && network.referrals.length > 0) {
            const networkData = network.referrals.map((referral, index) => ({
              id: index + 1,
              address: referral.address || `${referral.address?.slice(0, 6)}...${referral.address?.slice(-3)}`,
              deposit: referral.totalDeposits || 0,
              returnRate: referral.returnRate || 0,
              earnings: referral.earnings || 0,
              level: 1, // Default to level 1 for now
              status: referral.active ? 'active' : 'inactive',
              joinDate: referral.joinDate || new Date().toISOString().split('T')[0]
            }));
            setNetworkTree(networkData);
          }
        }

        // Get referral stats from referrals API
        const referralStatsResponse = await referralsApi.getReferralStats(account);
        if (referralStatsResponse.success) {
          setReferralStats(prev => ({
            ...prev,
            ...referralStatsResponse.stats
          }));
        }

      } catch (error) {
        console.error('[DEBUG] Referrals: Error loading referral data:', error);
        setError(error.message || 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [isConnected, account]);

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(`https://goat-platform.com/ref/${referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GOAT Platform',
          text: 'Join me on GOAT - the Greatest of All Time football platform and start earning rewards!',
          url: `https://goat-platform.com/ref/${referralCode}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyReferralCode();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to view your referral network</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h2 className="text-xl text-gray-300">Loading referral data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl text-gray-300 mb-2">Error loading referrals</h2>
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">Referral Network</h1>
          <p className="text-lg sm:text-xl text-gray-300">Invite friends and earn bonuses from their success</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm">Total Referrals</p>
                <p className="text-lg sm:text-2xl font-bold text-white">{referralStats.totalReferrals}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm">Active Referrals</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">{referralStats.activeReferrals}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm">Total Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-goat-gold truncate">{formatCurrency(referralStats.totalEarnings)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-goat-gold to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-gray-400 text-xs sm:text-sm">Monthly Earnings</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">{formatCurrency(referralStats.monthlyEarnings)}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Referral Code Section */}
          <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Your Referral Code</h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Referral Link
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
                <input
                  type="text"
                  value={`https://goat-platform.com/ref/${referralCode}`}
                  readOnly
                  className="flex-1 bg-black/20 border border-gray-600 rounded-lg sm:rounded-l-lg sm:rounded-r-none px-3 sm:px-4 py-2 sm:py-3 text-white focus:outline-none focus:border-goat-gold text-sm sm:text-base min-w-0"
                />
                <button
                  onClick={copyReferralCode}
                  className="bg-goat-gold hover:bg-orange-500 text-black px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {copied ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2">Referral link copied to clipboard!</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={shareReferral}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Link
              </button>
              
              <button
                onClick={() => window.open('https://twitter.com/intent/tweet?text=Join me on GOAT - the Greatest of All Time football platform!', '_blank')}
                className="flex items-center justify-center px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Share on Twitter
              </button>
            </div>

            {/* How it Works */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">How Referrals Work</h3>
              <ul className="space-y-2 text-sm text-blue-300">
                <li>• Share your referral link with friends</li>
                <li>• Earn bonus percentage from their returns</li>
                <li>• Higher your rate, bigger the bonus difference</li>
                <li>• Build your network and increase your rank</li>
              </ul>
            </div>
          </div>

          {/* Bonus Calculator */}
          <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Bonus Calculator</h2>
            
            <div className="space-y-4">
              {bonusCalculations.length > 0 ? (
                bonusCalculations.map((calc, index) => (
                  <div key={index} className="p-4 bg-black/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-medium">{calc.referral}</span>
                      <span className="text-goat-gold font-bold">{formatCurrency(calc.earnings)}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Your Rate: {formatPercentage(calc.yourRate)} | 
                      Their Rate: {formatPercentage(calc.theirRate)} | 
                      Bonus: {formatPercentage(calc.bonus)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No referral bonuses yet</div>
                  <div className="text-sm text-gray-500">Start inviting friends to see your bonus calculations</div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 rounded-lg border border-goat-gold/20">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Total Monthly Bonus:</span>
                <span className="text-2xl font-bold text-goat-gold">
                  {formatCurrency(referralStats.monthlyEarnings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Tree */}
        <div className="glass rounded-xl p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Your Network</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-300 py-3">Address</th>
                  <th className="text-left text-gray-300 py-3">Deposit</th>
                  <th className="text-left text-gray-300 py-3">Return Rate</th>
                  <th className="text-left text-gray-300 py-3">Your Bonus</th>
                  <th className="text-left text-gray-300 py-3">Status</th>
                  <th className="text-left text-gray-300 py-3">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {networkTree.length > 0 ? (
                  networkTree.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-700/50">
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            referral.level === 1 ? 'bg-blue-400' : 'bg-purple-400'
                          }`}></div>
                          <span className="text-white font-mono">{referral.address}</span>
                        </div>
                      </td>
                      <td className="py-4 text-white">{formatCurrency(referral.deposit)}</td>
                      <td className="py-4 text-goat-gold">{formatPercentage(referral.returnRate)}</td>
                      <td className="py-4 text-green-400">{formatCurrency(referral.earnings)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400">{referral.joinDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="text-gray-400 mb-2">No referrals yet</div>
                      <div className="text-sm text-gray-500">Share your referral link to start building your network</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referral Benefits */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Referral Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6">
              <Gift className="w-12 h-12 text-goat-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Bonus Earnings</h3>
              <p className="text-gray-300">Earn the difference between your return rate and your referrals' rates</p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <Network className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Network Growth</h3>
              <p className="text-gray-300">Build a strong network to increase your rank and unlock higher returns</p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Passive Income</h3>
              <p className="text-gray-300">Earn continuous bonuses as your network grows and earns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
