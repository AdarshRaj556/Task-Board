import  { Request, Response, NextFunction } from "express";

const cookieParser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const str = req.headers?.cookie;
    const cookies: Record<string, string> = {};
    if (!str) {
      (req as any).cookies = cookies;
      return next();
    }
    let key = "";
    let value = "";
    let flag = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === " ") continue;
      if (str[i] === ";") {
        cookies[key] = decodeURIComponent(value);
        key = "";
        value = "";
        flag = 0;
        continue;
      }
      if (str[i] === "=") {
        flag = 1;
        continue;
      }
      if (flag === 0) {
        key += str[i];
      } else {
        value += str[i];
      }
    }
    if (key.length !== 0) {
      cookies[key] = decodeURIComponent(value);
    }
    (req as any).cookies = cookies;
    next();
   }catch (err) {
    next(err);
   }
};
export { cookieParser };