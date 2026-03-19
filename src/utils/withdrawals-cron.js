import { withdrawalsService } from "../services/withdrawals.service.js";
import { logger } from "./logger.js";

const expirePendingWithdrawals = async () => {
  try {
    logger.info("Ejecutando expiración automática de retiros...");
    const result = await withdrawalsService.expirePendingWithdrawals();
    logger.info(`Retiros expirados automáticamente: ${result.processed || 0}`);
    return result;
  } catch (error) {
    logger.error("Error al expirar retiros automáticamente:", error);
    throw error;
  }
};

export const startWithdrawalsCron = () => {
  (async () => {
    try {
      logger.info("Verificando retiros vencidos al iniciar el servidor...");
      await expirePendingWithdrawals();
    } catch (error) {
      logger.error("Error al expirar retiros al iniciar el servidor:", error);
    }
  })();

  const INTERVAL_1_HOUR = 60 * 60 * 1000;

  const intervalId = setInterval(async () => {
    try {
      await expirePendingWithdrawals();
    } catch (error) {
      logger.error("Error en la expiración periódica de retiros:", error);
    }
  }, INTERVAL_1_HOUR);

  logger.info(`Cron job de retiros iniciado: se ejecutará cada 1 hora (${INTERVAL_1_HOUR} ms)`);
  return intervalId;
};
