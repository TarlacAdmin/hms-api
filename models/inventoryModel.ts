import mongoose, { Document, mongo, Schema } from "mongoose";

export interface InventoryModel extends Document {
  item: mongoose.Schema.Types.ObjectId;
  quantity: number;
  location: mongoose.Schema.Types.ObjectId;
  reorderLevel: number;
  lastRestocked?: Date;
}

const inventorySchema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 0,
  },
  lastRestocked: Date,
});

export default mongoose.model<InventoryModel>("Inventory", inventorySchema);
