import mongoose, { Schema, model, Document } from "mongoose";
import { IRide, IRider } from "./rider.interface";



const rideSchema = new Schema<IRide>(
  {
    riderId: {type : Schema.Types.ObjectId, ref: "User" , required: true},
     assignedDriver: { type: Schema.Types.ObjectId, ref: "Driver" },
    driverId: { type: Schema.Types.ObjectId, ref: "User" }, // optional
    estimatedFare: {type: Number , required :true},
    pickupLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "picked_up", "in_transit", "completed", "canceled"],
      default: "requested",
    },
    fare: { type: Number },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    canceledAt: { type: Date },
  },
  { timestamps: true }
);

// Rider Schema
const riderSchema = new Schema<IRider>(
  {
        riderId: {type : Schema.Types.ObjectId, ref: "User" , required: true},
    rideHistory: [{ type: Schema.Types.ObjectId, ref: "Ride" }], 
    maxCancelAttempts: { type: Number, default: 3 },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true }
);

export const Ride = model("Ride", rideSchema);
export const Rider = model("Rider", riderSchema);
