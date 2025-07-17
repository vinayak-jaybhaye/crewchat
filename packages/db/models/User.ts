import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    avatarUrl?: string;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        avatarUrl: { type: String }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

// Export the model, or reuse if already compiled
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
