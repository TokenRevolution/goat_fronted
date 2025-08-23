import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

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

  // Connect to MetaMask or other wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
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
        
        // Get chain ID and balance
        const network = await provider.getNetwork();
        setChainId(network.chainId);
        
        const balance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(balance));
        
        return { success: true, account };
      } else {
        throw new Error('Please install MetaMask or another wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return { success: false, error: error.message };
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    setBalance('0');
  };

  // Switch network (for testing on different chains)
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

  // Send transaction (for deposits)
  const sendTransaction = async (to, amount) => {
    try {
      if (!signer) throw new Error('No signer available');
      
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount.toString()),
      });
      
      return { success: true, hash: tx.hash };
    } catch (error) {
      console.error('Error sending transaction:', error);
      return { success: false, error: error.message };
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
        window.location.reload();
      });

      return () => {
        window.ethereum.removeAllListeners();
      };
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
        await connectWallet();
      }
    };
    
    checkConnection();
  }, []);

  const value = {
    account,
    provider,
    signer,
    isConnected,
    chainId,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
