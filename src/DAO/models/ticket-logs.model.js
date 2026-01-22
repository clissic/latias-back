import { TicketLogsMongoose } from "./mongoose/ticket-logs.mongoose.js";

class TicketLogsModel {
  async create(logData) {
    const logCreated = await TicketLogsMongoose.create(logData);
    return logCreated;
  }

  async getAll(limit = 100) {
    const logs = await TicketLogsMongoose.find({})
      .sort({ timestamp: -1 })
      .limit(limit);
    return logs;
  }

  async getByTicketId(ticketId) {
    const logs = await TicketLogsMongoose.find({ ticketId })
      .sort({ timestamp: -1 });
    return logs;
  }

  async getByEventId(eventId) {
    const logs = await TicketLogsMongoose.find({ eventId })
      .sort({ timestamp: -1 });
    return logs;
  }
}

export const ticketLogsModel = new TicketLogsModel();
