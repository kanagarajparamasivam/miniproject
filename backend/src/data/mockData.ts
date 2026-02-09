/**
 * Mock Data for Bus and Taxi Services
 * Used for Phase 1 MVP demonstration
 */

export interface BusOption {
  routeNo: string;
  operator: string;
  type: string;
  eta: number; // in minutes
  fare: number; // in currency units
  seatAvailable: boolean;
  coveragePercent: number; // percentage of route covered by bus
  source: string;
  destination: string;
  distance: number; // in km
}

export interface TaxiOption {
  eta: number; // in minutes
  farePerKm: number; // fare per kilometer
  totalFare: number; // total fare for the route
  source: string;
  destination: string;
  distance: number; // in km
  available: boolean;
}

export interface RouteData {
  source: string;
  destination: string;
  distance: number; // in km
  estimatedTime: number; // in minutes (direct route)
}

// Mock Bus Routes Database - Tamil Nadu Cities
// Mock Bus Routes Database - Tamil Nadu Cities with Multiple Operators
export const mockBusRoutes: BusOption[] = [
  // Chennai -> Coimbatore (Major Route - Showcasing Multiple Operators)
  {
    routeNo: "MKH001",
    operator: "MKH Travels",
    type: "AC Sleeper",
    eta: 480, // 8 hours
    fare: 850,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },
  {
    routeNo: "SETC001",
    operator: "SETC",
    type: "Ultra Deluxe",
    eta: 540, // 9 hours
    fare: 450,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },
  {
    routeNo: "KPN001",
    operator: "KPN Travels",
    type: "AC Multi Axle",
    eta: 450, // 7.5 hours
    fare: 950,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },
  {
    routeNo: "SRS001",
    operator: "SRS Travels",
    type: "Non-AC Sleeper",
    eta: 510, // 8.5 hours
    fare: 650,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },
  {
    routeNo: "KSRTC001",
    operator: "KSRTC",
    type: "Airavat",
    eta: 480,
    fare: 750,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },

  // Chennai -> Madurai
  {
    routeNo: "MKH002",
    operator: "MKH Travels",
    type: "AC Sleeper",
    eta: 420,
    fare: 750,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Madurai",
    distance: 450
  },
  {
    routeNo: "SETC002",
    operator: "SETC",
    type: "Ultra Deluxe",
    eta: 480,
    fare: 420,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Madurai",
    distance: 450
  },

  // Coimbatore -> Chennai
  {
    routeNo: "KPN002",
    operator: "KPN Travels",
    type: "AC Multi Axle",
    eta: 450,
    fare: 950,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Chennai",
    distance: 495
  },

  // Other Routes (kept minimal for brevity but functional)
  {
    routeNo: "TN003",
    operator: "SETC",
    type: "Deluxe",
    eta: 150,
    fare: 350,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Tiruchirappalli",
    distance: 320
  },
  {
    routeNo: "TN010",
    operator: "KPN",
    type: "AC Seater",
    eta: 210,
    fare: 520,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Salem",
    distance: 340
  },
];

// Mock Taxi Data - Dynamic calculation based on distance
export const mockTaxiData: TaxiOption[] = [
  // This will be calculated dynamically based on route distance
  // Base taxi options with fare per km
];

// Mock Users Database - Now stored in MongoDB
// This is kept for backward compatibility during migration
export interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "demo@example.com",
    password: "demo123",
    name: "Demo User"
  },
  {
    id: "2",
    email: "user@test.com",
    password: "test123",
    name: "Test User"
  },
  {
    id: "3",
    email: "admin@booking.com",
    password: "admin123",
    name: "Admin User"
  }
];

// Mock Route Calculation (simulates Maps & Routing Service)
// Returns route data based on Tamil Nadu cities
export function calculateRoute(source: string, destination: string): RouteData {
  // Find matching bus route for distance
  const busRoute = mockBusRoutes.find(
    route =>
      route.source.toLowerCase() === source.toLowerCase() &&
      route.destination.toLowerCase() === destination.toLowerCase()
  );

  if (busRoute) {
    return {
      source: busRoute.source,
      destination: busRoute.destination,
      distance: busRoute.distance,
      estimatedTime: busRoute.eta
    };
  }

  // Try reverse route
  const reverseRoute = mockBusRoutes.find(
    route =>
      route.source.toLowerCase() === destination.toLowerCase() &&
      route.destination.toLowerCase() === source.toLowerCase()
  );

  if (reverseRoute) {
    return {
      source: reverseRoute.destination,
      destination: reverseRoute.source,
      distance: reverseRoute.distance,
      estimatedTime: reverseRoute.eta
    };
  }

  // Default route if not found
  return {
    source,
    destination,
    distance: 100,
    estimatedTime: 120
  };
}

