import express from 'express';
import { Response } from 'express';
import { userAuth } from '../middlewares/userAuth';
import { AuthRequest } from '../types/authRequest';
import { prisma } from '../prisma';

const notificationRouter = express.Router();

notificationRouter.get("/", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user!.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return res.status(200).json({ data: notifications });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

notificationRouter.get("/unread-count", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user!.id, isRead: false }
        });
        return res.status(200).json({ data: count });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

notificationRouter.patch("/read-all", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user!.id, isRead: false },
            data: { isRead: true }
        });
        return res.status(200).json({ message: "All marked as read" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

notificationRouter.patch("/:id/read", userAuth, async (req: AuthRequest, res: Response) => {
    try {
        await prisma.notification.update({
            where: { id: req.params.id as string },
            data: { isRead: true }
        });
        return res.status(200).json({ message: "Marked as read" });
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

export { notificationRouter };
