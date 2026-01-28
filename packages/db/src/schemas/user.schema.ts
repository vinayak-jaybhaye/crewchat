import mongoose, { Schema } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password_hash: string | null;
  passwordAuthenticationEnabled: Boolean;
  avatarUrl?: string;
  lastActive: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    password_hash: { type: String, default: null },
    passwordAuthenticationEnabled: { type: Boolean, default: false },

    avatarUrl: { type: String },
    lastActive: { type: Date, default: null },
  },
  { timestamps: true },
);

// Export the model, or reuse if already compiled
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
