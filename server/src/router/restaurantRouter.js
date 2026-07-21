import express from "express";
import multer from "multer";
import {
  createRestaurant,
  getRestaurantByUserId,
  updateRestaurant,
} from "../controller/restaurantController.js";
import { Protect, restaurantMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.post(
  "/create-restaurant",
  Protect,
  restaurantMiddleware,
  upload.array("images"),
  createRestaurant,
);

router.get(
  "/get-restaurant",
  Protect,
  restaurantMiddleware,
  getRestaurantByUserId,
);

router.put(
  "/update-restaurant",
  Protect,
  restaurantMiddleware,
  upload.array("images"),
  updateRestaurant,
);

export default router;
