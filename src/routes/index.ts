import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";

import  { RiderRoutes } from "../modules/rider/rider.route";
import { DriverRoutes } from "../modules/driver/driver.route";
import { AuthRoutes } from "../modules/auth/auth.route";


export const router=Router()

const moduleRoutes=[
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },{
        path:'/rides',
        route: RiderRoutes
    },
    {
        path: '/drivers',
        route : DriverRoutes
    }
]

moduleRoutes.forEach((route)=>{
     router.use(route.path, route.route)
})