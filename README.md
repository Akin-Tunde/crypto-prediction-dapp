# Multi-Chain Crypto Prediction Market 

This project is a decentralized prediction market where users can bet on the future price of cryptocurrencies. It is deployed across five EVM-compatible blockchains: **Base, BNB Smart Chain, Optimism, Celo, and Arbitrum**.

The dApp consists of three main components:
1.  **Solidity Smart Contracts:** The on-chain logic for the prediction market, using Chainlink Oracles for price resolution.
2.  **Next.js Frontend:** A web interface built with Next.js, React, `wagmi`, and `viem` for interacting with the smart contracts on any of the supported chains.
3.  **Python Backend:** A FastAPI server that aggregates data from all chains and can automate tasks like market resolution.

## Features Used 

-   **Multi-Chain Support:** Connect and place bets on any of the five supported networks.
-   **Wallet Integration:** Uses `wagmi` for seamless connection with browser wallets like MetaMask.
-   **Live Market Data:** View real-time totals for "UP" and "DOWN" betting pools.
-   **Proportional Payouts:** Winners receive a share of the total prize pool proportional to their bet.
-   **Backend Aggregation:** An API to view market statistics across all chains at once.
-   **Automated Resolution:** The Python backend includes a script to automatically resolve markets when their resolution time is reached

