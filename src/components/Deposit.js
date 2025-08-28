import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  AlertCircle, 
  CheckCircle,
  Info,
  Target,
  Heart
} from 'lucide-react';
import { 
  calculateMonthlyReturn, 
  calculateDailyReturn,
  validateDeposit, 
  calculateDonation,
  formatCurrency,
  formatPercentage 
} from '../utils/platformUtils';
import { goatApi } from '../api';

const Deposit = () => {
  const { isConnected, account, sendTransaction, usdtBalance, getUSDTBalance } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [isDonationEnabled, setIsDonationEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [targetWallet, setTargetWallet] = useState(null);

  const returnTiers = [
    { min: 0, max: 100, basePercentage: 8, maxPercentage: 9, color: 'from-green-400 to-green-600' },
    { min: 100, max: 500, basePercentage: 10, maxPercentage: 11, color: 'from-blue-400 to-blue-600' },
    { min: 500, max: 1000, basePercentage: 12, maxPercentage: 13, color: 'from-purple-400 to-purple-600' },
    { min: 1000, max: Infinity, basePercentage: 15, maxPercentage: 16, color: 'from-goat-gold to-orange-500' }
  ];

  // Load target wallet address on component mount
  useEffect(() => {
    const loadTargetWallet = async () => {
      try {
        const response = await goatApi.wallet.getTargetAddress();
        if (response.success) {
          setTargetWallet(response.targetAddress);
          console.log('[DEBUG] Deposit: Target wallet loaded:', response.targetAddress);
        }
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
    // Use API validation instead of utils
    const validation = goatApi.deposits.validateDepositAmount(parseFloat(depositAmount));
    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    if (!isConnected) {
      setValidationError('Please connect your wallet first');
      return;
    }

    // Check USDT balance
    const usdtBal = parseFloat(usdtBalance || '0');
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

          const donationMessage = isDonationEnabled 
            ? ` (includes ${formatCurrency(donationInfo.donation)} donation)` 
            : '';
          
          setTransactionStatus({
            type: 'success',
            message: `Deposit successful!${donationMessage}`,
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
        setIsDonationEnabled(false);
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
  const monthlyReturn = calculateMonthlyReturn(parseFloat(depositAmount) || 0, true); // Assume Instagram bonus for display
  const dailyReturn = calculateDailyReturn(parseFloat(depositAmount) || 0, true); // Assume Instagram bonus for display
  const donationInfo = calculateDonation(parseFloat(depositAmount) || 0, isDonationEnabled);

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
                  Balance: <span className="text-goat-gold font-medium">{formatCurrency(parseFloat(usdtBalance || '0'))} USDT</span>
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

            {/* Donation Option */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-lg border-2 border-gray-600 hover:border-goat-gold/50 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={isDonationEnabled}
                  onChange={(e) => setIsDonationEnabled(e.target.checked)}
                  className="w-5 h-5 text-goat-gold bg-transparent border-2 border-gray-600 rounded focus:ring-goat-gold focus:ring-2 mt-0.5"
                />
                <Heart className={`w-5 h-5 mt-0.5 ${isDonationEnabled ? 'text-red-500' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <span className="text-white font-medium">Dona 0.5% allo sviluppo della piattaforma</span>
                  <p className="text-gray-400 text-sm mt-1">
                    Supporta il continuo sviluppo e miglioramento di GOAT
                  </p>
                  {isDonationEnabled && depositAmount && (
                    <div className="mt-2 p-2 bg-goat-gold/10 rounded border border-goat-gold/20">
                      <p className="text-goat-gold text-sm">
                        💝 Donazione: {formatCurrency(donationInfo.donation)} | 
                        Deposito netto: {formatCurrency(donationInfo.netDeposit)}
                      </p>
                    </div>
                  )}
                </div>
              </label>
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
                    {formatPercentage(monthlyReturn.finalPercentage)} Monthly Return
                  </p>
                  <p className="text-gray-400 text-sm">
                    ${currentTier.min} - ${currentTier.max === Infinity ? '∞' : currentTier.max}
                  </p>
                  {monthlyReturn.instagramBonus > 0 && (
                    <p className="text-pink-500 text-sm mt-1">
                      Include +{monthlyReturn.instagramBonus}% Instagram Bonus
                    </p>
                  )}
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
                      {formatPercentage(monthlyReturn.finalPercentage)}
                    </span>
                  </div>
                  {monthlyReturn.instagramBonus > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-500 text-sm">Base + Instagram:</span>
                      <span className="text-sm text-pink-500">
                        {formatPercentage(monthlyReturn.basePercentage)} + {formatPercentage(monthlyReturn.instagramBonus)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Daily Return */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Daily Return:</span>
                    <span className="text-2xl font-bold text-blue-400">
                      {formatCurrency(dailyReturn.dailyReturn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400">Daily Rate:</span>
                    <span className="text-lg font-semibold text-blue-400">
                      {formatPercentage(dailyReturn.finalPercentage / 30)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Accumulates daily until cashout request
                  </div>
                </div>

                {/* Donation Breakdown */}
                {isDonationEnabled && depositAmount && (
                  <div className="p-4 bg-goat-gold/10 border border-goat-gold/30 rounded-lg">
                    <div className="text-center mb-2">
                      <span className="text-goat-gold font-semibold">Platform Development Support</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Donation (0.5%):</span>
                        <span className="text-goat-gold font-semibold">
                          {formatCurrency(donationInfo.donation)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Net Deposit:</span>
                        <span className="text-white font-semibold">
                          {formatCurrency(donationInfo.netDeposit)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Annual Projection */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Annual Return:</span>
                    <span className="text-xl font-bold text-blue-400">
                      {formatCurrency(monthlyReturn.return * 12)}
                    </span>
                  </div>
                  {isDonationEnabled && (
                    <div className="text-xs text-gray-400 mt-1">
                      Based on net deposit of {formatCurrency(donationInfo.netDeposit)}
                    </div>
                  )}
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
              <p className="text-gray-300">Earn up to 16% monthly returns (15% base + 1% Instagram bonus)</p>
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
