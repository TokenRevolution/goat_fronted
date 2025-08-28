// Main API exports for GOAT Frontend
// This file centralizes all API services for easy importing

// Import all API services
import authApi from './auth';
import depositsApi from './deposits';
import referralsApi from './referrals';
import trophiesApi from './trophies';
import walletApi from './wallet';
import apiClient from './client';
import { API_ENDPOINTS, HTTP_METHODS, STATUS_CODES, ERROR_MESSAGES } from './config';

// Export individual services
export {
    authApi,
    depositsApi,
    referralsApi,
    trophiesApi,
    walletApi,
    apiClient
};

// Export configuration
export {
    API_ENDPOINTS,
    HTTP_METHODS,
    STATUS_CODES,
    ERROR_MESSAGES
};

// Export a combined API object for convenience
export const goatApi = {
    auth: authApi,
    deposits: depositsApi,
    referrals: referralsApi,
    trophies: trophiesApi,
    wallet: walletApi,
    client: apiClient,
    config: {
        endpoints: API_ENDPOINTS,
        methods: HTTP_METHODS,
        statusCodes: STATUS_CODES,
        errorMessages: ERROR_MESSAGES
    }
};

// Health check function
export const checkApiHealth = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.HEALTH);
        return {
            isHealthy: true,
            status: response.status,
            message: response.message,
            timestamp: response.timestamp
        };
    } catch (error) {
        return {
            isHealthy: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// Default export
export default goatApi;
