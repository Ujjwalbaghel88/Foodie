import express from "express";
import {
  getAllRestaurants,
  getRestaurantById,
} from "../controller/restaurantController.js";
import { getMenuItemsByRestaurantId } from "../controller/menuController.js";

const router = express.Router();

// Public endpoints - No authentication required
// Get all restaurants for Home page
router.get("/restaurants", getAllRestaurants);

// Get a single restaurant by ID
router.get("/restaurant/:restaurantId", getRestaurantById);

// Get menu items for a specific restaurant - for Order Now page
router.get("/restaurant/:restaurantId/menu", getMenuItemsByRestaurantId);

export default router;
