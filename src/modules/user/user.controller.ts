import { NextFunction, Request, Response } from "express"
import { userService } from "./user.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from  "http-status-codes"
const createUser=async(req: Request, res :Response , next :  NextFunction)=>{
    try {
         const user=await userService.createUser(req.body as object)

     sendResponse(res, {
        success:true,
        statusCode: 201,
        message: "user created successfully",
        data: user
     })
    } catch (error) {
          sendResponse(res, {
        success:false,
        statusCode: 401,
        message: "user created unsuccessful",
        data: error
     })
    }
}


  const getAllUsers=async(req :Request , res : Response, next : NextFunction)=>{
      const allUsers= await userService.getAllUsers()
      sendResponse(res, {
         success :true,
         statusCode: httpStatus.OK,
         message: "all users retrived successfully",
         data: allUsers
      })
  }

  const blockUser= async()=>{

  }

export const UserController= { createUser ,getAllUsers ,blockUser}