import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { HafezService } from "./services/hafezService.js";
import { tokenRoutes } from "./routes/tokenRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const hafez = new HafezService({
  rpcUrl: process.env.RPC_URL || "http://localhost:8545",
  tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS || "",
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || "",
});

app.use("/api", tokenRoutes(hafez));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", connectedTo: hafez.rpcUrl });
});

app.listen(port, () => {
  console.log(`Hafez backend listening on port ${port}`);
});
