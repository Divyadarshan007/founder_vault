import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface TokenPayload {
  id: string;
}

export function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { id: userId } as TokenPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: userId } as TokenPayload,
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
