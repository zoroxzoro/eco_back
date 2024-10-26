import { User } from "../models/user.model.js";

// Middleware to ensure only admins are allowed
export const AdminOnly = async (req, res, next) => {
  const { _id } = req.query;

  // Check if ID is provided
  if (!_id) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    // Find the user by ID
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ message: "Invalid user ID provided." });
    }

    // Check if the user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle any unexpected errors
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
