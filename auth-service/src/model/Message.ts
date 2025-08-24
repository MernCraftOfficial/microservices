import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "audio"],
      default: "text",
    },
  },
  { timestamps: true }
);
export const Message = model("Message", MessageSchema);
