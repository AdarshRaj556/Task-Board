import { taskAssignedToUser, taskStatusChanged } from "../utils/notification";
import { AuditType, IssueType, NotificationType, PriorityType } from "../../generated/prisma/enums";
import { User } from "../../generated/prisma/client";
import { prisma } from "../prisma";
import { auditLog } from "../utils/auditLog";
import { isProjectMember, makeUsername } from "../utils/miscellaneous";


export const addIssueService = async (boardId:string,title: string,description: string,
    storyId: string | null,userId: string,
    columnId: string,issueType:IssueType,priority:PriorityType,dueDate: Date | null) => {
        if(storyId){
            if(issueType===IssueType.STORY){
                throw new Error("Inside story task and bug are the only issuetype");
            }
        }
        const lastIssue= await prisma.issue.findFirst({
            where:{
                columnId,
            },
            orderBy:{order:"desc"}
        })
        const newOrder= lastIssue ? lastIssue.order+1:1;
        const issue = await prisma.issue.create({
            data: {
                boardId,
                title,
                description,
                order:newOrder,
                reporterId: userId,
                columnId,
                dueDate,
                type: issueType,
                priority,
                ...(storyId && { storyId })
            }
        });
        return issue;
};


export const changeColumnService = async (boardId:string,userId:string,
    projectId:string,columnId: string,
    issueId: string,toColumnId: string,toOrder: number)=>{
    await prisma.$transaction(async (tx) => {
        const column = await tx.column.findUnique({
            where:{
                id:columnId
            }
        })
        if ( !column){
            throw new Error("Column not found");
        }
        const toColumn= await tx.column.findUnique({
            where:{
                id:toColumnId,
            }
        })
        if(!toColumn) throw new Error("toColumn not found");
        const issue = await tx.issue.findUnique({
            where: { id: issueId }
        });
        if (!issue) throw new Error("Issue not found");

        if (column.boardId !== boardId) {
            throw new Error("Column does not belong to this project");
        }

        if (toColumn.boardId !== boardId) {
            throw new Error("Target column does not belong to this project");
        }

        if (issue.boardId !== boardId) {
            throw new Error("Issue does not belong to this project");
        }

        if (issue.boardId !==boardId) {
            throw new Error("Issue is not in the specified source column");
        }

        const fromOrder = issue.order;
        const count = await tx.issue.count({
            where: {
                columnId: toColumnId
            }
        });
        let safeToOrder = toOrder;
        if(safeToOrder<0){
            safeToOrder=0;
        }
        const maxOrder= columnId===toColumnId ? count-1:count;
        if( safeToOrder>maxOrder) safeToOrder=maxOrder;
        
        if(columnId===toColumnId){
            if (safeToOrder === fromOrder) return;
            if (safeToOrder > fromOrder) {
                await tx.issue.updateMany({
                    where: {
                        columnId,
                        order: {
                            gt: fromOrder,
                            lte: safeToOrder
                        }
                    },
                    data: {
                        order: { decrement: 1 }
                    }
                });
            } else {
                await tx.issue.updateMany({
                    where: {
                        columnId,
                        order: {
                            gte: safeToOrder,
                            lt: fromOrder
                        }
                    },
                    data: {
                        order: { increment: 1 }
                    }
                });
            }
            await tx.issue.update({
                where: { id: issueId },
                data: {
                    order: safeToOrder
                }
            });

            return;
        }
        await tx.issue.updateMany({
            where: {
                columnId,
                order: { gt: fromOrder }
            },
            data: {
                order: { decrement: 1 }
            }
        });
        await tx.issue.updateMany({
            where: {
                columnId: toColumnId,
                order: { gte: safeToOrder }
            },
            data: {
                order: { increment: 1 }
            }
        });
        await tx.issue.update({
            where: { id: issueId },
            data: {
                columnId: toColumnId,
                order: safeToOrder
            }
        });
        await taskStatusChanged(tx,projectId,issue,column,toColumn,userId);
        await auditLog(tx,column.name,toColumn.name,issueId,AuditType.STATUS_CHANGED);
    });
}


export const assignIssueService = async (projectId:string,actor:User,assigneeId:string,issueId:string)=>{
    await prisma.$transaction( async (tx)=>{
        const assignee= await tx.user.findUnique({
            where:{
                id:assigneeId
            }
        })
        if(!assignee)throw new Error("Assignee not found");
        const issue= await  tx.issue.findUnique({
            where:{
                id:issueId,
            },
            include:{
                assignee:true
            }
        })
        if(!issue) throw new Error("Issue is not present");
        await isProjectMember(tx,assigneeId,projectId);

        if (issue.assigneeId && issue.assigneeId !== assigneeId) {
            const previousAssigned = issue.assignee ? makeUsername(issue.assignee): "Unknown";
            const newAssigned = makeUsername(assignee);
            await auditLog(tx,previousAssigned,newAssigned,issueId,AuditType.ASSIGNEE_CHANGED);
        }
        await tx.issue.update({
            where:{
                id:issueId
            },
            data:{
                assigneeId:assigneeId,
            }
        })
        if( actor.id!==assigneeId){
            await taskAssignedToUser(tx,assigneeId,actor,issue)
        }
    })
}