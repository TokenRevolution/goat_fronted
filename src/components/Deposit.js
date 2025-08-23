import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  AlertCircle, 
  CheckCircle,
  Info,
  Target
} from 'lucide-react';
import { 
  calculateMonthlyReturn, 
  validateDeposit, 
  formatCurrency,
  formatPercentage 
} from '../utils/platformUtils';

const Deposit = () => {
  const { isConnected, account, sendTransaction } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [validationError, setValidationError] = useState('');

  const returnTiers = [
    { min: 0, max: 100, percentage: 8, color: 'from-green-400 to-green-600' },
    { min: 100, max: 500, percentage: 10, color: 'from-blue-400 to-blue-600' },
    { min: 500, max: 1000, percentage: 12, color: 'from-purple-400 to-purple-600' },
    { min: 1000, max: Infinity, percentage: 15, color: 'from-goat-gold to-orange-500' }
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const handleDeposit = async () => {
    const validation = validateDeposit(depositAmount);
    if (!validation.valid) {
      setValidationError(validation.message);
      return;
    }

    if (!isConnected) {
      setValidationError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      // In a real app, this would be the GOAT platform contract address
      const platformAddress = '0x1234567890123456789012345678901234567890';
      
      const result = await sendTransaction(platformAddress, parseFloat(depositAmount));
      
      if (result.success) {
        setTransactionStatus({
          type: 'success',
          message: 'Deposit successful!',
          hash: result.hash
        });
        setDepositAmount('');
      } else {
        setTransactionStatus({
          type: 'error',
          message: result.error || 'Transaction failed',
          hash: null
        });
      }
    } catch (error) {
      setTransactionStatus({
        type: 'error',
        message: error.message || 'An error occurred',
        hash: null
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentTier = () => {
    const amount = parseFloat(depositAmount) || 0;
    return returnTiers.find(tier => amount > tier.min && amount <= tier.max) || returnTiers[0];
  };

  const currentTier = getCurrentTier();
  const monthlyReturn = calculateMonthlyReturn(parseFloat(depositAmount) || 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-300 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to make deposits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Make a Deposit</h1>
          <p className="text-xl text-gray-300">Start earning monthly returns and climb the GOAT ranks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <div className="glass rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Deposit Amount</h2>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={depositAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount (min: $10)"
                  className="deposit-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                  min="10"
                  step="0.01"
                />
              </div>
              {validationError && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {validationError}
                </p>
              )}
            </div>

            <button
              onClick={handleDeposit}
              disabled={isProcessing || !depositAmount}
              className="w-full bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? 'Processing...' : 'Make Deposit'}
            </button>

            {/* Transaction Status */}
            {transactionStatus && (
              <div className={`mt-4 p-4 rounded-lg ${
                transactionStatus.type === 'success' 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-red-500/20 border border-red-500/30'
              }`}>
                <div className="flex items-center">
                  {transactionStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <span className={`font-medium ${
                    transactionStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transactionStatus.message}
                  </span>
                </div>
                {transactionStatus.hash && (
                  <p className="text-sm text-gray-400 mt-2">
                    Transaction Hash: {transactionStatus.hash.slice(0, 10)}...{transactionStatus.hash.slice(-8)}
                  </p>
                )}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Important Information</p>
                  <ul className="space-y-1">
                    <li>• Minimum deposit: $10</li>
                    <li>• Returns are paid monthly</li>
                    <li>• Deposits are locked for the earning period</li>
                    <li>• Higher deposits earn higher returns</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Return Calculator */}
          <div className="glass rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Return Calculator</h2>
            
            {depositAmount ? (
              <div className="space-y-6">
                {/* Current Tier */}
                <div className="text-center p-6 bg-gradient-to-r from-goat-gold/10 to-orange-500/10 rounded-lg border border-goat-gold/20">
                  <h3 className="text-lg font-semibold text-white mb-2">Your Tier</h3>
                  <div className={`w-16 h-16 bg-gradient-to-r ${currentTier.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-goat-gold">
                    {formatPercentage(currentTier.percentage)} Monthly Return
                  </p>
                  <p className="text-gray-400 text-sm">
                    ${currentTier.min} - ${currentTier.max === Infinity ? '∞' : currentTier.max}
                  </p>
                </div>

                {/* Monthly Return */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Monthly Return:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(monthlyReturn.return)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Return Rate:</span>
                    <span className="text-lg font-semibold text-green-400">
                      {formatPercentage(monthlyReturn.percentage)}
                    </span>
                  </div>
                </div>

                {/* Annual Projection */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Annual Return:</span>
                    <span className="text-xl font-bold text-blue-400">
                      {formatCurrency(monthlyReturn.return * 12)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Enter an amount to see your potential returns</p>
              </div>
            )}

            {/* Return Tiers */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Return Tiers</h3>
              <div className="space-y-3">
                {returnTiers.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-gradient-to-r ${tier.color} rounded-full mr-3`}></div>
                      <span className="text-gray-300">
                        ${tier.min} - ${tier.max === Infinity ? '∞' : tier.max}
                      </span>
                    </div>
                    <span className="text-goat-gold font-semibold">
                      {formatPercentage(tier.percentage)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Why Deposit with GOAT?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-goat-gold mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">High Returns</h3>
              <p className="text-gray-300">Earn up to 15% monthly returns based on your deposit amount</p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Rank Advancement</h3>
              <p className="text-gray-300">Climb the ranks from Pulcini to Serie A and collect exclusive trophies</p>
            </div>
            
            <div className="glass rounded-xl p-6">
              <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Referral Bonuses</h3>
              <p className="text-gray-300">Earn additional income from your referral network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
