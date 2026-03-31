import mongoose from "mongoose";

const tokenCounterSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  seq: { type: Number, default: 0 },
});

tokenCounterSchema.index({ date: 1 }, { unique: true });

export default mongoose.model("TokenCounter", tokenCounterSchema);
