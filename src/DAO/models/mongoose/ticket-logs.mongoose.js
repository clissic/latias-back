import { Schema, model } from "mongoose";

const schema = new Schema({
  ticketId: { type: String, required: true, index: true },
  eventId: { type: String, required: true },
  eventTitle: { type: String, required: true },
  personFirstName: { type: String, required: true },
  personLastName: { type: String, required: true },
  personCi: { type: String, required: true },
  checkedBy: {
    userId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true }
  },
  action: { 
    type: String, 
    required: true,
    enum: ['validated', 'already_used', 'invalid']
  },
  previousAvailable: { type: Boolean },
  newAvailable: { type: Boolean },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas rápidas
schema.index({ ticketId: 1, timestamp: -1 });
schema.index({ eventId: 1, timestamp: -1 });
schema.index({ timestamp: -1 });

export const TicketLogsMongoose = model("ticket-logs", schema);
