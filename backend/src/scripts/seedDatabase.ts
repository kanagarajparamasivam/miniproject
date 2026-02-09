/**
 * Database Seeding Script
 * Populates MongoDB with initial bus data from mock data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Bus from '../models/Bus';
import User from '../models/User';
import LocalTaxiRoute from '../models/LocalTaxiRoute';
import { mockBusRoutes } from '../data/mockData';
import { connectDatabase } from '../config/database';

dotenv.config();

async function seedDatabase() {
  try {
    // Connect to database
    await connectDatabase();

    // Clear existing data (optional - comment out if you want to keep existing data)
    await Bus.deleteMany({});
    console.log('✅ Cleared existing bus data');

    // Create buses from mock data
    const buses = mockBusRoutes.map((route) => ({
      routeNo: route.routeNo,
      source: route.source,
      destination: route.destination,
      fare: route.fare,
      operator: route.operator,
      type: route.type,
      distance: route.distance,
      eta: route.eta,
      departureTime: generateDepartureTime(),
      arrivalTime: generateArrivalTime(route.eta),
      coveragePercent: route.coveragePercent,
      totalSeats: 40,
    }));

    // Generate seats for each bus manually since insertMany doesn't trigger pre-save
    const busesWithSeats = buses.map(bus => {
      const seats = [];
      for (let i = 1; i <= bus.totalSeats; i++) {
        seats.push({
          seatNumber: i.toString().padStart(2, '0'),
          isBooked: false,
        });
      }
      return { ...bus, seats };
    });

    // Insert buses
    const createdBuses = await Bus.insertMany(busesWithSeats);
    console.log(`✅ Created ${createdBuses.length} bus routes`);

    // Check if demo user exists, if not create it
    const existingUser = await User.findOne({ email: 'demo@example.com' });
    if (!existingUser) {
      await User.create({
        email: 'demo@example.com',
        password: 'demo123', // In production, hash this password
        name: 'Demo User',
      });
      console.log('✅ Created demo user');
    }

    // Seed LocalTaxiRoutes
    await LocalTaxiRoute.deleteMany({});
    const taxiRoutes = [
      { city: 'Chennai', baseFare: 50, ratePerKm: 15, maxDistance: 60, available: true },
      { city: 'Coimbatore', baseFare: 40, ratePerKm: 12, maxDistance: 40, available: true },
      { city: 'Madurai', baseFare: 40, ratePerKm: 14, maxDistance: 40, available: true },
      { city: 'Salem', baseFare: 35, ratePerKm: 12, maxDistance: 30, available: true },
      { city: 'Tiruchirappalli', baseFare: 35, ratePerKm: 12, maxDistance: 30, available: true },
    ];
    await LocalTaxiRoute.insertMany(taxiRoutes);
    console.log(`✅ Created ${taxiRoutes.length} local taxi routes`);

    console.log('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Generate random departure time between 6 AM and 10 PM
function generateDepartureTime(): string {
  const hour = Math.floor(Math.random() * 17) + 6; // 6 to 22
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Generate arrival time based on departure time and ETA
function generateArrivalTime(etaMinutes: number): string {
  const departureHour = 6 + Math.floor(Math.random() * 17);
  const departureMinute = Math.floor(Math.random() * 4) * 15;

  const departureTime = departureHour * 60 + departureMinute;
  const arrivalTime = departureTime + etaMinutes;

  const arrivalHour = Math.floor(arrivalTime / 60) % 24;
  const arrivalMinute = arrivalTime % 60;

  return `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}`;
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;

