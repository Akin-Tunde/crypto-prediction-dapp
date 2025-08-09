// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react'; // <-- IMPORT useEffect
import { ConnectButton } from '@/components/ConnectButton';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, BaseError } from 'viem';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_CONTRACT_ADDRESSES } from '@/constants';

export default function Home() {
  const [betAmount, setBetAmount] = useState('');
  const { chain, isConnected } = useAccount();

  // Dynamically get the contract address based on the connected chain
  const contractAddress = chain ? PREDICTION_MARKET_CONTRACT_ADDRESSES[chain.id] : undefined;

  // wagmi hook to write to the 'placeBet' function
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  // wagmi hooks to read contract data. We also get the refetch functions.
  const { data: priceTarget } = useReadContract({
    address: contractAddress,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'priceTarget',
  });

  const { data: totalBetsUp, refetch: refetchBetsUp } = useReadContract({
    address: contractAddress,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'totalBetsUp',
  });

  const { data: totalBetsDown, refetch: refetchBetsDown } = useReadContract({
    address: contractAddress,
    abi: PREDICTION_MARKET_ABI,
    functionName: 'totalBetsDown',
  });

  // Function to handle placing a bet
  const handlePlaceBet = async (position: 0 | 1) => { // 0 for UP, 1 for DOWN
    if (!betAmount || parseFloat(betAmount) <= 0) {
      alert('Please enter a valid bet amount.');
      return;
    }
    writeContract({
      address: contractAddress!,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'placeBet',
      args: [position],
      value: parseEther(betAmount),
    });
  };
  
  // wagmi hook to wait for the transaction to be mined
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // THIS IS THE NEW, CORRECT WAY TO HANDLE THE SIDE EFFECT
  useEffect(() => {
    // If the transaction has been successfully confirmed...
    if (isConfirmed) {
      console.log('Transaction confirmed! Refetching pool data...');
      // ...refetch the bet totals to update the UI.
      refetchBetsUp();
      refetchBetsDown();
    }
  }, [isConfirmed, refetchBetsUp, refetchBetsDown]); // Dependency array


  return (
    <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-2xl md:text-4xl font-bold">Crypto Prediction Market</h1>
        <div className="mt-4 lg:mt-0">
          <ConnectButton />
        </div>
      </div>

      <div className="mt-16 w-full max-w-2xl">
        {isConnected && contractAddress ? (
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Market: ETH Price Prediction</h2>
            <div className="text-lg mb-2">
              Will the price be above <span className="font-bold text-yellow-400">${priceTarget ? Number(priceTarget) / 1e8 : '...'}</span> on Oct 1, 2025?
            </div>
            <p className="text-sm text-gray-400 mb-6">Connected to: {chain?.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-green-500/20 p-4 rounded-lg">
                <h3 className="text-lg font-bold">Total Bets UP</h3>
                <p className="text-2xl">{totalBetsUp ? formatEther(totalBetsUp) : '0'} ETH</p>
              </div>
              <div className="bg-red-500/20 p-4 rounded-lg">
                <h3 className="text-lg font-bold">Total Bets DOWN</h3>
                <p className="text-2xl">{totalBetsDown ? formatEther(totalBetsDown) : '0'} ETH</p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="betAmount" className="block text-sm font-medium mb-1">
                Your Bet Amount ({chain?.nativeCurrency.symbol})
              </label>
              <input
                type="number"
                id="betAmount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.1"
                disabled={isPending}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePlaceBet(0)}
                disabled={isPending || !betAmount}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isPending ? 'Betting...' : 'Bet UP'}
              </button>
              <button
                onClick={() => handlePlaceBet(1)}
                disabled={isPending || !betAmount}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isPending ? 'Betting...' : 'Bet DOWN'}
              </button>
            </div>
            
            {hash && <div className="mt-4 text-center text-sm truncate">Tx Hash: {hash}</div>}
            {isConfirming && <div className="mt-2 text-center text-yellow-400">Waiting for confirmation...</div>}
            {isConfirmed && <div className="mt-2 text-center text-green-400">Transaction confirmed! Your bet is placed.</div>}
            
            {error && (
              <div className="mt-2 text-center text-red-400 break-words">
                Error: {error instanceof BaseError ? error.shortMessage : error.message}
              </div>
            )}

          </div>
        ) : (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold">Please connect your wallet to continue.</h2>
            <p className="text-gray-400 mt-2">Make sure you are connected to a supported network (Base, BSC, Optimism, Celo, or Arbitrum).</p>
          </div>
        )}
      </div>
    </main>
  );
}