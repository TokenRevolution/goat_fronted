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
      // Return mock data for development
      return {
        success: true,
        tiers: [
          { tier_name: 'No Return', min_deposit: 0, max_deposit: 100, annual_rate: 0 },
          { tier_name: 'Starter', min_deposit: 100, max_deposit: 500, annual_rate: 0.05 },
          { tier_name: 'Bronze', min_deposit: 500, max_deposit: 1000, annual_rate: 0.06 },
          { tier_name: 'Silver', min_deposit: 1000, max_deposit: 2500, annual_rate: 0.07 },
          { tier_name: 'Gold', min_deposit: 2500, max_deposit: 5000, annual_rate: 0.08 },
          { tier_name: 'Platinum', min_deposit: 5000, max_deposit: 10000, annual_rate: 0.09 },
          { tier_name: 'Diamond', min_deposit: 10000, max_deposit: 999999999, annual_rate: 0.10 }
        ]
      };
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
      // Return mock data for development
      return {
        success: true,
        levels: [
          {
            level_id: 0,
            name: 'Cliente',
            description: 'Livello base - può fare massimo x3 del capitale proprio',
            required_personal_deposit: 0,
            required_first_line_revenue: 0,
            required_team_revenue: 0,
            max_multiplier: 3.0,
            network_bonus_rate: 0.1000,
            same_level_bonus_rate: 0.0000,
            requirements_text: 'Nessun requisito'
          },
          {
            level_id: 1,
            name: 'Posizione 1',
            description: 'Prende il 15% della produzione di tutta la sua linea',
            required_personal_deposit: 1000,
            required_first_line_revenue: 2500,
            required_team_revenue: 10000,
            max_multiplier: 4.0,
            network_bonus_rate: 0.1500,
            same_level_bonus_rate: 0.0000,
            requirements_text: 'Deposito 1000$ + Prima linea 2500$ + Team 10k$'
          }
          // ... other levels would be here
        ]
      };
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
      return {
        success: true,
        position: {
          current: {
            level_id: 0,
            name: 'Cliente',
            network_bonus_rate: 0.1000,
            max_multiplier: 3.0
          },
          next: {
            level_id: 1,
            name: 'Posizione 1',
            required_personal_deposit: 1000,
            required_first_line_revenue: 2500,
            required_team_revenue: 10000
          },
          progress: 0,
          isMaxLevel: false,
          userStats: {
            personalDeposit: 0,
            firstLineRevenue: 0,
            teamRevenue: 0
          }
        }
      };
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
      return {
        success: true,
        stats: {
          totalDeposits: 0,
          returnRate: 0,
          returnTier: 'No Return',
          dailyReturn: 0,
          monthlyReturn: 0,
          accumulatedEarnings: 0,
          maxCashout: 0,
          canEarn: false
        }
      };
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
      return {
        success: true,
        earnings: []
      };
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
      return {
        success: true,
        data: {
          position: {
            current: {
              level_id: 0,
              name: 'Cliente',
              network_bonus_rate: 0.1000,
              max_multiplier: 3.0
            },
            progress: 0,
            isMaxLevel: false
          },
          deposits: {
            totalDeposits: 0,
            returnRate: 0,
            returnTier: 'No Return',
            dailyReturn: 0,
            monthlyReturn: 0,
            canEarn: false
          },
          earnings: {
            accumulated: 0,
            maxCashout: 0,
            recent: []
          },
          network: {
            personalDeposit: 0,
            firstLineRevenue: 0,
            teamRevenue: 0
          }
        }
      };
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
      return {
        success: true,
        stats: {
          totalUsers: 0,
          totalDeposits: 0,
          totalEarnings: 0,
          activeUsers: 0
        }
      };
    }
  }
};
