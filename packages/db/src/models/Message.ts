import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    content: string;
    type: "text" | "image" | "video" | "file";
    createdAt?: Date;
    updatedAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        content: { type: String, required: true, maxlength: 1000 },
        type: { type: String, enum: ["text", "image", "video", "file"], default: "text" },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);