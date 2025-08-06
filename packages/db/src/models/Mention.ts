import mongoose, { Schema, Document } from "mongoose";

export interface IMention extends Document {
    messageId: mongoose.Types.ObjectId;
    mentionedUserId: mongoose.Types.ObjectId;
    mentionedByUserId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MentionSchema = new Schema<IMention>(
    {
        messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true },
        mentionedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mentionedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true }
    },
    {
        timestamps: true
    }
);

MentionSchema.index({ mentionedUserId: 1 });
MentionSchema.index({ messageId: 1 });
MentionSchema.index({ messageId: 1, mentionedUserId: 1 }, { unique: true });

const Mention = mongoose.models.Mention || mongoose.model<IMention>("Mention", MentionSchema);
export default Mention;