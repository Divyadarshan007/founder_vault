import { Request, Response } from "express";
import * as contentService from "./content.service";
import { ContentType } from "./content.model";
import { assertContentAccess, assertContentOwner } from "./content.guard";

export async function createContentHandler(req: Request, res: Response): Promise<void> {
  const content = await contentService.createContent(req.user.id, req.body);
  res.status(201).json({ success: true, data: content });
}

export async function listContentHandler(req: Request, res: Response): Promise<void> {
  const q = req.query as Record<string, string | string[]>;
  const type = typeof q.type === "string" ? q.type : undefined;
  const tag = typeof q.tag === "string" ? q.tag : undefined;
  const from = typeof q.from === "string" ? q.from : undefined;
  const to = typeof q.to === "string" ? q.to : undefined;
  const page = typeof q.page === "string" ? q.page : undefined;
  const limit = typeof q.limit === "string" ? q.limit : undefined;
  const ownerId = typeof q.ownerId === "string" ? q.ownerId : undefined;
  const result = await contentService.listContent(req.user.id, {
    type: type as ContentType | undefined,
    tag,
    from,
    to,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    ownerId,
  });
  res.json({ success: true, data: result });
}

export async function getContentHandler(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await assertContentAccess(id, req.user.id);
  const content = await contentService.getContentById(id);
  res.json({ success: true, data: content });
}

export async function updateContentHandler(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await assertContentOwner(id, req.user.id);
  const content = await contentService.updateContent(id, req.body);
  res.json({ success: true, data: content });
}

export async function deleteContentHandler(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  await assertContentOwner(id, req.user.id);
  await contentService.deleteContent(id);
  res.json({ success: true, message: "Content deleted" });
}

export async function getStatsHandler(req: Request, res: Response): Promise<void> {
  const stats = await contentService.getContentStats(req.user.id);
  res.json({ success: true, data: stats });
}
