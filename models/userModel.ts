import mongoose, { Document, Schema } from "mongoose";

export interface UserModel extends Document {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  status: "active" | "inactive" | "suspended" | "deactivated" | "archived";
  type: "admin" | "user" | "viewer";
  lastActive?: Date;
}

// User Schema
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    firstname: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    lastname: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    email: {
      type: String,
      minLength: 1,
      maxLength: 255,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 255,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deactivated", "archived"],
      default: "active",
    },
    type: {
      type: String,
      enum: ["admin", "user", "viewer"],
      default: "user",
    },
    lastActive: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<UserModel>("User", userSchema);
