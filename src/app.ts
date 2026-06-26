import path from "path";
import fs from "fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import contentRoutes from "./modules/content/content.routes";
import uploadsRoutes from "./modules/uploads/uploads.routes";
import sharesRoutes from "./modules/shares/shares.routes";
import searchRoutes from "./modules/search/search.routes";
import tagsRoutes from "./modules/tags/tags.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static(uploadsDir));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/shares", sharesRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/tags", tagsRoutes);

app.use(errorHandler);

export default app;
