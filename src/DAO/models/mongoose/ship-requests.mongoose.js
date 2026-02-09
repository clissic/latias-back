import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    ship: {
      type: Schema.Types.ObjectId,
      ref: "boats",
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    type: {
      type: [String],
      required: true,
      enum: ["Renovación", "Preparación", "Asesoramiento", "Solicitud especial"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0 && v.every((t) => ["Renovación", "Preparación", "Asesoramiento", "Solicitud especial"].includes(t)),
        message: "type debe ser un array con al menos uno de: Renovación, Preparación, Asesoramiento, Solicitud especial",
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["Pendiente", "En progreso", "Completado", "Rechazado"],
      default: "Pendiente",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ owner: 1, requestedAt: -1 });
schema.index({ manager: 1, requestedAt: -1 });
schema.index({ ship: 1, requestedAt: -1 });
schema.index({ status: 1, requestedAt: -1 });

export const ShipRequestsMongoose = model("ship-requests", schema);
