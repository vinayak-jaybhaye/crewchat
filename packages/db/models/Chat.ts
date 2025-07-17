import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    name?: string;
    members: mongoose.Types.ObjectId[];
    createdBy?: mongoose.Types.ObjectId;
    isGroup: boolean;
    iconUrl?: string;
    description?: string;
}

const ChatSchema = new Schema<IChat>(
    {
        name: { type: String },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        isGroup: { type: Boolean, default: false },
        iconUrl: { type: String },
        description: { type: String },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
