// src/constants.ts

// 1. Paste your contract addresses for each chain
export const PREDICTION_MARKET_CONTRACT_ADDRESSES: { [chainId: number]: `0x${string}` } = {
  8453: '0xYourBaseContractAddressHere',      // Base Mainnet
  56: '0xYourBscContractAddressHere',          // BSC Mainnet
  10: '0xYourOptimismContractAddressHere',      // Optimism Mainnet
  42220: '0xYourCeloContractAddressHere',       // Celo Mainnet
  42161: '0xYourArbitrumContractAddressHere',   // Arbitrum One
  // Add testnet chain IDs and addresses if needed
};

// 2. Paste the ABI you copied from Remix
export const PREDICTION_MARKET_ABI = [
    // ... paste the entire JSON array here ...
] as const;