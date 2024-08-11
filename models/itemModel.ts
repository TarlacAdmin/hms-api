import mongoose, { Schema, Document } from "mongoose";

export interface ItemModel extends Document {
  name: string;
  description?: string;
  gtin: string; // Global Trade Item Number
  manufacturerName: string;
  category: string;
}

const itemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  gtin: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{14,14}$/, // GTIN is typically a 14-digit number
  },
  manufacturerName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

export default mongoose.model<ItemModel>("Item", itemSchema);
