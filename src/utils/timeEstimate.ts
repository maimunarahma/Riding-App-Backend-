// src/utils/timeEstimate.ts
type Vehicle = "CAR" | "BIKE" | "CNG";

const baseSpeedKmH: Record<Vehicle, number> = {
  CAR: 18,
  BIKE: 22,
  CNG: 20,
};

// crude time-of-day factor (rush hour slower)
function timeOfDayFactor(date = new Date()): number {
  const hour = date.getHours(); // server local time; use city tz if needed
  if ((hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21)) return 0.75; // rush
  if (hour >= 23 || hour <= 5) return 1.2; // late night faster
  return 1.0;
}

export function estimateDurationMin(
  distanceKm: number,
  vehicle: Vehicle,
  now = new Date()
): number {
  const speed = baseSpeedKmH[vehicle] * timeOfDayFactor(now); // km/h
  const hours = distanceKm / Math.max(speed, 1); // guard
  return Math.ceil(hours * 60);
}
