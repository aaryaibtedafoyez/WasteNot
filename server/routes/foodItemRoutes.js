import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createFoodItem,
  listFoodItems,
  getFoodItem,
  updateFoodItem,
  deleteFoodItem,
  checkFreshness,
  getDashboardSummary,
} from "../controllers/foodItemController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/dashboard", getDashboardSummary);
router.get("/", listFoodItems);
router.post("/", createFoodItem);
router.get("/:id", getFoodItem);
router.patch("/:id", updateFoodItem);
router.delete("/:id", deleteFoodItem);
router.post("/:id/check-freshness", checkFreshness);

export default router;
