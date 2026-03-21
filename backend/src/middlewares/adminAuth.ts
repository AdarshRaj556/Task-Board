import { Request,Response,NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
const adminAuth=async (req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const user=req.user!;   
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Forbidden: Admin access required"
            });
        }
        next();
    }catch(err:any){
        res.status(403).json({
            message:"Forbidden:Admin access required"
        })
    }
}

export  {adminAuth};