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
        operator: bus.operator,
        type: bus.type,
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
 * Step 1: Book bus seats and create hybrid booking
 */
router.post('/book-bus-seat', async (req: Request, res: Response) => {
  try {
    const { routeId, seats, from, to, journeyType = 'HYBRID', userId } = req.body;

    if (!routeId || !seats || !seats.length || !from || !to) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 1. Find the bus
    const bus = await Bus.findOne({ routeNo: routeId });
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    // 2. Check availability
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

    // 3. Mark seats as BOOKED (Permanent for now)
    seats.forEach((seatNum: string) => {
      const seat = bus.seats.find((s) => s.seatNumber === seatNum);
      if (seat) {
        seat.isBooked = true;
        seat.bookedBy = userId;
        seat.bookingDate = new Date();
      }
    });

    await bus.save();

    // 4. Create Hybrid Booking
    const totalBusFare = bus.fare * seats.length;

    const newBooking = new Booking({
      userId: userId || new mongoose.Types.ObjectId(),
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
      status: 'confirmed', // Mark as confirmed for bus leg
      paymentStatus: 'pending'
    });

    await newBooking.save();

    res.json({
      success: true,
      bookingId: newBooking._id,
      message: 'Bus seats booked successfully'
    });

  } catch (error: any) {
    console.error('Book Bus Seat Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/hybrid/passenger-details
 * Step 2: Save passenger info and update status to 'PASSENGER_CONFIRMED'
 */
router.post('/passenger-details', async (req: Request, res: Response) => {
  try {
    const { bookingId, passengers } = req.body;

    if (!bookingId || !passengers || !passengers.length) {
      return res.status(400).json({ success: false, message: 'Missing booking ID or passenger details' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Validation/Logic could go here (e.g. check seat count matches passenger count)

    booking.passengerDetails = passengers;
    booking.status = 'PASSENGER_CONFIRMED'; // STRICT FLOW: Step 2

    await booking.save();

    res.json({
      success: true,
      bookingId: booking._id,
      message: 'Passenger details saved'
    });

  } catch (error: any) {
    console.error('Passenger Details Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/hybrid/taxi-booking
 * Step 3: Add taxi leg and update status to 'HYBRID_COMPLETE'
 */
router.post('/taxi-booking', async (req: Request, res: Response) => {
  try {
    const { bookingId, pickup, drop, distance, taxiType } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Vehicle Pricing Rates (Base Fare + Per Km)
    const RATES: Record<string, { base: number, perKm: number }> = {
      'Mini': { base: 50, perKm: 15 },
      'Sedan': { base: 70, perKm: 20 },
      'SUV': { base: 100, perKm: 30 }
    };

    const selectedType = (taxiType && RATES[taxiType]) ? taxiType : 'Mini';
    const rate = RATES[selectedType];

    // Handle Taxi Logic
    let calculatedScheduledTime = new Date();
    let additionalFare = 0;

    if (pickup) {
      // Expecting string or object
      const pickupSource = typeof pickup === 'string' ? pickup : pickup.source;

      // For Pickup: Schedule based on Bus Departure
      // We want to reach bus stand 15 mins before departure
      if (booking.busBooking && booking.busBooking.departureTime) {
        const [hours, minutes] = booking.busBooking.departureTime.split(':').map(Number);
        const busDate = new Date(booking.busBooking.bookingDate);
        busDate.setHours(hours, minutes, 0, 0);
        // Target Arrival at Bus Stand: Departure - 15 mins
        calculatedScheduledTime = new Date(busDate.getTime() - 15 * 60000);
      }

      booking.pickupTaxi = {
        source: pickupSource,
        destination: booking.busBooking?.source || '', // To Bus
        distance: distance || 5, // Default or from logic
        fare: rate.base + ((distance || 5) * rate.perKm),
        scheduledTime: calculatedScheduledTime,
        estimatedPickupTime: calculatedScheduledTime,
        taxiType: selectedType
      };
      additionalFare += booking.pickupTaxi.fare;
    }

    if (drop) {
      const dropDest = typeof drop === 'string' ? drop : drop.destination;

      // For Drop: Schedule based on Bus Arrival
      if (booking.busBooking && booking.busBooking.arrivalTime) {
        const [hours, minutes] = booking.busBooking.arrivalTime.split(':').map(Number);
        const busDate = new Date(booking.busBooking.bookingDate);
        busDate.setHours(hours, minutes, 0, 0);
        // Pickup Time: Arrival + 15 mins buffer
        calculatedScheduledTime = new Date(busDate.getTime() + 15 * 60000);
      }

      booking.dropTaxi = {
        source: booking.busBooking?.destination || '', // From Bus
        destination: dropDest,
        distance: distance || 5,
        fare: rate.base + ((distance || 5) * rate.perKm),
        scheduledTime: calculatedScheduledTime,
        estimatedPickupTime: calculatedScheduledTime,
        taxiType: selectedType
      };
      additionalFare += booking.dropTaxi.fare;
    }

    booking.bookingType = 'hybrid'; // Force hybrid type
    booking.totalFare += additionalFare;
    booking.status = 'HYBRID_COMPLETE'; // STRICT FLOW: Step 3

    await booking.save();

    res.json({
      success: true,
      bookingId: booking._id,
      data: booking,
      message: 'Hybrid booking complete'
    });

  } catch (error: any) {
    console.error('Taxi Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});



export { router as hybridRoutes };

