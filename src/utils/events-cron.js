import { eventsService } from "../services/events.service.js";
import { logger } from "./logger.js";

// Función para desactivar eventos vencidos
const deactivateExpiredEvents = async () => {
  try {
    logger.info("Ejecutando verificación de eventos vencidos...");
    const result = await eventsService.deactivateExpiredEvents();
    logger.info(`Eventos desactivados: ${result.modifiedCount || 0}`);
    return result;
  } catch (error) {
    logger.error("Error al desactivar eventos vencidos:", error);
    throw error;
  }
};

// Ejecutar cada 24 horas en loop para desactivar eventos vencidos
export const startEventsCron = () => {
  // Ejecutar inmediatamente al iniciar el servidor para desactivar eventos que ya vencieron
  (async () => {
    try {
      logger.info("Desactivando eventos vencidos al iniciar el servidor...");
      await deactivateExpiredEvents();
    } catch (error) {
      logger.error("Error al desactivar eventos vencidos al inicio:", error);
    }
  })();

  // Configurar intervalo para ejecutar cada 24 horas (86400000 ms)
  const INTERVAL_24_HOURS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  const intervalId = setInterval(async () => {
    try {
      await deactivateExpiredEvents();
    } catch (error) {
      logger.error("Error en la ejecución periódica de desactivación de eventos:", error);
    }
  }, INTERVAL_24_HOURS);

  logger.info(`Cron job de eventos iniciado: se ejecutará cada 24 horas (${INTERVAL_24_HOURS} ms)`);
  
  // Retornar el intervalId por si se necesita cancelar en el futuro
  return intervalId;
};
