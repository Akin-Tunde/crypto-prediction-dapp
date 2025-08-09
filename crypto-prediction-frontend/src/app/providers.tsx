// src/app/providers.tsx
'use client'; 

import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, bsc, optimism, celo, arbitrum } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Set up the chains and transports
const config = createConfig({
  chains: [base, bsc, optimism, celo, arbitrum],
  transports: {
    [base.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
    [celo.id]: http(),
    [arbitrum.id]: http(),
  },
});

// 2. Set up a React Query client
const queryClient = new QueryClient();

// 3. Create the provider component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}