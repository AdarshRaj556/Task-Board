import { Request } from "express";
import { User } from "../../generated/prisma/client";
import  "multer";
export interface AuthRequest extends Request {
  user?: User;
  file?: Express.Multer.File;
}