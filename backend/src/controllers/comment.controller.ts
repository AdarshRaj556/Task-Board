import { AuthRequest } from "../types/authRequest";
import { Response } from "express";
import { User } from "../../generated/prisma/client";
import { postCommentService } from "../services/comment.services";
export const postComment = async (req:AuthRequest,res:Response)=>{
    try{
        const postComment= await postCommentService(
            req.user as User,
            req.body.comment as string,
            req.params.issueId as string,
        )
        return res.status(200).json({
            message:"Comment Posted Successfully",
            data:postComment
        })
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error "
        });
    }
}
