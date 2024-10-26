import express from "express";
import { buyShares } from "../controllers/Investment.controller.js";
const router = express.Router();

router.post("/buyShares", buyShares);

export default router;
