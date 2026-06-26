import mongoose from "mongoose";

const FRESHNESS_STATES = ["fresh", "aging", "near_expiry", "expired"];

const foodItemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "produce",
        "dairy",
        "meat",
        "seafood",
        "grain",
        "condiment",
        "beverage",
        "leftover",
        "other",
      ],
      default: "other",
    },
    quantity: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: "pcs", trim: true },
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    storageLocation: {
      type: String,
      enum: ["fridge", "freezer", "pantry", "counter"],
      default: "fridge",
    },
    // Set by the (mocked) CNN freshness/color detection pipeline
    freshness: {
      score: { type: Number, min: 0, max: 100, default: 100 }, // 100 = perfectly fresh
      state: { type: String, enum: FRESHNESS_STATES, default: "fresh" },
      lastCheckedAt: { type: Date, default: Date.now },
      source: {
        type: String,
        enum: ["manual", "cnn_mock", "ocr"],
        default: "manual",
      },
    },
    addedVia: {
      type: String,
      enum: ["manual", "voice", "ocr"],
      default: "manual",
    },
    consumed: { type: Boolean, default: false },
    consumedAt: { type: Date },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// Derives freshness.state from days-to-expiry. Called on save and by the
// daily sweep job so state always reflects current wall-clock time.
foodItemSchema.methods.recalculateFreshness = function recalculateFreshness() {
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((this.expiryDate - now) / msPerDay);

  let state = "fresh";
  let score = this.freshness?.score ?? 100;

  if (daysLeft < 0) {
    state = "expired";
    score = 0;
  } else if (daysLeft <= 1) {
    state = "near_expiry";
    score = Math.min(score, 25);
  } else if (daysLeft <= 3) {
    state = "aging";
    score = Math.min(score, 60);
  } else {
    state = "fresh";
  }

  this.freshness.state = state;
  this.freshness.score = score;
  this.freshness.lastCheckedAt = now;
  return { daysLeft, state, score };
};

foodItemSchema.index({ owner: 1, expiryDate: 1 });

export default mongoose.model("FoodItem", foodItemSchema);
