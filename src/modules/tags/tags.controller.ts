import { Request, Response } from "express";
import { Types } from "mongoose";
import { Content } from "../content/content.model";

export async function getTagsHandler(req: Request, res: Response): Promise<void> {
  const tags = await Content.distinct("tags", { ownerId: new Types.ObjectId(req.user.id) });
  res.json({ success: true, data: tags.filter(Boolean).sort() });
}
