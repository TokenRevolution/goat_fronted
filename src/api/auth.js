// Authentication API service for GOAT
import apiClient from './client';
import { API_ENDPOINTS } from './config';

export const authApi = {
    // User registration
    register: async (userData) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                username: userData.username,
                address: userData.address,
                referralCode: userData.referralCode,
                signature: userData.signature,
                message: userData.message
            });
            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Note: Traditional login removed - using wallet-based authentication only

    // User logout
    logout: async () => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
            
            // Clear stored token
            localStorage.removeItem('authToken');
            
            return response;
        } catch (error) {
            console.error('Logout error:', error);
            // Clear token even if logout fails
            localStorage.removeItem('authToken');
            throw error;
        }
    },

    // Check authentication status
    checkAuth: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.AUTH.CHECK_AUTH);
            return response;
        } catch (error) {
            console.error('Auth check error:', error);
            throw error;
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
            return response;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Note: Password update removed - using wallet-based authentication only

    // Get user by wallet address
    getUserByAddress: async (address) => {
        console.log(`[DEBUG] AuthAPI: Getting user by address: ${address}`);
        try {
            const url = API_ENDPOINTS.AUTH.GET_BY_ADDRESS(address);
            console.log(`[DEBUG] AuthAPI: API URL: ${url}`);
            const response = await apiClient.get(url);
            console.log(`[DEBUG] AuthAPI: Response received:`, response);
            return response;
        } catch (error) {
            console.log(`[DEBUG] AuthAPI: Error caught, status: ${error.status}`);
            // Handle 404 specifically - user not found is a valid case
            if (error.status === 404) {
                console.log(`[DEBUG] AuthAPI: 404 error - returning success:false, user:null`);
                return { success: false, user: null };
            }
            console.error('[DEBUG] AuthAPI: Get user by address error:', error);
            throw error;
        }
    }
};

export default authApi;
