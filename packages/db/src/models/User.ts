import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    avatarUrl?: string;
    lastSeen?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        avatarUrl: { type: String },
        lastSeen: { type: Date, default: () => new Date() },
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

// Export the model, or reuse if already compiled
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
