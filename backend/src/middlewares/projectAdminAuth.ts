import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";
import { AuthRequest } from "../types/authRequest";

const projectAdminAuth = async (req: AuthRequest,res: Response,next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const  projectId  = req.params.projectId as string;

    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (member?.role ==="PROJECT_ADMIN") {
      return next();
    }
    return res.status(403).json({
        message: "Access denied. Project Admin  only.",
      });
  } catch (error) {
    return res.status(500).json({
      message: "Server error 1",
    });
  }
};

export { projectAdminAuth };