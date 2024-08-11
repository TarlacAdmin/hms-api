import mongoose, { Document, Schema } from "mongoose";

export interface LocationModel extends Document {
  gln: string; // Global Location Number
  name: string;
  region: string;
  country: string;
  city: string;
  barangay: string;
  street: string;
  postalCode: string;
}

const locationSchema: Schema = new Schema({
  gln: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{13,13}$/, // GLN is typically a 13-digit number
  },
  name: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  barangay: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
});

export default mongoose.model<LocationModel>("Location", locationSchema);
