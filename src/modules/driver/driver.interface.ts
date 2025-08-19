import mongoose from "mongoose";
import { IRide } from "../rider/rider.interface";
import { IUser } from "../user/user.interface";





export interface ILocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
} 

export interface IDriver extends IUser{
    _id:string,
  driverId: mongoose.Types.ObjectId;
  isApproved: boolean;        // Admin approves driver
  isOnline: boolean;          // Available to accept rides
  isBusy:boolean;
  currentRideId?: string;     // ride currently in progress
  location:ILocation,
  vehicle: {
    type: string;             // e.g., car, bike
    plateNumber?: string;
    model: string;
    color?: string;
  },
  earningsHistory?: IRide[];  // past completed rides
  rating?: number;            // optional rating from riders
}

