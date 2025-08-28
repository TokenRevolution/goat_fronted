import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { authApi } from '../api/auth';
import { Trophy, User, Users, Loader, AlertCircle } from 'lucide-react';

const Registration = () => {
  console.log('[DEBUG] Registration: Component mounted');
  const navigate = useNavigate();
  const { account, signer, refreshUserData, isUserRegistered, registrationChecked } = useWallet();
  
  console.log('[DEBUG] Registration: account =', account);
  console.log('[DEBUG] Registration: signer =', signer ? 'available' : 'not available');
  console.log('[DEBUG] Registration: isUserRegistered =', isUserRegistered);
  console.log('[DEBUG] Registration: registrationChecked =', registrationChecked);
  const [formData, setFormData] = useState({
    nickname: '',
    referralAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const signRegistrationMessage = async () => {
    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const message = `Register account for GOAT platform\nWallet: ${account}\nNickname: ${formData.nickname}\nTimestamp: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      
      return { message, signature };
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign registration message');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] Registration: Form submission started');
    
    if (!formData.nickname.trim()) {
      console.log('[DEBUG] Registration: Validation failed - nickname required');
      setError('Nickname is required');
      return;
    }

    if (formData.nickname.length < 3) {
      console.log('[DEBUG] Registration: Validation failed - nickname too short');
      setError('Nickname must be at least 3 characters long');
      return;
    }

    if (formData.nickname.length > 20) {
      console.log('[DEBUG] Registration: Validation failed - nickname too long');
      setError('Nickname must be less than 20 characters');
      return;
    }

    // Validate referral address if provided
    if (formData.referralAddress && !/^0x[a-fA-F0-9]{40}$/.test(formData.referralAddress)) {
      console.log('[DEBUG] Registration: Validation failed - invalid referral address');
      setError('Invalid referral address format');
      return;
    }

    console.log('[DEBUG] Registration: All validations passed, starting registration process');
    setIsLoading(true);
    setError('');

    try {
      // Sign the registration message
      console.log('[DEBUG] Registration: Signing registration message...');
      const { message, signature } = await signRegistrationMessage();
      console.log('[DEBUG] Registration: Message signed successfully');
      
      // Register user with API
      const registrationData = {
        username: formData.nickname,
        address: account,
        referralCode: formData.referralAddress || null,
        signature: signature,
        message: message
      };
      console.log('[DEBUG] Registration: Sending registration data to API:', registrationData);

      const response = await authApi.register(registrationData);
      console.log('[DEBUG] Registration: API response:', response);
      
      if (response && response.success) {
        // Registration successful - refresh user data and redirect to home
        console.log('[DEBUG] Registration: Registration successful, refreshing user data...');
        await refreshUserData();
        console.log('[DEBUG] Registration: Redirecting to home...');
        navigate('/', { replace: true });
      } else {
        throw new Error(response?.message || 'Registration failed');
      }
    } catch (error) {
      console.error('[DEBUG] Registration: Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation in useEffect to avoid rendering issues
  useEffect(() => {
    if (!account) {
      console.log('[DEBUG] Registration: No wallet connected, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

    if (registrationChecked && isUserRegistered === true) {
      console.log('[DEBUG] Registration: User already registered, redirecting to home');
      navigate('/', { replace: true });
      return;
    }
  }, [account, registrationChecked, isUserRegistered, navigate]);

  // Show loading if no wallet or still checking
  if (!account || !registrationChecked) {
    const message = !account ? 
      'Please connect your wallet...' : 
      'Checking registration status...';
    
    console.log('[DEBUG] Registration:', !account ? 'No wallet connected' : 'Still checking registration status...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-goat-dark to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-goat-gold mb-2">
            {!account ? 'Connect Wallet' : 'Checking Registration Status'}
          </h1>
          <p className="text-gray-300">{message}</p>
        </div>
      </div>
    );
  }

  // If user is already registered, show loading (navigation will happen in useEffect)
  if (isUserRegistered === true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-goat-dark to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-goat-gold mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-goat-gold mb-2">Redirecting...</h1>
          <p className="text-gray-300">You are already registered</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-goat-dark to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-goat-gold to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Welcome to GOAT</h1>
          <p className="text-gray-300 text-lg">Complete your registration to get started</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-goat-gold/20 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Connected Wallet Display */}
            <div className="bg-black/20 rounded-lg p-4 border border-goat-gold/10">
              <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
              <p className="text-goat-gold font-mono text-sm break-all">{account}</p>
            </div>

            {/* Nickname Field */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nickname *
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="Enter your nickname"
                className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-goat-gold focus:ring-1 focus:ring-goat-gold transition-colors"
                disabled={isLoading}
                maxLength="20"
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, will be displayed publicly</p>
            </div>

            {/* Referral Address Field */}
            <div>
              <label htmlFor="referralAddress" className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Referral Address (Optional)
              </label>
              <input
                type="text"
                id="referralAddress"
                name="referralAddress"
                value={formData.referralAddress}
                onChange={handleInputChange}
                placeholder="0x... (optional)"
                className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-goat-gold focus:ring-1 focus:ring-goat-gold transition-colors"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">If you were referred by someone, enter their wallet address</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.nickname.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-goat-gold to-orange-500 hover:from-orange-500 hover:to-goat-gold text-black font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5" />
                  <span>Sign & Register</span>
                </>
              )}
            </button>

            {/* Info Text */}
            <div className="text-center text-sm text-gray-400 space-y-2">
              <p>By registering, you'll be able to:</p>
              <ul className="text-xs space-y-1">
                <li>• Make deposits and participate in the platform</li>
                <li>• Earn referral rewards</li>
                <li>• Unlock trophies and achievements</li>
                <li>• Access your personalized dashboard</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
