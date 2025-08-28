// Blockchain Configuration for GOAT Frontend
// BSC Mainnet and Testnet only

// Get environment variables
const BSC_MAINNET_RPC = process.env.REACT_APP_BSC_MAINNET_RPC || 'https://bsc-dataseed.binance.org';
const BSC_TESTNET_RPC = process.env.REACT_APP_BSC_TESTNET_RPC || 'https://data-seed-prebsc-1-s1.binance.org:8545';
const BSC_MAINNET_CHAIN_ID = parseInt(process.env.REACT_APP_BSC_MAINNET_CHAIN_ID || '56');
const BSC_TESTNET_CHAIN_ID = parseInt(process.env.REACT_APP_BSC_TESTNET_CHAIN_ID || '97');

// Network configurations
export const NETWORKS = {
  bscMainnet: {
    chainId: BSC_MAINNET_CHAIN_ID,
    name: 'BNB Smart Chain Mainnet',
    shortName: 'BSC',
    rpcUrl: BSC_MAINNET_RPC,
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    isTestnet: false
  },
  bscTestnet: {
    chainId: BSC_TESTNET_CHAIN_ID,
    name: 'BNB Smart Chain Testnet',
    shortName: 'BSC Testnet',
    rpcUrl: BSC_TESTNET_RPC,
    blockExplorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'Test BNB',
      symbol: 'tBNB',
      decimals: 18
    },
    isTestnet: true
  }
};

// USDT contract addresses for transfers
export const USDT_CONTRACTS = {
  mainnet: process.env.REACT_APP_USDT_BSC_MAINNET || '0x55d398326f99059fF775485246999027B3197955',
  testnet: process.env.REACT_APP_USDT_BSC_TESTNET || '0x4bC3A5ae91ab34380464DBD17233178fbB861AC0'
};

// Get current network based on environment
export const getCurrentNetwork = () => {
  const defaultNetwork = process.env.REACT_APP_DEFAULT_NETWORK || 'testnet';
  return process.env.NODE_ENV === 'production' && defaultNetwork === 'mainnet' 
    ? NETWORKS.bscMainnet 
    : NETWORKS.bscTestnet;
};

// Get USDT contract address for current network
export const getUSDTAddress = (network) => {
  const currentNetwork = network || getCurrentNetwork();
  const isMainnet = currentNetwork.chainId === BSC_MAINNET_CHAIN_ID;
  
  return isMainnet ? USDT_CONTRACTS.mainnet : USDT_CONTRACTS.testnet;
};

// MetaMask network configuration
export const getMetamaskNetworkConfig = (networkKey = 'bscTestnet') => {
  const network = NETWORKS[networkKey];
  if (!network) {
    throw new Error(`Unknown network: ${networkKey}`);
  }

  return {
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: network.name,
    nativeCurrency: network.nativeCurrency,
    rpcUrls: [network.rpcUrl],
    blockExplorerUrls: [network.blockExplorer]
  };
};

// Switch or add network to MetaMask
export const switchToNetwork = async (networkKey = 'bscTestnet') => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const network = NETWORKS[networkKey];
  const chainIdHex = `0x${network.chainId.toString(16)}`;

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }]
    });
  } catch (switchError) {
    // Network doesn't exist, add it
    if (switchError.code === 4902) {
      const networkConfig = getMetamaskNetworkConfig(networkKey);
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig]
      });
    } else {
      throw switchError;
    }
  }
};

// Get explorer URL for transaction
export const getExplorerUrl = (txHash, networkKey) => {
  const network = networkKey ? NETWORKS[networkKey] : getCurrentNetwork();
  return `${network.blockExplorer}/tx/${txHash}`;
};

// Get explorer URL for address
export const getAddressExplorerUrl = (address, networkKey) => {
  const network = networkKey ? NETWORKS[networkKey] : getCurrentNetwork();
  return `${network.blockExplorer}/address/${address}`;
};

// Validate network compatibility
export const isValidNetwork = (chainId) => {
  return chainId === BSC_MAINNET_CHAIN_ID || chainId === BSC_TESTNET_CHAIN_ID;
};

// Get network info by chain ID
export const getNetworkByChainId = (chainId) => {
  switch (chainId) {
    case BSC_MAINNET_CHAIN_ID:
      return NETWORKS.bscMainnet;
    case BSC_TESTNET_CHAIN_ID:
      return NETWORKS.bscTestnet;
    default:
      return null;
  }
};

export default {
  NETWORKS,
  USDT_CONTRACTS,
  getCurrentNetwork,
  getUSDTAddress,
  getMetamaskNetworkConfig,
  switchToNetwork,
  getExplorerUrl,
  getAddressExplorerUrl,
  isValidNetwork,
  getNetworkByChainId
};
