import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { donationApi } from "../api/endpoints";
import "./Donations.css";

function PostSurplusForm({ onCreated }) {
  const [form, setForm] = useState({
    foodDescription: "",
    estimatedServings: 10,
    category: "cooked_meal",
    readyBy: "",
    pickupAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await donationApi.create(form);
      setForm({ foodDescription: "", estimatedServings: 10, category: "cooked_meal", readyBy: "", pickupAddress: "" });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post this surplus.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card donation-form" onSubmit={handleSubmit}>
      <h3>Post surplus food</h3>
      <div className="form-field">
        <label htmlFor="desc">What's available</label>
        <input
          id="desc"
          required
          value={form.foodDescription}
          onChange={(e) => setForm({ ...form, foodDescription: e.target.value })}
          placeholder="e.g. 40 portions of biryani, untouched"
        />
      </div>
      <div className="donation-form__row">
        <div className="form-field">
          <label htmlFor="servings">Est. servings</label>
          <input
            id="servings"
            type="number"
            min="1"
            value={form.estimatedServings}
            onChange={(e) => setForm({ ...form, estimatedServings: Number(e.target.value) })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="cooked_meal">Cooked meal</option>
            <option value="produce">Produce</option>
            <option value="bakery">Bakery</option>
            <option value="packaged">Packaged</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="readyBy">Must be picked up by</label>
        <input
          id="readyBy"
          type="datetime-local"
          required
          value={form.readyBy}
          onChange={(e) => setForm({ ...form, readyBy: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label htmlFor="pickupAddress">Pickup address</label>
        <input
          id="pickupAddress"
          value={form.pickupAddress}
          onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
          placeholder="Defaults to your registered address"
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn--accent" type="submit" disabled={submitting}>
        {submitting ? "Posting…" : "Post surplus"}
      </button>
    </form>
  );
}

function statusBadgeClass(status) {
  if (status === "available") return "badge--fresh";
  if (status === "claimed" || status === "in_transit") return "badge--aging";
  if (status === "delivered") return "badge--fresh";
  return "badge--expired";
}

function RestaurantView() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await donationApi.mine();
    setDonations(data.donations);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="donations__layout">
      <PostSurplusForm onCreated={load} />
      <div>
        <h3 className="donations__list-title">Your posted surplus</h3>
        {loading ? (
          <p className="mono" style={{ color: "var(--ink-soft)" }}>
            Loading…
          </p>
        ) : donations.length === 0 ? (
          <div className="empty-state card">
            <h3>No surplus posted yet</h3>
            <p>Use the form to list food before it goes to waste.</p>
          </div>
        ) : (
          <div className="donations__cards">
            {donations.map((d) => (
              <div className="card donation-card" key={d._id}>
                <div className="donation-card__top">
                  <strong>{d.foodDescription}</strong>
                  <span className={`badge ${statusBadgeClass(d.status)}`}>{d.status}</span>
                </div>
                <p className="mono donation-card__meta">
                  {d.estimatedServings} servings · ready by{" "}
                  {new Date(d.readyBy).toLocaleString()}
                </p>
                {d.route?.distanceKm && (
                  <p className="mono donation-card__meta">
                    matched route: {d.route.distanceKm}km · {d.route.etaMinutes}min ETA
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NgoView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await donationApi.available();
    setResults(data.results);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClaim(id) {
    setClaimingId(id);
    try {
      await donationApi.claim(id);
      await load();
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div>
      <h3 className="donations__list-title">Available surplus near you</h3>
      <p className="dashboard__sub" style={{ marginBottom: 20 }}>
        Ranked by estimated pickup distance.
      </p>
      {loading ? (
        <p className="mono" style={{ color: "var(--ink-soft)" }}>
          Loading…
        </p>
      ) : results.length === 0 ? (
        <div className="empty-state card">
          <h3>No surplus available right now</h3>
          <p>Check back soon — restaurants post throughout the day.</p>
        </div>
      ) : (
        <div className="donations__cards">
          {results.map(({ donation, route }) => (
            <div className="card donation-card" key={donation._id}>
              <div className="donation-card__top">
                <strong>{donation.foodDescription}</strong>
                <span className="mono donation-card__distance">{route.distanceKm}km away</span>
              </div>
              <p className="mono donation-card__meta">
                {donation.estimatedServings} servings · from{" "}
                {donation.donor?.organizationName || donation.donor?.name}
              </p>
              <p className="mono donation-card__meta">
                ready by {new Date(donation.readyBy).toLocaleString()} · ~{route.etaMinutes}min ETA
              </p>
              <button
                className="btn btn--primary"
                onClick={() => handleClaim(donation._id)}
                disabled={claimingId === donation._id}
              >
                {claimingId === donation._id ? "Claiming…" : "Claim this pickup"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Donations() {
  const { user } = useAuth();

  return (
    <div className="donations">
      <div className="dashboard__header">
        <div>
          <h1>Surplus board</h1>
          <p className="dashboard__sub">
            {user.role === "restaurant"
              ? "Post what's left over and get it matched with a nearby NGO."
              : "Claim available surplus, ranked by how fast you can get there."}
          </p>
        </div>
      </div>

      {user.role === "restaurant" ? <RestaurantView /> : <NgoView />}
    </div>
  );
}
