import { Prisma } from "../../generated/prisma/client";
import { AuditType } from "../../generated/prisma/enums";
export async function auditLog(tx:Prisma.TransactionClient,oldValue:string, newValue:string,issueId:string,type:AuditType) {
    await tx.auditLog.create({
        data:{
            oldValue,
            newValue,
            issueId,
            type
        }
    })
}
