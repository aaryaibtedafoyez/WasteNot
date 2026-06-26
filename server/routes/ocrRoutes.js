import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { scanLabel } from "../controllers/ocrController.js";

const router = express.Router();

router.use(requireAuth);
router.post("/scan-label", upload.single("label"), scanLabel);

export default router;
