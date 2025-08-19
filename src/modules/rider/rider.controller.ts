import { createRideService } from "./rider.service";
import { Request, Response, NextFunction } from "express";
import { RideService } from "./rider.service";
import { Ride } from "./rider.model";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { Driver } from "../driver/driver.model";
import { driverSockets, io, riderSockets } from "../../app";
import { Socket } from "socket.io";
import { haversineKm } from "../../utils/geo";
import { estimateDurationMin } from "../../utils/timeEstimate";
import {
  calculateDistance,
  calculateFare,
  computeSurgeMultiplier,
} from "../../utils/fare";
import { RideStatus } from "./rider.interface";

const createRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError(401, "User not authenticated");
    }

    const riderId = req.user.userId;
    const { pickupLocation, dropLocation } = req.body;

    // Validate pickupLocation
    if (
      !pickupLocation ||
      typeof pickupLocation.lng !== "number" ||
      typeof pickupLocation.lat !== "number"
    ) {
      throw new AppError(400, "pickupLocation must contain valid lng and lat");
    }

    // Convert to GeoJSON for DB
    const pickupGeoJSON = {
      type: "Point",
      coordinates: [pickupLocation.lng, pickupLocation.lat],
    };

    const dropGeoJSON = {
      type: "Point",
      coordinates: [dropLocation.lng, dropLocation.lat],
    };
    console.log(pickupGeoJSON, pickupLocation);
    // Find nearest driver
    const nearestDriver = await Driver.find({
      isOnline: true,
      // isBusy: false,
      location: {
        $near: {
          $geometry: pickupGeoJSON,
          $maxDistance: 2000, // 2 km in meters
        },
      },
    }).limit(5);
    console.log("nearest driver", nearestDriver);
    if (nearestDriver.length === 0) {
      throw new AppError(404, "No driver found within 2km");
    }
    let assignedDriver = null;

    for (const driver of nearestDriver) {
      // Try to atomically mark this driver as busy
      const updatedDriver = await Driver.findOneAndUpdate(
        { _id: driver._id, isBusy: false }, // only if still free
        { $set: { isBusy: true } },
        { new: true }
      );

      if (updatedDriver) {
        assignedDriver = updatedDriver;
        break;
      }
    }
    console.log("assign driver", assignedDriver);
    if (!assignedDriver) {
      throw new AppError(404, "No available drivers at the moment");
    }

    const { distanceKm, durationMin } = await calculateDistance(
      { lat: pickupLocation.lat, lng: pickupLocation.lng },
      { lat: dropLocation.lat, lng: dropLocation.lng }
    );

    let estimateFare = calculateFare(
      { lat: pickupLocation.lat, lng: pickupLocation.lng },
      { lat: dropLocation.lat, lng: dropLocation.lng }
    );
    const riderSocketId = riderSockets[riderId.toString()];
    nearestDriver.forEach((driver) => {
      const driverSocketId = driverSockets[driver._id.toString()];
      if (driverSocketId) {
        io.to(driverSocketId).emit("rideRequest", {
          rideId: ride._id,
          riderId,
        });
      }
    });

    const ride = await RideService.createRideService(
      riderId,
      assignedDriver.driverId,
      pickupLocation,
      pickupGeoJSON,
      dropLocation,
      dropGeoJSON,
      (estimateFare /= 100)
    );
    console.log(nearestDriver);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Ride created successfully",
      data: ride,
    });
  } catch (err) {
    sendResponse(res, {
      success: false,
      message: "ride can't be created",
      data: null,
      statusCode: 401,
    });
    next(err);
  }
};

const deleteRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error("Ride ID is required");
    }
    const ride = await RideService.deleteRide(id);
    sendResponse(res, {
      success: true,
      message: "ride deleted successfully",
      data: null,
      statusCode: 201,
    });
  } catch (err) {
    sendResponse(res, {
      success: false,
      message: "ride can't be deleted",
      data: null,
      statusCode: 0,
    });
    next(err);
  }
};

const myRides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!req.user) {
      throw new AppError(403, "user not exist");
    }

    if (!accessToken) {
      throw new AppError(401, "no token recieved");
    }
    const riderId = req.user.userId;
    if (!riderId) {
      throw new AppError(401, "rider not exist");
    }
    console.log(riderId);
    const myRides = await RideService.myRides(riderId);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "riders own rides retrived",
      data: myRides,
    });
  } catch (error) {
    sendResponse(res, {
      success: false,
      statusCode: 401,
      message: "riders own rides retrived not possible",
      data: null,
    });
  }
};
const RideStatusUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!req.user) {
      throw new AppError(403, "user not exist");
    }

    if (!accessToken) {
      throw new AppError(401, "no token recieved");
    }
    const riderId = req.user.userId;
    const { id } = req.params;
    if (!riderId) {
      throw new AppError(401, "rider not exist");
    }
    const { status } = req.body;
    const myRides = await RideService.RideStatusUpdate(id, status);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "riders own rides retrived",
      data: myRides,
    });
  } catch (error) {
    return next(error);
  }
};

// RideController.ts
const driverResponse = async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const { driverId, action } = req.body; // "accept" or "reject"

  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(404, "Ride not found");

  if (!ride.assignedDriver) {
    throw new AppError(400, "No driver assigned to this ride");
  }

  // Ensure driver is the assigned one
  if (ride.assignedDriver.toString() !== driverId) {
    throw new AppError(403, "Not authorized");
  }

  if (action === "accept") {
    ride.status = RideStatus.ACCEPTED;
    await ride.save();

    // Notify rider
    io.to(ride.riderSocketId).emit("rideAccepted", { rideId, driverId });
  } else if (action === "reject") {
    ride.status = "rejected";
    await ride.save();

    // Notify rider
    io.to(ride.riderSocketId).emit("rideRejected", { rideId, driverId });

    // (Optional) Assign next driver
    // findNextAvailableDriver(ride);
  }

  return res.json({
    success: true,
    message: `Driver ${action}ed the ride`,
    ride,
  });
};

export const RideController = {
  createRide,
  deleteRide,
  myRides,
  RideStatusUpdate,
  driverResponse,
};
