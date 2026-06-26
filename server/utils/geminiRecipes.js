import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
function getClient() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    return null;
  }
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

const FALLBACK_RECIPES = [
  {
    title: "Quick Vegetable Khichuri",
    description:
      "A one-pot rice-and-lentil dish that's forgiving with whatever vegetables are about to turn.",
    usesIngredients: [],
    steps: [
      "Rinse rice and lentils together, drain.",
      "Sauté onion, garlic, and ginger in oil until fragrant.",
      "Add chopped vegetables and spices, cook 2 minutes.",
      "Add rice, lentils, and water; simmer 20 minutes until soft.",
    ],
  },
];

/**
 * Calls Gemini to suggest recipes for a list of soon-to-expire ingredients.
 * Returns parsed JSON recipe objects. Falls back to a static suggestion if
 * no API key is configured, so the feature still demos without one.
 */
export async function getRecipeSuggestions(ingredients) {
  const client = getClient();

  if (!client) {
    return {
      source: "fallback",
      recipes: FALLBACK_RECIPES,
      note: "GEMINI_API_KEY not configured - returning a static fallback recipe. Add a key in .env to enable live suggestions.",
    };
  }

  const ingredientList = ingredients.map((i) => i.name).join(", ");

  const prompt = `You are a recipe assistant for a food-waste reduction app used in Bangladesh.
A user has these ingredients about to expire: ${ingredientList}.
Suggest exactly 3 recipes that primarily use these ingredients, suitable for a home cook in Bangladesh (Bengali or fusion dishes are welcome, but not required).
Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "recipes": [
    {
      "title": "string",
      "description": "one sentence, under 25 words",
      "usesIngredients": ["string", "..."],
      "steps": ["string", "string", "..."]
    }
  ]
}`;

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    const parsed = JSON.parse(cleaned);

    return {
      source: "gemini",
      recipes: parsed.recipes || [],
    };
  } catch (err) {
    console.error("[gemini] recipe generation failed:", err.message);
    return {
      source: "fallback",
      recipes: FALLBACK_RECIPES,
      note: "Live Gemini call failed, showing a fallback recipe instead.",
    };
  }
}
