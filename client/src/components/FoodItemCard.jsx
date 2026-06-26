import "./FoodItemCard.css";

const STATE_LABEL = {
  fresh: "Fresh",
  aging: "Aging",
  near_expiry: "Use soon",
  expired: "Expired",
};

function daysUntil(dateStr) {
  const ms = new Date(dateStr) - new Date();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function FoodItemCard({ item, onCheckFreshness, onMarkConsumed, onDelete, checking }) {
  const days = daysUntil(item.expiryDate);
  const state = item.freshness?.state || "fresh";

  let timeLabel;
  if (days < 0) timeLabel = `${Math.abs(days)}d overdue`;
  else if (days === 0) timeLabel = "expires today";
  else timeLabel = `${days}d left`;

  return (
    <div className={`item-card item-card--${state}`}>
      <div className="item-card__top">
        <div>
          <h4>{item.name}</h4>
          <p className="item-card__meta mono">
            {item.quantity} {item.unit} · {item.storageLocation}
          </p>
        </div>
        <span className={`badge badge--${state}`}>{STATE_LABEL[state]}</span>
      </div>

      <div className="item-card__freshness">
        <div className="item-card__bar">
          <div
            className={`item-card__bar-fill item-card__bar-fill--${state}`}
            style={{ width: `${item.freshness?.score ?? 100}%` }}
          />
        </div>
        <span className="mono item-card__score">{item.freshness?.score ?? 100}%</span>
      </div>

      <div className="item-card__footer">
        <span className="mono item-card__days">{timeLabel}</span>
        <div className="item-card__actions">
          <button
            className="btn btn--ghost item-card__btn"
            onClick={() => onCheckFreshness(item._id)}
            disabled={checking}
            title="Run the freshness/color check on this item"
          >
            {checking ? "Checking…" : "Check freshness"}
          </button>
          <button className="btn btn--ghost item-card__btn" onClick={() => onMarkConsumed(item._id)}>
            Used it
          </button>
          <button className="btn btn--danger item-card__btn" onClick={() => onDelete(item._id)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
