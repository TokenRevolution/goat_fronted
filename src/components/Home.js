import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { Trophy, Users, TrendingUp, Shield, Zap, Star, ArrowRight } from 'lucide-react';

const Home = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Trophy,
      title: '7 Trophy Levels',
      description: 'From Pulcini to Serie A, climb the ranks and collect exclusive trophies',
      color: 'from-goat-gold to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'High Returns',
      description: 'Earn up to 15% monthly returns based on your deposit amount',
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

  const stats = [
    { label: 'Total Users', value: '50,000+', icon: Users },
    { label: 'Total Deposits', value: '$25M+', icon: TrendingUp },
    { label: 'Trophies Awarded', value: '150,000+', icon: Trophy },
    { label: 'Network Growth', value: '300%', icon: Zap }
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
