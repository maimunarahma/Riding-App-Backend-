import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { sendResponse } from "../../utils/sendResponse";
import { Rider } from "../rider/rider.model";
import { Driver } from "../driver/driver.model";
import { ILocation } from "../driver/driver.interface";
import { Socket } from "socket.io";

type CreateUserPayload = Partial<IUser> & {
  model?: string; // for riders
  location : {
    type: "Point",
    coordinates: Number[]
  },
  vehicle?: {
    // for drivers
    type?: string;
    plateNumber?: string;
    model?: string;
    color?: string;
  };
};

const createUser = async (payload: CreateUserPayload) => {
  try {
    const email = payload.email;
    console.log("payload", payload);
    const isExist = await User.findOne({ email });
    if (isExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "user already exist");
    }
    const hashedPassword = await bcryptjs.hash(payload.password as string, 10);
    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: email as string,
    };
  
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      auths: [authProvider],
      role: payload.role || Role.RIDER,
    });
    if (payload.role === Role.RIDER || payload.role===null) {
 
      await Rider.create({
       riderId: user._id,
        rideHistory: [],
        maxCancelAttempts: 3,
        location: { lat: 0, lng: 0 },
      });
    } else if (payload.role === Role.DRIVER) {

      
      if (!payload.vehicle?.model || !payload.vehicle?.plateNumber) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Vehicle model and plate number are required for drivers"
        );
      }

      await Driver.create({
       driverId: user._id,
        isApproved: false,
        isOnline: true,
        location:payload.location,
        vehicle: {
          type: payload.vehicle.type || "CAR",
          model: payload.vehicle.model,
          plateNumber: payload.vehicle.plateNumber,
          color: payload.vehicle.color || "",
        },
      });
    }

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const loginUser = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new AppError(401, "user not exist, first register to login");
  }
  return existingUser;
};

const getAllUsers = async () => {
  const users = await User.find();
  const total = await User.countDocuments();
  return {
    data: users,
    meta: {
      totalUser: total,
    },
  };
};
export const userService = { createUser, getAllUsers };
