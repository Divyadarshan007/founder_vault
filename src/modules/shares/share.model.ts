import mongoose, { Document, Schema, Types } from "mongoose";

export type ShareStatus = "PENDING" | "ACCEPTED" | "REVOKED";

export interface IShare extends Document {
  founderId: Types.ObjectId;
  agencyId: Types.ObjectId;
  role: "VIEWER";
  status: ShareStatus;
  createdAt: Date;
}

const ShareSchema = new Schema<IShare>(
  {
    founderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["VIEWER"], default: "VIEWER" },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REVOKED"], default: "PENDING" },
  },
  { timestamps: true }
);

ShareSchema.index({ founderId: 1, agencyId: 1 }, { unique: true });
ShareSchema.index({ agencyId: 1, status: 1 });

export const Share = mongoose.model<IShare>("Share", ShareSchema);
