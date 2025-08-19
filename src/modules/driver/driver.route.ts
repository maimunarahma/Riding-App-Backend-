import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DriverController } from "./driver.controller";


const route=Router()


route.patch('/approve/:id', checkAuth(Role.DRIVER), DriverController.approvalRide)

export const DriverRoutes= route