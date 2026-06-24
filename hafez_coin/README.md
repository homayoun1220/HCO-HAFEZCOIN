# Hafez Web Application

This folder contains the skeleton for the `Hafez` cryptocurrency web application, designed for a limited-node test deployment on Hyperledger Besu and the new POCMT consensus architecture.

## Goals

- Provide a frontend dashboard for token balance, transfers, and consensus status
- Provide a backend API for Ethereum/Besu RPC interaction and token management
- Support a new Hafez token deployment on a private Besu testnet
- Follow best-practice separation between UI, API, and blockchain contract layers

## Structure

- `backend/` — Express API, token service, contract ABI loader
- `frontend/` — React/Vite interface for wallet and token operations
- `docker-compose.yml` — local dev orchestration for backend and frontend

## Getting started

1. Start your Besu testnet and deploy the `HafezToken` contract.
2. In `backend`, install dependencies:
   ```bash
   npm install
   ```
3. In `frontend`, install dependencies:
   ```bash
   npm install
   ```
4. Configure `backend/.env` based on `backend/.env.example`.
5. Run the app:
   ```bash
   docker compose up --build
   ```

## Integration notes

- The backend connects to Besu via `RPC_URL`.
- The Hafez token address is provided via `TOKEN_CONTRACT_ADDRESS`.
- `HAFEZ` is the placeholder token symbol used in the scaffolding; replace if needed.
- For Horizon Europe requirements, keep private keys secure and use HTTPS in production.
- Smart contract deployment and compilation are bootstrapped by `backend/contracts/HafezToken.sol`.
