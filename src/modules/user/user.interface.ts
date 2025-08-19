import type { Types } from "mongoose"

export enum Role{
      SUEPR_ADMIN="SUPER_ADMIN",
      ADMIN= "ADMIN",
      USER="USER",
      RIDER="RIDER",
      DRIVER="DRIVER"
}

export interface IAuthProvider{
      provider:string,
      providerId:string
}
 export enum IsActive{
      ACTIVE="ACTIVE",
      INACTIVE="INACTIVE",
      BLOCKED="BLOCKED"
 }
export interface IUser{
      _id?: string,
     name: string,
     email: string,
     password?: string,
     phone?: string,
     picture?: string,
     address?: string,
     isDeleted?: string,
     isActive?: IsActive,
     isVerified?: string,
     auths: IAuthProvider[],
     role:Role,
     bookings?: Types.ObjectId[],
     guides?: Types.ObjectId[]
}