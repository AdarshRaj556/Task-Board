import { commentAddedToTask, userMentionedInComment } from "../utils/notification";
import { prisma } from "../prisma";
import { AuditType, User } from "../../generated/prisma/client";
import { auditLog } from "../utils/auditLog";
import { extractMentions } from "../utils/miscellaneous";
export const postCommentService= async (user: User, comment:string, issueId:string)=>{
    const validComment= comment.trim();
    if(!validComment){
        throw new Error("comment should not be empty");
    }
    const issue= await prisma.issue.findUnique({
        where:{
            id:issueId
        }
    })
    if(!issue) throw new Error("Issue must exist to comment");
    await prisma.$transaction( async (tx)=>{
        const newComment= await tx.comment.create({
            data:{
                userId: user.id,
                issueId,
                comment
            }
        })
        
        const mentionedEmails = extractMentions(validComment);
        let mentionedUsers: User[] = [];
        if (mentionedEmails.length > 0) {
            mentionedUsers = await tx.user.findMany({
                where: {
                    email: { in: mentionedEmails }
                }
            });
        }
        const mentionedIds = mentionedUsers.map(u => u.id);
        await userMentionedInComment(tx,newComment.id,user,issue,mentionedIds);
        await commentAddedToTask(tx,newComment.id,user,issue);
        await auditLog(tx,"",comment,issueId,AuditType.COMMENT_ADDED);
    })
}

export const editCommentService= async (user:User,issueId:string,commentId:string,newComment:string)=>{
    const issue= await prisma.issue.findUnique({
        where:{
            id:issueId
        }
    })
    if(!issue) throw new Error("Issue must exist to comment");
    const validNewComment= newComment.trim();
    if(!validNewComment){
        throw new Error("new comment should not be empty");
    }
    const comment = await prisma.comment.findUnique({
        where:{
            id:commentId
        }
    })
    if(!comment) throw new Error("Comment does not exist");
    if( comment.issueId !== issueId){
        throw new Error("comment does not belong to this issue");
    }

    if(comment.userId!== user.id){
        throw new Error("Not allowed to edit comment")
    }
    const oldComment= comment.comment;
    await prisma.$transaction(async (tx)=>{
        await tx.comment.update({
            where:{
                id:comment.id
            },
            data:{
                comment:newComment
            }
        })

    })
}

