import { connect } from "mongoose";
import { logger } from "./logger.js";

const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const dbName = "LATIAS_DB"

export async function connectMongo() {
  try {
    await connect(
      `mongodb+srv://joaquinperezcoria:${MONGODB_PASSWORD}@cluster0.zye6fyd.mongodb.net/${dbName}?retryWrites=true&w=majority`
    );
    logger.info(`Plug to ${dbName} MONGO database!`);
  } catch (e) {
    logger.info(e);
    throw "Can not connect to the db";
  }
}