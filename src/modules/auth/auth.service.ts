import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { generateToken } from "../../utils/jwt";
import { createUserTokens } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
const credentialLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(password as string, user.password as string);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
  }

  const tokens = await createUserTokens(user);
  const { password: pass, ...rest } = user.toObject();

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: rest,
  };
};


// const passwordReset = async (
//   payload: Record<string, any>,
//   decodedToekn: JwtPayload
// ) => {
//   console.log("payload", payload);
// //   if (payload._id != decodedToekn.userId) {
// //     throw new AppError(401, " you cant reset your password");
// //   }
//   const isUserExist = await User.findById(decodedToekn.userId);
//   if (!isUserExist) {
//     throw new AppError(401, "user not exist");
//   }
//   const hashedPassword = await bcryptjs.hash(payload.newPassword, 10);
//   isUserExist.password = hashedPassword;
//   await isUserExist.save();
// };
export const AuthServices = {
  credentialLogin,

//   passwordReset,
};
