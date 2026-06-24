import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HafezService {
  constructor({ rpcUrl, tokenContractAddress, adminPrivateKey }) {
    this.rpcUrl = rpcUrl;
    this.tokenContractAddress = tokenContractAddress;
    this.adminPrivateKey = adminPrivateKey;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.adminWallet = adminPrivateKey
      ? new ethers.Wallet(adminPrivateKey, this.provider)
      : null;

    this.tokenAbi = this._loadTokenAbi();
    this.tokenContract = tokenContractAddress
      ? new ethers.Contract(tokenContractAddress, this.tokenAbi, this.provider)
      : null;
  }

  _loadTokenAbi() {
    const abiPath = path.resolve(__dirname, "..", "contracts", "HafezTokenAbi.json");
    return JSON.parse(fs.readFileSync(abiPath, "utf8"));
  }

  async getBlockNumber() {
    return this.provider.getBlockNumber();
  }

  async getNetworkChainId() {
    return this.provider.getNetwork().then((network) => network.chainId);
  }

  async getWalletBalance(account) {
    return ethers.formatEther(await this.provider.getBalance(account));
  }

  async getTokenInfo() {
    if (!this.tokenContract) throw new Error("TOKEN_CONTRACT_ADDRESS is not configured.");
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.tokenContract.name(),
      this.tokenContract.symbol(),
      this.tokenContract.decimals(),
      this.tokenContract.totalSupply(),
    ]);
    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      address: this.tokenContract.address,
    };
  }

  async getTokenBalance(account) {
    if (!this.tokenContract) throw new Error("TOKEN_CONTRACT_ADDRESS is not configured.");
    const decimals = await this.tokenContract.decimals();
    const balance = await this.tokenContract.balanceOf(account);
    return ethers.formatUnits(balance, decimals);
  }

  async transferToken(to, amount, privateKey) {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const contract = this.tokenContract.connect(wallet);
    const decimals = await contract.decimals();
    const tx = await contract.transfer(to, ethers.parseUnits(amount.toString(), decimals));
    return tx.wait();
  }

  async mintToken(to, amount) {
    if (!this.adminWallet) {
      throw new Error("ADMIN_PRIVATE_KEY is required to mint tokens.");
    }
    const contract = this.tokenContract.connect(this.adminWallet);
    const decimals = await contract.decimals();
    const tx = await contract.mint(to, ethers.parseUnits(amount.toString(), decimals));
    return tx.wait();
  }

  async getValidators() {
    try {
      return await this.provider.send("ibft_getValidatorsByBlockNumber", ["latest"]);
    } catch (error) {
      return { error: error.message };
    }
  }
}
