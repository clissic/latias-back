import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = new Schema({
  paymentId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  courseId: { 
    type: String, 
    required: true, 
    index: true 
  },
  courseName: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'users', 
    required: true, 
    index: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  userFirstName: { 
    type: String 
  },
  userLastName: { 
    type: String 
  },
  transactionAmount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    required: true,
    enum: ['approved', 'pending', 'rejected', 'cancelled', 'refunded'],
    default: 'approved'
  },
  paymentStatusDetail: { 
    type: String 
  },
  externalReference: { 
    type: String, 
    required: true,
    index: true
  },
  processedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  alreadyPurchased: { 
    type: Boolean, 
    default: false 
  },
  errorMessage: { 
    type: String 
  }
}, {
  timestamps: true
});

// Índices compuestos para búsquedas rápidas
schema.index({ paymentId: 1, processedAt: -1 });
schema.index({ userId: 1, processedAt: -1 });
schema.index({ courseId: 1, processedAt: -1 });
schema.index({ processedAt: -1 });
schema.index({ paymentStatus: 1, processedAt: -1 });

schema.plugin(mongoosePaginate);

export const ProcessedPaymentsMongoose = model("processed-payments", schema);
