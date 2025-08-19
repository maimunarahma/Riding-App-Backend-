import { Schema, model } from "mongoose";
import { IDriver } from "./driver.interface";



const driverSchema = new Schema<IDriver>(
  {
    // Link to User
  driverId: {type: Schema.Types.ObjectId ,ref: "User" , required :true},
    isApproved: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isBusy: {type : Boolean , default :false},

    currentRideId: { type: Schema.Types.ObjectId, ref: "Ride" },
   location: {
  type: {
    type: String,
    enum: ["Point"],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
},
    vehicle: {
      type: {
        type: String, // e.g., "car", "bike"
        required: true,
      },
      plateNumber: { type: String, required: true },
      model: { type: String, required: true },
      color: { type: String },
    },

    earningsHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],

    rating: { type: Number, min: 0, max: 5 },
  },
  { timestamps: true }
);
driverSchema.index({ location: "2dsphere" });
export const Driver = model<IDriver>("Driver", driverSchema);
