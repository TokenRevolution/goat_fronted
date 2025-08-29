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

    // Calculate potential returns using CORRECT GOAT business logic
    calculateReturns: (amount) => {
        // Use the correct business logic that matches database
        try {
            const { calculateReturnRate, calculateDailyReturn, calculatePersonalCapitalReturns } = require('../utils/goatBusinessLogic');
            
            const returnInfo = calculateReturnRate(amount);
            const dailyInfo = calculateDailyReturn(amount);
            const monthlyInfo = calculatePersonalCapitalReturns(amount, 30);

            return {
                monthlyReturn: monthlyInfo.accumulatedAmount,
                dailyReturn: dailyInfo.dailyReturn,
                yearlyReturn: dailyInfo.annualReturn,
                monthlyRate: returnInfo.rate / 100, // Convert to decimal
                tier: returnInfo.label,
                isValidForReturns: returnInfo.rate > 0
            };
        } catch (error) {
            console.error('Error calculating returns:', error);
            // Fallback to simple calculation
            const rate = amount >= 100 ? 0.05 : 0; // 5% for deposits >= $100
            return {
                monthlyReturn: amount * rate,
                dailyReturn: (amount * rate) / 30,
                yearlyReturn: amount * rate * 12,
                monthlyRate: rate,
                tier: amount >= 100 ? 'Starter' : 'No Return',
                isValidForReturns: rate > 0
            };
        }
    },

    // Validate deposit amount (aligned with database: no minimum, returns start at $100)
    validateDepositAmount: (amount) => {
        const maxDeposit = 1000000;

        if (!amount || isNaN(amount)) {
            return { isValid: false, message: 'Please enter a valid amount' };
        }

        if (amount <= 0) {
            return { isValid: false, message: 'Amount must be greater than 0' };
        }

        if (amount > maxDeposit) {
            return { isValid: false, message: `Maximum deposit is $${maxDeposit.toLocaleString()}` };
        }

        if (amount < 100) {
            return { 
                isValid: true, 
                message: 'Valid amount (Note: Returns start at $100)',
                warning: 'Deposits below $100 do not earn returns'
            };
        }

        return { isValid: true, message: 'Valid amount' };
    }
};

export default depositsApi;
