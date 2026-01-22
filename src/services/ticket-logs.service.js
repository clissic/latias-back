import { ticketLogsModel } from "../DAO/models/ticket-logs.model.js";

class TicketLogsService {
  async createLog(logData) {
    const log = await ticketLogsModel.create(logData);
    return log;
  }

  async getAllLogs(limit = 100) {
    const logs = await ticketLogsModel.getAll(limit);
    return logs;
  }

  async getLogsByTicketId(ticketId) {
    const logs = await ticketLogsModel.getByTicketId(ticketId);
    return logs;
  }

  async getLogsByEventId(eventId) {
    const logs = await ticketLogsModel.getByEventId(eventId);
    return logs;
  }
}

export const ticketLogsService = new TicketLogsService();
