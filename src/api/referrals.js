// Referrals API service for GOAT
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const referralsApi = {
    // Get user referral information
    getReferralInfo: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.REFERRALS.INFO);
            return response;
        } catch (error) {
            console.error('Get referral info error:', error);
            throw error;
        }
    },

    // Get referral statistics
    getReferralStats: async (walletAddress) => {
        try {
            console.log('[DEBUG] ReferralAPI: Getting stats for address:', walletAddress);
            
            // Use dashboard API to get referral data
            const dashboardResponse = await require('./goat').goatApi.getUserDashboardData(walletAddress);
            
            if (dashboardResponse.success && dashboardResponse.data) {
                const { network } = dashboardResponse.data;
                
                return {
                    success: true,
                    stats: {
                        totalReferrals: network.directReferrals || 0,
                        activeReferrals: network.directReferrals || 0,
                        totalEarnings: network.referralEarnings || 0,
                        monthlyEarnings: network.monthlyReferralEarnings || 0,
                        referralBonus: network.networkBonus || 0
                    }
                };
            }

            // Return empty stats if no data
            return {
                success: true,
                stats: {
                    totalReferrals: 0,
                    activeReferrals: 0,
                    totalEarnings: 0,
                    monthlyEarnings: 0,
                    referralBonus: 0
                }
            };
        } catch (error) {
            console.error('[DEBUG] ReferralAPI: Get referral stats error:', error);
            throw error;
        }
    },

    // Get referral network tree
    getReferralNetwork: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.REFERRALS.NETWORK);
            return response;
        } catch (error) {
            console.error('Get referral network error:', error);
            throw error;
        }
    },

    // Generate new referral code
    generateReferralCode: async () => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.REFERRALS.GENERATE_CODE);
            return response;
        } catch (error) {
            console.error('Generate referral code error:', error);
            throw error;
        }
    },

    // Calculate referral bonuses
    calculateReferralBonus: (depositAmount, userLevel = 1) => {
        const referralRates = {
            1: 0.01,   // Pulcini - 1%
            2: 0.015,  // Esordienti - 1.5%
            3: 0.02,   // Giovanissimi - 2%
            4: 0.025,  // Allievi - 2.5%
            5: 0.03,   // Primavera - 3%
            6: 0.035,  // Serie C - 3.5%
            7: 0.05    // Serie A - 5%
        };

        const rate = referralRates[userLevel] || 0.01;
        return depositAmount * rate;
    },

    // Generate referral link
    generateReferralLink: (referralCode) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}?ref=${referralCode}`;
    },

    // Extract referral code from URL
    extractReferralFromUrl: () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('ref');
    },

    // Validate referral code format
    validateReferralCode: (code) => {
        if (!code) {
            return { isValid: false, message: 'Referral code is required' };
        }

        // Referral code should be alphanumeric and start with GOAT
        const codeRegex = /^GOAT[A-Z0-9]+$/;
        if (!codeRegex.test(code)) {
            return { isValid: false, message: 'Invalid referral code format' };
        }

        if (code.length < 6 || code.length > 20) {
            return { isValid: false, message: 'Referral code must be between 6 and 20 characters' };
        }

        return { isValid: true, message: 'Valid referral code' };
    },

    // Share referral link via various methods
    shareReferralLink: (referralCode, method = 'copy') => {
        const link = referralsApi.generateReferralLink(referralCode);
        const message = `Join GOAT - Greatest of All Time football DeFi platform and start earning up to 25% monthly returns! Use my referral code: ${referralCode}`;

        switch (method) {
            case 'copy':
                navigator.clipboard.writeText(link);
                return { success: true, message: 'Link copied to clipboard!' };

            case 'whatsapp':
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + link)}`;
                window.open(whatsappUrl, '_blank');
                return { success: true, message: 'WhatsApp opened' };

            case 'telegram':
                const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
                window.open(telegramUrl, '_blank');
                return { success: true, message: 'Telegram opened' };

            case 'twitter':
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`;
                window.open(twitterUrl, '_blank');
                return { success: true, message: 'Twitter opened' };

            case 'facebook':
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
                window.open(facebookUrl, '_blank');
                return { success: true, message: 'Facebook opened' };

            default:
                return { success: false, message: 'Unknown sharing method' };
        }
    }
};

export default referralsApi;
