import passport, { Profile } from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false);
        }
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName || "",
            role: Role.USER,
            isVerified: true,
            auths: { provider: "google", providerId: profile.id },
          });
        }
        return done(null, user);
      } catch (error) {
        console.log("google strategy error");
        return done(error);
      }
    }
  )
);
  passport.use(
      new LocalStrategy({
        usernameField:"email",
        passwordField : "password"
      }, async(email : string , password : string , done)=>{
        try {
          const isUserExist= await User.findOne({email})
          if(!isUserExist){
             return done(null, false, {message : "user not exist"})
          }
          const user=isUserExist;
          if(!user){
             return done(null, false, {message :" user not exist"})
          }

          const isGoogleAuthenticated= user.auths.some((providerObject :any)=> providerObject.provider=== "google")
          if(isGoogleAuthenticated && !user.password){
             return done(null, false, {
               message: "you have authenticated with google login . If you want to login with credentials please   set a password ,then login"
             })
          }

          return done(null,user)
        } catch (error) {
          console.log(error)
          done(error)
        }
      })
  )

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});
passport.serializeUser((user: any, done: VerifyCallback) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done: VerifyCallback) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
});
