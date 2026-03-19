import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { walletService } from "../services/wallet.service.js";
import { logger } from "../utils/logger.js";

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URL;
  if (!mongoUrl) {
    // eslint-disable-next-line no-console
    console.error("MONGO_URL / MONGO_URI no está definido");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    const now = new Date();
    const result = await walletService.releasePendingFunds(now);
    logger.info(`release-wallet-funds: transacciones procesadas=${result.processed}`);
  } catch (err) {
    logger.error("release-wallet-funds: error al liberar fondos pendientes:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();

