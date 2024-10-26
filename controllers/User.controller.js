import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const registerOrLoginUser = async (req, res) => {
  const { _id, name, email } = req.body;

  // Validate request body
  if (!_id || !name || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if the user already exists in the database
    let user = await User.findById(_id);

    if (user) {
      // User already exists, consider it as login
      return res.status(200).json({ message: "Login successful", user });
    }

    // If user does not exist, create a new one (Register)
    // const firebaseUser = await admin.auth().createUser({
    //   uid: _id,
    //   displayName: name,
    //   email: email,
    // });

    // Create user in your database
    user = await User.create({
      _id,
      name,
      email,
      // firebaseUid: firebaseUser.uid, // Store Firebase UID if needed
    });

    res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single User by ID
export const getUserById = async (req, res) => {
  try {
    // Extract user ID from request parameters or query (adjust as needed)
    const userId = req.params.id;

    // Find user by ID
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user data as a response
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data." });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Check if users exist
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send the list of users as a response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
};

// Get Recent Investments for a Specific User

// Get Recent Investments for a Specific User
export const getUserInvestmentById = async (req, res) => {
  try {
    const userId = req.params.id;
    const investmentId = req.params.investmentId;

    // Validate the userId and investmentId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(investmentId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid user ID or investment ID." });
    }

    // Find the user and the specific investment using aggregate
    const investment = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$investments" },
      {
        $match: {
          "investments._id": new mongoose.Types.ObjectId(investmentId),
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "investments.projectId",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      { $unwind: "$projectDetails" },
      {
        $project: {
          userId: "$_id",
          userName: "$name",
          email: "$email",
          projectName: "$projectDetails.name",
          shares: "$investments.shares",
          investmentDate: "$investments.date",
          energyProduced: {
            $multiply: [
              "$projectDetails.energyPerShare",
              "$investments.shares",
            ],
          },
          carbonSaved: {
            $multiply: [
              "$projectDetails.co2PerKwh",
              {
                $multiply: [
                  "$projectDetails.energyPerShare",
                  "$investments.shares",
                ],
              },
            ],
          },
        },
      },
    ]);

    // Check if the investment was found
    if (investment.length === 0) {
      return res
        .status(404)
        .json({ message: "Investment not found for this user." });
    }

    res.status(200).json({
      message: "Investment retrieved successfully.",
      investment: investment[0],
    });
  } catch (error) {
    console.error("Error fetching user's investment:", error);
    res.status(500).json({
      error: "An error occurred while fetching the user's investment.",
    });
  }
};

export const getUserCredits = async (req, res) => {
  try {
    const userId = req.params.id; // Extract user ID from URL parameters
    const user = await User.findById(userId).select("credits"); // Fetch user with only the credits field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get user investments
export const getUserInvestments = async (req, res) => {
  try {
    const userId = req.params.id; // Extract user ID from URL parameters
    const user = await User.findById(userId).select("investments"); // Fetch user with only the investments field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ investments: user.investments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
