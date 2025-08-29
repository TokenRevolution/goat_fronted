/**
 * GOAT Business Logic Implementation
 * Handles all calculations for the GOAT platform according to business rules
 */

// Return rates based on deposit amount - UPDATED RATES
export const RETURN_RATES = [
  { min: 0, max: 100, rate: 0, label: "No Return" },
  { min: 100, max: 500, rate: 5, label: "Starter" },
  { min: 500, max: 1000, rate: 6, label: "Bronze" },
  { min: 1000, max: 2500, rate: 7, label: "Silver" },
  { min: 2500, max: 5000, rate: 8, label: "Gold" },
  { min: 5000, max: 10000, rate: 9, label: "Platinum" },
  { min: 10000, max: Infinity, rate: 10, label: "Diamond" }
];

// Position levels with requirements and bonuses
export const POSITION_LEVELS = [
  {
    id: 0,
    name: "Cliente",
    personalDeposit: 0,
    firstLineRevenue: 0,
    teamRevenue: 0,
    maxMultiplier: 3,
    networkBonus: 10,
    sameLevel: 0,
    requirements: "Nessun requisito",
    description: "Livello base - può fare massimo x3 del capitale proprio"
  },
  {
    id: 1,
    name: "Posizione 1",
    personalDeposit: 1000,
    firstLineRevenue: 2500,
    teamRevenue: 10000,
    maxMultiplier: 4,
    networkBonus: 15,
    sameLevel: 0,
    requirements: "Deposito 1000$ + Prima linea 2500$ + Team 10k$",
    description: "Prende il 15% della produzione di tutta la sua linea"
  },
  {
    id: 2,
    name: "Posizione 2",
    personalDeposit: 2500,
    firstLineRevenue: 2500,
    teamRevenue: 75000,
    maxMultiplier: 4,
    networkBonus: 20,
    sameLevel: 10,
    requirements: "Due Posizioni 1 in due gambe",
    description: "Prende il 20% + 10% a parità livello"
  },
  {
    id: 3,
    name: "Posizione 3",
    personalDeposit: 2500,
    firstLineRevenue: 2500,
    teamRevenue: 250000,
    maxMultiplier: 4,
    networkBonus: 25,
    sameLevel: 11,
    requirements: "Due Posizioni 2 in due gambe",
    description: "Prende il 25% + 11% a parità livello"
  },
  {
    id: 4,
    name: "Posizione 4",
    personalDeposit: 5000,
    firstLineRevenue: 2500,
    teamRevenue: 750000,
    maxMultiplier: 5,
    networkBonus: 30,
    sameLevel: 12,
    requirements: "Due Posizioni 3 + una Posizione 1 in tre gambe",
    description: "Prende il 30% + 12% a parità livello"
  },
  {
    id: 5,
    name: "Posizione 5",
    personalDeposit: 5000,
    firstLineRevenue: 2500,
    teamRevenue: 1800000,
    maxMultiplier: 5,
    networkBonus: 35,
    sameLevel: 13,
    requirements: "Due Posizioni 4 + una Posizione 2 in tre gambe",
    description: "Prende il 35% + 13% a parità livello"
  },
  {
    id: 6,
    name: "Posizione 6",
    personalDeposit: 10000,
    firstLineRevenue: 2500,
    teamRevenue: 5000000,
    maxMultiplier: 5,
    networkBonus: 40,
    sameLevel: 14,
    requirements: "Due Posizioni 5 + una Posizione 3 in tre gambe",
    description: "Prende il 40% + 14% a parità livello"
  },
  {
    id: 7,
    name: "Posizione 7",
    personalDeposit: 10000,
    firstLineRevenue: 2500,
    teamRevenue: 15000000,
    maxMultiplier: 6,
    networkBonus: 45,
    sameLevel: 15,
    requirements: "Due Posizioni 6 + una Posizione 3 in tre gambe",
    description: "Prende il 45% + 15% a parità livello"
  },
  {
    id: 8,
    name: "Posizione 8",
    personalDeposit: 10000,
    firstLineRevenue: 2500,
    teamRevenue: 40000000,
    maxMultiplier: 6,
    networkBonus: 50,
    sameLevel: 20,
    requirements: "Due Posizioni 7 + una Posizione 5 in tre gambe",
    description: "Livello massimo - 50% + 20% a parità livello"
  }
];

/**
 * Calculate the return rate percentage based on deposit amount
 * @param {number} depositAmount - User's total deposit
 * @returns {object} - Return rate info
 */
