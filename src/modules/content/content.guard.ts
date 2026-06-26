import { Types } from "mongoose";
import { Content, IContent } from "./content.model";
import { Share } from "../shares/share.model";
import { AppError } from "../../middleware/errorHandler";

export async function assertContentAccess(contentId: string, userId: string): Promise<IContent> {
  const content = await Content.findById(contentId);
  if (!content) throw new AppError("Content not found", 404);

  if (content.ownerId.toString() === userId) return content;

  const share = await Share.findOne({
    founderId: content.ownerId,
    agencyId: new Types.ObjectId(userId),
    status: "ACCEPTED",
  });
  if (!share) throw new AppError("Access forbidden", 403);
  return content;
}

export async function assertContentOwner(contentId: string, userId: string): Promise<IContent> {
  const content = await Content.findById(contentId);
  if (!content) throw new AppError("Content not found", 404);
  if (content.ownerId.toString() !== userId) throw new AppError("Access forbidden", 403);
  return content;
}
