import { Project } from "../models/project.model.js";

export const createProject = async (req, res) => {
  const {
    name,
    location,
    description,
    totalShares,
    availableShares,
    pricePerShare,
    energyPerShare,
    co2PerKwh,
  } = req.body;

  try {
    const newProject = new Project({
      name,
      location,
      description,
      totalShares,
      availableShares,
      pricePerShare,
      energyPerShare,
      co2PerKwh,
    });

    // Save the project to the database
    await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all projects (for users to view)
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
