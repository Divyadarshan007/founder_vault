import { Types } from "mongoose";
import { Attachment, IAttachment } from "./attachment.model";
import { AppError } from "../../middleware/errorHandler";
import { env } from "../../config/env";

export async function uploadFiles(
  _userId: string,
  files: Express.Multer.File[],
  contentId?: string
) {
  if (!files || files.length === 0) throw new AppError("No files provided", 400);

  const results = await Promise.all(
    files.map(async (file) => {
      const fileUrl = `${env.BACKEND_URL}/uploads/${file.filename}`;

      const attachmentData: Partial<IAttachment> = {
        fileName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        r2Key: file.filename,
        ...(contentId ? { contentId: new Types.ObjectId(contentId) } : {}),
      };

      const attachment = await Attachment.create(attachmentData);

      return {
        attachmentId: attachment._id,
        fileUrl: attachment.fileUrl,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
      };
    })
  );

  return results;
}
