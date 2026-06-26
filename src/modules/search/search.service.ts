import { Types, PipelineStage } from "mongoose";
import { Content } from "../content/content.model";
import { Share } from "../shares/share.model";

interface SearchParams {
  q: string;
  type?: string;
  tag?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  ownerId?: string;
}

export async function searchContent(userId: string, params: SearchParams) {
  const { q, type, tag, from, to, page = 1, limit = 20, ownerId } = params;
  const skip = (page - 1) * limit;

  let ownerIds: Types.ObjectId[];

  if (ownerId && ownerId !== userId) {
    const share = await Share.findOne({ founderId: new Types.ObjectId(ownerId), agencyId: new Types.ObjectId(userId), status: "ACCEPTED" });
    if (!share) {
      return { items: [], total: 0, page, limit, pages: 0 };
    }
    ownerIds = [new Types.ObjectId(ownerId)];
  } else {
    ownerIds = [new Types.ObjectId(userId)];
  }

  // Attempt Atlas Search; fall back to regex if index not yet configured
  try {
    const pipeline: PipelineStage[] = [
      {
        $search: {
          index: "content_search",
          text: {
            query: q,
            path: ["title", "description", "tags", "transcript"],
            fuzzy: { maxEdits: 1 },
          },
        },
      },
      { $match: { ownerId: { $in: ownerIds } } },
    ];

    if (type) pipeline.push({ $match: { type } });
    if (tag) pipeline.push({ $match: { tags: tag } });
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      pipeline.push({ $match: { createdAt: dateFilter } });
    }

    const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" } as PipelineStage];
    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });

    const [items, countResult] = await Promise.all([
      Content.aggregate(pipeline),
      Content.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  } catch {
    // Fallback: regex search (for development without Atlas Search)
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const query: Record<string, unknown> = {
      ownerId: { $in: ownerIds },
      $or: [{ title: regex }, { description: regex }, { tags: regex }, { transcript: regex }],
    };
    if (type) query.type = type;
    if (tag) query.tags = tag;
    if (from || to) {
      query.createdAt = {};
      if (from) (query.createdAt as Record<string, Date>).$gte = new Date(from);
      if (to) (query.createdAt as Record<string, Date>).$lte = new Date(to);
    }

    const [items, total] = await Promise.all([
      Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Content.countDocuments(query),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
