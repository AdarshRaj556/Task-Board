import { User } from "../../generated/prisma/client";

function sanitizeUser(user: User) {
  const { password, refreshToken,public_id, ...safeUser } = user;
  return safeUser;
}

export {sanitizeUser};