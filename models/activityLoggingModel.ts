import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLogging extends Document {
  referenceId: mongoose.Schema.Types.ObjectId;
  activities: {
    actor: mongoose.Schema.Types.ObjectId;
    action: string;
    createdAt: Date;
    referenceId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
  };
}

const activityLoggingSchema: Schema = new Schema(
  {
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferenceSchema",
    },
    activities: [
      {
        actor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        action: {
          type: String,
          enum: ["create", "read", "update", "remove", "login", "logout"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        referenceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ReferenceSchema",
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLogging>("ActivityLogging", activityLoggingSchema);
