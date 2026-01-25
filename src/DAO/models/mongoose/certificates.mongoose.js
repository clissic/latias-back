import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = new Schema({
  boatId: {
    type: Schema.Types.ObjectId,
    ref: 'boats',
    required: true,
    index: true,
  },
  certificateType: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: String,
    required: true,
    trim: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['vigente', 'vencido', 'anulado'],
    required: true,
    default: 'vigente',
    index: true,
  },
  observations: {
    type: String,
    trim: true,
  },
  pdfFile: {
    type: String, // URL del archivo PDF del certificado
  },
  annualInspection: {
    type: String,
    enum: ['realizada', 'no_realizada', 'no_corresponde'],
    default: 'no_realizada',
  },
}, {
  timestamps: true,
});

// Índice compuesto para búsquedas por barco y estado
schema.index({ boatId: 1, status: 1 });

// Índice para búsquedas por fecha de vencimiento
schema.index({ expirationDate: 1 });

schema.plugin(mongoosePaginate);

export const CertificatesMongoose = model("certificates", schema);
