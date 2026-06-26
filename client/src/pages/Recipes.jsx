import { useEffect, useState } from "react";
import { recipeApi } from "../api/endpoints";
import "./Recipes.css";

export default function Recipes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRecipes() {
    setLoading(true);
    setError("");
    try {
      const { data } = await recipeApi.suggestions();
      setData(data);
    } catch (err) {
      setError("Couldn't fetch recipe suggestions right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <div className="recipes">
      <div className="recipes__header">
        <div>
          <h1>What to cook</h1>
          <p className="dashboard__sub">
            Suggestions built around what's about to expire in your shelf.
          </p>
        </div>
        <button className="btn btn--ghost" onClick={loadRecipes} disabled={loading}>
          {loading ? "Thinking…" : "Refresh suggestions"}
        </button>
      </div>

      {data?.basedOn?.length > 0 && (
        <div className="recipes__based-on">
          <span className="mono">based on:</span>
          {data.basedOn.map((item) => (
            <span key={item.id} className={`badge badge--${item.state}`}>
              {item.name}
            </span>
          ))}
        </div>
      )}

      {data?.source === "fallback" && data?.note && (
        <p className="recipes__note">{data.note}</p>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="mono" style={{ color: "var(--ink-soft)" }}>
          Asking the recipe engine…
        </p>
      ) : data?.recipes?.length === 0 ? (
        <div className="empty-state card">
          <h3>{data.message ? "Nothing to suggest yet" : "No recipes found"}</h3>
          <p>{data.message || "Try adding more items to your shelf."}</p>
        </div>
      ) : (
        <div className="recipes__grid">
          {data?.recipes?.map((recipe, i) => (
            <div className="card recipe-card" key={i}>
              <h3>{recipe.title}</h3>
              <p className="recipe-card__desc">{recipe.description}</p>
              {recipe.usesIngredients?.length > 0 && (
                <div className="recipe-card__tags">
                  {recipe.usesIngredients.map((ing, j) => (
                    <span key={j} className="recipe-card__tag mono">
                      {ing}
                    </span>
                  ))}
                </div>
              )}
              <ol className="recipe-card__steps">
                {recipe.steps?.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
