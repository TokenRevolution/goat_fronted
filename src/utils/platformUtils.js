// GOAT Platform Utility Functions

// Calculate monthly return based on deposit amount
export const calculateMonthlyReturn = (depositAmount) => {
  if (depositAmount <= 100) {
    return { percentage: 8, return: (depositAmount * 0.08).toFixed(2) };
  } else if (depositAmount <= 500) {
    return { percentage: 10, return: (depositAmount * 0.10).toFixed(2) };
  } else if (depositAmount <= 1000) {
    return { percentage: 12, return: (depositAmount * 0.12).toFixed(2) };
  } else {
    return { percentage: 15, return: (depositAmount * 0.15).toFixed(2) };
  }
};

// Calculate rank based on total network deposits
export const calculateRank = (totalNetworkDeposits) => {
  if (totalNetworkDeposits < 10000) {
    return { rank: 'Pulcini', level: 1, color: 'text-green-400', bgColor: 'bg-green-500' };
  } else if (totalNetworkDeposits < 20000) {
    return { rank: 'Esordienti', level: 2, color: 'text-blue-400', bgColor: 'bg-blue-500' };
  } else if (totalNetworkDeposits < 80000) {
    return { rank: 'Juniores', level: 3, color: 'text-purple-400', bgColor: 'bg-purple-500' };
  } else if (totalNetworkDeposits < 150000) {
    return { rank: 'Eccellenza', level: 4, color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
  } else if (totalNetworkDeposits < 500000) {
    return { rank: 'Serie C', level: 5, color: 'text-orange-400', bgColor: 'bg-orange-500' };
  } else if (totalNetworkDeposits < 1500000) {
    return { rank: 'Serie B', level: 6, color: 'text-red-400', bgColor: 'bg-red-500' };
  } else {
    return { rank: 'Serie A', level: 7, color: 'text-goat-gold', bgColor: 'bg-goat-gold' };
  }
};

// Calculate referral bonus (difference between referrer and referee returns)
export const calculateReferralBonus = (referrerReturn, refereeReturn) => {
  const difference = referrerReturn - refereeReturn;
  return difference > 0 ? difference : 0;
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (percentage) => {
  return `${percentage}%`;
};

// Calculate progress to next rank
export const calculateRankProgress = (currentTotal, currentRank) => {
  const rankThresholds = {
    1: 10000,   // Pulcini to Esordienti
    2: 20000,   // Esordienti to Juniores
    3: 80000,   // Juniores to Eccellenza
    4: 150000,  // Eccellenza to Serie C
    5: 500000,  // Serie C to Serie B
    6: 1500000, // Serie B to Serie A
  };

  const nextThreshold = rankThresholds[currentRank];
  if (!nextThreshold) return 100; // Already at max rank

  const progress = (currentTotal / nextThreshold) * 100;
  return Math.min(progress, 100);
};

// Generate referral code
export const generateReferralCode = (address) => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

// Validate deposit amount
export const validateDeposit = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, message: 'Please enter a valid amount' };
  }
  if (numAmount < 10) {
    return { valid: false, message: 'Minimum deposit is $10' };
  }
  return { valid: true, message: '' };
};

// Calculate total earnings including referral bonuses
export const calculateTotalEarnings = (deposits, referrals, referralBonuses) => {
  const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
  const totalReferrals = referrals.reduce((sum, referral) => sum + referral.amount, 0);
  const totalBonuses = referralBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  
  return {
    totalDeposits,
    totalReferrals,
    totalBonuses,
    grandTotal: totalDeposits + totalReferrals + totalBonuses
  };
};

// Get trophy information based on rank
export const getTrophyInfo = (rank) => {
  const trophies = {
    'Pulcini': { name: 'Pulcini Trophy', icon: '🥉', description: 'First steps in football' },
    'Esordienti': { name: 'Esordienti Trophy', icon: '🥈', description: 'Rising talent' },
    'Juniores': { name: 'Juniores Trophy', icon: '🥇', description: 'Junior champion' },
    'Eccellenza': { name: 'Eccellenza Trophy', icon: '🏆', description: 'Excellence achieved' },
    'Serie C': { name: 'Serie C Trophy', icon: '🏅', description: 'Professional level' },
    'Serie B': { name: 'Serie B Trophy', icon: '👑', description: 'Elite status' },
    'Serie A': { name: 'Serie A Trophy', icon: '💎', description: 'Greatest of All Time' }
  };
  
  return trophies[rank] || trophies['Pulcini'];
};
