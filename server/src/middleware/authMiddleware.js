import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const Protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token) {
    const err = new Error("Unauthorized: No token provided");
    err.status = 401;
    return next(err);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      const err = new Error("Unauthorized: User not found");
      err.status = 401;
      return next(err);
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    const err = new Error("Unauthorized: Invalid token");
    err.status = 401;
    return next(err);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next();
  } else {
    const err = new Error("Forbidden: Admins only");
    err.status = 403;
    return next(err);
  }
};

export const restaurantMiddleware = (req, res, next) => {
  if (req.user && req.user.userType === "restaurant") {
    next();
  } else {
    const err = new Error("Forbidden: Restaurant Owners only");
    err.status = 403;
    return next(err);
  }
};

export const customerMiddleware = (req, res, next) => {
  if (req.user && req.user.userType === "customer") {
    next();
  } else {
    const err = new Error("Forbidden: Customers only");
    err.status = 403;
    return next(err);
  }
};

export const riderMiddleware = (req, res, next) => {
  if (req.user && req.user.userType === "rider") {
    next();
  } else {
    const err = new Error("Forbidden: Riders only");
    err.status = 403;
    return next(err);
  }
};
