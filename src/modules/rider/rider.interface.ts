import mongoose from "mongoose";
import { IUser } from "../user/user.interface";


export enum RideStatus {
  PENDING = "pending",       // Rider requested, waiting for driver
  ACCEPTED = "accepted",     // Driver accepted
  REJECTED = "rejected",     // Driver rejected
  IN_PROGRESS = "in_progress", // Ride started
  COMPLETED = "completed",   // Ride finished
  CANCELLED = "cancelled"    // Rider or driver cancelled
}

export interface IRide {
  _id?: string;
  assignedDriver: string;
  riderId: string;
  driverId?: string;           // assigned when accepted
  pickupLocation: { lat: number; lng: number };
  estimatedFare: number;
  dropLocation: { lat: number; lng: number };
  status: RideStatus;
  fare?: number;               // optional if calculated
  requestedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  canceledAt?: Date;
}
export interface IRider extends IUser {
  _id:string,
  riderId: mongoose.Types.ObjectId,
  rideHistory?: IRide[];       // array of past rides
  maxCancelAttempts?: number;  // optional limit for cancellations
  location?: {
    lat: number;
    lng: number;
  };
}
