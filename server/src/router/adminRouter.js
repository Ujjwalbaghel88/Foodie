import express from "express";
import { getManagerProgress } from "../controller/adminController.js";
import { Protect, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/manager-progress", Protect, adminMiddleware, getManagerProgress);

export default router;
