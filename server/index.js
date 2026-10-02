import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/dbConnection.js";
import cloudinary from "./src/config/cloudinaryConfig.js";
import authRouter from "./src/router/authRouter.js";
import restaurantRouter from "./src/router/restaurantRouter.js";
import customerRouter from "./src/router/customerRouter.js";
import riderRouter from "./src/router/riderRouter.js";
import menuRouter from "./src/router/menuRouter.js";
import publicRouter from "./src/router/publicRouter.js";
import adminRouter from "./src/router/adminRouter.js";

const app = express();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters");
}

const buildAllowedOrigins = () => {
  const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://0.0.0.0:5173",
    "http://0.0.0.0:5174",
    "http://0.0.0.0:5175",
  ];

  const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaultOrigins, ...configuredOrigins]);
};

app.disable("x-powered-by");
const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const error = new Error("Origin is not allowed");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use("/restaurant", restaurantRouter);
app.use("/customer", customerRouter);
app.use("/rider", riderRouter);
app.use("/menu", menuRouter);
app.use("/public", publicRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.status(200).json({ name: "Cravings API", status: "ok" });
});

app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.status >= 500 || !err.status) console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status >= 500 ? "Internal Server Error" : err.message,
  });
});

const PORT = process.env.PORT || 4501;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connected successfully:", result);
  } catch (error) {
    console.error("Cloudinary connection error:", error);
  }
});
