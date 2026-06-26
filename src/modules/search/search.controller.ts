import { Request, Response } from "express";
import * as searchService from "./search.service";
import { AppError } from "../../middleware/errorHandler";

export async function searchHandler(req: Request, res: Response): Promise<void> {
  const { q, type, tag, from, to, page, limit, ownerId } = req.query as Record<string, string>;
  if (!q || q.trim().length === 0) {
    throw new AppError("Search query is required", 400);
  }
  const result = await searchService.searchContent(req.user.id, {
    q: q.trim(),
    type,
    tag,
    from,
    to,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    ownerId,
  });
  res.json({ success: true, data: result });
}
