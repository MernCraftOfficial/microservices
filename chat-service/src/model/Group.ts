import { Schema, model } from "mongoose";

const GroupSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    profilePictureUrl: { type: String, required: true, default: null },
    language: { type: String, required: true, default: "en" },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["SUPER_ADMIN", "ADMIN", "MEMBER", "GUEST"],
          default: "GUEST",
        },
      },
    ],
  },
  { timestamps: true }
);
export const Group = model("Group", GroupSchema);
