// Deposits API service for GOAT
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const depositsApi = {
    // Get user deposits
    getDeposits: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.DEPOSITS.LIST);
            return response;
        } catch (error) {
            console.error('Get deposits error:', error);
            throw error;
        }
    },

    // Create new deposit
    createDeposit: async (depositData) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.DEPOSITS.CREATE, {
                amount: depositData.amount,
                walletAddress: depositData.walletAddress,
                token: depositData.token || 'USDT',
                transactionHash: depositData.transactionHash
            });
            return response;
        } catch (error) {
            console.error('Create deposit error:', error);
            throw error;
        }
    },

    // Get deposit statistics
    getDepositStats: async (walletAddress) => {
        try {
            console.log('[DEBUG] DepositAPI: Getting stats for address:', walletAddress);
            const url = `${API_ENDPOINTS.DEPOSITS.STATS}?address=${encodeURIComponent(walletAddress)}`;
            const response = await apiClient.get(url);
            console.log('[DEBUG] DepositAPI: Stats response:', response);
            return response;
        } catch (error) {
            console.error('[DEBUG] DepositAPI: Get deposit stats error:', error);
            throw error;
        }
    },

    // Get platform statistics (public endpoint)
    getPlatformStats: async () => {
        try {
            console.log('[DEBUG] DepositAPI: Getting platform statistics');
            const response = await apiClient.get(API_ENDPOINTS.DEPOSITS.PLATFORM_STATS);
            console.log('[DEBUG] DepositAPI: Platform stats response:', response);
            return response;
        } catch (error) {
            console.error('[DEBUG] DepositAPI: Get platform stats error:', error);
            throw error;
        }
    },

    // Calculate potential returns
    calculateReturns: (amount, userLevel = 1) => {
        const baseRate = 0.15; // 15% base monthly return
        const instagramBonus = 0.01; // 1% Instagram bonus
        
        // Trophy level bonuses
        const levelBonuses = {
            1: 0.15, // Pulcini
            2: 0.16, // Esordienti
            3: 0.17, // Giovanissimi
            4: 0.18, // Allievi
            5: 0.19, // Primavera
            6: 0.20, // Serie C
            7: 0.25  // Serie A
        };

        const monthlyRate = levelBonuses[userLevel] || baseRate;
        const monthlyReturn = amount * monthlyRate;
        const dailyReturn = monthlyReturn / 30;
        const yearlyReturn = monthlyReturn * 12;

        return {
            monthlyReturn,
            dailyReturn,
            yearlyReturn,
            monthlyRate,
            dailyRate: monthlyRate / 30,
            yearlyRate: monthlyRate * 12
        };
    },

    // Validate deposit amount
    validateDepositAmount: (amount) => {
        const minDeposit = 100;
        const maxDeposit = 1000000;

        if (!amount || isNaN(amount)) {
            return { isValid: false, message: 'Please enter a valid amount' };
        }

        if (amount < minDeposit) {
            return { isValid: false, message: `Minimum deposit is $${minDeposit}` };
        }

        if (amount > maxDeposit) {
            return { isValid: false, message: `Maximum deposit is $${maxDeposit.toLocaleString()}` };
        }

        return { isValid: true, message: 'Valid amount' };
    }
};

export default depositsApi;
