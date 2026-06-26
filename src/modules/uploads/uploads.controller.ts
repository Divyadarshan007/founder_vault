import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { Attachment } from "./attachment.model";
import * as uploadsService from "./uploads.service";

export async function uploadFilesHandler(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[];
  const { contentId } = req.body;
  const results = await uploadsService.uploadFiles(req.user.id, files, contentId);
  res.status(201).json({ success: true, data: results });
}

export async function downloadAttachmentHandler(req: Request, res: Response): Promise<void> {
  const attachment = await Attachment.findById(req.params.id);
  if (!attachment) {
    res.status(404).json({ success: false, message: "Attachment not found" });
    return;
  }

  const localPath = path.join(process.cwd(), "uploads", attachment.r2Key);
  if (!fs.existsSync(localPath)) {
    res.status(404).json({ success: false, message: "File not found on server" });
    return;
  }

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(attachment.fileName)}"`);
  res.setHeader("Content-Type", attachment.fileType || "application/octet-stream");
  fs.createReadStream(localPath).pipe(res);
}
