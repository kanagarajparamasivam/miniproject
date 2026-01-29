import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bus-taxi-booking';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.warn('⚠️  Server will continue without MongoDB. Some features may not work.');
    console.warn('⚠️  Make sure MongoDB is running and try again.');
    // Don't exit - allow server to start without MongoDB
    // Routes that don't require MongoDB (login, getRoutes, getTaxiOptions) will still work
  }
};

export default connectDatabase;
