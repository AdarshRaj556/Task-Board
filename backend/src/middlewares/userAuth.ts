import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { Request, Response, NextFunction } from "express";
interface JwtPayload {
  userId: string;
}
import { AuthRequest } from "../types/authRequest";
export const userAuth = async (req: AuthRequest,res: Response,next: NextFunction) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEYS as string) as JwtPayload;
    const user = await prisma.user.findUnique({where: { id: decoded.userId }});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};