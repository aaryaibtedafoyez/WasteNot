import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createDonation,
  listAvailableDonations,
  claimDonation,
  markDelivered,
  suggestNgoMatches,
  myDonations,
} from "../controllers/donationController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", createDonation);
router.get("/available", listAvailableDonations);
router.get("/mine", myDonations);
router.get("/:id/matches", suggestNgoMatches);
router.post("/:id/claim", claimDonation);
router.post("/:id/deliver", markDelivered);

export default router;
