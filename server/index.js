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

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://cravings.ricr.in"],
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

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 4500;
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
