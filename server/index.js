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
const allowedOrigins = new Set(
  [
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    ...((process.env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)),
  ].filter(Boolean),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
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
  res.send("Hello, World!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
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
