import express from "express";
import multer from "multer";
import {
  addMenuItem,
  getMenuItems,
  getMenuItemsByRestaurantId,
  updateMenuItem,
  markItemUnavailable,
  markItemDiscontinued,
  deleteMenuItem,
} from "../controller/menuController.js";
import { Protect, restaurantMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protected routes (require authentication)
router.post("/add-item", Protect, restaurantMiddleware, upload.single("image"), addMenuItem);
router.get("/get-items", Protect, restaurantMiddleware, getMenuItems);
router.put("/update-item/:itemId", Protect, restaurantMiddleware, upload.single("image"), updateMenuItem);
router.patch("/mark-unavailable/:itemId", Protect, restaurantMiddleware, markItemUnavailable);
router.patch("/mark-discontinued/:itemId", Protect, restaurantMiddleware, markItemDiscontinued);
router.delete("/delete-item/:itemId", Protect, restaurantMiddleware, deleteMenuItem);

// Public route (no authentication required - for customers browsing menu)
router.get("/restaurant/:restaurantId", getMenuItemsByRestaurantId);

export default router;
