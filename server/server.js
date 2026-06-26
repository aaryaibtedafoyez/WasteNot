import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import foodItemRoutes from "./routes/foodItemRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "wastenot-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/food-items", foodItemRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/donations", donationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] WasteNot API running on http://localhost:${PORT}`);
  });
});
