import { Router ,Request, Response ,NextFunction} from "express";
import { AuthController } from "./auth.controller";
import passport from "passport";


const route= Router()

route.post('/login', AuthController.credentialLogin)
// route.get('/google',  (req: Request , res: Response, next: NextFunction)=>{
//     passport.authenticate("google", { scope : ["profile" , "email"] }) (req,res, next)
    
// })
// route.get('/google/callback',passport.authenticate("google", { failureRedirect: "/" }),AuthController.googleCallbackController)

export const AuthRoutes=route