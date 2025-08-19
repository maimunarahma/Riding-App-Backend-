

import { NextFunction,Request,Response, Router } from "express";
import  jwt, { JwtPayload }  from "jsonwebtoken";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";



const router = Router();


router.post('/register', UserController.createUser)
router.get('/all-users', checkAuth(Role.ADMIN),UserController.getAllUsers)
router.patch('/users', UserController.blockUser)
export const userRoutes = router;
