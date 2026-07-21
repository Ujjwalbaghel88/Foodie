import express from "express";
import {
  createRider,
  getRiderByUserId,
  updateRider,
  updateVehicleDetails,
  updateBankingDetails,
  updateAvailability,
  updateLocation,
} from "../controller/riderController.js";
import { Protect, riderMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-rider", Protect, riderMiddleware, createRider);
router.get("/get-rider", Protect, riderMiddleware, getRiderByUserId);
router.put("/update-rider", Protect, riderMiddleware, updateRider);
router.put(
  "/update-vehicle-details",
  Protect,
  riderMiddleware,
  updateVehicleDetails,
);
router.put(
  "/update-banking-details",
  Protect,
  riderMiddleware,
  updateBankingDetails,
);
router.put(
  "/update-availability",
  Protect,
  riderMiddleware,
  updateAvailability,
);
router.put(
  "/update-location",
  Protect,
  riderMiddleware,
  updateLocation,
);

export default router;
