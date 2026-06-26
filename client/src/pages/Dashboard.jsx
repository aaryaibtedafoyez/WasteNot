import { useEffect, useState, useCallback } from "react";
import { foodItemApi } from "../api/endpoints";
import FoodItemCard from "../components/FoodItemCard";
import ItemFormModal from "../components/ItemFormModal";
import ScanLabelModal from "../components/ScanLabelModal";
import "./Dashboard.css";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanPrefill, setScanPrefill] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [itemsRes, summaryRes] = await Promise.all([
        foodItemApi.list(),
        foodItemApi.dashboard(),
      ]);
      setItems(itemsRes.data.items);
      setSummary(summaryRes.data);
    } catch (err) {
      setError("Couldn't load your shelf. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddItem(formData) {
    await foodItemApi.create(formData);
    await loadData();
  }

  async function handleCheckFreshness(id) {
    setCheckingId(id);
    try {
      await foodItemApi.checkFreshness(id);
      await loadData();
    } finally {
      setCheckingId(null);
    }
  }

  async function handleMarkConsumed(id) {
    await foodItemApi.update(id, { consumed: true });
    await loadData();
  }

  async function handleDelete(id) {
    await foodItemApi.remove(id);
    await loadData();
  }

  function handleScanned(prefill) {
    setShowScanModal(false);
    setScanPrefill(prefill);
    setShowAddModal(true);
  }

  const filteredItems = items.filter((item) =>
    filter === "all" ? true : item.freshness?.state === filter
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Your shelf</h1>
          <p className="dashboard__sub">Everything in your fridge, freezer, and pantry, tracked live.</p>
        </div>
        <div className="dashboard__header-actions">
          <button className="btn btn--ghost" onClick={() => setShowScanModal(true)}>
            Scan a label
          </button>
          <button className="btn btn--accent" onClick={() => { setScanPrefill(null); setShowAddModal(true); }}>
            + Add item
          </button>
        </div>
      </div>

      {summary && (
        <div className="dashboard__stats">
          <button
            className={`stat-card ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className="stat-card__num mono">{summary.totalItems}</span>
            <span className="stat-card__label">Total items</span>
          </button>
          <button
            className={`stat-card stat-card--fresh ${filter === "fresh" ? "is-active" : ""}`}
            onClick={() => setFilter("fresh")}
          >
            <span className="stat-card__num mono">{summary.counts.fresh}</span>
            <span className="stat-card__label">Fresh</span>
          </button>
          <button
            className={`stat-card stat-card--aging ${filter === "aging" ? "is-active" : ""}`}
            onClick={() => setFilter("aging")}
          >
            <span className="stat-card__num mono">{summary.counts.aging}</span>
            <span className="stat-card__label">Aging</span>
          </button>
          <button
            className={`stat-card stat-card--near_expiry ${filter === "near_expiry" ? "is-active" : ""}`}
            onClick={() => setFilter("near_expiry")}
          >
            <span className="stat-card__num mono">{summary.counts.near_expiry}</span>
            <span className="stat-card__label">Use soon</span>
          </button>
          <button
            className={`stat-card stat-card--expired ${filter === "expired" ? "is-active" : ""}`}
            onClick={() => setFilter("expired")}
          >
            <span className="stat-card__num mono">{summary.counts.expired}</span>
            <span className="stat-card__label">Expired</span>
          </button>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="mono" style={{ color: "var(--ink-soft)" }}>
          Loading shelf…
        </p>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state card">
          <h3>{items.length === 0 ? "Your shelf is empty" : "Nothing in this category"}</h3>
          <p>
            {items.length === 0
              ? "Add your first item to start tracking freshness and getting recipe ideas."
              : "Try a different filter above."}
          </p>
        </div>
      ) : (
        <div className="dashboard__grid">
          {filteredItems.map((item) => (
            <FoodItemCard
              key={item._id}
              item={item}
              checking={checkingId === item._id}
              onCheckFreshness={handleCheckFreshness}
              onMarkConsumed={handleMarkConsumed}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <ItemFormModal
          prefill={scanPrefill}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddItem}
        />
      )}

      {showScanModal && (
        <ScanLabelModal onClose={() => setShowScanModal(false)} onScanned={handleScanned} />
      )}
    </div>
  );
}
