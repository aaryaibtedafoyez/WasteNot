import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defaultRole = params.get("role") === "restaurant" ? "restaurant" : "household";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    organizationName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOrg = form.role === "restaurant" || form.role === "ngo";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signup(form);
      navigate(isOrg ? "/donations" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fruits = [
    '🍎', '🍌', '🥬', '🍅', '🥑', '🍊', '🍇', '🥕', 
    '🍆', '🥦', '🌽', '🍋', '🍐', '🍑', '🍒', '🫐',
    '🍓', '🥝', '🍉', '🍈', '🥭', '🍍', '🧄', '🧅',
    '🥔', '🍠', '🥒', '🌶️', '🫑', '🧀', '🥚', '🍞'
  ];

  const floatingFruits = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: fruits[i % fruits.length],
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1.5 + Math.random() * 2.5,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 20,
    rotation: Math.random() * 360,
    opacity: 0.06 + Math.random() * 0.08,
  }));

  const styles = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      margin: 0;
    }

    .auth-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      position: relative;
      background: #F5F0EB;
      overflow: hidden;
    }

    /* Subtle texture overlay */
    .auth-page::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(123, 91, 154, 0.04) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(196, 168, 130, 0.04) 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    /* Floating fruits container */
    .auth-page__floating {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .auth-page__fruit {
      position: absolute;
      font-size: 2rem;
      animation: float-fruit 20s ease-in-out infinite;
      filter: drop-shadow(0 2px 8px rgba(45, 27, 61, 0.06));
      will-change: transform;
    }

    @keyframes float-fruit {
      0% {
        transform: translate(0, 0) rotate(0deg) scale(1);
      }
      25% {
        transform: translate(30px, -25px) rotate(8deg) scale(1.05);
      }
      50% {
        transform: translate(-25px, 30px) rotate(-6deg) scale(0.95);
      }
      75% {
        transform: translate(20px, 20px) rotate(5deg) scale(1.02);
      }
      100% {
        transform: translate(0, 0) rotate(0deg) scale(1);
      }
    }

    /* Card matching navbar aesthetic */
    .auth-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: 44px 40px 48px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 24px;
      border: 1px solid rgba(184, 160, 201, 0.15);
      box-shadow: 
        0 4px 24px rgba(45, 27, 61, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
      max-height: 90vh;
      overflow-y: auto;
    }

    .auth-card::-webkit-scrollbar {
      width: 4px;
    }

    .auth-card::-webkit-scrollbar-track {
      background: transparent;
    }

    .auth-card::-webkit-scrollbar-thumb {
      background: rgba(184, 160, 201, 0.2);
      border-radius: 2px;
    }

    .auth-card:hover {
      box-shadow: 
        0 8px 40px rgba(45, 27, 61, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
      transform: translateY(-2px);
    }

    /* Decorative food emoji on card */
    .auth-card__decor {
      position: absolute;
      font-size: 2.8rem;
      opacity: 0.06;
      pointer-events: none;
    }

    .auth-card__decor--1 { top: -8px; right: -8px; transform: rotate(15deg); }
    .auth-card__decor--2 { bottom: -8px; left: -8px; transform: rotate(-10deg); font-size: 2.2rem; }
    .auth-card__decor--3 { top: 50%; right: -12px; transform: rotate(25deg); font-size: 1.8rem; opacity: 0.04; }

    .auth-card h2 {
      font-size: 1.6rem;
      font-weight: 300;
      color: #2D1B3D;
      letter-spacing: -0.01em;
      margin-bottom: 6px;
    }

    .auth-card__sub {
      font-size: 0.92rem;
      color: #4A4050;
      margin-bottom: 30px;
      font-weight: 350;
      border-left: 3px solid #B8A0C9;
      padding-left: 14px;
    }

    .form-field {
      margin-bottom: 20px;
    }

    .form-field label {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7B5B9A;
      margin-bottom: 6px;
      font-weight: 500;
    }

    .form-field input {
      width: 100%;
      padding: 13px 16px;
      background: rgba(245, 240, 235, 0.5);
      border: 1.5px solid rgba(184, 160, 201, 0.12);
      border-radius: 8px;
      color: #1A1420;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s ease;
      outline: none;
    }

    .form-field input::placeholder {
      color: rgba(74, 64, 80, 0.2);
    }

    .form-field input:focus {
      border-color: #7B5B9A;
      background: rgba(245, 240, 235, 0.7);
      box-shadow: 0 0 0 4px rgba(123, 91, 154, 0.04);
    }

    .form-field input:hover {
      border-color: rgba(123, 91, 154, 0.2);
    }

    /* Role Toggle */
    .role-toggle {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .role-toggle__option {
      padding: 10px 8px;
      border: 1.5px solid rgba(184, 160, 201, 0.12);
      border-radius: 8px;
      background: rgba(245, 240, 235, 0.3);
      color: #4A4050;
      font-size: 0.82rem;
      font-weight: 400;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      text-align: center;
    }

    .role-toggle__option:hover {
      border-color: rgba(123, 91, 154, 0.2);
      background: rgba(245, 240, 235, 0.5);
    }

    .role-toggle__option.is-active {
      background: rgba(123, 91, 154, 0.08);
      border-color: #7B5B9A;
      color: #2D1B3D;
      font-weight: 500;
    }

    .error-text {
      color: #8B5E4A;
      font-size: 0.85rem;
      padding: 10px 14px;
      background: rgba(139, 94, 74, 0.04);
      border-radius: 8px;
      border: 1px solid rgba(139, 94, 74, 0.06);
      margin: 0 0 20px;
    }

    .btn {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.3s ease;
      border: 1.5px solid transparent;
      cursor: pointer;
      font-family: inherit;
      line-height: 1.4;
      width: 100%;
      text-align: center;
      letter-spacing: 0.02em;
    }

    .btn--primary {
      background: linear-gradient(135deg, #4A2B5E, #7B5B9A);
      color: white;
      border-color: #4A2B5E;
      box-shadow: 0 2px 16px rgba(74, 43, 94, 0.12);
    }

    .btn--primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 28px rgba(74, 43, 94, 0.2);
      background: linear-gradient(135deg, #5B3A72, #8B6BAA);
    }

    .btn--primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .auth-card__footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.85rem;
      color: #4A4050;
    }

    .auth-card__footer a {
      color: #7B5B9A;
      text-decoration: none;
      font-weight: 400;
      transition: all 0.3s ease;
      border-bottom: 1.5px solid rgba(123, 91, 154, 0.1);
      padding-bottom: 2px;
    }

    .auth-card__footer a:hover {
      color: #4A2B5E;
      border-bottom-color: #4A2B5E;
    }

    /* Fun food row at bottom */
    .auth-card__food-row {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid rgba(184, 160, 201, 0.06);
    }

    .auth-card__food-row span {
      font-size: 1.1rem;
      opacity: 0.15;
      transition: all 0.3s ease;
      cursor: default;
    }

    .auth-card__food-row span:hover {
      opacity: 0.4;
      transform: scale(1.2) rotate(-5deg);
    }

    @media (max-width: 480px) {
      .auth-page {
        padding: 16px;
      }
      .auth-card {
        padding: 28px 20px 32px;
        border-radius: 18px;
        max-height: 95vh;
      }
      .auth-card h2 {
        font-size: 1.3rem;
      }
      .auth-card__sub {
        font-size: 0.85rem;
        padding-left: 12px;
      }
      .form-field input {
        padding: 11px 14px;
        font-size: 0.9rem;
      }
      .role-toggle {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .role-toggle__option {
        padding: 8px 12px;
        font-size: 0.78rem;
      }
      .auth-page__fruit {
        font-size: 1.2rem !important;
      }
      .auth-card__food-row span {
        font-size: 0.9rem;
      }
      .auth-card__decor {
        font-size: 2rem !important;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        {/* Floating fruits */}
        <div className="auth-page__floating">
          {floatingFruits.map((fruit) => (
            <span
              key={fruit.id}
              className="auth-page__fruit"
              style={{
                top: `${fruit.top}%`,
                left: `${fruit.left}%`,
                fontSize: `${fruit.size}rem`,
                animationDelay: `${fruit.delay}s`,
                animationDuration: `${fruit.duration}s`,
                opacity: fruit.opacity,
                transform: `rotate(${fruit.rotation}deg)`,
              }}
            >
              {fruit.emoji}
            </span>
          ))}
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* Decorative food emojis on card */}
          <span className="auth-card__decor auth-card__decor--1">🍎</span>
          <span className="auth-card__decor auth-card__decor--2">🥕</span>
          <span className="auth-card__decor auth-card__decor--3">🥬</span>

          <h2>Create your account</h2>
          <p className="auth-card__sub">Track a kitchen, or list and claim surplus food.</p>

          <div className="form-field">
            <label>I am signing up as</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-toggle__option ${form.role === "household" ? "is-active" : ""}`}
                onClick={() => setForm({ ...form, role: "household" })}
              >
                 Household
              </button>
              <button
                type="button"
                className={`role-toggle__option ${form.role === "restaurant" ? "is-active" : ""}`}
                onClick={() => setForm({ ...form, role: "restaurant" })}
              >
                 Restaurant
              </button>
              <button
                type="button"
                className={`role-toggle__option ${form.role === "ngo" ? "is-active" : ""}`}
                onClick={() => setForm({ ...form, role: "ngo" })}
              >
                 NGO
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="name">{isOrg ? "Contact name" : "Full name"}</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isOrg ? "Your full name" : "Your full name"}
            />
          </div>

          {isOrg && (
            <div className="form-field">
              <label htmlFor="organizationName">
                {form.role === "restaurant" ? "Restaurant name" : "Organization name"}
              </label>
              <input
                id="organizationName"
                required
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder={form.role === "restaurant" ? "Your restaurant name" : "Your organization name"}
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>

          {isOrg && (
            <div className="form-field">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Used to match nearby pickups"
              />
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn--primary" type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-card__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          
        </form>
      </div>
    </>
  );
}