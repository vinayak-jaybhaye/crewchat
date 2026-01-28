import mongoose, { Schema } from "mongoose";

export type ChatRole = "member" | "admin" | "owner";

export interface IUserChatMetaData {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  lastSeen: Date | null;
  muted: boolean;
  pinned: boolean;
  lastDeleted: Date | null;
  role: ChatRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserChatMetaDataSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },

    lastSeen: { type: Date, default: null },
    lastDeleted: { type: Date, default: null },

    muted: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["member", "admin", "owner"],
      default: "member",
    },
  },
  { timestamps: true },
);

UserChatMetaDataSchema.index({ userId: 1, chatId: 1 }, { unique: true });
UserChatMetaDataSchema.index({ userId: 1, pinned: -1 });

const UserChatMetaData =
  mongoose.models.UserChatMetaData ||
  mongoose.model<IUserChatMetaData>("UserChatMetaData", UserChatMetaDataSchema);
export default UserChatMetaData;
