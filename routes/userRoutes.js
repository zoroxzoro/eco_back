import express from "express";
import {
  getUserById,
  getUserCredits,
  getUserInvestments,
  registerOrLoginUser,
} from "../controllers/User.controller.js";
const router = express.Router();
router.post("/register", registerOrLoginUser);
router.get("/:id", getUserById);
router.get("/transaction/:id", getUserInvestments);
router.get("/credit/:id", getUserCredits);

export default router;
