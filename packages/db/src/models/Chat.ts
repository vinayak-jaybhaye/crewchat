import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    name?: string;
    members: mongoose.Types.ObjectId[];
    owner?: mongoose.Types.ObjectId;
    isGroup: boolean;
    imageUrl?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        name: { type: String },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
        owner: { type: Schema.Types.ObjectId, ref: "User" },
        isGroup: { type: Boolean, default: false },
        imageUrl: { type: String },
        description: { type: String },
    },
    {
        timestamps: true
    }
);

export default mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
