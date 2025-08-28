// Wallet API service for GOAT
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const walletApi = {
    // Get wallet information
    getWalletInfo: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WALLET.INFO);
            return response;
        } catch (error) {
            console.error('Get wallet info error:', error);
            throw error;
        }
    },

    // Get wallet balance
    getWalletBalance: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WALLET.BALANCE);
            return response;
        } catch (error) {
            console.error('Get wallet balance error:', error);
            throw error;
        }
    },

    // Get transaction history
    getTransactions: async (walletAddress, page = 1, limit = 10, type = null) => {
        try {
            console.log('[DEBUG] WalletAPI: Getting transactions for address:', walletAddress);
            
            // Use dashboard API to get earnings history which includes transaction-like data
            const dashboardResponse = await require('./goat').goatApi.getUserDashboardData(walletAddress);
            
            if (dashboardResponse.success && dashboardResponse.data && dashboardResponse.data.earnings.recent) {
                const transactions = dashboardResponse.data.earnings.recent.map((earning, index) => ({
                    id: index + 1,
                    type: 'daily_return',
                    amount: earning.total_earnings,
                    hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
                    timestamp: earning.date,
                    status: 'confirmed',
                    fee: 0
                }));

                return {
                    success: true,
                    transactions: transactions,
                    pagination: {
                        page: page,
                        limit: limit,
                        total: transactions.length,
                        pages: Math.ceil(transactions.length / limit)
                    }
                };
            }

            // Return empty if no data
            return {
                success: true,
                transactions: [],
                pagination: {
                    page: page,
                    limit: limit,
                    total: 0,
                    pages: 0
                }
            };
        } catch (error) {
            console.error('[DEBUG] WalletAPI: Get transactions error:', error);
            throw error;
        }
    },

    // Initiate withdrawal
    initiateWithdrawal: async (withdrawalData) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.WALLET.WITHDRAW, {
                amount: withdrawalData.amount,
                token: withdrawalData.token || 'USDT',
                address: withdrawalData.address
            });
            return response;
        } catch (error) {
            console.error('Initiate withdrawal error:', error);
            throw error;
        }
    },

    // Connect wallet
    connectWallet: async (walletData) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.WALLET.CONNECT, {
                address: walletData.address,
                signature: walletData.signature,
                message: walletData.message
            });
            return response;
        } catch (error) {
            console.error('Connect wallet error:', error);
            throw error;
        }
    },

    // Validate wallet address
    validateAddress: (address) => {
        if (!address) {
            return { isValid: false, message: 'Address is required' };
        }

        // Ethereum address format validation
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!ethAddressRegex.test(address)) {
            return { isValid: false, message: 'Invalid Ethereum address format' };
        }

        return { isValid: true, message: 'Valid address' };
    },

    // Validate withdrawal amount
    validateWithdrawalAmount: (amount, availableBalance) => {
        const minWithdrawal = 50;
        const withdrawalFee = 0.005; // 0.5%

        if (!amount || isNaN(amount)) {
            return { isValid: false, message: 'Please enter a valid amount' };
        }

        if (amount < minWithdrawal) {
            return { isValid: false, message: `Minimum withdrawal is $${minWithdrawal}` };
        }

        const totalAmount = amount * (1 + withdrawalFee);
        if (totalAmount > availableBalance) {
            return { isValid: false, message: 'Insufficient balance (including fees)' };
        }

        return { isValid: true, message: 'Valid withdrawal amount' };
    },

    // Calculate withdrawal fees
    calculateWithdrawalFee: (amount) => {
        const feeRate = 0.005; // 0.5%
        const fee = amount * feeRate;
        const netAmount = amount - fee;

        return {
            grossAmount: amount,
            fee,
            netAmount,
            feeRate
        };
    },

    // Format transaction status
    formatTransactionStatus: (status) => {
        const statusMap = {
            pending: { text: 'Pending', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
            confirmed: { text: 'Confirmed', color: 'text-green-500', bgColor: 'bg-green-100' },
            processing: { text: 'Processing', color: 'text-blue-500', bgColor: 'bg-blue-100' },
            completed: { text: 'Completed', color: 'text-green-500', bgColor: 'bg-green-100' },
            failed: { text: 'Failed', color: 'text-red-500', bgColor: 'bg-red-100' },
            cancelled: { text: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-100' }
        };

        return statusMap[status] || statusMap.pending;
    },

    // Format transaction type
    formatTransactionType: (type) => {
        const typeMap = {
            deposit: { text: 'Deposit', icon: '⬇️', color: 'text-green-600' },
            withdrawal: { text: 'Withdrawal', icon: '⬆️', color: 'text-red-600' },
            transfer: { text: 'Transfer', icon: '↔️', color: 'text-blue-600' },
            bonus: { text: 'Bonus', icon: '🎁', color: 'text-purple-600' },
            referral_bonus: { text: 'Referral Bonus', icon: '👥', color: 'text-cyan-600' },
            monthly_return: { text: 'Monthly Return', icon: '📈', color: 'text-goat-gold' },
            daily_return: { text: 'Daily Return', icon: '📊', color: 'text-orange-600' }
        };

        return typeMap[type] || { text: type, icon: '💰', color: 'text-gray-600' };
    },

    // Get explorer URL for transaction
    getExplorerUrl: (txHash, network = 'ethereum') => {
        const explorers = {
            ethereum: 'https://etherscan.io/tx/',
            polygon: 'https://polygonscan.com/tx/',
            bsc: 'https://bscscan.com/tx/'
        };

        const baseUrl = explorers[network] || explorers.ethereum;
        return `${baseUrl}${txHash}`;
    },

    // Get target wallet address for deposits
    getTargetAddress: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.WALLET.TARGET_ADDRESS);
            return response;
        } catch (error) {
            console.error('Get target address error:', error);
            throw error;
        }
    },

    // Shorten address for display
    shortenAddress: (address, startLength = 6, endLength = 4) => {
        if (!address) return '';
        if (address.length <= startLength + endLength) return address;
        
        return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
    },

    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return { success: true, message: 'Copied to clipboard!' };
        } catch (error) {
            console.error('Copy to clipboard error:', error);
            return { success: false, message: 'Failed to copy to clipboard' };
        }
    }
};

export default walletApi;
