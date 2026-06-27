import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAttachment extends Document {
  contentId?: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
  uploadedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  contentId: { type: Schema.Types.ObjectId, ref: "Content", required: false },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  storageKey: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

AttachmentSchema.index({ contentId: 1 });

export const Attachment = mongoose.model<IAttachment>("Attachment", AttachmentSchema);
