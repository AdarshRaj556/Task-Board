import { Column, Issue, User,Comment } from "../../generated/prisma/client";
import { NotificationType } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";
import { makeUsername } from "./miscellaneous";
import { prisma } from "../prisma";
export async function taskStatusChanged(tx:Prisma.TransactionClient,projectId:string,
    issue:Issue,column:Column,
    toColumn:Column,userId:string,) {
        const members = await tx.projectMember.findMany({
                where:{
                    projectId:projectId,
                },
                include:{
                    user:true
                }
            })
        const notifications = members
            .filter(member => member.user.id !== userId)
            .map(member => ({
                userId: member.user.id as string,
                actorId: userId as string,
                message:`${issue.title} moved from ${column.name} to ${toColumn.name}`,
                issueId:issue.id,
                type: NotificationType.TASK_STATUS_CHANGED,
            }));
        await tx.notification.createMany({
            data: notifications
        });
}


export async function taskAssignedToUser(tx:Prisma.TransactionClient,userId:string,actor:User,issue:Issue) {
    const actorName= makeUsername(actor);
    await tx.notification.create({
        data:{
            userId:userId as string,
            actorId:actor.id as string,
            message:`${issue.title} is assigned to you by ${actorName}`,
            issueId:issue.id,
            type:NotificationType.TASK_ASSIGNED
        }
    })
}


export async function commentAddedToTask(tx:Prisma.TransactionClient,commentId: string,user: User,issue: Issue) {
    const toNotify = new Set<string>();
    const commenterId = user.id;
    const username= makeUsername(user);
    if (issue.assigneeId && issue.assigneeId !== commenterId) {
        toNotify.add(issue.assigneeId);
    }
    if (!issue.assigneeId && issue.reporterId && issue.reporterId !== commenterId) {
        toNotify.add(issue.reporterId);
    }
    const notifications = Array.from(toNotify).map((userId) => ({
        userId,
        actorId: commenterId,
        issueId: issue.id,
        commentId:commentId,
        message: `${username} commented on ${issue.title}`,
        type: NotificationType.COMMENT_ADDED,
    }));
    await tx.notification.createMany({
        data: notifications,
    });
}

export async function userMentionedInComment(tx:Prisma.TransactionClient,commentId:string,user:User,issue:Issue,mentionedIds:string[]){
    const toNotify = new Set<string>();
    const commenterId = user.id;
    const username= makeUsername(user);
    mentionedIds.forEach((mentionedId) => {
        if (mentionedId !== commenterId) {
            toNotify.add(mentionedId);
        }
    });

    const notifications = Array.from(toNotify).map((userId) => ({
        userId,
        actorId: commenterId,
        issueId: issue.id,
        commentId:commentId,
        message: `you are mentioned by ${username} on ${issue.title}`,
        type: NotificationType.USER_MENTIONED,
    }));
    await tx.notification.createMany({
        data: notifications,
    });
}

export async function notifyProjectAdmin(projectAdminIds: string[],issue: Issue) {
    const notifications = projectAdminIds.map((projectAdminId) => ({
        userId: projectAdminId,
        issueId: issue.id,
        message: `No user is assigned on ${issue.title}`,
        type: NotificationType.NO_USER_ASSIGNED,
    }));

    await prisma.notification.createMany({
        data: notifications,
    });
}