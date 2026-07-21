import express from "express";
import multer from "multer";
import {
  Register,
  Login,
  Logout,
  Profile,
  EditProfile,
  ChangePassword,
  ForgotPassword,
  ResetPassword,
  updateProfilePicture,
} from "../controller/authController.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer();

router.post("/register", Register);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/profile", Profile);
router.put("/update-profile", Protect, EditProfile);
router.post("/change-password", ChangePassword);
router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
router.put(
  "/update-profile-picture",
  Protect,
  upload.single("photo"),
  updateProfilePicture,
);

export default router;
