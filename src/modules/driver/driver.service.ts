import AppError from "../../errorHelpers/AppError";
import { RideStatus } from "../rider/rider.interface";
import { Ride } from "../rider/rider.model";



const approvalRide = async (id: string, driverId: string, status: string) => {
  try {
    const ride = await Ride.findById(id);
    if (!ride) {
      throw new AppError(404, "Ride not found");
    }

    // Only allow "accept" if no driver is already assigned
    if (status === "accepted") {
      if (ride.assignedDriver) {
        throw new AppError(400, "Ride already assigned to another driver");
      }

      ride.assignedDriver = driverId;
      ride.status = RideStatus.ACCEPTED;
    }

    // If driver rejects
    else if (status === "rejected") {
      ride.status = RideStatus.REJECTED;
    }

    // If driver cancels after accepting
    else if (status === "cancelled") {
      ride.status = RideStatus.CANCELLED;
      // ride.assignedDriver = undefined; // make it available again
    }

    // Later you can add "in_progress" and "completed" here

    await ride.save(); // ✅ This persists both assignedDriver and status
    return ride;

  } catch (error) {
    throw error;
  }
};


export const DriverService = { approvalRide };
