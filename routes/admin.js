import express from "express";
import {
  getDashboardData,
  getMonthlyData,
  getYearlyData,
} from "../controllers/DashBoard.controller.js";
import { AdminOnly } from "../middleware/auth.js";
import { get } from "mongoose";
import { getAllUsers } from "../controllers/User.controller.js";

const router = express.Router();

router.get("/data", AdminOnly, getDashboardData);
router.get("/monthly", AdminOnly, getMonthlyData);
router.get("/yearly", AdminOnly, getYearlyData);
router.get("/allUser", getAllUsers);

export default router;
