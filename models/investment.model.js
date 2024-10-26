import mongoose from "mongoose";
const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  sharesPurchased: {
    type: Number,
    required: true,
  },
  amountPaid: {
    type: Number, // Total amount paid for the shares
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});
export const Investment = mongoose.model("Investment", investmentSchema);
