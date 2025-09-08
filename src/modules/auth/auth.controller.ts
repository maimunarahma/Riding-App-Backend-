import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";

// Controller for local login using Passport
const credentialLogin = async(req: Request, res: Response, next: NextFunction) => {
  
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    try {
      if (err) return next(err);
      if (!user) return next(new AppError(401, info?.message || "Authentication failed"));

      // Generate tokens
      console.log(user)
      const tokens =  createUserTokens(user);
      const { password, ...rest } = user.toObject();

      // Set cookies
      setAuthCookie(res, tokens);

      // Send response
      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged in successfully",
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: rest,
        },
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

/*
// Optional Google OAuth login (keep commented until ready)
const googleCallbackController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oauthUser = req.user as any;
    if (!oauthUser) throw new AppError(403, "User not found from Google OAuth");

    const email = oauthUser.email;
    if (!email) throw new AppError(400, "Email is required for Google login");

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, provider: "google", password: null });
    }

    const tokens = await createUserTokens(user);
    setAuthCookie(res, tokens);
    res.redirect(process.env.FRONTEND_URL || "/");
  } catch (error) {
    next(error);
  }
};
*/

export const AuthController = {
  credentialLogin,
  // googleCallbackController
};
