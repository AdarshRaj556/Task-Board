import { Column, Issue, User } from "../../generated/prisma/client";
import { NotificationType } from "../../generated/prisma/enums";
import { Prisma } from "../../generated/prisma/client";
import { makeUsername } from "./miscellaneous";
import { prisma } from "../prisma";

export async function taskStatusChanged(
    tx: Prisma.TransactionClient,
    projectId: string,
    issue: Issue,
    column: Column,
    toColumn: Column,
    userId: string,
) {
    const members = await tx.projectMember.findMany({
        where: { projectId },
        include: { user: true }
    });
    const notifications = members
        .filter(m => m.user.id !== userId)
        .map(m => ({
            userId: m.user.id,
            actorId: userId,
            message: `${issue.title} moved from ${column.name} to ${toColumn.name}`,
            issueId: issue.id,
            type: NotificationType.TASK_STATUS_CHANGED,
        }));
    if (notifications.length > 0) {
        await tx.notification.createMany({ data: notifications });
    }
}

export async function taskAssignedToUser(
    tx: Prisma.TransactionClient,
    userId: string,
    actor: User,
    issue: Issue,
) {
    await tx.notification.create({
        data: {
            userId,
            actorId: actor.id,
            message: `${issue.title} is assigned to you by ${makeUsername(actor)}`,
            issueId: issue.id,
            type: NotificationType.TASK_ASSIGNED,
        }
    });
}

export async function commentAddedToTask(
    tx: Prisma.TransactionClient,
    commentId: string,
    user: User,
    issue: Issue,
) {
    const toNotify = new Set<string>();
    const commenterId = user.id;
    if (issue.assigneeId && issue.assigneeId !== commenterId) {
        toNotify.add(issue.assigneeId);
    } else if (!issue.assigneeId && issue.reporterId && issue.reporterId !== commenterId) {
        toNotify.add(issue.reporterId);
    }
    if (toNotify.size === 0) return;

    const notifications = Array.from(toNotify).map(userId => ({
        userId,
        actorId: commenterId,
        issueId: issue.id,
        commentId,
        message: `${makeUsername(user)} commented on ${issue.title}`,
        type: NotificationType.COMMENT_ADDED,
    }));
    await tx.notification.createMany({ data: notifications });
}

export async function userMentionedInComment(
    tx: Prisma.TransactionClient,
    commentId: string,
    user: User,
    issue: Issue,
    mentionedIds: string[],
) {
    const toNotify = new Set(mentionedIds.filter(id => id !== user.id));
    if (toNotify.size === 0) return;

    const notifications = Array.from(toNotify).map(userId => ({
        userId,
        actorId: user.id,
        issueId: issue.id,
        commentId,
        message: `you are mentioned by ${makeUsername(user)} on ${issue.title}`,
        type: NotificationType.USER_MENTIONED,
    }));
    await tx.notification.createMany({ data: notifications });
}

export async function notifyProjectAdmin(projectAdminIds: string[], issue: Issue) {
    if (projectAdminIds.length === 0) return;
    const notifications = projectAdminIds.map(userId => ({
        userId,
        issueId: issue.id,
        message: `No user is assigned on ${issue.title}`,
        type: NotificationType.NO_USER_ASSIGNED,
    }));
    await prisma.notification.createMany({ data: notifications });
}
