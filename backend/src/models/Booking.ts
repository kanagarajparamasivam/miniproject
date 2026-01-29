import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  bookingType: 'bus' | 'taxi' | 'hybrid';
  busBooking?: {
    busId: mongoose.Types.ObjectId;
    routeNo: string;
    source: string;
    destination: string;
    seats: string[];
    fare: number;
    departureTime: string;
    arrivalTime: string;
    bookingDate: Date;
  };
  pickupTaxi?: {
    source: string;
    destination: string;
    fare: number;
    distance: number;
    scheduledTime: Date;
    estimatedPickupTime: Date;
  };
  dropTaxi?: {
    source: string;
    destination: string;
    fare: number;
    distance: number;
    scheduledTime: Date;
    estimatedPickupTime: Date;
  };
  totalFare: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentId?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingType: {
      type: String,
      enum: ['bus', 'taxi', 'hybrid'],
      required: true,
    },
    busBooking: {
      busId: {
        type: Schema.Types.ObjectId,
        ref: 'Bus',
      },
      routeNo: String,
      source: String,
      destination: String,
      seats: [String],
      fare: Number,
      departureTime: String,
      arrivalTime: String,
      bookingDate: Date,
    },
    pickupTaxi: {
      source: String,
      destination: String,
      fare: Number,
      distance: Number,
      scheduledTime: Date, // Based on bus departure time (minus travel time)
      estimatedPickupTime: Date,
    },
    dropTaxi: {
      source: String,
      destination: String,
      fare: Number,
      distance: Number,
      scheduledTime: Date, // Based on bus arrival time
      estimatedPickupTime: Date,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet'],
    },
    paymentId: String,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
