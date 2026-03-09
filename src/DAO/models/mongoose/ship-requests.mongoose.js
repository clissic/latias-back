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
      validate: {
        validator: (v) => {
          const allowed = ["Renovación", "Preparación", "Asesoramiento", "Solicitud especial", "Solicitud de flota"];
          return Array.isArray(v) && v.length > 0 && v.every((t) => allowed.includes(t));
        },
        message: "type debe ser un array con al menos uno de: Renovación, Preparación, Asesoramiento, Solicitud especial, Solicitud de flota",
      },
    },
    status: {
      type: String,
      required: true,
      enum: ["Pendiente", "Pendiente de pago", "En progreso", "Completado", "Rechazado"],
      default: "Pendiente",
      index: true,
    },
    procedureTypes: {
      type: [String],
      default: null,
      trim: true,
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
    certificate: {
      type: String,
      default: null,
      trim: true,
    },
    number: {
      type: String,
      default: null,
      trim: true,
    },
    certificateIssueDate: { type: Date, default: null },
    certificateExpirationDate: { type: Date, default: null },
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
