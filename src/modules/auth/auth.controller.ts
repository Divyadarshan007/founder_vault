import { Request, Response } from "express";
import * as authService from "./auth.service";

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: "Refresh token required" });
    return;
  }
  const result = await authService.refresh(refreshToken);
  res.json({ success: true, data: result });
}

export async function logoutHandler(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: "Logged out" });
}
