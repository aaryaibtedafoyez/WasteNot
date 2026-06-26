import FoodItem from "../models/FoodItem.js";
import { getRecipeSuggestions } from "../utils/geminiRecipes.js";

// Pulls the user's soon-to-expire items and asks Gemini for recipes that
// use them. If no items are near expiry, falls back to the user's
// freshest items so the feature still returns something useful to demo.
export async function suggestRecipes(req, res, next) {
  try {
    const items = await FoodItem.find({ owner: req.user._id, consumed: false });
    items.forEach((item) => item.recalculateFreshness());

    let candidates = items.filter((i) =>
      ["aging", "near_expiry"].includes(i.freshness.state)
    );

    if (candidates.length === 0) {
      candidates = items.slice(0, 5);
    }

    if (candidates.length === 0) {
      return res.json({
        recipes: [],
        message: "No food items logged yet - add some items to get recipe suggestions.",
      });
    }

    const result = await getRecipeSuggestions(candidates);

    res.json({
      basedOn: candidates.map((c) => ({ id: c._id, name: c.name, state: c.freshness.state })),
      ...result,
    });
  } catch (err) {
    next(err);
  }
}
