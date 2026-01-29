import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { authRoutes } from './routes/authRoutes';
import { routeRoutes } from './routes/routeRoutes';
import { busRoutes } from './routes/busRoutes';
import { taxiRoutes } from './routes/taxiRoutes';
import { hybridRoutes } from './routes/hybridRoutes';
import { bookingRoutes } from './routes/bookingRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDatabase().catch(console.error);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', routeRoutes);
app.use('/api', busRoutes);
app.use('/api', taxiRoutes);
app.use('/api', hybridRoutes);
app.use('/api', bookingRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 API endpoints available at http://localhost:${PORT}/api`);
});