export const calculateReturnRate = (depositAmount) => {
  const tier = RETURN_RATES.find(rate => 
    depositAmount >= rate.min && depositAmount < rate.max
  );
  
  return tier || RETURN_RATES[RETURN_RATES.length - 1];
};

/**
 * Calculate daily return based on deposit and rate
 * @param {number} depositAmount - User's total deposit
 * @returns {object} - Daily and monthly returns
 */
export const calculateDailyReturn = (depositAmount) => {
  const tierInfo = calculateReturnRate(depositAmount);
  const monthlyRate = tierInfo.rate / 100; // MENSILE non annuale!
  const dailyRate = monthlyRate / 30; // Diviso 30 giorni, non 365
  
  const dailyReturn = depositAmount * dailyRate;
  const monthlyReturn = depositAmount * monthlyRate; // Diretto dal tasso mensile
  
  return {
    tier: tierInfo,
    dailyReturn,
    monthlyReturn,
    annualReturn: depositAmount * monthlyRate * 12, // 12 mesi
    dailyRate: dailyRate * 100,
    monthlyRate: tierInfo.rate, // Percentage mensile
    canEarn: tierInfo.rate > 0
  };
};

/**
 * Calculate days elapsed since the beginning of current month
 * @returns {number} - Days elapsed including today (1-31)
 */
export const getDaysElapsedThisMonth = () => {
  const now = new Date();
  return now.getDate(); // Returns day of month (1-31)
};

/**
 * Calculate precise days elapsed since a specific timestamp (REAL-TIME CALCULATION)
 * @param {Date|string} startDate - The starting date/timestamp
 * @returns {number} - Precise days elapsed with up to 6 decimals (seconds precision)
 */
export const getDaysElapsedSinceDate = (startDate) => {
  if (!startDate) return 0;
  
  const start = new Date(startDate);
  const now = new Date();
  
  // Calculate exact milliseconds difference WITHOUT modifying times
  const timeDiffMs = now.getTime() - start.getTime();
  
  // Convert to seconds, then to days (86400 seconds = 1 day)
  const secondsDiff = timeDiffMs / 1000;
  const daysDiff = secondsDiff / 86400; // 86400 seconds in a day
  
  // Return precise days with up to 6 decimal places
  // Minimum 0.000012 (≈1 second = 0.000011574 days)
  return Math.max(0.000012, parseFloat(daysDiff.toFixed(6)));
};

/**
 * Calculate accumulated personal capital returns (paid monthly via cashout)
 * @param {number} depositAmount - User's personal deposit
 * @param {Date|string|number} daysOrDate - Days since last cashout, deposit date, or null for current month elapsed
 * @returns {object} - Accumulated returns info
 */
export const calculatePersonalCapitalReturns = (depositAmount, daysOrDate = null) => {
  const tierInfo = calculateReturnRate(depositAmount);
  const monthlyRate = tierInfo.rate / 100; // TASSI MENSILI!
  const dailyRate = monthlyRate / 30; // Diviso 30 giorni del mese
  const dailyAmount = depositAmount * dailyRate;
  
  let actualDaysAccumulated;
  
  // Determine how to calculate days
  if (typeof daysOrDate === 'number') {
    // Legacy: number of days passed directly
    actualDaysAccumulated = daysOrDate;
  } else if (daysOrDate !== null && daysOrDate !== undefined) {
    // New: calculate from deposit date - PRECISE TO THE SECOND
    actualDaysAccumulated = getDaysElapsedSinceDate(daysOrDate);
  } else {
    // Fallback: calculate from beginning of current month
    actualDaysAccumulated = getDaysElapsedThisMonth();
  }
  
  const accumulatedAmount = dailyAmount * actualDaysAccumulated;
  
  return {
    dailyAmount,
    accumulatedAmount,
    daysAccumulated: actualDaysAccumulated,
    nextCashoutDate: getNextCashoutDate(),
    tier: tierInfo.label,
    rate: tierInfo.rate, // Tasso mensile
    monthlyRate: tierInfo.rate, // Percentuale mensile
    type: 'personal_capital',
    paymentSchedule: 'monthly'
  };
};

/**
 * Calculate daily network earnings (paid daily at 00:00)
 * @param {object} userLevel - User's current level
 * @param {number} teamRevenue - Team's daily revenue
 * @param {number} sameLevel - Same level team revenue
 * @returns {object} - Daily network earnings
 */
