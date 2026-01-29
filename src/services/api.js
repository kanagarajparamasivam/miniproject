/**
 * API Service for Backend Communication
 * Handles all HTTP requests to the backend server
 */

// Use 127.0.0.1 for web browsers (localhost sometimes has issues)
// Use 10.0.2.2 for Android Emulator, 127.0.0.1 for Web, or Machine IP for real device
// NOTE: If using Android Emulator, set this to 'http://10.0.2.2:3000/api'
const API_BASE_URL = 'http://10.0.2.2:3000/api';
// const API_BASE_URL = 'http://127.0.0.1:3000/api'; // Use this for Web/iOS Simulator

// Mock Data for Offline Fallback
const MOCK_ROUTES = {
  success: true,
  data: {
    recommendedOption: "Hybrid",
    totalFare: 2200,
    totalETA: 495, // 8h 15m in minutes
    allOptions: {
      busOnly: {
        fare: 650,
        eta: 570, // 9h 30m
        available: true,
        distance: "495 km",
        duration: "9h 30m"
      },
      taxiOnly: {
        fare: 6500,
        eta: 525, // 8h 45m
        available: true,
        distance: "490 km",
        duration: "8h 45m"
      },
      hybrid: {
        fare: 2200,
        eta: 495, // 8h 15m
        available: true,
        distance: "500 km",
        duration: "8h 15m",
        busFare: 650,
        taxiFare: 1550
      }
    },
    breakdown: {
      bus: {
        busId: "bus-123",
        routeNo: "45A",
        fare: 650,
        departureTime: "10:00 AM",
        arrivalTime: "07:30 PM",
        eta: 570
      },
      taxi: {
        fare: 6500,
        eta: 525
      },
      hybrid: {
        busId: "bus-123",
        routeNo: "45A",
        busFare: 650,
        taxiFare: 1550,
        departureTime: "10:00 AM",
        arrivalTime: "06:15 PM"
      }
    }
  },
  message: "Routes fetched successfully (Offline Mode)"
};

/**
 * Generic API request function
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${method} ${url}`, body ? { body } : '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for faster fallback

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`[API] Sending request to ${url}`);
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // Check if response is ok before trying to parse JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      console.error('[API] Error response:', data);
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    console.log('[API] Success response:', data);
    return data;
  } catch (error) {
    console.error('[API] Request failed:', error.message);

    // Check if we should return mock data for specific endpoints
    if (endpoint === '/getHybridRecommendation' || endpoint === '/routes') {
      console.log('[API] Returning mock data due to failure');
      return MOCK_ROUTES;
    }

    // Re-throw with more context if not handled by mock
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'AbortError') {
      throw new Error('Unable to connect to server.');
    }
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    return apiRequest('/login', 'POST', { email, password });
  },
};

/**
 * Route API
 */
export const routeAPI = {
  /**
   * Get route information between source and destination
   */
  getRoutes: async (source, destination) => {
    return apiRequest('/routes', 'POST', { fromLocation: source, toLocation: destination });
  },
};

/**
 * Bus API
 */
export const busAPI = {
  /**
   * Get available bus options for a route
   */
  getBusOptions: async (source, destination) => {
    return apiRequest('/getBusOptions', 'POST', { source, destination });
  },
};

/**
 * Taxi API
 */
export const taxiAPI = {
  /**
   * Get available taxi options for a route
   */
  getTaxiOptions: async (source, destination) => {
    return apiRequest('/getTaxiOptions', 'POST', { source, destination });
  },
};

/**
 * Hybrid Optimization API
 */
export const hybridAPI = {
  /**
   * Get hybrid route recommendation
   */
  getHybridRecommendation: async (source, destination) => {
    // Try the new standard endpoint first, or fallback to the specific one
    return apiRequest('/getHybridRecommendation', 'POST', { source, destination });
  },
  /**
    * Book Bus for Hybrid Journey
    */
  bookBus: async (bookingData) => {
    return apiRequest('/hybrid/book-bus-seat', 'POST', bookingData);
  },
  /**
   * Book Taxi for Hybrid Journey
   */
  bookTaxi: async (bookingData) => {
    return apiRequest('/hybrid/book-taxi', 'POST', bookingData);
  },
};

/**
 * Booking API
 */
export const bookingAPI = {
  /**
   * Get bus details including seats
   */
  getBusDetails: async (busId) => {
    return apiRequest('/getBusDetails', 'POST', { busId });
  },
  /**
   * Book bus with seat selection (New Persistent)
   */
  bookBus: async (bookingData) => {
    // Check if we should use the new endpoint structure
    // The new endpoint expects: { userId, busId, seats: [], bookingDate }
    // The old call passed: { userId, busId, selectedSeats: [], bookingDate }
    // Let's adapt here
    const payload = {
      ...bookingData,
      seats: bookingData.selectedSeats || bookingData.seats
    };
    return apiRequest('/book-seats', 'POST', payload);
  },
  /**
   * Add taxi leg (pickup/drop) to bus booking
   */
  addTaxiToBooking: async (taxiData) => {
    return apiRequest('/addTaxiToBooking', 'POST', taxiData);
  },
  /**
   * Book taxi only
   */
  bookTaxiOnly: async (taxiData) => {
    return apiRequest('/bookTaxiOnly', 'POST', taxiData);
  },
  /**
   * Process payment
   */
  processPayment: async (paymentData) => {
    return apiRequest('/processPayment', 'POST', paymentData);
  },
  /**
   * Get user bookings
   */
  getBookings: async (userId) => {
    return apiRequest(`/getBookings/${userId}`, 'GET');
  },
};

export default {
  authAPI,
  routeAPI,
  busAPI,
  taxiAPI,
  hybridAPI,
  bookingAPI,
};


