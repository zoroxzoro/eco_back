import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  totalShares: {
    type: Number,
    required: true,
  },
  availableShares: {
    type: Number,
    required: true,
  },
  pricePerShare: {
    type: Number,
    required: true,
  },
  energyPerShare: {
    type: Number, // Energy produced per share in kWh
    required: true,
  },
  totalEnergyProduced: {
    type: Number, // Total energy produced by the entire project in kWh
    default: 0,
  },
  co2PerKwh: {
    type: Number, // CO2 saved per kWh in kg
    default: 0.7,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export const Project = mongoose.model("Project", projectSchema);
