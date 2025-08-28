// API Configuration for GOAT Frontend
// This file centralizes all API endpoints and configuration

// Backend base URL - change this based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_BACKEND_URL 
    : 'http://localhost:3001';

// API endpoints configuration
export const API_ENDPOINTS = {
    // Base API path
    BASE: `${API_BASE_URL}/api`,
    
    // Authentication endpoints (wallet-based only)
    AUTH: {
        REGISTER: `${API_BASE_URL}/api/users/register`,
        LOGOUT: `${API_BASE_URL}/api/users/logout`,
        CHECK_AUTH: `${API_BASE_URL}/api/users/check-auth`,
        PROFILE: `${API_BASE_URL}/api/users/profile`,
        GET_BY_ADDRESS: (address) => `${API_BASE_URL}/api/users/address/${address}`
    },

    // Deposits endpoints
    DEPOSITS: {
        BASE: `${API_BASE_URL}/api/deposits`,
        LIST: `${API_BASE_URL}/api/deposits`,
        CREATE: `${API_BASE_URL}/api/deposits`,
        STATS: `${API_BASE_URL}/api/deposits/stats`,
        PLATFORM_STATS: `${API_BASE_URL}/api/deposits/platform-stats`
    },

    // Referrals endpoints
    REFERRALS: {
        BASE: `${API_BASE_URL}/api/referrals`,
        INFO: `${API_BASE_URL}/api/referrals`,
        STATS: `${API_BASE_URL}/api/referrals/stats`,
        NETWORK: `${API_BASE_URL}/api/referrals/network`,
        GENERATE_CODE: `${API_BASE_URL}/api/referrals/generate-code`
    },

    // Trophies endpoints
    TROPHIES: {
        BASE: `${API_BASE_URL}/api/trophies`,
        ALL: `${API_BASE_URL}/api/trophies`,
        USER: `${API_BASE_URL}/api/trophies/user`,
        PROGRESS: `${API_BASE_URL}/api/trophies/progress`
    },

    // Wallet endpoints
    WALLET: {
        BASE: `${API_BASE_URL}/api/wallet`,
        INFO: `${API_BASE_URL}/api/wallet`,
        BALANCE: `${API_BASE_URL}/api/wallet/balance`,
        TRANSACTIONS: `${API_BASE_URL}/api/wallet/transactions`,
        WITHDRAW: `${API_BASE_URL}/api/wallet/withdraw`,
        CONNECT: `${API_BASE_URL}/api/wallet/connect`,
        TARGET_ADDRESS: `${API_BASE_URL}/api/wallet/target-address`
    },

    // Health check
    HEALTH: `${API_BASE_URL}/health`
};

// HTTP methods
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Default headers for all requests
export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// API response status codes
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'You are not authorized. Please login again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    TOO_MANY_REQUESTS: 'Too many requests. Please wait before trying again.'
};

export default {
    API_ENDPOINTS,
    HTTP_METHODS,
    REQUEST_TIMEOUT,
    DEFAULT_HEADERS,
    STATUS_CODES,
    ERROR_MESSAGES
};
