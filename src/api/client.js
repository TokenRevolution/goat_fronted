// API Client for GOAT Frontend
// This file handles all HTTP requests with error handling, authentication, and response parsing

import { API_ENDPOINTS, HTTP_METHODS, REQUEST_TIMEOUT, DEFAULT_HEADERS, STATUS_CODES, ERROR_MESSAGES } from './config';

class ApiClient {
    constructor() {
        this.baseURL = API_ENDPOINTS.BASE;
        this.timeout = REQUEST_TIMEOUT;
    }

    // Get authentication token from localStorage or cookies
    getAuthToken() {
        // Check localStorage first (for mobile apps)
        const token = localStorage.getItem('authToken');
        if (token) {
            return token;
        }
        
        // If no token in localStorage, cookies will be sent automatically
        return null;
    }

    // Build headers for requests
    buildHeaders(customHeaders = {}) {
        const headers = { ...DEFAULT_HEADERS, ...customHeaders };
        
        const token = this.getAuthToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        return headers;
    }

    // Handle API responses
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const error = new Error(data.message || ERROR_MESSAGES.SERVER_ERROR);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    // Handle different types of errors
    handleError(error) {
        console.error('API Error:', error);

        if (error.name === 'AbortError') {
            const timeoutError = new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
            throw timeoutError;
        }

        if (!navigator.onLine) {
            const networkError = new Error(ERROR_MESSAGES.NETWORK_ERROR);
            throw networkError;
        }

        // Preserve the original error properties
        const newError = new Error(error.message || ERROR_MESSAGES.SERVER_ERROR);
        newError.status = error.status;
        newError.data = error.data;

        switch (error.status) {
            case STATUS_CODES.UNAUTHORIZED:
                // Clear auth token and redirect to login
                localStorage.removeItem('authToken');
                window.location.href = '/';
                newError.message = ERROR_MESSAGES.UNAUTHORIZED;
                break;
            
            case STATUS_CODES.FORBIDDEN:
                newError.message = ERROR_MESSAGES.UNAUTHORIZED;
                break;
            
            case STATUS_CODES.NOT_FOUND:
                newError.message = ERROR_MESSAGES.NOT_FOUND;
                break;
            
            case STATUS_CODES.TOO_MANY_REQUESTS:
                newError.message = ERROR_MESSAGES.TOO_MANY_REQUESTS;
                break;
            
            case STATUS_CODES.UNPROCESSABLE_ENTITY:
                newError.message = error.data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
                break;
        }

        throw newError;
    }

    // Generic request method
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const config = {
                method: options.method || HTTP_METHODS.GET,
                headers: this.buildHeaders(options.headers),
                credentials: 'include', // Include cookies
                signal: controller.signal,
                ...options
            };

            if (options.body && config.method !== HTTP_METHODS.GET) {
                if (typeof options.body === 'object') {
                    config.body = JSON.stringify(options.body);
                } else {
                    config.body = options.body;
                }
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);
            
            return await this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            this.handleError(error);
        }
    }

    // HTTP method shortcuts
    async get(url, options = {}) {
        return this.request(url, { ...options, method: HTTP_METHODS.GET });
    }

    async post(url, body, options = {}) {
        return this.request(url, { ...options, method: HTTP_METHODS.POST, body });
    }

    async put(url, body, options = {}) {
        return this.request(url, { ...options, method: HTTP_METHODS.PUT, body });
    }

    async delete(url, options = {}) {
        return this.request(url, { ...options, method: HTTP_METHODS.DELETE });
    }

    async patch(url, body, options = {}) {
        return this.request(url, { ...options, method: HTTP_METHODS.PATCH, body });
    }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;
