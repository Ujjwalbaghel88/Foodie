import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import {
  uploadSingleImage,
  deleteImage,
} from "../utils/imageUploader.js";
import { sendEmail } from "../utils/sendEmail.js";
import getAuthCookieOptions from "../utils/authCookieOptions.js";

const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const Register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.status = 400;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const PhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random&size=512`;
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      userType,
      photo: { url: PhotoURL },
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.status = 401;
      return next(error);
    }

    const existingUserObj = existingUser.toObject(); // Convert Mongoose document to plain object
    delete existingUserObj.password; // Remove password from plain object

    const token = generateToken(existingUserObj, res);
    res
      .status(200)
      .json({ message: "User logged in successfully", data: existingUserObj, token });
  } catch (error) {
    next(error);
  }
};

export const Logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      ...getAuthCookieOptions(),
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const Profile = async (req, res, next) => {
  try {
    res.status(200).json({ message: "User profile retrieved successfully" });
  } catch (error) {
    next(error);
  }
};

export const EditProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phone,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "User profile updated successfully",
      data: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const ChangePassword = async (req, res, next) => {
  try {
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      const error = new Error("Email is required");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = expiresAt;
    await user.save();

    const emailSubject = "Cravings password reset OTP";
    const emailText = `Your Cravings password reset OTP is ${otp}. It will expire in 10 minutes.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="color: #c2410c;">Cravings password reset</h2>
        <p>Your password reset OTP is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #111827; margin: 16px 0;">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    res.status(200).json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const ResetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      const error = new Error("Email, OTP and new password are required");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    if (
      !user.passwordResetOtpHash ||
      !user.passwordResetOtpExpiresAt ||
      user.passwordResetOtpExpiresAt.getTime() < Date.now()
    ) {
      const error = new Error("OTP has expired. Please request a new one.");
      error.status = 400;
      return next(error);
    }

    const isOtpValid = await bcrypt.compare(otp, user.passwordResetOtpHash);
    if (!isOtpValid) {
      const error = new Error("Invalid OTP");
      error.status = 401;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    // Validate file upload
    if (!file) {
      const error = new Error("No image provided");
      error.status = 400;
      return next(error);
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // Delete previous image if it exists
    if (user.photo?.publicId) {
      try {
        await deleteImage(user.photo.publicId);
      } catch (deleteError) {
        console.error("Error deleting previous image:", deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image to Cloudinary
    const cloudinaryFolder = `users/${userId}`;
    const base64Image = file.buffer.toString("base64");
    const imageData = await uploadSingleImage(base64Image, cloudinaryFolder);

    // Update user's photo
    user.photo = {
      url: imageData.URL,
      publicId: imageData.publicId,
    };

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Profile picture updated successfully",
      data: userObj,
    });
  } catch (error) {
    next(error);
  }
};
