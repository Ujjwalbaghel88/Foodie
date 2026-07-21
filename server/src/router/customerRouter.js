import express from "express";
import {
  createCustomer,
  getCustomerByUserId,
  updateCustomer,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controller/customerController.js";
import { customerMiddleware, Protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/create-customer", Protect, customerMiddleware, createCustomer);
router.get("/get-customer", Protect, customerMiddleware, getCustomerByUserId);
router.put("/update-customer", Protect, customerMiddleware, updateCustomer);
router.post("/add-address", Protect, customerMiddleware, addAddress);
router.put(
  "/update-address/:addressId",
  Protect,
  customerMiddleware,
  updateAddress,
);
router.delete(
  "/delete-address/:addressId",
  Protect,
  customerMiddleware,
  deleteAddress,
);

export default router;
