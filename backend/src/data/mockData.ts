/**
 * Mock Data for Bus and Taxi Services
 * Used for Phase 1 MVP demonstration
 */

export interface BusOption {
  routeNo: string;
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
export const mockBusRoutes: BusOption[] = [
  // Chennai Routes
  {
    routeNo: "TN001",
    eta: 180,
    fare: 450,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Coimbatore",
    distance: 495
  },
  {
    routeNo: "TN002",
    eta: 240,
    fare: 600,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Madurai",
    distance: 450
  },
  {
    routeNo: "TN003",
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
    eta: 210,
    fare: 520,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Salem",
    distance: 340
  },
  {
    routeNo: "TN011",
    eta: 180,
    fare: 420,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Vellore",
    distance: 135
  },
  {
    routeNo: "TN012",
    eta: 120,
    fare: 280,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Chennai",
    destination: "Pondicherry",
    distance: 150
  },
  // Coimbatore Routes
  {
    routeNo: "TN004",
    eta: 120,
    fare: 280,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Salem",
    distance: 160
  },
  {
    routeNo: "TN005",
    eta: 180,
    fare: 400,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Madurai",
    distance: 225
  },
  {
    routeNo: "TN009",
    eta: 90,
    fare: 200,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Ooty",
    distance: 85
  },
  {
    routeNo: "TN013",
    eta: 150,
    fare: 350,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Tirunelveli",
    distance: 280
  },
  {
    routeNo: "TN014",
    eta: 100,
    fare: 250,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Coimbatore",
    destination: "Erode",
    distance: 100
  },
  // Madurai Routes
  {
    routeNo: "TN007",
    eta: 150,
    fare: 380,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Madurai",
    destination: "Tirunelveli",
    distance: 150
  },
  {
    routeNo: "TN015",
    eta: 120,
    fare: 300,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Madurai",
    destination: "Rameswaram",
    distance: 170
  },
  {
    routeNo: "TN016",
    eta: 90,
    fare: 220,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Madurai",
    destination: "Kanyakumari",
    distance: 240
  },
  {
    routeNo: "TN017",
    eta: 100,
    fare: 250,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Madurai",
    destination: "Tiruchirappalli",
    distance: 130
  },
  // Tiruchirappalli Routes
  {
    routeNo: "TN008",
    eta: 120,
    fare: 300,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Tiruchirappalli",
    destination: "Thanjavur",
    distance: 55
  },
  {
    routeNo: "TN018",
    eta: 90,
    fare: 200,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Tiruchirappalli",
    destination: "Pudukkottai",
    distance: 45
  },
  // Salem Routes
  {
    routeNo: "TN006",
    eta: 90,
    fare: 220,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Salem",
    destination: "Erode",
    distance: 80
  },
  {
    routeNo: "TN019",
    eta: 120,
    fare: 280,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Salem",
    destination: "Hosur",
    distance: 150
  },
  {
    routeNo: "TN020",
    eta: 150,
    fare: 350,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Salem",
    destination: "Vellore",
    distance: 200
  },
  // Other Routes
  {
    routeNo: "TN021",
    eta: 60,
    fare: 150,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Vellore",
    destination: "Kanchipuram",
    distance: 75
  },
  {
    routeNo: "TN022",
    eta: 180,
    fare: 420,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Thanjavur",
    destination: "Nagapattinam",
    distance: 90
  },
  {
    routeNo: "TN023",
    eta: 120,
    fare: 300,
    seatAvailable: true,
    coveragePercent: 100,
    source: "Tirunelveli",
    destination: "Kanyakumari",
    distance: 85
  }
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

