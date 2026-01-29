
import mongoose, { Schema, Document } from 'mongoose';

export interface ILocalTaxiRoute extends Document {
    city: string;
    baseFare: number;
    ratePerKm: number;
    maxDistance: number; // in km, e.g., 50 for local
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const LocalTaxiRouteSchema: Schema = new Schema(
    {
        city: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        baseFare: {
            type: Number,
            required: true,
            default: 50,
        },
        ratePerKm: {
            type: Number,
            required: true,
            default: 15,
        },
        maxDistance: {
            type: Number,
            required: true,
            default: 50,
        },
        available: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILocalTaxiRoute>('LocalTaxiRoute', LocalTaxiRouteSchema);