export const calculateDailyNetworkEarnings = (userLevel, teamRevenue, sameLevel = 0) => {
  const networkBonus = (teamRevenue * userLevel.networkBonus) / 100;
  const sameLevelBonus = (sameLevel * userLevel.sameLevel) / 100;
  const totalDaily = networkBonus + sameLevelBonus;
  
  return {
    networkBonus,
    sameLevelBonus,
    totalDaily,
    teamRevenue,
    nextCreditTime: getNextDailyCreditTime(),
    type: 'network_earnings',
    paymentSchedule: 'daily'
  };
};

/**
 * Get next cashout date (monthly)
 * @returns {Date} - Next monthly cashout date
 */
export const getNextCashoutDate = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

/**
 * Get next daily credit time (00:00 tomorrow)
 * @returns {Date} - Next daily credit time
 */
export const getNextDailyCreditTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

/**
 * Calculate time remaining until next cashout
 * @returns {object} - Time remaining info
 */
export const getTimeUntilCashout = () => {
  const now = new Date();
  const nextCashout = getNextCashoutDate();
  const timeDiff = nextCashout.getTime() - now.getTime();
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return {
    days,
    hours,
    nextCashoutDate: nextCashout,
    isToday: days === 0
  };
};

/**
 * Calculate time remaining until next daily credit
 * @returns {object} - Time remaining info
 */
export const getTimeUntilDailyCredit = () => {
  const now = new Date();
  const nextCredit = getNextDailyCreditTime();
  const timeDiff = nextCredit.getTime() - now.getTime();
  
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    hours,
    minutes,
    nextCreditTime: nextCredit,
    isWithinHour: hours === 0
  };
};

/**
 * Determine user's current position level
 * @param {object} userStats - User statistics
 * @returns {object} - Current level and progress
 */
export const calculateUserLevel = (userStats) => {
  const {
    personalDeposit = 0,
    firstLineRevenue = 0,
    teamRevenue = 0,
    teamStructure = {}
  } = userStats;

  // Find the highest level the user qualifies for
  let currentLevel = POSITION_LEVELS[0]; // Default to Cliente
  
  for (let i = 1; i < POSITION_LEVELS.length; i++) {
    const level = POSITION_LEVELS[i];
    
    // Check basic requirements
    const meetsPersonalDeposit = personalDeposit >= level.personalDeposit;
    const meetsFirstLine = firstLineRevenue >= level.firstLineRevenue;
    const meetsTeamRevenue = teamRevenue >= level.teamRevenue;
    
    // Check team structure requirements (simplified for now)
    let meetsStructure = true;
    if (i >= 2) {
      // For Posizione 2+, check if user has required positions in team
      // This would need to be implemented based on actual team data
      meetsStructure = checkTeamStructureRequirements(level, teamStructure);
    }
    
    if (meetsPersonalDeposit && meetsFirstLine && meetsTeamRevenue && meetsStructure) {
      currentLevel = level;
    } else {
      break;
    }
  }
  
  // Calculate progress to next level
  const nextLevel = POSITION_LEVELS[Math.min(currentLevel.id + 1, POSITION_LEVELS.length - 1)];
  const progress = calculateLevelProgress(userStats, currentLevel, nextLevel);
  
  return {
    current: currentLevel,
    next: nextLevel,
    progress,
    isMaxLevel: currentLevel.id === POSITION_LEVELS.length - 1
  };
};

/**
 * Calculate progress towards next level
 * @param {object} userStats - User statistics
 * @param {object} currentLevel - Current level
 * @param {object} nextLevel - Next level
 * @returns {object} - Progress information
 */
export const calculateLevelProgress = (userStats, currentLevel, nextLevel) => {
  if (currentLevel.id === nextLevel.id) {
    return { overall: 100, requirements: [] }; // Max level reached
  }
  
  const requirements = [
    {
      name: "Deposito Personale",
      current: userStats.personalDeposit || 0,
      required: nextLevel.personalDeposit,
      progress: Math.min(100, ((userStats.personalDeposit || 0) / nextLevel.personalDeposit) * 100)
    },
    {
      name: "Fatturato Prima Linea",
      current: userStats.firstLineRevenue || 0,
      required: nextLevel.firstLineRevenue,
      progress: Math.min(100, ((userStats.firstLineRevenue || 0) / nextLevel.firstLineRevenue) * 100)
    },
    {
      name: "Fatturato Team",
      current: userStats.teamRevenue || 0,
      required: nextLevel.teamRevenue,
      progress: Math.min(100, ((userStats.teamRevenue || 0) / nextLevel.teamRevenue) * 100)
    }
  ];
  
  const overallProgress = requirements.reduce((sum, req) => sum + req.progress, 0) / requirements.length;
  
  return {
    overall: overallProgress,
    requirements
  };
};

