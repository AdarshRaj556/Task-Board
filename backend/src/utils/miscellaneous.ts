import { Prisma, User } from "../../generated/prisma/client";
import { validateEmail } from "./validateSignup";
export function makeUsername(user:User){
    const userName = [user.firstName, user.middleName, user.lastName].filter(name => name !== "").join(" ");
    return userName;
}

export async function isProjectMember(tx:Prisma.TransactionClient,userId:string,projectId:string){
    const member = await tx.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if(!member){
        throw new Error("Must be Project Member")
    }
}


export function extractMentions(comment: string): string[] {
    const regex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
    const mentions: string[] = [];

    let match;
    while ((match = regex.exec(comment)) !== null) {
        const email = match[1];
        if (validateEmail(email)) {
            mentions.push(email);
        }
    }
    return mentions;
}