import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import { Content, ContentType } from "./content.model";
import { Attachment } from "../uploads/attachment.model";
import { Share } from "../shares/share.model";
import { AppError } from "../../middleware/errorHandler";

interface ContentFilters {
  type?: ContentType;
  tag?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  ownerId?: string;
}

export async function createContent(ownerId: string, data: {
  title: string;
  description: string;
  type: ContentType;
  tags?: string[];
  transcript?: string;
  attachmentIds?: string[];
}) {
  const content = await Content.create({ ownerId: new Types.ObjectId(ownerId), ...data });
  return content;
}

export async function listContent(userId: string, filters: ContentFilters) {
  const { type, tag, from, to, page = 1, limit = 20, ownerId } = filters;
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

  const query: Record<string, unknown> = { ownerId: { $in: ownerIds } };
  if (type) query.type = type;
  if (tag) query.tags = tag;
  if (from || to) {
    query.createdAt = {};
    if (from) (query.createdAt as Record<string, Date>).$gte = new Date(from);
    if (to) (query.createdAt as Record<string, Date>).$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("attachmentIds"),
    Content.countDocuments(query),
  ]);

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getContentById(contentId: string) {
  const content = await Content.findById(contentId).populate("attachmentIds");
  if (!content) throw new AppError("Content not found", 404);
  return content;
}

export async function updateContent(contentId: string, data: {
  title?: string;
  description?: string;
  type?: ContentType;
  tags?: string[];
  transcript?: string;
  attachmentIds?: string[];
}) {
  const content = await Content.findByIdAndUpdate(contentId, data, { new: true, runValidators: true }).populate("attachmentIds");
  if (!content) throw new AppError("Content not found", 404);
  return content;
}

export async function deleteContent(contentId: string) {
  const content = await Content.findByIdAndDelete(contentId);
  if (!content) throw new AppError("Content not found", 404);

  const attachments = await Attachment.find({ contentId: content._id });
  await Promise.all([
    ...attachments.map((a) => {
      const filePath = path.join(process.cwd(), "uploads", a.storageKey);
      return fs.promises.unlink(filePath).catch(() => {});
    }),
    Attachment.deleteMany({ contentId: content._id }),
  ]);
}

export async function getContentStats(userId: string) {
  const counts = await Content.aggregate([
    { $match: { ownerId: new Types.ObjectId(userId) } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  const stats: Record<string, number> = {
    TOTAL: 0, THOUGHT: 0, EVENT: 0, MEETING: 0, VOICE_NOTE: 0, PHOTO: 0, VIDEO: 0, DOCUMENT: 0,
  };

  for (const item of counts) {
    stats[item._id as string] = item.count;
    stats.TOTAL += item.count;
  }

  return stats;
}
