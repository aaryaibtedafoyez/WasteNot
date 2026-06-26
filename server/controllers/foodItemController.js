import FoodItem from "../models/FoodItem.js";
import { runFreshnessDetection } from "../utils/freshnessMock.js";

export async function createFoodItem(req, res, next) {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      purchaseDate,
      expiryDate,
      storageLocation,
      addedVia,
      notes,
    } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({ message: "name and expiryDate are required" });
    }

    const item = new FoodItem({
      owner: req.user._id,
      name,
      category,
      quantity,
      unit,
      purchaseDate,
      expiryDate,
      storageLocation,
      addedVia: addedVia || "manual",
      notes,
    });

    item.recalculateFreshness();
    await item.save();

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

// Returns all of the requesting user's items, freshest-expiring-first,
// with freshness state recalculated against the current time on read.
export async function listFoodItems(req, res, next) {
  try {
    const { storageLocation, category, includeConsumed } = req.query;

    const filter = { owner: req.user._id };
    if (storageLocation) filter.storageLocation = storageLocation;
    if (category) filter.category = category;
    if (includeConsumed !== "true") filter.consumed = false;

    const items = await FoodItem.find(filter).sort({ expiryDate: 1 });

    items.forEach((item) => item.recalculateFreshness());

    res.json({ items, count: items.length });
  } catch (err) {
    next(err);
  }
}

export async function getFoodItem(req, res, next) {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.recalculateFreshness();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function updateFoodItem(req, res, next) {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const editable = [
      "name",
      "category",
      "quantity",
      "unit",
      "expiryDate",
      "storageLocation",
      "notes",
      "consumed",
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    if (req.body.consumed === true && !item.consumedAt) {
      item.consumedAt = new Date();
    }

    item.recalculateFreshness();
    await item.save();

    res.json({ item });
  } catch (err) {
    next(err);
  }
}

export async function deleteFoodItem(req, res, next) {
  try {
    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

// Runs the (mocked) CNN freshness/color check against a single item and
// persists the result - this is what the "fridge monitor" camera loop
// would call per item per scan cycle in a real deployment.
export async function checkFreshness(req, res, next) {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) return res.status(404).json({ message: "Item not found" });

    const result = runFreshnessDetection({
      category: item.category,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate,
    });

    item.freshness = {
      score: result.score,
      state: result.state,
      lastCheckedAt: result.checkedAt,
      source: result.source,
    };
    await item.save();

    res.json({ item, detection: result });
  } catch (err) {
    next(err);
  }
}

// Dashboard summary: counts by freshness state, soonest-expiring items.
export async function getDashboardSummary(req, res, next) {
  try {
    const items = await FoodItem.find({ owner: req.user._id, consumed: false });
    items.forEach((item) => item.recalculateFreshness());

    const counts = { fresh: 0, aging: 0, near_expiry: 0, expired: 0 };
    items.forEach((item) => {
      counts[item.freshness.state] = (counts[item.freshness.state] || 0) + 1;
    });

    const expiringSoon = items
      .filter((i) => ["aging", "near_expiry"].includes(i.freshness.state))
      .sort((a, b) => a.expiryDate - b.expiryDate)
      .slice(0, 5);

    res.json({
      totalItems: items.length,
      counts,
      expiringSoon,
    });
  } catch (err) {
    next(err);
  }
}
