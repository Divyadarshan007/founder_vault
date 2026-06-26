import { Request, Response } from "express";
import * as usersService from "./users.service";

export async function listAgenciesHandler(req: Request, res: Response): Promise<void> {
  const search = typeof req.query.search === "string" ? req.query.search : "";
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "12"), 10)));
  const result = await usersService.listUsers(req.user.id, search, page, limit);
  res.json({ success: true, data: result });
}

export async function getProfileHandler(req: Request, res: Response): Promise<void> {
  const user = await usersService.getProfile(req.user.id);
  res.json({ success: true, data: user });
}

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const { name, companyName, designation, bio, profileImage } = req.body;
  const user = await usersService.updateProfile(req.user.id, { name, companyName, designation, bio, profileImage });
  res.json({ success: true, data: user });
}

export async function getUserByIdHandler(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const user = await usersService.getUserById(id);
  res.json({ success: true, data: user });
}
