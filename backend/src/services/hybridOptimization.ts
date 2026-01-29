/**
 * Hybrid Route Optimization Algorithm
 * Compares Bus-only, Taxi-only, and Hybrid (Bus + Taxi) options
 * Selects the best option based on cost and time efficiency
 */

import { BusOption, TaxiOption } from '../data/mockData';

export interface HybridRecommendation {
  recommendedOption: 'Bus' | 'Taxi' | 'Hybrid';
  totalFare: number;
  totalETA: number;
  breakdown?: {
    bus?: {
      routeNo: string;
      fare: number;
      eta: number;
      coveragePercent: number;
      departureTime?: string;
      arrivalTime?: string;
      busId?: string;
    };
    taxi?: {
      fare: number;
      eta: number;
      distance?: number;
    };
    hybrid?: {
      busFare: number;
      busETA: number;
      taxiFare: number;
      taxiETA: number;
      totalFare: number;
      totalETA: number;
      busId?: string;
      routeNo?: string;
      departureTime?: string;
      arrivalTime?: string;
    };
  };
  allOptions: {
    busOnly: { fare: number; eta: number; available: boolean };
    taxiOnly: { fare: number; eta: number; available: boolean };
    hybrid: { fare: number; eta: number; available: boolean };
  };
}

/**
 * Main optimization function
 * Rule-based algorithm to find the best travel option
 */
export function optimizeRoute(
  busOptions: BusOption[],
  taxiOptions: TaxiOption[]
): HybridRecommendation {
  // Filter available options
  const availableBuses = busOptions.filter(bus => bus.seatAvailable);
  const availableTaxis = taxiOptions.filter(taxi => taxi.available);

  // If no options available
  if (availableBuses.length === 0 && availableTaxis.length === 0) {
    return {
      recommendedOption: 'Taxi',
      totalFare: 0,
      totalETA: 0,
      allOptions: {
        busOnly: { fare: 0, eta: 0, available: false },
        taxiOnly: { fare: 0, eta: 0, available: false },
        hybrid: { fare: 0, eta: 0, available: false }
      }
    };
  }

  // Calculate Bus-only option (best available bus)
  const bestBus = availableBuses.length > 0 
    ? availableBuses.reduce((best, current) => 
        current.fare < best.fare ? current : best
      )
    : null;

  const busOnlyOption = bestBus ? {
    fare: bestBus.fare,
    eta: bestBus.eta,
    available: true
  } : {
    fare: 0,
    eta: 0,
    available: false
  };

  // Calculate Taxi-only option (best available taxi)
  const bestTaxi = availableTaxis.length > 0
    ? availableTaxis.reduce((best, current) =>
        current.totalFare < best.totalFare ? current : best
      )
    : null;

  const taxiOnlyOption = bestTaxi ? {
    fare: bestTaxi.totalFare,
    eta: bestTaxi.eta,
    available: true
  } : {
    fare: 0,
    eta: 0,
    available: false
  };

  // Calculate Hybrid option (Bus + Taxi)
  // Hybrid is only considered if bus coverage >= 60%
  let hybridOption = {
    fare: 0,
    eta: 0,
    available: false
  };

  if (bestBus && bestBus.coveragePercent >= 60 && bestTaxi) {
    // Calculate uncovered distance (percentage not covered by bus)
    const uncoveredPercent = 100 - bestBus.coveragePercent;
    const uncoveredDistance = (bestBus.distance * uncoveredPercent) / 100;
    
    // Taxi fare for uncovered portion
    const taxiFareForUncovered = uncoveredDistance * bestTaxi.farePerKm;
    
    // Hybrid total fare = bus fare + taxi fare for uncovered portion
    const hybridFare = bestBus.fare + taxiFareForUncovered;
    
    // Hybrid ETA = bus ETA + taxi ETA for uncovered portion
    // Estimate taxi ETA for uncovered distance (assuming 1km = 2 minutes)
    const taxiETAForUncovered = uncoveredDistance * 2;
    const hybridETA = bestBus.eta + taxiETAForUncovered;

    hybridOption = {
      fare: Math.round(hybridFare),
      eta: Math.round(hybridETA),
      available: true
    };
  }

  // Decision Logic: Select best option
  const options = [
    { type: 'Bus' as const, fare: busOnlyOption.fare, eta: busOnlyOption.eta, available: busOnlyOption.available },
    { type: 'Taxi' as const, fare: taxiOnlyOption.fare, eta: taxiOnlyOption.eta, available: taxiOnlyOption.available },
    { type: 'Hybrid' as const, fare: hybridOption.fare, eta: hybridOption.eta, available: hybridOption.available }
  ].filter(opt => opt.available);

  if (options.length === 0) {
    return {
      recommendedOption: 'Taxi',
      totalFare: 0,
      totalETA: 0,
      allOptions: {
        busOnly: busOnlyOption,
        taxiOnly: taxiOnlyOption,
        hybrid: hybridOption
      }
    };
  }

  // Score-based selection: Lower cost and reasonable time gets priority
  // Score = (fare * 0.6) + (eta * 0.4) - lower is better
  const scoredOptions = options.map(opt => ({
    ...opt,
    score: (opt.fare * 0.6) + (opt.eta * 0.4)
  }));

  const bestOption = scoredOptions.reduce((best, current) =>
    current.score < best.score ? current : best
  );

  // Build breakdown for response
  const breakdown: any = {};
  if (bestBus) {
    breakdown.bus = {
      routeNo: bestBus.routeNo,
      fare: bestBus.fare,
      eta: bestBus.eta,
      coveragePercent: bestBus.coveragePercent
    };
  }
  if (bestTaxi) {
    breakdown.taxi = {
      fare: bestTaxi.totalFare,
      eta: bestTaxi.eta
    };
  }
  if (hybridOption.available && bestBus && bestTaxi) {
    const uncoveredPercent = 100 - bestBus.coveragePercent;
    const uncoveredDistance = (bestBus.distance * uncoveredPercent) / 100;
    const taxiFareForUncovered = uncoveredDistance * bestTaxi.farePerKm;
    const taxiETAForUncovered = uncoveredDistance * 2;

    breakdown.hybrid = {
      busFare: bestBus.fare,
      busETA: bestBus.eta,
      taxiFare: Math.round(taxiFareForUncovered),
      taxiETA: Math.round(taxiETAForUncovered),
      totalFare: hybridOption.fare,
      totalETA: hybridOption.eta
    };
  }

  return {
    recommendedOption: bestOption.type,
    totalFare: bestOption.fare,
    totalETA: bestOption.eta,
    breakdown,
    allOptions: {
      busOnly: busOnlyOption,
      taxiOnly: taxiOnlyOption,
      hybrid: hybridOption
    }
  };
}

