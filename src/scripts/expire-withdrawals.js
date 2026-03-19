import mongoose from "mongoose";
import { connectMongo } from "../utils/db-connection.js";
import { withdrawalsService } from "../services/withdrawals.service.js";
import { logger } from "../utils/logger.js";

async function main() {
  try {
    await connectMongo();
    const result = await withdrawalsService.expirePendingWithdrawals();
    logger.info(`expire-withdrawals: procesados=${result.processed}`);
  } catch (error) {
    logger.error("expire-withdrawals: error al expirar retiros:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
