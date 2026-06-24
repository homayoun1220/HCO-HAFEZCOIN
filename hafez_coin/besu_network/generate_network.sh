#!/usr/bin/env bash
set -euo pipefail

# Generates genesis.json and validator keys using Hyperledger Besu operator
# Usage: ./generate_network.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_DIR="$ROOT_DIR"
OUT_DIR="$ROOT_DIR/networkFiles"
mkdir -p "$OUT_DIR"

docker run --rm \
  -v "$CONFIG_DIR":/config \
  -v "$OUT_DIR":/networkFiles \
  hyperledger/besu:latest \
  operator generate-blockchain-config \
    --config-file=/config/ibftConfigFile.json \
    --to=/networkFiles \
    --private-key-file-name=key

echo "Generated networkFiles in $OUT_DIR"

# After this, copy the generated node keys into nodes/* and adjust docker-compose if needed.
