import { User } from "./user.model";
import { AppError } from "../../middleware/errorHandler";

export async function listUsers(currentUserId: string, search: string, page: number, limit: number) {
  const query: Record<string, unknown> = { isActive: true, _id: { $ne: currentUserId } };
  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: re }, { companyName: re }, { email: re }];
  }
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(query).select("-passwordHash").sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateProfile(userId: string, updates: {
  name?: string;
  companyName?: string;
  designation?: string;
  bio?: string;
  profileImage?: string;
}) {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function getUserById(userId: string) {
  const user = await User.findById(userId).select("name email companyName designation profileImage bio");
  if (!user) throw new AppError("User not found", 404);
  return user;
}
