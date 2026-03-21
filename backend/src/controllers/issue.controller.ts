import { AuthRequest } from "../types/authRequest";
import { Response } from "express";
import { addIssueService ,changeColumnService,assignIssueService} from "../services/issue.services";
import { IssueType ,PriorityType} from "../../generated/prisma/enums";
import { User } from "../../generated/prisma/client";
export const addIssue= async (req:AuthRequest,res:Response)=>{
    try{
        const issue= await addIssueService(
            req.params.boardId as string,
            req.body.title as string,
            req.body.description as string,
            req.body?.storyId || null,
            req.user!.id as string,
            req.params.columnId as string,
            (req.body.type as IssueType) || IssueType.TASK,
            (req.body.priority as PriorityType) || PriorityType.MEDIUM,
            req.body?.dueDate as Date,     
        )
        return res.status(201).json({
            message: "Issue Created Successfully",
            data: issue
        });
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const changeColumn= async (req:AuthRequest,res:Response)=>{
    try{
        const changeColumn= await changeColumnService(
            req.params.boardId as string,
            req.user!.id as string,
            req.params.projecId as string,
            req.params.columnId as string,
            req.params.issueId as string,
            req.params.toColumnId as string,
            req.body.toOrder as number,

        );
        return res.status(200).json({
            message:"Column Changed Successful",
            data:changeColumn
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const assignIssue= async (req:AuthRequest,res:Response)=>{
    try{
        const assignIssue= await assignIssueService(
            req.params.projecId as string,
            req.user as User,
            req.params.assigneeId as string,
            req.params.issueId as string,
        )
        return res.status(200).json({
            message:"User assigned Successfully",
            data:assignIssue
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}