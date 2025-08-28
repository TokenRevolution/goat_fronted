import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
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
  calculateReturnRate,
  calculateDailyReturn,
  calculatePersonalCapitalReturns,
  formatCurrency,
  formatPercentage,
  RETURN_RATES
} from '../utils/goatBusinessLogic';
import { goatApi } from '../api/goat';

const Deposit = () => {
  const { isConnected, account, sendTransaction, usdtBalance, getUSDTBalance } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [localUsdtBalance, setLocalUsdtBalance] = useState(usdtBalance || '0');

  // Update local balance when context changes
  useEffect(() => {
    setLocalUsdtBalance(usdtBalance || '0');
  }, [usdtBalance]);

  // Force refresh balance on mount if connected
  useEffect(() => {
    const refreshBalance = async () => {
      if (isConnected && account && getUSDTBalance) {
        try {
          const freshBalance = await getUSDTBalance(account);
          setLocalUsdtBalance(freshBalance || '0');
        } catch (error) {
          console.error('Error refreshing USDT balance:', error);
        }
      }
    };

    refreshBalance();
  }, [isConnected, account, getUSDTBalance]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [targetWallet, setTargetWallet] = useState(null);

  // Use GOAT return rates with colors
  const returnTiersWithColors = RETURN_RATES.map((tier, index) => ({
    ...tier,
    color: index === 0 ? 'from-gray-400 to-gray-600' :
           index === 1 ? 'from-green-400 to-green-600' :
           index === 2 ? 'from-blue-400 to-blue-600' :
           index === 3 ? 'from-purple-400 to-purple-600' :
           index === 4 ? 'from-orange-400 to-orange-600' :
           index === 5 ? 'from-pink-400 to-pink-600' :
           'from-goat-gold to-yellow-500'
  }));

  // Load target wallet address on component mount
  useEffect(() => {
    const loadTargetWallet = async () => {
      try {
        // For now, use a fallback target wallet with proper checksum
        // In production, this would come from platform settings
        const fallbackTargetWallet = '0x742d35Cc6634C0532925a3b8D1A88C5f5c7FA98a'; // Example BSC address
        
        // Fix checksum using ethers
        const checksummedAddress = ethers.utils.getAddress(fallbackTargetWallet);
        
        setTargetWallet(checksummedAddress);
        console.log('[DEBUG] Deposit: Using target wallet with checksum:', checksummedAddress);
      } catch (error) {
        console.error('[DEBUG] Deposit: Error loading target wallet:', error);
      }
    };

    loadTargetWallet();
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setDepositAmount(value);
    
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const handleDeposit = async () => {
    // Basic validation
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setValidationError('Please enter a valid deposit amount');
      return;
    }
    
    if (amount < 1) {
      setValidationError('Minimum deposit amount is $1');
      return;
    }
    
    setValidationError('');

    if (!isConnected) {
      setValidationError('Please connect your wallet first');
      return;
    }

    // Check USDT balance
    const usdtBal = parseFloat(localUsdtBalance || '0');
    const depositAmt = parseFloat(depositAmount);
    
    if (usdtBal < depositAmt) {
      setValidationError(`Insufficient USDT balance. You have ${formatCurrency(usdtBal)} USDT, need ${formatCurrency(depositAmt)} USDT`);
      return;
    }

    setIsProcessing(true);
    setTransactionStatus(null);

    try {
      // Use target wallet address from backend
      if (!targetWallet) {
        throw new Error('Target wallet address not available. Please refresh the page.');
      }
      
      console.log('[DEBUG] Deposit: Sending to target wallet:', targetWallet);
      const finalAmount = parseFloat(depositAmount);
      const result = await sendTransaction(targetWallet, finalAmount);
      
      if (result.success) {
        // Create deposit record in backend
        try {
          const depositResponse = await goatApi.deposits.createDeposit({
            amount: finalAmount,
            walletAddress: account,
            transactionHash: result.hash,
            token: 'USDT'
          });

          const tierMessage = returnInfo.rate > 0 
            ? ` (${returnInfo.label} tier - ${returnInfo.rate}% monthly)` 
            : ' (No returns on this amount)';
          
          setTransactionStatus({
            type: 'success',
            message: `Deposit successful!${tierMessage}`,
            hash: result.hash,
            depositId: depositResponse.deposit?.id
          });
        } catch (apiError) {
          // Transaction succeeded but API call failed
          console.error('API error after successful transaction:', apiError);
          setTransactionStatus({
            type: 'warning',
            message: `Transaction successful but there was an issue recording it. Please contact support with hash: ${result.hash}`,
            hash: result.hash
          });
        }
        
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

  // Calculate returns using GOAT business logic
  const amount = parseFloat(depositAmount) || 0;
  const returnInfo = calculateReturnRate(amount);
  const dailyReturnInfo = calculateDailyReturn(amount);
  const personalCapitalInfo = calculatePersonalCapitalReturns(amount, 30);
  
  const getCurrentTier = () => {
    return returnTiersWithColors.find(tier => 
      amount >= tier.min && amount < tier.max
    ) || returnTiersWithColors[returnTiersWithColors.length - 1];
  };

  const currentTier = getCurrentTier();

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
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-sm font-medium">
                  Amount (USD)
                </label>
                <span className="text-sm text-gray-400">
                  Balance: <span className="text-goat-gold font-medium">{formatCurrency(parseFloat(localUsdtBalance || '0'))} USDT</span>
                </span>
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={depositAmount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount (no minimum)"
                  className="deposit-input w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none"
                  min="0"
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

            {/* Return Tier Information */}
            <div className="mb-6">
              <div className="p-4 rounded-lg border-2 border-gray-600 bg-white/5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${currentTier.color}`}></div>
                  <span className="text-white font-medium">
                    {returnInfo.label} Tier ({returnInfo.rate}% Monthly)
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  {returnInfo.rate > 0 
                    ? `Your deposit will earn ${returnInfo.rate}% monthly returns through monthly cashouts`
                    : 'Deposits below $100 do not earn returns. Consider depositing more to start earning.'
                  }
                </p>
                {amount >= 100 && (
                  <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      💰 Monthly Accumulated: {formatCurrency(personalCapitalInfo.accumulatedAmount)} | 
                      Daily Rate: {formatCurrency(personalCapitalInfo.dailyAmount)}
                    </p>
                  </div>
                )}
              </div>
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
                    <li>• No minimum deposit required</li>
                    <li>• Daily returns accumulate automatically</li>
                    <li>• Cashout payments arrive at midnight after request</li>
                    <li>• Deposits are locked for the earning period</li>
                    <li>• Higher deposits earn higher returns</li>
                    <li>• Optional 0.5% donation supports platform development</li>
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
                    {returnInfo.rate}% Monthly Return
                  </p>
                  <p className="text-gray-400 text-sm">
                    ${currentTier.min} - ${currentTier.max === Infinity ? '∞' : currentTier.max}
                  </p>
                  {returnInfo.rate > 0 && (
                    <p className="text-green-500 text-sm mt-1">
                      ✅ Qualified for monthly cashouts
                    </p>
                  )}
                </div>

                {/* Monthly Accumulation */}
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Monthly Accumulation:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatCurrency(personalCapitalInfo.accumulatedAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Monthly Rate:</span>
                    <span className="text-lg font-semibold text-green-400">
                      {returnInfo.rate}%
                    </span>
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    Personal capital returns (monthly cashout system)
                  </div>
                </div>

                {/* Daily Rate */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Daily Rate:</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {formatCurrency(dailyReturnInfo.dailyReturn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Daily Percentage:</span>
                    <span className="text-lg font-semibold text-blue-400">
                      {formatPercentage(dailyReturnInfo.dailyRate)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Accumulates daily, paid monthly via cashout
                  </div>
                </div>



                {/* Annual Projection */}
                {returnInfo.rate > 0 && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Annual Projection:</span>
                      <span className="text-xl font-bold text-purple-400">
                        {formatCurrency(dailyReturnInfo.annualReturn)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on {returnInfo.label} tier ({returnInfo.rate}% monthly) • Monthly cashouts
                    </p>
                  </div>
                )}
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
                {returnTiersWithColors.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 bg-gradient-to-r ${tier.color} rounded-full mr-3`}></div>
                      <div>
                        <span className="text-gray-300">
                          ${tier.min} - ${tier.max === Infinity ? '∞' : tier.max}
                        </span>
                        <div className="text-xs text-gray-500">
                          Base: {formatPercentage(tier.basePercentage)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-goat-gold font-semibold">
                        {formatPercentage(tier.maxPercentage)}
                      </span>
                      <div className="text-xs text-pink-500">
                        con Instagram
                      </div>
                    </div>
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
              <p className="text-gray-300">Earn up to 10% monthly returns across 7 tiers (Diamond tier)</p>
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
