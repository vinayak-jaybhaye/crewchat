import mongoose, { Schema } from "mongoose";

export interface ILastMessage {
  _id: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface IChat {
  _id: mongoose.Types.ObjectId;
  name?: string;
  members: mongoose.Types.ObjectId[];
  isGroup: boolean;
  imageUrl?: string;
  description?: string;
  lastMessage?: ILastMessage | null;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    name: { type: String },

    isGroup: {
      type: Boolean,
      required: true,
    },

    imageUrl: { type: String },
    description: { type: String },

    members: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },

    lastMessage: {
      type: new Schema(
        {
          _id: { type: Schema.Types.ObjectId },
          senderId: { type: Schema.Types.ObjectId, ref: "User" },
          content: { type: String },
          editedAt: { type: Date, default: null },
          deletedAt: { type: Date, default: null },
          createdAt: { type: Date },
        },
        { _id: false },
      ),
      default: null,
    },

  },
  { timestamps: true },
);

ChatSchema.index({ members: 1 });
ChatSchema.index({ updatedAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
