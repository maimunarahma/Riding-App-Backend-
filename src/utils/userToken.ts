import { JwtPayload } from "jsonwebtoken"
import AppError from "../errorHelpers/AppError"
import { User } from "../modules/user/user.model"
import { IsActive, IUser } from "../modules/user/user.interface"
import httpStatus from "http-status-codes"
import { generateToken } from "./jwt"


export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }
    const accessToken = generateToken(jwtPayload, "secret", "1d")

    const refreshToken = generateToken(jwtPayload, "secretrefresh", "30d")


    return {
        accessToken,
        refreshToken
    }
}
