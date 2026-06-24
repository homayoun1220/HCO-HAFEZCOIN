import express from "express";

export function tokenRoutes(hafez) {
  const router = express.Router();

  router.get("/health", async (req, res) => {
    const block = await hafez.getBlockNumber();
    const chainId = await hafez.getNetworkChainId();
    res.json({ status: "ok", block, chainId, tokenContract: hafez.tokenContract?.address || null });
  });

  router.get("/token/info", async (req, res) => {
    const info = await hafez.getTokenInfo();
    res.json(info);
  });

  router.get("/wallet/:address/balance", async (req, res) => {
    const balance = await hafez.getWalletBalance(req.params.address);
    const tokenBalance = await hafez.getTokenBalance(req.params.address);
    res.json({ balance, tokenBalance });
  });

  router.post("/token/transfer", async (req, res) => {
    const { to, amount, privateKey } = req.body;
    const receipt = await hafez.transferToken(to, amount, privateKey);
    res.json({ receipt });
  });

  router.post("/token/mint", async (req, res) => {
    const { to, amount } = req.body;
    const receipt = await hafez.mintToken(to, amount);
    res.json({ receipt });
  });

  router.get("/consensus/validators", async (req, res) => {
    const validators = await hafez.getValidators();
    res.json({ validators });
  });

  return router;
}
