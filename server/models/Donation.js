import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    foodDescription: { type: String, required: true, trim: true },
    estimatedServings: { type: Number, required: true, min: 1 },
    category: {
      type: String,
      enum: ["cooked_meal", "produce", "bakery", "packaged", "other"],
      default: "cooked_meal",
    },
    readyBy: { type: Date, required: true }, // must be picked up before this
    pickupLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    pickupAddress: { type: String, trim: true },
    status: {
      type: String,
      enum: ["available", "claimed", "in_transit", "delivered", "expired", "cancelled"],
      default: "available",
      index: true,
    },
    // Populated once an NGO claims it - mock route optimization output
    route: {
      distanceKm: { type: Number },
      etaMinutes: { type: Number },
      provider: { type: String, default: "mock_osrm" },
      computedAt: { type: Date },
    },
    claimedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

donationSchema.index({ pickupLocation: "2dsphere" });

export default mongoose.model("Donation", donationSchema);
