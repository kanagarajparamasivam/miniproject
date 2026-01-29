import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
    busId: mongoose.Types.ObjectId;
    seatNumber: string;
    isBooked: boolean;
    bookedBy?: mongoose.Types.ObjectId;
    bookingDate?: Date;
    reservationExpiresAt?: Date; // Optional: for temporary locks
}

const SeatSchema: Schema = new Schema(
    {
        busId: {
            type: Schema.Types.ObjectId,
            ref: 'Bus',
            required: true,
            index: true, // Optimizes queries by busId
        },
        seatNumber: {
            type: String,
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
        bookedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        bookingDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique seat per bus
SeatSchema.index({ busId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model<ISeat>('Seat', SeatSchema);
