import { Router } from "express";
import { RideController } from "./rider.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";


const route=Router()

route.post('/create-ride',checkAuth(Role.RIDER), RideController.createRide)
route.get('/myRide',checkAuth(Role.RIDER), RideController.myRides)
route.delete('/myRide/:id',checkAuth(Role.RIDER), RideController.deleteRide)
route.patch('/myRide/:id', checkAuth(Role.RIDER), RideController.RideStatusUpdate)
export const RiderRoutes= route;