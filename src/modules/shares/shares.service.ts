import { Types } from "mongoose";
import { Share } from "./share.model";
import { User } from "../users/user.model";
import { AppError } from "../../middleware/errorHandler";

export async function inviteUser(founderId: string, email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("No user found with this email", 404);
  if (user._id.toString() === founderId) throw new AppError("You cannot invite yourself", 400);
  return _createOrReactivateShare(founderId, user._id.toString());
}

export async function inviteUserById(founderId: string, userId: string) {
  if (userId === founderId) throw new AppError("You cannot invite yourself", 400);
  const user = await User.findById(new Types.ObjectId(userId));
  if (!user) throw new AppError("User not found", 404);
  return _createOrReactivateShare(founderId, userId);
}

const AGENCY_FIELDS = "name email companyName designation profileImage";

async function _createOrReactivateShare(founderId: string, agencyId: string) {
  const existing = await Share.findOne({
    founderId: new Types.ObjectId(founderId),
    agencyId: new Types.ObjectId(agencyId),
  });

  if (existing) {
    if (existing.status === "ACCEPTED") throw new AppError("User already has access", 409);
    if (existing.status === "PENDING") throw new AppError("Invitation already sent", 409);
    existing.status = "PENDING";
    await existing.save();
    return existing.populate("agencyId", AGENCY_FIELDS);
  }

  const share = await Share.create({
    founderId: new Types.ObjectId(founderId),
    agencyId: new Types.ObjectId(agencyId),
  });
  return share.populate("agencyId", AGENCY_FIELDS);
}

export async function listShares(userId: string) {
  const [sent, received] = await Promise.all([
    Share.find({ founderId: new Types.ObjectId(userId) })
      .populate("agencyId", "name email companyName designation profileImage")
      .sort({ createdAt: -1 }),
    Share.find({ agencyId: new Types.ObjectId(userId) })
      .populate("founderId", "name email companyName designation profileImage bio")
      .sort({ createdAt: -1 }),
  ]);
  return { sent, received };
}

export async function acceptShare(agencyId: string, shareId: string) {
  const share = await Share.findOne({
    _id: new Types.ObjectId(shareId),
    agencyId: new Types.ObjectId(agencyId),
    status: "PENDING",
  });
  if (!share) throw new AppError("Share invitation not found", 404);
  share.status = "ACCEPTED";
  await share.save();
  return share.populate("founderId", "name email companyName designation profileImage bio");
}

export async function revokeShare(founderId: string, shareId: string) {
  const share = await Share.findOne({
    _id: new Types.ObjectId(shareId),
    founderId: new Types.ObjectId(founderId),
  });
  if (!share) throw new AppError("Share not found", 404);
  share.status = "REVOKED";
  await share.save();
  return share;
}
