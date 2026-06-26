import bcrypt from "bcryptjs";
import { User } from "../users/user.model";
import { generateTokens, verifyRefreshToken } from "../../utils/token";
import { AppError } from "../../middleware/errorHandler";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  companyName: string;
  designation: string;
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({ ...input, email, passwordHash });

  const tokens = generateTokens(user._id.toString());
  const safeUser = { _id: user._id, name: user.name, email: user.email, companyName: user.companyName, designation: user.designation };
  return { user: safeUser, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.isActive) throw new AppError("No account found with this email. Please register first.", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Incorrect password. Please try again.", 401);

  const tokens = generateTokens(user._id.toString());
  const safeUser = { _id: user._id, name: user.name, email: user.email, companyName: user.companyName, designation: user.designation, profileImage: user.profileImage, bio: user.bio };
  return { user: safeUser, ...tokens };
}

export async function refresh(token: string) {
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) throw new AppError("User not found", 401);
    const { accessToken } = generateTokens(user._id.toString());
    return { accessToken };
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }
}
