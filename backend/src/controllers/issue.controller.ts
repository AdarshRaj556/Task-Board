import { AuthRequest } from "../types/authRequest";
import { Response } from "express";
import { addIssueService ,changeColumnService,assignIssueService, editIssueService, deleteIssueService, getIssueActivityService } from "../services/issue.services";
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
            req.params.projectId as string,
            req.body.fromColumnId as string,
            req.params.issueId as string,
            req.params.toColumnId as string,
            req.body.toOrder as number,

        );
        return res.status(200).json({
            message:"Column Changed Successful",
            data:changeColumn
        })
    }catch(err: any){
        const isWip = err.message?.includes("WIP limit");
        return res.status(isWip ? 400 : 500).json({
            message: err.message || "Internal Server Error"
        })
    }
}

export const assignIssue= async (req:AuthRequest,res:Response)=>{
    try{
        const assignIssue= await assignIssueService(
            req.params.projectId as string,
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

export const editIssue = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const issue = await editIssueService(req.params.issueId as string, {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(priority !== undefined && { priority: priority as PriorityType }),
            ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        });
        return res.status(200).json({ message: "Issue updated", data: issue });
    } catch (err: any) {
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
    try {
        await deleteIssueService(req.params.issueId as string);
        return res.status(200).json({ message: "Issue deleted" });
    } catch (err: any) {
        return res.status(404).json({ message: err.message || "Issue not found" });
    }
};

export const getIssueActivity = async (req: AuthRequest, res: Response) => {
    try {
        const activity = await getIssueActivityService(req.params.issueId as string);
        return res.status(200).json({ data: activity });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};