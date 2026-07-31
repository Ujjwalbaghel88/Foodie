import express from "express";
import {
  getDataCollections,
  getManagerProgress,
  resetDataCollection,
  seedLegacyJsonData,
} from "../controller/adminController.js";
import { Protect, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/manager-progress", Protect, adminMiddleware, getManagerProgress);
router.get("/data-collections", Protect, adminMiddleware, getDataCollections);
router.post("/data-collections/:collection/reset", Protect, adminMiddleware, resetDataCollection);
router.post("/seed-legacy-json", Protect, adminMiddleware, seedLegacyJsonData);

export default router;
