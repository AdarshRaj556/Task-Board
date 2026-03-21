import express  from "express"
import { AuthRequest } from "../types/authRequest";
import { Response } from "express";
import { userAuth } from "../middlewares/userAuth";
import {prisma} from "../prisma";
const projectRouter=express.Router();


projectRouter.get("/allMember/:projectId",userAuth, async (req:AuthRequest,res:Response)=>{
    try{
        const userId=req.user!.id;
        const projectId= req.params.projectId as string;

        const isMember= await prisma.projectMember.findUnique({
            where:{
                userId_projectId:{
                    userId,
                    projectId
                }
            }
        })
        if(!isMember){
            return res.status(404).json({
                message:"Not Member of this project "
            })
        }
        const projectMember= await prisma.projectMember.findMany({
            where:{
                projectId:projectId,
                NOT:{
                    userId:userId
                }
            },
            include:{
                user:{
                    select:{
                        email:true,
                        firstName:true,
                        middleName:true,
                        lastName:true,
                        id:true,  
                    }
                }
            }
        })
    
        return res.status(200).json({
            data:projectMember
        })
    }catch(err:any){
        res.status(404).json({
            message:"Members not found"
        })
    }
})

export {projectRouter}