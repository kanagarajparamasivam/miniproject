import mongoose, { Schema, Document } from 'mongoose';

export interface ITaxi extends Document {
  source: string;
  destination: string;
  farePerKm: number;
  baseFare: number;
  available: boolean;
  estimatedETA: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const TaxiSchema: Schema = new Schema(
  {
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    farePerKm: {
      type: Number,
      required: true,
      default: 15,
    },
    baseFare: {
      type: Number,
      default: 50,
    },
    available: {
      type: Boolean,
      default: true,
    },
    estimatedETA: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITaxi>('Taxi', TaxiSchema);
