/**
 * MOCK CNN FRESHNESS / COLOR DETECTION
 * ------------------------------------
 * The pitch describes a CNN that looks at fridge-camera frames and scores
 * freshness from color/texture cues. Training and serving a real model is
 * out of scope here, so this simulates that model's *output contract* -
 * same shape a real inference service would return - using expiry-date math
 * plus small randomized jitter so repeated checks don't look perfectly
 * deterministic (real vision models don't return identical scores frame
 * to frame either).
 *
 * Swap point: replace the body of `runFreshnessDetection` with a real call
 * to a hosted model (e.g. a TF Serving / Replicate / SageMaker endpoint)
 * that accepts an image and returns { score, state }. Keep the same
 * function signature and the rest of the app doesn't need to change.
 */

const CATEGORY_DECAY_RATES = {
  produce: 1.3,
  dairy: 1.2,
  meat: 1.5,
  seafood: 1.7,
  grain: 0.4,
  condiment: 0.3,
  beverage: 0.5,
  leftover: 1.6,
  other: 1.0,
};

function jitter(base, spread) {
  return base + (Math.random() * spread * 2 - spread);
}

export function runFreshnessDetection({ category, purchaseDate, expiryDate }) {
  const now = new Date();
  const totalLifespanMs = new Date(expiryDate) - new Date(purchaseDate);
  const elapsedMs = now - new Date(purchaseDate);

  const lifeFraction = totalLifespanMs > 0 ? elapsedMs / totalLifespanMs : 1;
  const decayRate = CATEGORY_DECAY_RATES[category] ?? 1.0;

  // Base score decays nonlinearly as the item approaches expiry, scaled by
  // how fast that category typically degrades visually. Past the expiry
  // date itself (lifeFraction >= 1), score should already be solidly in
  // "expired" territory rather than borderline.
  let score;
  if (lifeFraction >= 1) {
    const overdueFraction = Math.min(lifeFraction - 1, 1); // how far past expiry, capped
    score = 12 - overdueFraction * 12; // 0-12 range once past expiry
  } else {
    score = 100 - Math.pow(Math.max(lifeFraction, 0), 1.4) * 100 * decayRate * 0.65;
  }
  score = jitter(score, 3);
  score = Math.max(0, Math.min(100, Math.round(score)));

  let state;
  if (score >= 70) state = "fresh";
  else if (score >= 45) state = "aging";
  else if (score >= 15) state = "near_expiry";
  else state = "expired";

  return {
    score,
    state,
    confidence: Math.round(jitter(91, 4)), // mock model confidence %
    source: "cnn_mock",
    checkedAt: now,
  };
}

/**
 * MOCK OCR LABEL PARSE
 * ---------------------
 * Real OCR (Tesseract.js) runs in ocrController.js on uploaded images.
 * This helper just extracts a plausible expiry date from raw OCR text
 * using common date patterns found on packaging.
 */
export function extractExpiryDateFromText(rawText) {
  // YYYY-MM-DD checked first and anchored with \b so "2026-08-15" can't be
  // partially re-matched by the DD/MM/YY pattern as "26-08-15".
  const yyyyFirst = /\b(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})\b/;
  const ddFirst = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/;

  const yMatch = rawText.match(yyyyFirst);
  if (yMatch) {
    const [, year, month, day] = yMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }

  const dMatch = rawText.match(ddFirst);
  if (dMatch) {
    const [, day, month, yearRaw] = dMatch;
    let year = Number(yearRaw);
    if (year < 100) year += 2000;
    const date = new Date(year, Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}
