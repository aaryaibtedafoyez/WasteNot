import { useState } from "react";
import { ocrApi } from "../api/endpoints";
import "./ItemFormModal.css";

export default function ScanLabelModal({ onClose, onScanned }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function handleScan() {
    if (!file) return;
    setScanning(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("label", file);
      const { data } = await ocrApi.scanLabel(formData);

      onScanned({
        name: data.guessedName || "",
        expiryDate: data.guessedExpiryDate
          ? new Date(data.guessedExpiryDate).toISOString().slice(0, 10)
          : "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't read that label. Try a clearer photo, or enter it manually."
      );
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="card modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Scan a label</h3>
        <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", marginTop: 0 }}>
          Upload a photo of the packaging. We'll read the expiry date and product name with OCR.
        </p>

        <div className="form-field">
          <label htmlFor="label-photo">Label photo</label>
          <input id="label-photo" type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        {preview && (
          <img
            src={preview}
            alt="Label preview"
            style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 8, marginBottom: 12 }}
          />
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="modal-card__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleScan}
            disabled={!file || scanning}
          >
            {scanning ? "Reading label…" : "Scan label"}
          </button>
        </div>
      </div>
    </div>
  );
}
