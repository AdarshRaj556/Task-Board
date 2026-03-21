import { prisma } from "../prisma";

export const createBoardService = async (projectId: string,name: string) => {
    const board = await prisma.board.create({
        data: {
            projectId,
            name,
            columns: {
                create: [
                    { name: "To Do", order: 1, wipLimit: 10, isFinal: false },
                    { name: "In Progress", order: 2, wipLimit: 5, isFinal: false },
                    { name: "Review", order: 3, wipLimit: 5, isFinal: false },
                    { name: "Done", order: 4, wipLimit: 100, isFinal: true }
                ]
            }
        },
        include: {
            columns: true,
        }
    });
    return board;
};

export const addColumnService = async (boardId:string, name:string,wipLimit:number)=>{
    const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: "desc" }
    })
    const newOrder = lastColumn ? lastColumn.order + 1 : 1
    await prisma.column.create({
        data:{
            boardId,
            name,
            wipLimit,
            order: newOrder
        }
    })
}

export const renameColumnService = async (columnId:string,name:string)=>{
    const column= await prisma.column.update({
        where:{
            id:columnId
        },
        data:{
            name:name
        }
    })
    return column;
}

export const deleteColumnService = async (columnId: string, boardId: string) => {
    const column = await prisma.column.findUnique({
        where: { id: columnId }
    });
    if (!column) {
        throw new Error("Column not found");
    }
    const deletedOrder = column.order;
    await prisma.$transaction([
        prisma.column.delete({
            where: { id: columnId }
        }),
        prisma.column.updateMany({
            where: {
            boardId,
            order: { gt: deletedOrder }
        },
        data: {
            order: { decrement: 1 }
        }
    })
    ]);
};