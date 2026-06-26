import Tesseract from "tesseract.js";
import fs from "fs";
import { extractExpiryDateFromText } from "../utils/freshnessMock.js";

// Accepts an uploaded label/packaging image, runs real OCR via Tesseract.js,
// and tries to extract an expiry date and a likely product name from the
// recognized text. The caller (frontend) shows this as a pre-filled form
// the user can confirm/edit before saving as a FoodItem.
export async function scanLabel(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded. Field name must be 'label'." });
    }

    const { data } = await Tesseract.recognize(req.file.path, "eng", {
      logger: () => {}, // suppress verbose per-page progress logs
    });

    const rawText = data.text.trim();
    const expiryDate = extractExpiryDateFromText(rawText);

    // Best-effort product name guess: first non-empty line that isn't
    // purely numeric/date-like.
    const candidateLine = rawText
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 2 && !/^\d/.test(line));

    fs.unlink(req.file.path, () => {}); // best-effort cleanup of temp upload

    res.json({
      rawText,
      guessedName: candidateLine || null,
      guessedExpiryDate: expiryDate,
      confidence: data.confidence,
    });
  } catch (err) {
    next(err);
  }
}
