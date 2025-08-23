// GOAT Platform Utility Functions

// Calculate monthly return based on deposit amount
export const calculateMonthlyReturn = (depositAmount, hasInstagramBonus = false) => {
  let basePercentage;
  
  if (depositAmount <= 100) {
    basePercentage = 8;
  } else if (depositAmount <= 500) {
    basePercentage = 10;
  } else if (depositAmount <= 1000) {
    basePercentage = 12;
  } else {
    basePercentage = 15;
  }
  
  // Add +1% Instagram bonus if active
  const finalPercentage = hasInstagramBonus ? basePercentage + 1 : basePercentage;
  const monthlyReturn = depositAmount * (finalPercentage / 100);
  
  return { 
    basePercentage, 
    finalPercentage, 
    return: parseFloat(monthlyReturn.toFixed(2)),
    monthlyReturn: parseFloat(monthlyReturn.toFixed(2)),
    instagramBonus: hasInstagramBonus ? 1 : 0
  };
};

// Calculate daily return based on deposit amount and Instagram bonus
export const calculateDailyReturn = (depositAmount, hasInstagramBonus = false) => {
  const monthlyReturn = calculateMonthlyReturn(depositAmount, hasInstagramBonus);
  const dailyReturn = monthlyReturn.return / 30; // Convert monthly to daily
  
  return {
    ...monthlyReturn,
    dailyReturn: parseFloat(dailyReturn.toFixed(4)),
    monthlyReturn: monthlyReturn.return
  };
};

// Calculate accumulated earnings (daily returns that haven't been cashed out)
export const calculateAccumulatedEarnings = (deposits, daysSinceDeposit, hasInstagramBonus = false) => {
  let totalAccumulated = 0;
  
  deposits.forEach(deposit => {
    const dailyReturn = calculateDailyReturn(deposit.amount, hasInstagramBonus);
    const earningsForThisDeposit = dailyReturn.dailyReturn * daysSinceDeposit;
    totalAccumulated += earningsForThisDeposit;
  });
  
  return parseFloat(totalAccumulated.toFixed(2));
};

// Calculate cashout amount (accumulated daily returns)
export const calculateCashoutAmount = (accumulatedEarnings, networkCashouts = []) => {
  let totalCashout = accumulatedEarnings;
  
  // Add referral bonuses from network cashouts
  networkCashouts.forEach(cashout => {
    if (cashout.referralBonus) {
      totalCashout += cashout.referralBonus;
    }
  });
  
  return parseFloat(totalCashout.toFixed(2));
};

// Calculate days since deposit
export const calculateDaysSinceDeposit = (depositDate) => {
  const deposit = new Date(depositDate);
  const now = new Date();
  const diffTime = Math.abs(now - deposit);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate rank based on total network deposits and personal deposit
export const calculateRank = (totalNetworkDeposits, personalDeposit = 0) => {
  // Check both network deposits and personal deposit requirements
  if (totalNetworkDeposits < 5000 || personalDeposit < 1000) {
    return { 
      rank: 'Nuovo', 
      level: 0, 
      color: 'text-gray-400', 
      bgColor: 'bg-gray-500',
      networkRequired: 5000,
      personalRequired: 1000
    };
  } else if (totalNetworkDeposits < 10000 || personalDeposit < 1000) {
    return { 
      rank: 'Pulcini', 
      level: 1, 
      color: 'text-green-400', 
      bgColor: 'bg-green-500',
      networkRequired: 10000,
      personalRequired: 1000
    };
  } else if (totalNetworkDeposits < 20000 || personalDeposit < 3000) {
    return { 
      rank: 'Esordienti', 
      level: 2, 
      color: 'text-blue-400', 
      bgColor: 'bg-blue-500',
      networkRequired: 20000,
      personalRequired: 3000
    };
  } else if (totalNetworkDeposits < 80000 || personalDeposit < 10000) {
    return { 
      rank: 'Juniores', 
      level: 3, 
      color: 'text-purple-400', 
      bgColor: 'bg-purple-500',
      networkRequired: 80000,
      personalRequired: 10000
    };
  } else if (totalNetworkDeposits < 150000 || personalDeposit < 15000) {
    return { 
      rank: 'Eccellenza', 
      level: 4, 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500',
      networkRequired: 150000,
      personalRequired: 15000
    };
  } else if (totalNetworkDeposits < 500000 || personalDeposit < 25000) {
    return { 
      rank: 'Serie C', 
      level: 5, 
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500',
      networkRequired: 500000,
      personalRequired: 25000
    };
  } else if (totalNetworkDeposits < 1500000 || personalDeposit < 50000) {
    return { 
      rank: 'Serie B', 
      level: 6, 
      color: 'text-red-400', 
      bgColor: 'bg-red-500',
      networkRequired: 1500000,
      personalRequired: 50000
    };
  } else if (personalDeposit >= 100000) {
    return { 
      rank: 'Serie A', 
      level: 7, 
      color: 'text-goat-gold', 
      bgColor: 'bg-goat-gold',
      networkRequired: 1500000,
      personalRequired: 100000
    };
  } else {
    return { 
      rank: 'Serie B', 
      level: 6, 
      color: 'text-red-400', 
      bgColor: 'bg-red-500',
      networkRequired: 1500000,
      personalRequired: 50000
    };
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
    0: 5000,    // Nuovo to Pulcini
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
  return { valid: true, message: '' };
};

// Calculate platform development donation
export const calculateDonation = (depositAmount, isDonationEnabled = false) => {
  if (!isDonationEnabled) {
    return { donation: 0, netDeposit: depositAmount };
  }
  
  const donation = depositAmount * 0.005; // 0.5%
  const netDeposit = depositAmount - donation;
  
  return { 
    donation: parseFloat(donation.toFixed(2)), 
    netDeposit: parseFloat(netDeposit.toFixed(2)) 
  };
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
    'Nuovo': { name: 'Starter Badge', icon: '⚽', description: 'Welcome to GOAT' },
    'Pulcini': { name: 'Pulcini Trophy + Carta WeFi', icon: '🥉', description: 'First steps in football + WeFi Card reward' },
    'Esordienti': { name: 'Esordienti Trophy', icon: '🥈', description: 'Rising talent' },
    'Juniores': { name: 'Juniores Trophy', icon: '🥇', description: 'Junior champion' },
    'Eccellenza': { name: 'Eccellenza Trophy', icon: '🏆', description: 'Excellence achieved' },
    'Serie C': { name: 'Serie C Trophy', icon: '🏅', description: 'Professional level' },
    'Serie B': { name: 'Serie B Trophy', icon: '👑', description: 'Elite status' },
    'Serie A': { name: 'Serie A Trophy', icon: '💎', description: 'Greatest of All Time' }
  };
  
  return trophies[rank] || trophies['Nuovo'];
};
