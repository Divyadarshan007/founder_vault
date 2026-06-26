import mongoose, { Document, Schema, Types } from "mongoose";

export type ContentType =
  | "THOUGHT"
  | "EVENT"
  | "MEETING"
  | "VOICE_NOTE"
  | "PHOTO"
  | "VIDEO"
  | "DOCUMENT";

export interface IContent extends Document {
  ownerId: Types.ObjectId;
  title: string;
  description: string;
  type: ContentType;
  tags: string[];
  transcript?: string;
  attachmentIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["THOUGHT", "EVENT", "MEETING", "VOICE_NOTE", "PHOTO", "VIDEO", "DOCUMENT"],
      required: true,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    transcript: { type: String },
    attachmentIds: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
  },
  { timestamps: true }
);

ContentSchema.index({ ownerId: 1, createdAt: -1 });
ContentSchema.index({ ownerId: 1, type: 1 });
ContentSchema.index({ tags: 1 });

export const Content = mongoose.model<IContent>("Content", ContentSchema);
