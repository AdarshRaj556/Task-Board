import express from "express";
import { Response,Request } from "express";
import bcrypt from 'bcrypt';
import { validateSignup } from "../utils/validateSignup";
import {prisma} from "../prisma";
import jwt  from "jsonwebtoken";
import { sanitizeUser } from "../utils/sanitizeUser";
interface JwtPayload {
  userId: string;
}
const authRouter=express.Router();


authRouter.post("/signup", async (req:Request, res:Response) => {
    try {
        validateSignup(req);
        const { firstName,middleName, lastName, password, email,avatarUrl,role} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const finalAvatarUrl =
            avatarUrl && avatarUrl.trim() !== "" ? avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName)}`;
        const lowerEmail=email.trim().toLowerCase();
        const user = await prisma.user.create({
            data: {
                firstName,
                middleName,
                lastName,
                email:lowerEmail,
                role,
                password: passwordHash,
                avatarUrl:finalAvatarUrl,
            }
        });
        const safeUser=sanitizeUser(user);
        res.status(201).json({
            message: "User saved successfully",
            user:safeUser,
        });

    } catch (err: any) {
        if (err.code === "P2002") {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        res.status(400).json({
            message: err.message
        });
    }
});

authRouter.post("/login", async (req:Request, res:Response) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const user = await prisma.user.findUnique({
      where: { email }
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const isValidPassword = await bcrypt.compare(password,user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id },process.env.JWT_SECRET_KEYS as string,{ expiresIn: "15m" });
    const refreshToken=jwt.sign({userId:user.id},process.env.JWT_REFRESH_KEYS as string,{expiresIn:"7d"});
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });
    res.cookie("token",token,{expires: new Date(Date.now()+ 60*15*1000)});
    res.cookie("refreshToken", refreshToken, {httpOnly: true,expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)});
    const safeUser=sanitizeUser(user);
    return res.status(200).json({
      message: "Login successful",
      user:safeUser,
    });
   }catch (error) {
    return res.status(500).json({
      message: "Internal server error"
    });
   }
});


authRouter.post("/refresh", async (req:Request, res:Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({
        message: "token missing"
      });
    }
    const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_KEYS as string) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token"
      });
    }
    const newAccessToken = jwt.sign({ userId: user.id },process.env.JWT_SECRET_KEYS as string,{ expiresIn: "15m" });
    res.cookie("token", newAccessToken, {httpOnly: true,expires: new Date(Date.now() + 15 * 60 * 1000)});
    return res.json({
      message: "Access token refreshed"
    });
    }catch (err) {
    return res.status(401).json({
      message: "Invalid refresh token"
    });
  }
});

authRouter.post("/logout",async (req:Request,res:Response)=>{
    try{
        const {refreshToken}=req.cookies;
        if (refreshToken){
            const decoded=jwt.verify(refreshToken,process.env.JWT_REFRESH_KEYS as string) as JwtPayload;
            await prisma.user.update({
                where:{id:decoded.userId},
                data:{refreshToken:null}
            });
        }
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.json({
            message:"logged out successfully"
        });
    }catch(err){
        return res.json({message: "Logged out"});
    }
})
export {authRouter};