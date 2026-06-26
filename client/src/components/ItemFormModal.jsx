import { useState } from "react";
import "./ItemFormModal.css";

const CATEGORIES = ["produce", "dairy", "meat", "seafood", "grain", "condiment", "beverage", "leftover", "other"];
const LOCATIONS = ["fridge", "freezer", "pantry", "counter"];

function todayPlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ItemFormModal({ onClose, onSubmit, prefill }) {
  const [form, setForm] = useState({
    name: prefill?.name || "",
    category: "produce",
    quantity: 1,
    unit: "pcs",
    expiryDate: prefill?.expiryDate || todayPlusDays(5),
    storageLocation: "fridge",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Give the item a name.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save that item.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <form
        className="card modal-card"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3>Add to your shelf</h3>

        <div className="form-field">
          <label htmlFor="item-name">Item name</label>
          <input
            id="item-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Tomatoes"
            autoFocus
          />
        </div>

        <div className="modal-card__row">
          <div className="form-field">
            <label htmlFor="item-category">Category</label>
            <select
              id="item-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="item-location">Storage</label>
            <select
              id="item-location"
              value={form.storageLocation}
              onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-card__row">
          <div className="form-field">
            <label htmlFor="item-qty">Quantity</label>
            <input
              id="item-qty"
              type="number"
              min="0"
              step="0.5"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="item-unit">Unit</label>
            <input
              id="item-unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="pcs, g, ml…"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="item-expiry">Expiry date</label>
          <input
            id="item-expiry"
            type="date"
            required
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label htmlFor="item-notes">Notes (optional)</label>
          <textarea
            id="item-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-card__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save item"}
          </button>
        </div>
      </form>
    </div>
  );
}
