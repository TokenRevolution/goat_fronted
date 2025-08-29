import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { goatApi } from '../api/goat';
import { Trophy, Users, TrendingUp, Shield, Zap, Star, ArrowRight, Heart, MessageCircle, CreditCard, AlertTriangle, CheckCircle, Upload, Gift } from 'lucide-react';

const Home = () => {
  const { isConnected, isUserRegistered, registrationChecked } = useWallet();
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalTrophiesAwarded: 0,
    networkGrowthRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Handle registration redirect when user connects wallet
  useEffect(() => {
    console.log('[DEBUG] Home: Registration check effect triggered', {
      isConnected,
      isUserRegistered,
      registrationChecked,
      location: window.location.pathname
    });
    
    if (isConnected && registrationChecked && isUserRegistered === false) {
      console.log('[DEBUG] Home: User connected but not registered, redirecting to registration...');
      navigate('/register');
    } else if (isConnected && registrationChecked && isUserRegistered === true) {
      console.log('[DEBUG] Home: User connected and registered, staying on home');
    } else if (isConnected && !registrationChecked) {
      console.log('[DEBUG] Home: User connected but registration check not completed yet');
    } else if (!isConnected) {
      console.log('[DEBUG] Home: User not connected');
    }
  }, [isConnected, isUserRegistered, registrationChecked, navigate]);

  // Load platform statistics
  useEffect(() => {
    const loadPlatformStats = async () => {
      try {
        console.log('[DEBUG] Home: Loading platform statistics...');
        const response = await goatApi.getPlatformStats();
        if (response.success) {
          setPlatformStats({
            totalUsers: response.stats.totalUsers || 0,
            totalDeposits: response.stats.totalDeposits || 0,
            totalDepositCount: response.stats.activeUsers || 0, // Use active users as deposit count
            totalTrophiesAwarded: 8, // Static for now (8 position levels)
            totalReferrals: 0, // Will be enhanced later
            averageMonthlyReturn: 7.5 // Average of return rates
          });
          console.log('[DEBUG] Home: Platform stats loaded:', response.stats);
        } else {
          // Fallback to default stats
          setPlatformStats({
            totalUsers: 0,
            totalDeposits: 0,
            totalDepositCount: 0,
            totalTrophiesAwarded: 8,
            totalReferrals: 0,
            averageMonthlyReturn: 7.5
          });
        }
      } catch (error) {
        console.error('[DEBUG] Home: Error loading platform stats:', error);
        // Set fallback stats
        setPlatformStats({
          totalUsers: 0,
          totalDeposits: 0,
          totalDepositCount: 0,
          totalTrophiesAwarded: 8,
          totalReferrals: 0,
          averageMonthlyReturn: 7.5
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadPlatformStats();
  }, []);

  const features = [
    {
      icon: Trophy,
      title: '8 Trophy Levels',
      description: 'From Pulcini to Serie A, climb the ranks and collect exclusive trophies',
      color: 'from-goat-gold to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Earn up to 10% monthly returns (Diamond tier)',
      color: 'from-green-400 to-blue-500'
    },
    {
      icon: Users,
      title: 'Referral Network',
      description: 'Build your network and earn bonuses from your referrals',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Built on secure blockchain technology with transparent transactions',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    } else if (num > 0) {
      return `$${num.toFixed(0)}`;
    }
    return '$0';
  };

  const formatCount = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    } else if (num > 0) {
      return `${num}+`;
    }
    return '0';
  };

  const stats = [
    { 
      label: 'Total Users', 
      value: statsLoading ? 'Loading...' : formatCount(platformStats.totalUsers), 
      icon: Users 
    },
    { 
      label: 'Total Deposits', 
      value: statsLoading ? 'Loading...' : formatNumber(platformStats.totalDeposits), 
      icon: TrendingUp 
    },
    { 
      label: 'Trophies Awarded', 
      value: statsLoading ? 'Loading...' : formatCount(platformStats.totalTrophiesAwarded), 
      icon: Trophy 
    },
    { 
      label: 'Network Growth', 
      value: statsLoading ? 'Loading...' : `${platformStats.networkGrowthRate}%`, 
      icon: Zap 
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-goat-gold/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">GOAT</span>
              <br />
              <span className="text-white">Greatest of All Time</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The ultimate football platform where you can earn rewards, build your network, 
              and collect exclusive trophies through blockchain technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isConnected ? (
                <Link
                  to="/deposit"
                  className="px-8 py-4 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 btn-animate"
                >
                  Start Earning Now
                  <ArrowRight className="inline ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 btn-animate"
                >
                  Go to Dashboard
                  <ArrowRight className="inline ml-2 w-5 h-5" />
                </Link>
              )}
              
              <Link
                to="/trophies"
                className="px-8 py-4 border-2 border-goat-gold text-goat-gold hover:bg-goat-gold hover:text-black font-bold text-lg rounded-lg transition-all duration-200"
              >
                View Trophies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <div className="text-3xl font-bold text-goat-gold mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">GOAT</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of football rewards with our innovative platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="glass rounded-xl p-6 text-center card-hover">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect Wallet</h3>
              <p className="text-gray-300">
                Connect your MetaMask, Trust Wallet, or any other Web3 wallet to get started
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Make Deposit</h3>
              <p className="text-gray-300">
                Deposit funds and start earning monthly returns based on your investment amount
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Earn & Grow</h3>
              <p className="text-gray-300">
                Build your network, earn referral bonuses, and collect trophies as you climb ranks
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* WeFi Card Reward Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Gift className="w-12 h-12 text-cyan-500 mr-4" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">Carta WeFi</span> Reward
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Raggiungi il <span className="text-cyan-500 font-bold">rank Pulcini</span> e ottieni una 
              <span className="text-goat-gold font-bold"> carta WeFi decentralizzata</span> come premio esclusivo!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* WeFi Card Info */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-8 border-2 border-cyan-500/30">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-10 h-10 text-goat-gold mr-4" />
                  <h3 className="text-3xl font-bold text-white">Carta WeFi Gratuita</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">Carta Decentralizzata</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Tecnologia blockchain avanzata per pagamenti sicuri</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">Multi-Chain Compatible</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Supporta reti BNB, ETH, TRX e altre blockchain</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">Reward Esclusivo</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Ottieni la carta gratuitamente raggiungendo il rank Pulcini</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">Accesso Premium</p>
                      <p className="text-gray-400 text-sm leading-relaxed">Funzionalità avanzate e vantaggi esclusivi</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Gift className="w-5 h-5 text-cyan-400 mr-2" />
                    <span className="text-cyan-400 font-semibold">REWARD PULCINI</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Raggiungi $5.000 - $10.000 di network deposits + $1.000 deposito personale e ricevi la tua carta WeFi gratuitamente! 
                    Un reward esclusivo per i primi GOAT della piattaforma.
                  </p>
                </div>
              </div>
            </div>

            {/* Rank Progress to WeFi */}
            <div className="space-y-6">
              <div className="glass rounded-xl p-8">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Come Ottenere la Carta WeFi</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">0</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">Inizia come Nuovo</h4>
                      <p className="text-gray-400 leading-relaxed">
                        Registrati sulla piattaforma e inizia il tuo percorso GOAT.
                      </p>
                      <div className="text-sm text-gray-500 mt-1">Target: $0 - $5,000</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">Raggiungi Rank Pulcini</h4>
                      <p className="text-gray-400 leading-relaxed">
                        Accumula $5,000 - $10,000 di network deposits + $1,000 deposito personale minimo.
                      </p>
                      <div className="text-sm text-green-400 mt-1 font-semibold">🎁 Reward: Carta WeFi Gratuita!</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Requisiti: Network $5K-$10K + Personale $1K
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">Ricevi la Tua Carta</h4>
                      <p className="text-gray-400 leading-relaxed">
                        Una volta raggiunto il rank, riceverai automaticamente la tua carta WeFi decentralizzata.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">Goditi i Vantaggi</h4>
                      <p className="text-gray-400 leading-relaxed">
                        Usa la tua carta per accedere a funzionalità premium e vantaggi esclusivi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Networks */}
              <div className="glass rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 text-center">Reti Supportate dalla Carta WeFi</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">BNB</span>
                    </div>
                    <span className="text-white font-medium">Binance Smart Chain</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ETH</span>
                    </div>
                    <span className="text-white font-medium">Ethereum</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TRX</span>
                    </div>
                    <span className="text-white font-medium">Tron</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">+</span>
                    </div>
                    <span className="text-white font-medium">Altre Reti</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 rounded-xl p-8 text-center">
            <Trophy className="w-12 h-12 text-goat-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Disclaimer Carta WeFi</h3>
            <p className="text-gray-300 text-lg max-w-4xl mx-auto">
              La <span className="text-goat-gold font-bold">carta WeFi</span> viene assegnata automaticamente come reward 
              al raggiungimento del <span className="text-cyan-500 font-bold">rank Pulcini</span> (network deposits tra $5,000 e $10,000 + 
              deposito personale di $1,000). Questa carta decentralizzata ti darà accesso a funzionalità premium e supporta le principali blockchain. 
              È un reward esclusivo per riconoscere il tuo impegno nella piattaforma GOAT.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-goat-gold/10 to-orange-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Become a <span className="gradient-text">GOAT</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players already earning rewards and collecting trophies
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/deposit"
              className="px-8 py-4 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Your Journey
            </Link>
            <Link
              to="/referrals"
              className="px-8 py-4 border-2 border-goat-gold text-goat-gold hover:bg-goat-gold hover:text-black font-bold text-lg rounded-lg transition-all duration-200"
            >
              Invite Friends
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
