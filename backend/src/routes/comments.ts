import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { projectMemberAuth } from '../middlewares/projectMemberAuth';
import { postComment } from '../controllers/comment.controller';
import { AuthRequest } from '../types/authRequest';
import { Response } from 'express';
import { prisma } from '../prisma';

const commentRouter = express.Router({ mergeParams: true });

commentRouter.get("/:boardId/:issueId/comments", userAuth, projectMemberAuth, async (req: AuthRequest, res: Response) => {
    try {
        const comments = await prisma.comment.findMany({
            where: { issueId: req.params.issueId as string },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        return res.status(200).json({ data: comments });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

commentRouter.post("/:boardId/:issueId/comments", userAuth, projectMemberAuth, postComment);

commentRouter.patch("/:boardId/:issueId/:commentId", userAuth, projectMemberAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const { comment } = req.body;
        if (!comment?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

        const existing = await prisma.comment.findUnique({ where: { id: commentId as string } });
        if (!existing) return res.status(404).json({ message: "Comment not found" });
        if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Can only edit your own comments" });

        const updated = await prisma.comment.update({
            where: { id: commentId as string },
            data: { comment: comment.trim() },
            include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } }
        });
        return res.status(200).json({ data: updated });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

commentRouter.delete("/:boardId/:issueId/:commentId", userAuth, projectMemberAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const existing = await prisma.comment.findUnique({ where: { id: commentId as string } });
        if (!existing) return res.status(404).json({ message: "Comment not found" });
        if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Can only delete your own comments" });

        await prisma.comment.delete({ where: { id: commentId as string } });
        return res.status(200).json({ message: "Comment deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

export { commentRouter };
