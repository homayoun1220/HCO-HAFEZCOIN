import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import solc from "solc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.resolve(__dirname, "..", "contracts", "HafezToken.sol");
const source = fs.readFileSync(sourcePath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "HafezToken.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["HafezToken.sol"].HafezToken;

if (!contract) {
  console.error("Compilation failed", output.errors);
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const factory = new ethers.ContractFactory(contract.abi, contract.evm.bytecode.object, wallet);

const deploy = async () => {
  const token = await factory.deploy("Hafez Token", "HAFEZ");
  console.log("Deploying HafezToken...");
  await token.waitForDeployment();
  console.log("HafezToken deployed at", token.target);

  const deployedMeta = {
    address: token.target,
    abi: contract.abi,
  };

  fs.writeFileSync(
    path.resolve(__dirname, "..", "contracts", "deployed.json"),
    JSON.stringify(deployedMeta, null, 2),
  );

  console.log("Deployed metadata written to backend/contracts/deployed.json");
};

deploy().catch((error) => {
  console.error(error);
  process.exit(1);
});