/**
 * Check if user meets team structure requirements (simplified)
 * @param {object} level - Level to check
 * @param {object} teamStructure - User's team structure
 * @returns {boolean} - Whether requirements are met
 */
export const checkTeamStructureRequirements = (level, teamStructure) => {
  // This is a simplified implementation
  // In reality, you'd check the actual positions of team members
  return true; // For now, assume structure requirements are met
};

/**
 * Calculate maximum cashout based on level and deposit
 * @param {number} personalDeposit - User's personal deposit
 * @param {object} level - User's current level
 * @returns {object} - Cashout limits
 */
export const calculateCashoutLimits = (personalDeposit, level) => {
  const maxCashout = personalDeposit * level.maxMultiplier;
  
  return {
    maxCashout,
    multiplier: level.maxMultiplier,
    canCashout: true
  };
};

/**
 * Calculate network bonuses based on team performance
 * @param {object} userLevel - User's level information
 * @param {number} teamProduction - Total team production
 * @returns {object} - Network bonus calculation
 */
export const calculateNetworkBonuses = (userLevel, teamProduction) => {
  const networkBonus = (teamProduction * userLevel.current.networkBonus) / 100;
  const sameLevelBonus = (teamProduction * userLevel.current.sameLevel) / 100;
  
  return {
    networkBonus,
    sameLevelBonus,
    totalBonus: networkBonus + sameLevelBonus,
    networkRate: userLevel.current.networkBonus,
    sameLevelRate: userLevel.current.sameLevel
  };
};

/**
 * Format currency with proper decimals
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency
 */
export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format currency with high precision (up to 6 decimals)
 * @param {number} amount - Amount to format
 * @param {number} maxDecimals - Maximum decimal places (default 6)
 * @returns {string} - Formatted currency with precision
 */
export const formatCurrencyPrecise = (amount, maxDecimals = 6) => {
  if (!amount || isNaN(amount)) return '$0.000000';
  
  // For very small amounts, show up to 6 decimals
  if (amount < 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: maxDecimals,
      maximumFractionDigits: maxDecimals
    }).format(amount);
  }
  
  // For larger amounts, use standard 2 decimal format
  return formatCurrency(amount);
};

/**
 * Format percentage with proper decimals
 * @param {number} percentage - Percentage to format
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (percentage) => {
  if (!percentage || isNaN(percentage)) return '0%';
  
  return `${percentage.toFixed(1)}%`;
};

/**
 * Get level color based on position
 * @param {number} levelId - Level ID
 * @returns {string} - CSS color class
 */
export const getLevelColor = (levelId) => {
  const colors = [
    'text-gray-400',     // Cliente
    'text-blue-400',     // Posizione 1
    'text-green-400',    // Posizione 2
    'text-yellow-400',   // Posizione 3
    'text-orange-400',   // Posizione 4
    'text-red-400',      // Posizione 5
    'text-purple-400',   // Posizione 6
    'text-pink-400',     // Posizione 7
    'text-goat-gold'     // Posizione 8
  ];
  
  return colors[levelId] || 'text-gray-400';
};

/**
 * Get level badge background based on position
 * @param {number} levelId - Level ID
 * @returns {string} - CSS background class
 */
export const getLevelBadgeColor = (levelId) => {
  const colors = [
    'bg-gray-500/20',     // Cliente
    'bg-blue-500/20',     // Posizione 1
    'bg-green-500/20',    // Posizione 2
    'bg-yellow-500/20',   // Posizione 3
    'bg-orange-500/20',   // Posizione 4
    'bg-red-500/20',      // Posizione 5
    'bg-purple-500/20',   // Posizione 6
    'bg-pink-500/20',     // Posizione 7
    'bg-goat-gold/20'     // Posizione 8
  ];
  
  return colors[levelId] || 'bg-gray-500/20';
};

export default {
  RETURN_RATES,
  POSITION_LEVELS,
  calculateReturnRate,
  calculateDailyReturn,
  calculatePersonalCapitalReturns,
  calculateDailyNetworkEarnings,
  getDaysElapsedThisMonth,
  getDaysElapsedSinceDate,
  calculateUserLevel,
  calculateLevelProgress,
  calculateCashoutLimits,
  calculateNetworkBonuses,
  formatCurrency,
  formatCurrencyPrecise,
  formatPercentage,
  getLevelColor,
  getLevelBadgeColor
};