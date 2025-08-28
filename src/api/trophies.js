// Trophies API service for GOAT
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const trophiesApi = {
    // Get all available trophies
    getAllTrophies: async () => {
        try {
            console.log('[DEBUG] TrophyAPI: Getting all trophies from database');
            const response = await apiClient.get(API_ENDPOINTS.TROPHIES.ALL);
            console.log('[DEBUG] TrophyAPI: Trophies response:', response);
            return response;
        } catch (error) {
            console.error('[DEBUG] TrophyAPI: Get all trophies error:', error);
            throw error;
        }
    },

    // Get user trophies
    getUserTrophies: async (walletAddress) => {
        try {
            console.log('[DEBUG] TrophyAPI: Getting trophies for address:', walletAddress);
            // Mock data for now
            const mockResponse = {
                success: true,
                trophies: [
                    {
                        id: 1,
                        level: 1,
                        name: 'Pulcini',
                        description: 'First step in your GOAT journey',
                        icon: '🥇',
                        earned: true,
                        earnedAt: new Date().toISOString(),
                        progress: 100
                    }
                ],
                currentLevel: 1,
                nextTrophy: {
                    level: 2,
                    name: 'Esordienti',
                    requiredDeposits: 2500,
                    progress: 0
                }
            };
            console.log('[DEBUG] TrophyAPI: Mock trophies response:', mockResponse);
            return mockResponse;
        } catch (error) {
            console.error('[DEBUG] TrophyAPI: Get user trophies error:', error);
            throw error;
        }
    },

    // Get trophy progress
    getTrophyProgress: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.TROPHIES.PROGRESS);
            return response;
        } catch (error) {
            console.error('Get trophy progress error:', error);
            throw error;
        }
    },

    // Calculate progress towards next trophy
    calculateProgress: (currentDeposits, currentReferrals, targetTrophy) => {
        if (!targetTrophy) return null;

        const depositProgress = Math.min((currentDeposits / targetTrophy.requiredDeposits) * 100, 100);
        const referralProgress = Math.min((currentReferrals / targetTrophy.requiredReferrals) * 100, 100);
        const overallProgress = Math.min((depositProgress + referralProgress) / 2, 100);

        return {
            depositProgress: Math.round(depositProgress),
            referralProgress: Math.round(referralProgress),
            overallProgress: Math.round(overallProgress),
            depositsNeeded: Math.max(0, targetTrophy.requiredDeposits - currentDeposits),
            referralsNeeded: Math.max(0, targetTrophy.requiredReferrals - currentReferrals)
        };
    },

    // Get trophy requirements by level
    getTrophyByLevel: (level) => {
        const trophies = {
            1: {
                level: 1,
                name: 'Pulcini',
                description: 'First step in your GOAT journey',
                icon: '🥇',
                requiredDeposits: 1000,
                requiredReferrals: 0,
                bonusRate: 0.15,
                referralBonus: 0.01
            },
            2: {
                level: 2,
                name: 'Esordienti',
                description: 'Growing your network and deposits',
                icon: '🥈',
                requiredDeposits: 2500,
                requiredReferrals: 5,
                bonusRate: 0.16,
                referralBonus: 0.015
            },
            3: {
                level: 3,
                name: 'Giovanissimi',
                description: 'Building a solid foundation',
                icon: '🥉',
                requiredDeposits: 5000,
                requiredReferrals: 10,
                bonusRate: 0.17,
                referralBonus: 0.02
            },
            4: {
                level: 4,
                name: 'Allievi',
                description: 'Professional level achievements',
                icon: '🏆',
                requiredDeposits: 10000,
                requiredReferrals: 20,
                bonusRate: 0.18,
                referralBonus: 0.025
            },
            5: {
                level: 5,
                name: 'Primavera',
                description: 'Elite network builder',
                icon: '👑',
                requiredDeposits: 25000,
                requiredReferrals: 50,
                bonusRate: 0.19,
                referralBonus: 0.03
            },
            6: {
                level: 6,
                name: 'Serie C',
                description: 'Diamond level status',
                icon: '💎',
                requiredDeposits: 50000,
                requiredReferrals: 100,
                bonusRate: 0.20,
                referralBonus: 0.035
            },
            7: {
                level: 7,
                name: 'Serie A',
                description: 'Greatest of All Time - Legendary status',
                icon: '🌟',
                requiredDeposits: 100000,
                requiredReferrals: 200,
                bonusRate: 0.25,
                referralBonus: 0.05
            }
        };

        return trophies[level] || null;
    },

    // Get all trophy levels as array
    getAllTrophyLevels: () => {
        const levels = [];
        for (let i = 1; i <= 7; i++) {
            levels.push(trophiesApi.getTrophyByLevel(i));
        }
        return levels;
    },

    // Determine user's current trophy level
    getCurrentTrophyLevel: (totalDeposits, totalReferrals) => {
        const trophies = trophiesApi.getAllTrophyLevels();
        let currentLevel = 1;

        for (const trophy of trophies) {
            if (totalDeposits >= trophy.requiredDeposits && totalReferrals >= trophy.requiredReferrals) {
                currentLevel = trophy.level;
            } else {
                break;
            }
        }

        return currentLevel;
    },

    // Get next trophy to achieve
    getNextTrophy: (currentLevel) => {
        if (currentLevel >= 7) return null; // Already at max level
        return trophiesApi.getTrophyByLevel(currentLevel + 1);
    },

    // Format trophy bonus rate as percentage
    formatBonusRate: (rate) => {
        return `${(rate * 100).toFixed(1)}%`;
    },

    // Get trophy color based on level
    getTrophyColor: (level) => {
        const colors = {
            1: 'from-yellow-400 to-yellow-600',      // Pulcini - Gold
            2: 'from-gray-300 to-gray-500',          // Esordienti - Silver
            3: 'from-orange-400 to-orange-600',      // Giovanissimi - Bronze
            4: 'from-purple-400 to-purple-600',      // Allievi - Purple
            5: 'from-blue-400 to-blue-600',          // Primavera - Blue
            6: 'from-cyan-400 to-cyan-600',          // Serie C - Cyan
            7: 'from-green-400 to-green-600'         // Serie A - Green
        };

        return colors[level] || 'from-gray-400 to-gray-600';
    },

    // Calculate estimated time to next trophy
    estimateTimeToNextTrophy: (currentProgress, averageMonthlyGrowth) => {
        if (!averageMonthlyGrowth || currentProgress >= 100) return null;

        const remainingProgress = 100 - currentProgress;
        const monthsNeeded = Math.ceil(remainingProgress / averageMonthlyGrowth);

        if (monthsNeeded <= 1) return 'Less than 1 month';
        if (monthsNeeded <= 12) return `${monthsNeeded} months`;
        
        const years = Math.floor(monthsNeeded / 12);
        const months = monthsNeeded % 12;
        
        if (years === 1 && months === 0) return '1 year';
        if (years === 1) return `1 year and ${months} months`;
        if (months === 0) return `${years} years`;
        
        return `${years} years and ${months} months`;
    }
};

export default trophiesApi;
