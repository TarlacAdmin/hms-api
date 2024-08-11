import mongoose, { Document, Schema } from "mongoose";

export interface AssetModel extends Document {
  item: mongoose.Schema.Types.ObjectId;
  serialNumber: string;
  acquisitionDate: Date;
  expirationDate?: Date;
  location: mongoose.Schema.Types.ObjectId;
  status: string;
  value: number;
}

export const assetSchema: Schema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  acquisitionDate: {
    type: Date,
    required: true,
  },
  expirationDate: Date,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "in maintenance", "retired"], // Example status
  },
  value: {
    type: Number,
    required: true,
  },
});

export default mongoose.model<AssetModel>("Asset", assetSchema);
