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
  passengerDetails?: {
    name: string;
    age: number;
    gender: string;
    seatNumber: string;
    idProof?: string;
    email?: string;
    mobile?: string;
  }[];
  pickupTaxi?: {
    source: string;
    destination: string;
    fare: number;
    distance: number;
    taxiType: string;
    scheduledTime: Date;
    estimatedPickupTime: Date;
  };
  dropTaxi?: {
    source: string;
    destination: string;
    fare: number;
    distance: number;
    taxiType: string;
    scheduledTime: Date;
    estimatedPickupTime: Date;
  };
  totalFare: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentId?: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'SEAT_HELD' | 'PASSENGER_CONFIRMED' | 'HYBRID_COMPLETE';
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
    passengerDetails: [{
      name: String,
      age: Number,
      gender: String,
      seatNumber: String,
      idProof: String,
      email: String,
      mobile: String,
    }],
    pickupTaxi: {
      source: String,
      destination: String,
      fare: Number,
      distance: Number,
      taxiType: String,
      scheduledTime: Date, // Based on bus departure time (minus travel time)
      estimatedPickupTime: Date,
    },
    dropTaxi: {
      source: String,
      destination: String,
      fare: Number,
      distance: Number,
      taxiType: String,
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
      enum: ['confirmed', 'cancelled', 'completed', 'SEAT_HELD', 'PASSENGER_CONFIRMED', 'HYBRID_COMPLETE'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
