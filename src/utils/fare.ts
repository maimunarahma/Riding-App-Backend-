// src/utils/fare.ts
type Vehicle = "CAR" | "BIKE" | "CNG";

interface RateCard {
  base: number;      // start fee
  perKm: number;
  perMin: number;
  minFare: number;
  platformFee: number; // fixed fee
}

const rates: Record<Vehicle, RateCard> = {
  CAR:  { base: 40, perKm: 25, perMin: 2.0, minFare: 70, platformFee: 5 },
  BIKE: { base: 25, perKm: 18, perMin: 1.5, minFare: 50, platformFee: 5 },
  CNG:  { base: 30, perKm: 20, perMin: 1.8, minFare: 60, platformFee: 5 },
};

// very simple surge: more requests than drivers => >1.0
export const computeSurgeMultiplier=(
  nearbyDriverCount: number,
  nearbyRequestCount: number
): number=> {
  if (nearbyDriverCount <= 0) return 2.0;
  const ratio = nearbyRequestCount / nearbyDriverCount; // demand / supply
  if (ratio <= 0.8) return 1.0;
  if (ratio <= 1.2) return 1.1;
  if (ratio <= 1.6) return 1.25;
  if (ratio <= 2.0) return 1.5;
  return 1.8;
}
export const calculateFare = (
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number }
): number => {
  const { distanceKm, durationMin } = calculateDistance(pickup, dropoff);

  // Example: flat rates (change as you like)
  const baseFare = 30;       // start fee
  const perKm = 20;          // per km
  const perMin = 1;          // per minute
  const platformFee = 5;     // fixed

  let fare = baseFare + distanceKm * perKm + durationMin * perMin + platformFee;

  // Enforce minimum fare
  fare = Math.max(fare, 50);

  return Math.round(fare);
};

export const calculateDistance=(pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number })=> {
  const R = 6371; // Earth radius in km

  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLng = (dropoff.lng - pickup.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pickup.lat * Math.PI / 180) *
    Math.cos(dropoff.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceKm = R * c;

  // Duration (rough, assume average 40 km/h speed)
  const avgSpeedKmH = 40;
  const durationMin = (distanceKm / avgSpeedKmH) * 60;

  return { distanceKm, durationMin };
}
