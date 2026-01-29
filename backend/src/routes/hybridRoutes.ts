import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Bus from '../models/Bus';
import Booking from '../models/Booking';
import { optimizeRoute } from '../services/hybridOptimization';
import { BusOption, TaxiOption } from '../data/mockData';
import { calculateRoute } from '../data/mockData';

const router = Router();

/**
 * POST /api/getHybridRecommendation
 * Returns optimized hybrid recommendation comparing all options
 */
router.post('/getHybridRecommendation', async (req: Request, res: Response) => {
  try {
    const { source, destination } = req.body;

    // Validation
    if (!source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination are required'
      });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please ensure MongoDB is running and try again.'
      });
    }

    // Get bus options from MongoDB
    const buses = await Bus.find({
      source: new RegExp(`^${source}$`, 'i'),
      destination: new RegExp(`^${destination}$`, 'i'),
    });

    // Convert to BusOption format
    const busOptions: BusOption[] = buses.map(bus => {
      const availableSeats = bus.seats.filter(seat => !seat.isBooked).length;
      return {
        routeNo: bus.routeNo,
        source: bus.source,
        destination: bus.destination,
        fare: bus.fare,
        distance: bus.distance,
        eta: bus.eta,
        seatAvailable: availableSeats > 0,
        coveragePercent: bus.coveragePercent,
      };
    });

    // Calculate route for taxi options
    const routeData = calculateRoute(source, destination);
    const farePerKm = 15;
    const taxiFare = routeData.distance * farePerKm;
    const taxiETA = Math.round(routeData.distance * 2); // 2 minutes per km

    // Create taxi options
    const taxiOptions: TaxiOption[] = [{
      eta: taxiETA,
      farePerKm: farePerKm,
      totalFare: taxiFare,
      source: source,
      destination: destination,
      distance: routeData.distance,
      available: true,
    }];

    // Store route data for taxi breakdown
    const taxiRouteData = routeData;

    // Run optimization algorithm
    const recommendation = optimizeRoute(busOptions, taxiOptions);

    // Include bus details in breakdown
    if (busOptions.length > 0 && recommendation.breakdown?.bus) {
      const bestBus = buses.find(b => b.routeNo === recommendation.breakdown?.bus?.routeNo);
      if (bestBus) {
        recommendation.breakdown.bus.departureTime = bestBus.departureTime;
        recommendation.breakdown.bus.arrivalTime = bestBus.arrivalTime;
        recommendation.breakdown.bus.busId = bestBus._id.toString();
      }
    }

    // Include taxi distance in breakdown  
    if (recommendation.breakdown?.taxi) {
      recommendation.breakdown.taxi.distance = taxiRouteData.distance;
    }

    // Store taxi route data for later use
    (recommendation as any).taxiRouteData = taxiRouteData;

    // Include bus ID in hybrid breakdown
    if (recommendation.breakdown?.hybrid && busOptions.length > 0) {
      const bestBus = buses.find(b => b.routeNo === recommendation.breakdown?.bus?.routeNo);
      if (bestBus) {
        recommendation.breakdown.hybrid.busId = bestBus._id.toString();
        recommendation.breakdown.hybrid.routeNo = bestBus.routeNo;
        recommendation.breakdown.hybrid.departureTime = bestBus.departureTime;
        recommendation.breakdown.hybrid.arrivalTime = bestBus.arrivalTime;
        recommendation.breakdown.hybrid.busFare = bestBus.fare;
      }
    }

    res.json({
      success: true,
      data: recommendation,
      source,
      destination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating hybrid recommendation',
      error: error.message
    });
  }
});


/**
 * POST /api/hybrid/book-bus-seat
 * Book bus seats for hybrid journey
 */
router.post('/book-bus-seat', async (req: Request, res: Response) => {
  try {
    const { routeId, seats, from, to, journeyType, userId, fare } = req.body;

    if (!routeId || !seats || !seats.length || !from || !to) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Find the bus
    const bus = await Bus.findOne({ routeNo: routeId });
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    // 2. Check seat availability
    const unavailableSeats = seats.filter((seatNum: string) => {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      return !seat || seat.isBooked;
    });

    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some seats are already booked',
        unavailableSeats
      });
    }

    // 3. Mark seats as booked
    seats.forEach((seatNum: string) => {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      if (seat) {
        seat.isBooked = true;
        seat.bookedBy = userId;
        seat.bookingDate = new Date();
      }
    });

    await bus.save();

    // 4. Create Booking Record
    const totalBusFare = fare * seats.length;

    const newBooking = new Booking({
      userId: userId,
      bookingType: journeyType === 'HYBRID' ? 'hybrid' : 'bus',
      busBooking: {
        busId: bus._id,
        routeNo: routeId,
        source: from,
        destination: to,
        seats,
        fare: totalBusFare,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        bookingDate: new Date(),
      },
      totalFare: totalBusFare,
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    await newBooking.save();

    res.json({
      success: true,
      bookingId: newBooking._id,
      message: 'Bus seats booked successfully'
    });

  } catch (error: any) {
    console.error('Hybrid Bus Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/hybrid/book-taxi
 * Add taxi leg to existing booking
 */
router.post('/book-taxi', async (req: Request, res: Response) => {
  try {
    const { bookingId, pickup, drop, taxiType } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let additionalFare = 0;

    // Update Pickup
    if (pickup) {
      booking.pickupTaxi = {
        source: pickup.location || pickup.source,
        destination: pickup.destination,
        distance: pickup.distance,
        fare: 50 + (pickup.distance * 15), // Simple calc: Base 50 + 15/km
        scheduledTime: new Date(),
        estimatedPickupTime: new Date()
      };
      additionalFare += booking.pickupTaxi.fare;
    }

    // Update Drop
    if (drop) {
      booking.dropTaxi = {
        source: drop.source,
        destination: drop.location || drop.destination,
        distance: drop.distance,
        fare: 50 + (drop.distance * 15),
        scheduledTime: new Date(),
        estimatedPickupTime: new Date()
      };
      additionalFare += booking.dropTaxi.fare;
    }

    booking.totalFare += additionalFare;
    // booking.status = 'confirmed'; // Already confirmed

    await booking.save();

    res.json({
      success: true,
      bookingId: booking._id,
      data: booking,
      message: 'Taxi booking confirmed'
    });

  } catch (error: any) {
    console.error('Hybrid Taxi Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export { router as hybridRoutes };

