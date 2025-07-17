import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    groupId: mongoose.Types.ObjectId;
    content: string;
    type: "text" | "image" | "video" | "file";
}

const MessageSchema = new Schema<IMessage>(
    {
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        groupId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        content: { type: String, required: true, maxlength: 1000 },
        type: { type: String, enum: ["text", "image", "video", "file"], default: "text" },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);