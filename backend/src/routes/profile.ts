import { userAuth } from "../middlewares/userAuth";
import  express  from "express";
import { sanitizeUser } from "../utils/sanitizeUser";
import bcrypt from 'bcrypt';
import { isEditabel } from "../utils/validateEditable";
import {prisma} from "../prisma";
import { Response } from "express";
const profileRouter=express.Router();
import { AuthRequest } from "../types/authRequest";
import { User} from "../../generated/prisma/client";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
profileRouter.get("/profile", userAuth,async (req:AuthRequest,res:Response)=>{
    try{
        const user=req.user!;
        const safeUser=sanitizeUser(user);
        return res.json({
            user:safeUser
        })
    }catch(err:any){
        res.status(500).json({
        message: "Something went wrong"
    });
    }
});

profileRouter.patch("/profile/edit",userAuth, async (req:AuthRequest,res:Response)=>{
    try{
        const isOk=isEditabel(req);
        if(!isOk){
            return res.status(403).json({
                message:"Can't be editted"
            })
        }
        const user=req.user!;
        await prisma.user.update({
            where:{id:user.id},
            data:req.body
        })
        res.json({
            message:"Profile Updated Successfully"
        })
    }catch(err:any){
        res.status(500).json({
        message:"Something went wrong"
    })
}
})

profileRouter.post("/profile/avatar",userAuth, upload.single("avatar"),async (req:AuthRequest,res:Response)=>{
    try{
        if(!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }
        const user=req.user!;
        const file=req.file!;
        if(user.public_id!==null){
            await cloudinary.uploader.destroy(user.public_id);
        }
        const result= await cloudinary.uploader.upload(file.path);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                public_id: result.public_id,
                avatarUrl: result.secure_url
            }
        });
        fs.unlinkSync(file.path);
        res.json({
            message:"Uploaded",
            avatarUrl:result.secure_url
        })
    }catch(err:any){
        res.status(500).json({
            message:"Upload failed"
        })
    }
})
profileRouter.patch("/profile/password",userAuth,async (req:AuthRequest,res:Response)=>{
    try{
        const {oldPassword,newPassword}=req.body;
        const user=req.user!;
        if(!oldPassword || !newPassword){
            return res.status(400).json({
                message:"Both passwords are required"
            });
        }
        const isValidPassword=await bcrypt.compare(oldPassword,user.password);
        if(!isValidPassword){
            return res.status(400).json({
                message:"old password is incorrect"
            })
        }
        const passwordHash=await bcrypt.hash(newPassword,10);
        await prisma.user.update({
            where:{id:user.id},
            data:{password:passwordHash}
        });
        res.json({
            message:"Password updated Successfully"
        });
    }catch(err:any){
        res.status(401).json({
            message:"Not Authorised"
        })
    }
});


profileRouter.get("/profile/projects", userAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user: User = req.user!;
    const memberships = await prisma.projectMember.findMany({
      where:{
        userId: user.id
      },
      include: {
        project: true
      }
    });
    res.json({
      message: "List of user projects",
      data: memberships
    });
    }catch (err: any) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
});
export {profileRouter};