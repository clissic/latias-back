import { Schema, model } from "mongoose";

/**
 * Datos del trámite de flota pendiente de pago.
 * Se usa cuando premium.procedures === 0: no se crea ship-request hasta que
 * el pago esté aprobado por Mercado Pago. Al confirmar el pago se crea el
 * ship-request desde este documento y se elimina el pending.
 */
const schema = new Schema(
  {
    ship: { type: Schema.Types.ObjectId, ref: "boats", required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    manager: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
    type: { type: [String], required: true, default: ["Solicitud de flota"] },
    procedureTypes: { type: [String], default: null, trim: true },
    notes: { type: String, default: null, trim: true },
    certificate: { type: String, default: null, trim: true },
    number: { type: String, default: null, trim: true },
    certificateIssueDate: { type: Date, default: null },
    certificateExpirationDate: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.index({ createdAt: 1 });

export const PendingProcedurePaymentsMongoose = model("pending-procedure-payments", schema);
