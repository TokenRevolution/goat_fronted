import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { getCurrentNetwork, switchToNetwork, isValidNetwork, getNetworkByChainId, getUSDTAddress } from '../config/blockchain';
import { authApi } from '../api/auth';
import { makeApiRequest, cancelAllApiRequests } from '../utils/ApiManager';

// USDT Token ABI - Only transfer function needed
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(null); // null = unknown, true = registered, false = not registered
  const [registrationChecked, setRegistrationChecked] = useState(false);
  const [username, setUsername] = useState(null); // Store the user's nickname
  const [providerType, setProviderType] = useState(null); // 'metamask' | 'walletconnect'
  const [walletConnectProvider, setWalletConnectProvider] = useState(null);

  // Debounced cache for registration checks to prevent API spam
  const registrationCheckCache = useRef(new Map());
  const registrationCheckTimeouts = useRef(new Map());

  // Check if user is registered using Global API Manager (rate limited and cached)
  const checkUserRegistration = useCallback(async (address) => {
    console.log(`[DEBUG] WalletContext: Checking registration for address: ${address}`);
    
    if (!address) {
      console.log('[DEBUG] WalletContext: No address provided, skipping registration check');
      setIsUserRegistered(null);
      setRegistrationChecked(true);
      return null;
    }

    try {
      // Use the global API manager with rate limiting and caching
      const response = await makeApiRequest(
        `registration_${address}`,
        () => authApi.getUserByAddress(address),
        5 // Medium priority
      );
      
      console.log(`[DEBUG] WalletContext: API Response:`, response);
      
      if (response && response.success && response.user) {
        console.log(`[DEBUG] WalletContext: User found - ${response.user.username}`);
        setIsUserRegistered(true);
        setUsername(response.user.username);
        setRegistrationChecked(true);
        return true;
      } else {
        console.log(`[DEBUG] WalletContext: User NOT found or response structure unexpected`);
        setIsUserRegistered(false);
        setUsername(null);
        setRegistrationChecked(true);
        return false;
      }
      
    } catch (error) {
      console.error('[DEBUG] WalletContext: Error checking user registration:', error);
      
      // For errors, keep unknown state
      console.log('[DEBUG] WalletContext: Setting registration to null due to error');
      setIsUserRegistered(null);
      setUsername(null);
      setRegistrationChecked(true);
      return null;
    }
  }, []);

  // Connect to WalletConnect
  const connectWalletConnect = useCallback(async () => {
    try {
      console.log('[DEBUG] WalletContext: Connecting to WalletConnect...');
      
      // Check if WalletConnect is properly configured
      const projectIdFromEnv = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
      const projectId = projectIdFromEnv || '2ba67e006f17083c559e3b0340e07812'; // Fallback hardcoded
      
      console.log('[DEBUG] WalletConnect Project ID from env:', projectIdFromEnv);
      console.log('[DEBUG] WalletConnect Using Project ID:', projectId);
      console.log('[DEBUG] Expected Project ID: 2ba67e006f17083c559e3b0340e07812');
      console.log('[DEBUG] Project ID matches expected?', projectId === '2ba67e006f17083c559e3b0340e07812');
      
      if (!projectId || projectId === 'your-project-id-here') {
        throw new Error(
          'WalletConnect not configured. Please:\n' +
          '1. Go to https://cloud.walletconnect.com\n' +
          '2. Create a free project\n' +
          '3. Copy the Project ID\n' +
          '4. Create .env file with: REACT_APP_WALLETCONNECT_PROJECT_ID=your-project-id'
        );
      }
      
      // Check if MetaMask is available and connect directly
      const hasMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
      
      if (hasMetaMask) {
        console.log('[DEBUG] WalletConnect: MetaMask detected, connecting directly...');
        try {
          // Connect directly to MetaMask
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const account = accounts[0];
          
          setAccount(account);
          setProvider(provider);
          setSigner(signer);
          setIsConnected(true);
          setProviderType('metamask-direct');
          
          // Get chain ID and check network
          const network = await provider.getNetwork();
          const chainId = network.chainId;
          setChainId(chainId);
          
          // Check if we're on the correct BSC network
          const networkValid = isValidNetwork(chainId);
          setIsCorrectNetwork(networkValid);
          
          if (networkValid) {
            const networkInfo = getNetworkByChainId(chainId);
            setCurrentNetwork(networkInfo);
            
            // Get BNB balance
            const balance = await provider.getBalance(account);
            setBalance(ethers.utils.formatEther(balance));
            
            // Get USDT balance
            const usdtBal = await getUSDTBalance(account, networkInfo);
            setUsdtBalance(usdtBal);
            console.log('[DEBUG] WalletContext: Balances loaded - BNB:', ethers.utils.formatEther(balance), 'USDT:', usdtBal);
          }

          // Set up enhanced MetaMask event listeners
          window.ethereum.on('accountsChanged', async (accounts) => {
            console.log('[DEBUG] MetaMask: Accounts changed', accounts);
            
            if (accounts.length === 0) {
              console.log('[DEBUG] MetaMask: No accounts, disconnecting...');
              await disconnectWallet();
            } else if (accounts[0] !== account) {
              console.log('[DEBUG] MetaMask: Account changed from', account, 'to', accounts[0]);
              setAccount(accounts[0]);
              
              // Re-check user registration for new account (debounced)
              try {
                checkUserRegistration(accounts[0]); // This is now debounced, no need to await
                console.log('[DEBUG] MetaMask: Checking registration for new account (debounced)');
                
                // Update balances for new account
                if (currentNetwork) {
                  const balance = await provider.getBalance(accounts[0]);
                  setBalance(ethers.utils.formatEther(balance));
                  
                  const usdtBal = await getUSDTBalance(accounts[0], currentNetwork);
                  setUsdtBalance(usdtBal);
                }
              } catch (error) {
                console.error('[DEBUG] MetaMask: Error handling account change:', error);
              }
            }
          });

          window.ethereum.on('chainChanged', (chainId) => {
            const newChainId = parseInt(chainId, 16);
            console.log('[DEBUG] MetaMask: Chain changed to', newChainId);
            setChainId(newChainId);
            
            // Check if new network is valid
            const networkValid = isValidNetwork(newChainId);
            setIsCorrectNetwork(networkValid);
            
            if (networkValid) {
              const networkInfo = getNetworkByChainId(newChainId);
              setCurrentNetwork(networkInfo);
              
              // Refresh balances on new network
              if (account && provider) {
                provider.getBalance(account).then(balance => {
                  setBalance(ethers.utils.formatEther(balance));
                }).catch(console.error);
                
                getUSDTBalance(account, networkInfo).then(usdtBal => {
                  setUsdtBalance(usdtBal);
                }).catch(console.error);
              }
            } else {
              console.log('[DEBUG] MetaMask: Invalid network, user needs to switch to BSC');
            }
          });

          window.ethereum.on('disconnect', (error) => {
            console.log('[DEBUG] MetaMask: Disconnected', error);
            disconnectWallet();
          });

          // Clear manual disconnect flag since user is connecting
          try {
            localStorage.removeItem('wallet_manually_disconnected');
            console.log('[DEBUG] WalletContext: Cleared manual disconnect flag - user connecting to MetaMask');
          } catch (error) {
            console.error('[DEBUG] WalletContext: Error clearing disconnect flag:', error);
          }

          // Check if user is registered after successful wallet connection
          console.log(`[DEBUG] WalletContext: MetaMask connected directly, checking registration...`);
          const isRegistered = await checkUserRegistration(account);
          console.log(`[DEBUG] WalletContext: Registration check result: ${isRegistered}`);
          
          return { success: true, account, networkValid, isRegistered, type: 'metamask-direct' };
        } catch (metamaskError) {
          console.error('[DEBUG] WalletConnect: Direct MetaMask connection failed, falling back to WalletConnect:', metamaskError);
          // Fall through to WalletConnect initialization
        }
      }

      // Initialize WalletConnect provider for other wallets or if MetaMask direct failed
      console.log('[DEBUG] WalletConnect: Initializing WalletConnect for universal connection...');
      const wcProvider = await EthereumProvider.init({
        projectId: projectId,
        chains: [56, 97], // BSC mainnet and testnet
        showQrModal: true,
        qrModalOptions: {
          themeMode: 'dark',
          themeVariables: {
            '--wcm-z-index': '1000'
          },
          enableExplorer: true,
          enableWebWallets: true,
          enableMobileWallets: true,
          explorerRecommendedWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
            'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
            '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Trust Wallet
          ]
        },
        metadata: {
          name: 'GOAT Platform',
          description: 'Greatest of All Time - Football DeFi Platform',
          url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
          icons: ['https://app.goat-platform.com/favicon.ico']
        },
        rpcMap: {
          56: 'https://bsc-dataseed.binance.org',
          97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
        }
      });

      // Connect to wallet
      console.log('[DEBUG] WalletConnect: Attempting to connect...');
      await wcProvider.connect();
      console.log('[DEBUG] WalletConnect: Connected successfully!');
      
      const provider = new ethers.providers.Web3Provider(wcProvider);
      const signer = provider.getSigner();
      const accounts = await provider.listAccounts();
      const account = accounts[0];
      
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
      setIsConnected(true);
      setProviderType('unified'); // Always unified via WalletConnect
      setWalletConnectProvider(wcProvider);
      
      // Get chain ID and check network
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      setChainId(chainId);
      
      // Check if we're on the correct BSC network
      const networkValid = isValidNetwork(chainId);
      setIsCorrectNetwork(networkValid);
      
      if (networkValid) {
        const networkInfo = getNetworkByChainId(chainId);
        setCurrentNetwork(networkInfo);
        
        // Get BNB balance
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
        
        // Get USDT balance
        const usdtBal = await getUSDTBalance(account, networkInfo);
        setUsdtBalance(usdtBal);
        console.log('[DEBUG] WalletContext: Balances loaded - BNB:', ethers.utils.formatEther(balance), 'USDT:', usdtBal);
      }

      // Handle WalletConnect events
      wcProvider.on('accountsChanged', (accounts) => {
        console.log('[DEBUG] WalletConnect: Accounts changed', accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      wcProvider.on('chainChanged', (chainId) => {
        console.log('[DEBUG] WalletConnect: Chain changed', chainId);
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        const network = getNetworkByChainId(newChainId);
        setCurrentNetwork(network);
        setIsCorrectNetwork(isValidNetwork(newChainId));
      });

      wcProvider.on('disconnect', () => {
        console.log('[DEBUG] WalletConnect: Disconnected');
        disconnectWallet();
      });

      // Clear manual disconnect flag since user is connecting
      try {
        localStorage.removeItem('wallet_manually_disconnected');
        console.log('[DEBUG] WalletContext: Cleared manual disconnect flag - user connecting to WalletConnect');
      } catch (error) {
        console.error('[DEBUG] WalletContext: Error clearing disconnect flag:', error);
      }

      // Check if user is registered after successful wallet connection
      console.log(`[DEBUG] WalletContext: WalletConnect connected successfully, checking registration...`);
      const isRegistered = await checkUserRegistration(account);
      console.log(`[DEBUG] WalletContext: Registration check result: ${isRegistered}`);
      
      return { success: true, account, networkValid, isRegistered, type: 'walletconnect' };
    } catch (error) {
      console.error('[DEBUG] WalletConnect Error Details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.message.includes('Invalid project id')) {
        errorMessage = 'Invalid WalletConnect Project ID. Please check your .env file.';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user.';
      } else if (error.message.includes('Session rejected')) {
        errorMessage = 'Connection rejected. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  }, [checkUserRegistration]);

  // Legacy function kept for compatibility - redirects to WalletConnect
  const connectMetaMask = useCallback(async () => {
    console.log('[DEBUG] WalletContext: Redirecting MetaMask connection to unified WalletConnect...');
    return await connectWalletConnect();
  }, [connectWalletConnect]);

  // Generic connect wallet function (always uses WalletConnect now)
  const connectWallet = useCallback(async (type = 'unified') => {
    console.log('[DEBUG] WalletContext: Using unified wallet connection via WalletConnect');
    return await connectWalletConnect();
  }, [connectWalletConnect]);

  // Enhanced disconnect wallet function
  const disconnectWallet = async (silent = false) => {
    if (!silent) {
      console.log('[DEBUG] WalletContext: Starting disconnection process...');
      console.log('[DEBUG] WalletContext: Current provider type:', providerType);
    }
    
    // Cancel ALL pending API requests immediately
    cancelAllApiRequests();
    if (!silent) {
      console.log('[DEBUG] WalletContext: Cancelled all pending API requests');
    }
    
    try {
      // Handle different provider types with more thorough cleanup
      if (providerType === 'metamask-direct') {
        if (!silent) console.log('[DEBUG] WalletContext: Disconnecting direct MetaMask connection...');
        
        try {
          // Remove all possible MetaMask event listeners
          if (typeof window.ethereum !== 'undefined') {
            const events = ['accountsChanged', 'chainChanged', 'connect', 'disconnect', 'message'];
            events.forEach(event => {
              try {
                window.ethereum.removeAllListeners(event);
              } catch (e) {
                // Ignore individual listener removal errors
              }
            });
            if (!silent) console.log('[DEBUG] WalletContext: Removed all MetaMask event listeners');
          }
        } catch (error) {
          console.error('[DEBUG] WalletContext: Error removing MetaMask listeners:', error);
        }
        
      } else if (walletConnectProvider) {
        if (!silent) console.log('[DEBUG] WalletContext: Disconnecting WalletConnect wallet...');
        
        try {
          // More thorough WalletConnect cleanup
          if (walletConnectProvider.connected) {
            await walletConnectProvider.disconnect();
          }
          
          // Remove WalletConnect event listeners
          const wcEvents = ['accountsChanged', 'chainChanged', 'disconnect', 'connect'];
          wcEvents.forEach(event => {
            try {
              walletConnectProvider.removeAllListeners(event);
            } catch (e) {
              // Ignore individual listener removal errors
            }
          });
          
          if (!silent) console.log('[DEBUG] WalletContext: WalletConnect wallet disconnected successfully');
        } catch (wcError) {
          console.error('[DEBUG] WalletContext: WalletConnect disconnect error:', wcError);
        }
      }
      
      // Enhanced localStorage cleanup
      try {
        const keysToRemove = [
          'walletconnect',
          'WALLETCONNECT_DEEPLINK_CHOICE', 
          'WCM_MODAL_CLOSED_ON_CONNECT',
          'wc@2:client:0.3//session',
          'wc@2:core:0.3//keychain',
          'wc@2:core:0.3//messages',
          'wc@2:ethereum_provider:/chainId',
          'wc@2:ethereum_provider:/accounts'
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignore individual removal errors
          }
        });
        
        // Set manual disconnect flag only if not silent
        if (!silent) {
          localStorage.setItem('wallet_manually_disconnected', 'true');
        }
        
        if (!silent) console.log('[DEBUG] WalletContext: Enhanced localStorage cleanup completed');
      } catch (error) {
        console.error('[DEBUG] WalletContext: Error during localStorage cleanup:', error);
      }
      
    } catch (error) {
      console.error('[DEBUG] WalletContext: Error during disconnection process:', error);
    }

    // Reset all states regardless of any errors above
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    setBalance('0');
    setUsdtBalance('0');
    setCurrentNetwork(null);
    setIsCorrectNetwork(false);
    setIsUserRegistered(null);
    setRegistrationChecked(false);
    setUsername(null);
    setProviderType(null);
    setWalletConnectProvider(null);
    
    if (!silent) {
      console.log('[DEBUG] WalletContext: Wallet disconnected and state cleared');
      
      // Force a small delay to ensure state is fully reset
      setTimeout(() => {
        console.log('[DEBUG] WalletContext: Disconnection complete');
      }, 100);
    }
  };

  // Smart wallet switching function
  const switchWallet = async (force = false) => {
    console.log('[DEBUG] WalletContext: Starting wallet switch process...');
    console.log('[DEBUG] WalletContext: Current provider:', providerType);
    console.log('[DEBUG] WalletContext: Force switch:', force);
    
    try {
      // If user is connected and not forcing, suggest alternative
      if (isConnected && !force) {
        const currentWallet = providerType === 'metamask-direct' ? 'MetaMask (Direct)' : 'WalletConnect';
        console.log(`[DEBUG] WalletContext: Currently connected to ${currentWallet}`);
        
        // For switching from MetaMask to other wallets, we need to disconnect first
        if (providerType === 'metamask-direct') {
          console.log('[DEBUG] WalletContext: Switching from MetaMask to universal WalletConnect...');
          await disconnectWallet(true); // Silent disconnect
          
          // Give a moment for state to clear
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Connect via WalletConnect
          return await connectWalletConnect();
        } else {
          console.log('[DEBUG] WalletContext: Already using WalletConnect - opening new connection...');
          return await connectWalletConnect();
        }
      }
      
      // If not connected or forcing, start fresh connection
      console.log('[DEBUG] WalletContext: Starting fresh wallet connection...');
      return await connectWalletConnect();
      
    } catch (error) {
      console.error('[DEBUG] WalletContext: Error during wallet switch:', error);
      return { success: false, error: error.message };
    }
  };

  // Force reconnect current wallet (useful for refreshing connection)
  const reconnectWallet = async () => {
    console.log('[DEBUG] WalletContext: Reconnecting current wallet...');
    
    if (!isConnected) {
      console.log('[DEBUG] WalletContext: No wallet connected, starting fresh connection');
      return await connectWalletConnect();
    }
    
    const currentType = providerType;
    console.log('[DEBUG] WalletContext: Reconnecting', currentType);
    
    // Silent disconnect and reconnect
    await disconnectWallet(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return await connectWalletConnect();
  };

  // Switch to BSC network
  const switchToBSC = async (useTestnet = true) => {
    try {
      const networkKey = useTestnet ? 'bscTestnet' : 'bscMainnet';
      await switchToNetwork(networkKey);
      
      // Update state after successful switch
      const targetNetwork = getCurrentNetwork();
      setCurrentNetwork(targetNetwork);
      setChainId(targetNetwork.chainId);
      setIsCorrectNetwork(true);
      
      return { success: true };
    } catch (error) {
      console.error('Error switching to BSC:', error);
      return { success: false, error: error.message };
    }
  };

  // Legacy switch network function (kept for compatibility)
  const switchNetwork = async (chainId) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  // Get USDT balance
  const getUSDTBalance = useCallback(async (address, network = null) => {
    try {
      if (!provider || !address) return '0';
      
      const targetNetwork = network || currentNetwork;
      if (!targetNetwork) {
        console.log('[DEBUG] WalletContext: No network available for USDT balance');
        return '0';
      }
      
      const usdtAddress = getUSDTAddress(targetNetwork);
      const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, provider);
      const balance = await usdtContract.balanceOf(address);
      
      // Token has 18 decimals (not standard USDT 6)
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('[DEBUG] WalletContext: Error getting USDT balance:', error);
      return '0';
    }
  }, [provider, currentNetwork]);

  // Send USDT transaction (for deposits)
  const sendTransaction = async (to, amount) => {
    try {
      if (!signer) throw new Error('No signer available');
      
      console.log('[DEBUG] WalletContext: Sending USDT transfer', { to, amount });
      
      // Get USDT contract address for current network
      const usdtAddress = getUSDTAddress(currentNetwork);
      console.log('[DEBUG] WalletContext: USDT contract address:', usdtAddress);
      
      // Create USDT contract instance
      const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer);
      
      // Convert amount to token units (18 decimals)
      const usdtAmount = ethers.utils.parseUnits(amount.toString(), 18);
      console.log('[DEBUG] WalletContext: USDT amount (with decimals):', usdtAmount.toString());
      
      // Send USDT transfer transaction
      const tx = await usdtContract.transfer(to, usdtAmount);
      console.log('[DEBUG] WalletContext: Transaction sent:', tx.hash);
      
      // Wait for confirmation
      await tx.wait();
      console.log('[DEBUG] WalletContext: Transaction confirmed');
      
      return { success: true, hash: tx.hash };
    } catch (error) {
      console.error('[DEBUG] WalletContext: Error sending USDT transaction:', error);
      return { success: false, error: error.message };
    }
  };

  // Event listeners are now handled by WalletConnect provider
  // No need for separate MetaMask listeners

  // Auto-connect if previously connected (only if not manually disconnected)
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if user manually disconnected
        const manuallyDisconnected = localStorage.getItem('wallet_manually_disconnected') === 'true';
        
        if (manuallyDisconnected) {
          console.log('[DEBUG] WalletContext: Skipping auto-connect - user manually disconnected');
          return;
        }
        
        // Check for any previous wallet connection
        const hasWalletConnect = localStorage.getItem('walletconnect') !== null;
        const hasMetaMask = typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress && window.ethereum.isMetaMask;
        
        if (hasMetaMask) {
          console.log('[DEBUG] WalletContext: Auto-connecting to MetaMask directly');
          connectWalletConnect(); // This will detect MetaMask and connect directly
        } else if (hasWalletConnect) {
          console.log('[DEBUG] WalletContext: Auto-connecting to previously connected wallet via WalletConnect');
          connectWalletConnect();
        } else {
          console.log('[DEBUG] WalletContext: No previously connected wallet found');
        }
      } catch (error) {
        console.error('[DEBUG] WalletContext: Error during auto-connect check:', error);
      }
    };
    
    // Delay the auto-connect check to ensure all functions are initialized
    const timeoutId = setTimeout(checkConnection, 100);
    
    // Cleanup function to clear all timeouts and prevent memory leaks
    return () => {
      clearTimeout(timeoutId);
      
      // Clear all pending registration check timeouts
      registrationCheckTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      registrationCheckTimeouts.current.clear();
      
      // Clear cache
      registrationCheckCache.current.clear();
    };
  }, [connectWalletConnect]);



  const value = {
    account,
    provider,
    signer,
    isConnected,
    chainId,
    balance,
    usdtBalance,
    currentNetwork,
    isCorrectNetwork,
    isUserRegistered,
    registrationChecked,
    username,
    providerType,
    connectWallet: connectWalletConnect, // Unified connection via WalletConnect
    connectMetaMask, // Legacy compatibility - redirects to WalletConnect
    connectWalletConnect,
    disconnectWallet,
    switchWallet,
    reconnectWallet,
    switchNetwork,
    switchToBSC,
    sendTransaction,
    getUSDTBalance,
    checkUserRegistration,
    refreshUserData: useCallback(() => {
      if (account) {
        console.log('[DEBUG] WalletContext: Refreshing user data (debounced)');
        checkUserRegistration(account); // This is now debounced
      }
    }, [account, checkUserRegistration]),
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
