import { Schema, model } from "mongoose";

const schema = new Schema({
  eventId: { type: String, unique: true, sparse: true }, // No requerido, se genera automáticamente
  title: { type: String, required: true },
  date: { type: Date, required: true },
  active: { type: Boolean, default: true }, // Se calcula automáticamente
  hour: { type: String, required: true },
  price: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "USD" },
  description: { type: String },
  image: { type: String }, // URL de la imagen del evento
  tickets: {
    availableTickets: { type: Number, required: true, min: 0 },
    soldTickets: { type: Number, default: 0, min: 0 },
    remainingTickets: { type: Number, required: true, min: 0 }
  },
  location: {
    city: { type: String },
    country: { type: String },
    address: { type: String } // Para casos donde location es un string completo
  },
  speaker: {
    firstName: { type: String },
    lastName: { type: String },
    ci: { type: String },
    profession: { type: String },
    position: { type: String } // Algunos eventos usan position en vez de profession
  },
  peopleRegistered: [{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    ci: { type: String, required: true },
    ticketId: { type: String, required: true }, // ID único para autenticar el ticket
    available: { type: Boolean, default: true }, // Estado del ticket (true = disponible, false = usado)
    registeredAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índice para búsquedas por fecha y estado activo
schema.index({ date: 1, active: 1 });

// Índice para búsquedas por ticketId (sparse para ignorar valores null en arrays vacíos)
// No es único porque MongoDB no soporta índices únicos en arrays de manera confiable
// La unicidad se valida en la lógica de negocio
schema.index({ "peopleRegistered.ticketId": 1 }, { sparse: true });

export const EventsMongoose = model("events", schema);
