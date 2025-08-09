// src/app/providers.tsx
'use client'; // This is a client-side only file

import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Set up the chains and transports
const config = createConfig({
  chains: [sepolia], // You deployed to Sepolia
  transports: {
    [sepolia.id]: http(), // Use a public RPC for the chain
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