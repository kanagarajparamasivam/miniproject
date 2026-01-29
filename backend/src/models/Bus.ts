import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  seatNumber: string;
  isBooked: boolean;
  bookedBy?: mongoose.Types.ObjectId;
  bookingDate?: Date;
}

export interface IBus extends Document {
  routeNo: string;
  source: string;
  destination: string;
  fare: number;
  distance: number; // in km
  eta: number; // in minutes
  departureTime: string; // e.g., "08:00"
  arrivalTime: string; // e.g., "10:30"
  coveragePercent: number;
  totalSeats: number;
  seats: ISeat[];
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema: Schema = new Schema({
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
});

const BusSchema: Schema = new Schema(
  {
    routeNo: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    eta: {
      type: Number,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    coveragePercent: {
      type: Number,
      default: 100,
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    seats: [SeatSchema],
  },
  {
    timestamps: true,
  }
);

// Initialize seats when bus is created
BusSchema.pre('save', function (next: any) {
  const doc = this as any;
  if (doc.isNew && (!doc.seats || doc.seats.length === 0)) {
    doc.seats = [];
    for (let i = 1; i <= doc.totalSeats; i++) {
      doc.seats.push({
        seatNumber: i.toString().padStart(2, '0'),
        isBooked: false,
      });
    }
  }
  next();
});

export default mongoose.model<IBus>('Bus', BusSchema);
