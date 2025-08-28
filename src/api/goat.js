// GOAT API Client - Updated for new business model
import apiClient from './client';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const goatApi = {
  // Return rate tiers
  getReturnRateTiers: async () => {
    console.log('[DEBUG] GoatAPI: Getting return rate tiers');
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/return-rates`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Return rate tiers response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting return rate tiers:', error);
      throw error;
    }
  },

  // Position levels
  getPositionLevels: async () => {
    console.log('[DEBUG] GoatAPI: Getting position levels');
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/position-levels`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Position levels response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting position levels:', error);
      throw error;
    }
  },

  // User position
  getUserPosition: async (address) => {
    console.log('[DEBUG] GoatAPI: Getting user position for:', address);
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/user/${address}/position`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: User position response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting user position:', error);
      throw error;
    }
  },

  // User deposit stats
  getUserDepositStats: async (address) => {
    console.log('[DEBUG] GoatAPI: Getting deposit stats for:', address);
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/user/${address}/deposits`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Deposit stats response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting deposit stats:', error);
      throw error;
    }
  },

  // User earnings
  getUserEarnings: async (address, limit = 30) => {
    console.log('[DEBUG] GoatAPI: Getting earnings for:', address);
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/user/${address}/earnings?limit=${limit}`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Earnings response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting earnings:', error);
      throw error;
    }
  },

  // User dashboard data (comprehensive)
  getUserDashboardData: async (address) => {
    console.log('[DEBUG] GoatAPI: Getting dashboard data for:', address);
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/user/${address}/dashboard`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Dashboard data response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting dashboard data:', error);
      throw error;
    }
  },

  // Platform stats
  getPlatformStats: async () => {
    console.log('[DEBUG] GoatAPI: Getting platform stats');
    try {
      const response = await apiClient.request(`${BASE_URL}/api/goat/platform/stats`, { method: 'GET' });
      console.log('[DEBUG] GoatAPI: Platform stats response:', response);
      return response;
    } catch (error) {
      console.error('[DEBUG] GoatAPI: Error getting platform stats:', error);
      throw error;
    }
  },

  // Deposits API
  deposits: {
    // Create new deposit
    createDeposit: async (depositData) => {
      console.log('[DEBUG] GoatAPI: Creating deposit:', depositData);
      try {
        const response = await apiClient.request(`${BASE_URL}/api/deposits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(depositData)
        });
        console.log('[DEBUG] GoatAPI: Deposit created response:', response);
        return response;
      } catch (error) {
        console.error('[DEBUG] GoatAPI: Error creating deposit:', error);
        throw error;
      }
    },

    // Get deposit stats by wallet address
    getDepositStats: async (address) => {
      console.log('[DEBUG] GoatAPI: Getting deposit stats for:', address);
      try {
        const response = await apiClient.request(`${BASE_URL}/api/deposits/stats?address=${address}`, { method: 'GET' });
        console.log('[DEBUG] GoatAPI: Deposit stats response:', response);
        return response;
      } catch (error) {
        console.error('[DEBUG] GoatAPI: Error getting deposit stats:', error);
        throw error;
      }
    }
  }
};