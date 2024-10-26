import express from "express";
import {
  createProject,
  getAllProjects,
} from "../controllers/project.controller.js";
const router = express.Router();
router.post("/create", createProject);
router.get("/all", getAllProjects);
export default router;
