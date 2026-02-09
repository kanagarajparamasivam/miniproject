import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Bus from '../models/Bus';
import Seat from '../models/Seat';

const router = Router();

/**
 * POST /api/getBusOptions
 * Returns available bus options for a given route from MongoDB
 */
router.post('/getBusOptions', async (req: Request, res: Response) => {
  console.log('------------------------------------------------');
  console.log('🚌 [API] POST /getBusOptions called');

  try {
    const { source, destination } = req.body;
    console.log(`📍 Params: Source="${source}", Destination="${destination}"`);

    // Validation
    if (!source || !destination) {
      console.warn('⚠️  Missing source or destination');
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required'
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected');
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please ensure MongoDB is running.'
      });
    }

    console.log('🔍 Searching buses in MongoDB...');
    // Find buses matching source and destination
    const buses = await Bus.find({
      source: new RegExp(`^${source}$`, 'i'),
      destination: new RegExp(`^${destination}$`, 'i'),
    });

    console.log(`✅ Found ${buses.length} buses matching route.`);

    // Convert to BusOption format
    const busOptions = await Promise.all(buses.map(async (bus) => {
      // Get booked seats count
      const bookedSeatsCount = await Seat.countDocuments({
        busId: bus._id,
        isBooked: true
      });

      const availableSeats = bus.totalSeats - bookedSeatsCount;

      return {
        _id: bus._id.toString(),
        routeNo: bus.routeNo,
        operator: bus.operator,
        type: bus.type,
        source: bus.source,
        destination: bus.destination,
        fare: bus.fare,
        distance: bus.distance,
        eta: bus.eta,
        seatAvailable: availableSeats > 0,
        availableSeats: availableSeats,
        totalSeats: bus.totalSeats,
        coveragePercent: bus.coveragePercent,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
      };
    }));

    res.json({
      success: true,
      data: busOptions,
      count: busOptions.length
    });

  } catch (error: any) {
    console.error('❌ Error in /getBusOptions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bus options',
      error: error.message
    });
  }
});

/**
 * GET /api/getBus/:id
 * Get bus details including seat availability
 */
router.get('/getBus/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findById(id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.json({
      success: true,
      data: bus
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus details',
      error: error.message
    });
  }
});

/**
 * POST /api/getBusDetails
 * Get bus details including seat availability
 */
router.post('/getBusDetails', async (req: Request, res: Response) => {
  try {
    const { busId } = req.body;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'busId is required'
      });
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Fetch booked seats for this bus
    const bookedSeats = await Seat.find({ busId: bus._id, isBooked: true });

    // Create a map of booked seats
    const bookedSeatMap = new Set(bookedSeats.map(s => s.seatNumber));

    // Merge with bus.seats (structure used by frontend)
    // We clone the bus object to avoid modifying the Mongoose document directly if it's restrictive
    const busObj: any = bus.toObject();

    if (busObj.seats) {
      busObj.seats = busObj.seats.map((seat: any) => ({
        ...seat,
        isBooked: bookedSeatMap.has(seat.seatNumber)
      }));
    } else {
      // Fallback if seats array missing
      busObj.seats = [];
      for (let i = 1; i <= bus.totalSeats; i++) {
        const seatNum = i.toString().padStart(2, '0');
        busObj.seats.push({
          seatNumber: seatNum,
          isBooked: bookedSeatMap.has(seatNum)
        });
      }
    }

    res.json({
      success: true,
      data: busObj
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus details',
      error: error.message
    });
  }
});

export { router as busRoutes };

