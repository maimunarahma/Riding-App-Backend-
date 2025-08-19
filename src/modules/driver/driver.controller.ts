import { NextFunction, Request, Response } from "express";
import { DriverService } from "./driver.service";
import { sendResponse } from "../../utils/sendResponse";
import { driverSockets, io, riderSockets } from "../../app";
const approvalRide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const newStatus = req.body.status;
    const driverId = req.user?.userId;

    if (!id || !driverId) {
      throw new Error("Ride ID and driver ID are required");
    }

    const ride = await DriverService.approvalRide(id, driverId, newStatus);

    // Notify rider via socket
    if (ride?.riderId && riderSockets[ride.riderId]) {
      io.to(riderSockets[ride.riderId]).emit("ride-response", {
        rideId: ride.rideId,
        status: newStatus,
        driverId: driverId,
      });
    }

    sendResponse(res, {
      success: true,
      message: "Ride status updated successfully",
      data: ride,
      statusCode: 200,
    });
  } catch (error) {
    next(error);
       sendResponse(res, {
      success: false,
      message: "Ride status cant updated ",
      data: null,
      statusCode: 401,
    });
  }
};

export const DriverController = { approvalRide };
