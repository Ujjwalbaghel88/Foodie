import express from "express";
import {
  getDataCollections,
  getReports,
  getManagerProgress,
  resetDataCollection,
  seedLegacyJsonData,
  resetRestaurantManagerPassword,
} from "../controller/adminController.js";
import { Protect, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/manager-progress", Protect, adminMiddleware, getManagerProgress);
router.get("/data-collections", Protect, adminMiddleware, getDataCollections);
router.get("/reports", Protect, adminMiddleware, getReports);
router.post("/data-collections/:collection/reset", Protect, adminMiddleware, resetDataCollection);
router.post("/seed-legacy-json", Protect, adminMiddleware, seedLegacyJsonData);
router.post("/restaurant-managers/:id/reset-password", Protect, adminMiddleware, resetRestaurantManagerPassword);

export default router;
