import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { createBoard,addColumn,deleteColumn, renameColumn } from '../controllers/board.controller';
import { projectAdminAuth } from '../middlewares/projectAdminAuth';
import { AuthRequest } from '../types/authRequest';
import { Response } from 'express';
import { prisma } from '../prisma';
const boardRouter= express.Router();


boardRouter.get("/boards/:projectId", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        const boards = await prisma.board.findMany({
            where: { projectId: req.params.projectId as string },
            include: { columns: { orderBy: { order: 'asc' } } }
        });
        return res.status(200).json({ data: boards });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

boardRouter.get("/:projectId/:boardId", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        const board = await prisma.board.findUnique({
            where: { id: req.params.boardId as string },
            include: {
                columns: {
                    orderBy: { order: 'asc' },
                    include: {
                        issues: {
                            orderBy: { order: 'asc' },
                            include: {
                                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                                reporter: { select: { id: true, firstName: true, lastName: true } }
                            }
                        }
                    }
                }
            }
        });
        if (!board) return res.status(404).json({ message: "Board not found" });
        return res.status(200).json({ data: board });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

boardRouter.post("/createBoard/:projectId",userAuth, projectAdminAuth,createBoard)

boardRouter.post("/column/:projectId/:boardId",userAuth,projectAdminAuth,addColumn);

boardRouter.patch("/column/:projectId/:columnId",userAuth,projectAdminAuth,renameColumn)

boardRouter.delete("/column/:projectId/:boardId/:columnId",userAuth,projectAdminAuth,deleteColumn)

export {boardRouter}