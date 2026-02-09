import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  registrationCountry: {
    type: String, // ISO country code recommended (UY, AR, BR, etc.)
    required: true,
  },
  registrationPort: {
    type: String,
    required: true,
    trim: true,
  },
  currentPort: {
    type: String,
    trim: true,
  },
  boatType: {
    type: String,
    enum: ['Yate monocasco', 'Yate catamarán', 'Lancha', 'Velero monocasco', 'Velero catamarán', 'Moto náutica', 'Jet sky', 'Kayak', 'Canoa', 'Bote', 'Semirígido', 'Neumático', 'Otro'],
    required: true,
  },
  lengthOverall: {
    type: Number, // meters
    required: true,
    min: 0,
  },
  beam: {
    type: Number, // meters
    required: true,
    min: 0,
  },
  depth: {
    type: Number, // meters
    min: 0,
  },
  displacement: {
    type: Number, // tons
    min: 0,
  },
  image: {
    type: String, // URL de la imagen del barco
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  approvalToken: { type: String, trim: true },
  rejectionToken: { type: String, trim: true },
}, {
  timestamps: true,
});

schema.plugin(mongoosePaginate);

export const BoatsMongoose = model("boats", schema);
