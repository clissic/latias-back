import mongoose from "mongoose";
import { logger } from "./logger.js";

const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const dbName = "LATIAS_DB"

export async function connectMongo() {
  try {
    await mongoose.connect(
      `mongodb+srv://joaquinperezcoria:${MONGODB_PASSWORD}@cluster0.zye6fyd.mongodb.net/${dbName}?retryWrites=true&w=majority`
    );
    logger.info(`Plug to ${dbName} MONGO database!`);
    
    // Esperar a que la conexión esté lista y luego eliminar el índice problemático
    mongoose.connection.once('open', async () => {
      await fixEventsIndexes();
    });
    
    // Si la conexión ya está abierta, ejecutar inmediatamente
    if (mongoose.connection.readyState === 1) {
      await fixEventsIndexes();
    }
  } catch (e) {
    logger.info(e);
    throw "Can not connect to the db";
  }
}

// Función para corregir los índices de eventos
async function fixEventsIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      logger.info("Base de datos no disponible para verificar índices");
      return;
    }
    
    const collection = db.collection("events");
    
    // Obtener todos los índices
    const indexes = await collection.indexes();
    
    // Buscar el índice problemático (puede tener diferentes nombres)
    const problematicIndex = indexes.find(
      index => 
        (index.name === "peopleRegistered.ticketId_1" || 
         index.key?.["peopleRegistered.ticketId"] === 1) && 
        index.unique === true
    );
    
    if (problematicIndex) {
      // Eliminar el índice único problemático
      await collection.dropIndex(problematicIndex.name);
      logger.info(`Índice único problemático '${problematicIndex.name}' eliminado correctamente`);
    }
  } catch (error) {
    // Si el índice no existe o hay otro error, solo loguear (no es crítico)
    if (error.code !== 27 && error.codeName !== "IndexNotFound") {
      logger.info(`Advertencia al verificar índices de eventos: ${error.message}`);
    }
  }
}