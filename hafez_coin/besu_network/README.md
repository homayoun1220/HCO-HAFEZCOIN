Besu IBFT 4-node testnet scaffold

This folder contains a scaffold to create a 4-validator IBFT 2.0 testnet using Hyperledger Besu.

Steps:

1. Install Docker and pull Hyperledger Besu image.

2. Generate the network files (genesis.json and validator keys):

```bash
cd hafez_coin/besu_network
chmod +x generate_network.sh
./generate_network.sh
```

3. Start the Besu nodes:

```bash
docker compose -f docker-compose.besu.yml up --build
```

Notes:
- The generator writes files to `networkFiles/`. Verify the generated `keys/` and `genesis.json`.
- The compose file assumes keys with specific filenames; if your generated keys differ, update `docker-compose.besu.yml` accordingly.
- Once nodes are running, set `RPC_URL` in `backend/.env` to `http://localhost:8545` and deploy the `HafezToken`.
