import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { IRide, RideStatus } from "./rider.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { Ride } from "./rider.model";
import { Driver } from "../driver/driver.model";
import { sendResponse } from "../../utils/sendResponse";
import mongoose, { ObjectId, Types } from "mongoose";
import { driverSockets, riderSockets } from "../../app";
import { io } from "socket.io-client";

export const createRideService = async (
  riderId: string,
  assignedDriver: ObjectId,
  pickupLocation: IRide["pickupLocation"],
  pickupGeoJSON: { type: string; coordinates: any[] },
  dropLocation: IRide["dropLocation"],
  dropGeoJSON: { type: string; coordinates: any[] },
  estimatedFare: number
) => {
  const newRide = await Ride.create({
    riderId,
    assignedDriver: assignedDriver,
    pickupLocation: {
      lng: pickupLocation.lng,
      lat: pickupLocation.lat,
    },
    dropLocation: {
      lng: dropLocation.lng,
      lat: dropLocation.lat,
    },
    status: "requested",
    requestedAt: new Date(),
    estimatedFare: estimatedFare,
  });
if (newRide.status === "pending") {
  newRide.assignedDriver = assignedDriver;
  // newRide.status =RideStatus.;
  await newRide.save();

  // Notify rider
  const riderSocketId = riderSockets[newRide.riderId.toString()];
  if (riderSocketId) {
    io.to(riderSocketId).emit("rideAccepted", { rideId: newRide._id, assignedDriver });
  }

  // Notify all other drivers
  nearestDriver.forEach((otherDriver) => {
    if (otherDriver._id.toString() !== assignedDriver.toString()) {
      const socketId = driverSockets[otherDriver._id.toString()];
      if (socketId) {
        io.to(socketId).emit("rideAlreadyAssigned", { rideId: newRide._id });
      }
    }
  });
}

  await newRide.save();

  return newRide;
};

const deleteRide = async (id: string) => {
  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      throw new AppError(401, "ride not exists");
    }
    const result = await Ride.deleteOne({ _id: id });
    return result;
  } catch (error) {
    console.log(error);
  }
};

const myRides = async (riderId: string) => {
  try {
    console.log(typeof riderId);
    const myRides = await Ride.find({ riderId: new Types.ObjectId(riderId) });
    console.log(myRides);
    return myRides;
  } catch (error) {
    throw error;
  }
};

const RideStatusUpdate = async (id: string, status: String) => {
  try {
    console.log(status);
    const ride = await Ride.findById(id);
    console.log(ride);

    if (!ride) {
      throw new AppError(401, "ride not exists");
    }
    if (ride.status === "accepted") {
      throw new AppError(
        403,
        "Sorry,Ride cant be cancelled .It is already been accepted from drivers end"
      );
    }
    const result = await Ride.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const RideService = {
  createRideService,
  deleteRide,
  myRides,
  RideStatusUpdate,
};
