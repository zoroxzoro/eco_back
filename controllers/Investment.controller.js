import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";
import Stripe from "stripe";
import { stripe } from "../index.js";

export const buyShares = async (req, res) => {
  const userId = req.body.userId; // User ID from request body
  const { projectId, shares } = req.body; // Project ID and number of shares to buy

  try {
    // Find the project to calculate energy and carbon savings
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Calculate total energy produced from the purchased shares
    const energyProduced = project.energyPerShare * shares;
    const carbonSaved = project.co2PerKwh * energyProduced;

    // Update the user's investments
    await User.findByIdAndUpdate(userId, {
      $push: {
        investments: {
          projectId: new mongoose.Types.ObjectId(projectId),
          shares: shares,
          date: new Date(),
        },
      },
    });

    // Calculate credits based on the total energy produced
    const creditsEarned = Math.floor(energyProduced / 100); // 1 credit for every 100 kWh
    await User.findByIdAndUpdate(userId, {
      $inc: { credits: creditsEarned }, // Increment the user's credits
    });

    res.status(200).json({
      message: "Shares purchased successfully.",
      newCredits: creditsEarned + (await User.findById(userId)).credits, // Fetch the updated credits
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while purchasing shares." });
  }
};
