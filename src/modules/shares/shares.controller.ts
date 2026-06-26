import { Request, Response } from "express";
import * as sharesService from "./shares.service";

export async function inviteHandler(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "email is required" });
    return;
  }
  const share = await sharesService.inviteUser(req.user.id, email);
  res.status(201).json({ success: true, data: share });
}

export async function listSharesHandler(req: Request, res: Response): Promise<void> {
  const shares = await sharesService.listShares(req.user.id);
  res.json({ success: true, data: shares });
}

export async function acceptShareHandler(req: Request, res: Response): Promise<void> {
  const shareId = typeof req.body.shareId === "string" ? req.body.shareId : undefined;
  if (!shareId) {
    res.status(400).json({ success: false, message: "shareId is required" });
    return;
  }
  const share = await sharesService.acceptShare(req.user.id, shareId);
  res.json({ success: true, data: share });
}

export async function revokeShareHandler(req: Request, res: Response): Promise<void> {
  const share = await sharesService.revokeShare(req.user.id, String(req.params.id));
  res.json({ success: true, data: share });
}

export async function inviteByIdHandler(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ success: false, message: "userId is required" });
    return;
  }
  const share = await sharesService.inviteUserById(req.user.id, userId);
  res.status(201).json({ success: true, data: share });
}
