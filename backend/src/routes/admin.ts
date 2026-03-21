import express  from "express";
import { Response } from "express";
import { userAuth } from "../middlewares/userAuth";
import { adminAuth } from "../middlewares/adminAuth";
import {prisma} from "../prisma";
const adminRouter=express.Router();
import { AuthRequest } from "../types/authRequest";
import { User } from "../../generated/prisma/client";
import { ProjectRole } from "../../generated/prisma/enums";
adminRouter.post("/admin/createProject",userAuth,adminAuth,async (req:AuthRequest,res:Response)=>{
    try{
        const {name,description}=req.body;
        const user=req.user!;
        if (!name || !description) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const project=await prisma.project.create({
            data:{
                name,
                description
            }
        });
        const projectMember=await prisma.projectMember.create({
            data:{
                userId:user.id,
                projectId:project.id,
                role:"GLOBAL_ADMIN"
            }
        });
        res.status(201).json({
            message:"Project Created",
            project
        });
    }catch(err:any){
        if (err.code === "P2002") {
            return res.status(400).json({
                message: "Project with this name already exists"
            });
        }
        res.status(500).json({
            message:"Something went wrong"
        })
    }
})

adminRouter.post("/admin/project/addMember/:projectId/:role",userAuth,async (req: AuthRequest, res: Response) => {
    try {
      const  projectId  = req.params.projectId as string;
      const userId=req.user!.id;
      const role=req.params.role as ProjectRole;
      const allEmails: string[] = (req.body?.emails || [])
            .map((email: string) => email?.trim().toLowerCase())
            .filter((email: string) => email);
      const userRole=await prisma.projectMember.findUnique({
        where:{
            userId_projectId:{
                userId:userId,
                projectId:projectId
            }
        }
      });
      if (userRole?.role!=="GLOBAL_ADMIN" && userRole?.role!=="PROJECT_ADMIN"){
        return res.status(403).json({
            message:"Forbidden"
        })
      }
      if (allEmails.length === 0) {
        return res.status(400).json({
          message: "Emails required"
        });
      }
      const users:User[]= await prisma.user.findMany({
        where: {
          email: { in: allEmails }
        }
      });
      if (users.length !== allEmails.length) {
        return res.status(404).json({
          message: "Some users not found"
        });
      }
      for (const user of users) {
        try{
            await prisma.projectMember.create({
            data: {
                userId: user.id,
                projectId: projectId,
                role:role
            }
        });
        }catch(e){

        }
      }
      res.status(201).json({
        message: "Members successfully added"
      });
    } catch (err: any) {
      res.status(500).json({
        message: err.message
      });
    }
  }
);

adminRouter.patch("/admin/assignRole/:projectId/:userId/:role",userAuth,async (req:AuthRequest,res:Response)=>{
    try{
        const userId_projectAdmin_or_GlobalAdminId=req.user!.id;
        const userId=req.params.userId as string;
        const projectId=req.params.projectId as string;
        const role= req.params.role as ProjectRole;
        const toCheck= await prisma.projectMember.findUnique({
            where:{
                userId_projectId:{
                    projectId:projectId,
                    userId:userId_projectAdmin_or_GlobalAdminId
                }
            }
        })
        if(toCheck===null|| toCheck.role==="MEMBER"|| toCheck.role==="PROJECT_VEIWER"){
            return res.status(403).json({
                message:"Not Authorised"
            })
        }
        const updateMember= await prisma.projectMember.update({
            where:{
                userId_projectId:{
                    userId:userId,
                    projectId:projectId
                }
            },
            data:{
                role:role
            }
        });
        res.json({
            message:"Role Updated Successfully",
            data:updateMember
        })
    }catch(err:any){
        res.status(500).json({
            message:"Error in Updating",
            error:err.message
        })
    }
})


//TODO 
//remove user by admin and project admin 

export {adminRouter};