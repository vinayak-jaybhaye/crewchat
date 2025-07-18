import mongoose, { Schema, Document } from "mongoose";

export interface IUserChatMetaData extends Document {
    userId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    lastSeen: Date | null;
    muted: boolean;
    pinned: boolean;
    lastDeleted: Date | null;

}

const UserChatMetaDataSchema = new Schema<IUserChatMetaData>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        chatId: { type: Schema.Types.ObjectId, ref: "Group", required: true },
        lastSeen: { type: Date, default: null },
        muted: { type: Boolean, default: false },
        pinned: { type: Boolean, default: false },
        lastDeleted: { type: Date, default: () => new Date() }
    },
    { timestamps: true }
);

UserChatMetaDataSchema.index({ userId: 1, chatId: 1 }, { unique: true });

export default mongoose.models.UserChatMetaData || mongoose.model<IUserChatMetaData>("UserChatMetaData", UserChatMetaDataSchema);
