import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Demo items with refined naming
const SHELF_SEED = [
  { name: "Heirloom Tomatoes", category: "produce", lifespanSec: 18, elapsed: 2 },
  { name: "Jersey Milk", category: "dairy", lifespanSec: 22, elapsed: 14 },
  { name: "Khichuri", category: "leftover", lifespanSec: 14, elapsed: 11 },
  { name: "Free-range Chicken", category: "meat", lifespanSec: 26, elapsed: 6 },
  { name: "Basmati Rice", category: "grain", lifespanSec: 40, elapsed: 3 },
  { name: "Spinach", category: "produce", lifespanSec: 16, elapsed: 15.5 },
];

function stateForFraction(f) {
  if (f >= 1) return "expired";
  if (f >= 0.78) return "near_expiry";
  if (f >= 0.45) return "aging";
  return "fresh";
}

function ShelfStrip() {
  const [items, setItems] = useState(() =>
    SHELF_SEED.map((item) => ({ ...item }))
  );
  const frameRef = useRef();

  useEffect(() => {
    let last = performance.now();

    function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      setItems((prev) =>
        prev.map((item) => {
          let elapsed = item.elapsed + dt;
          if (elapsed > item.lifespanSec) elapsed = 0;
          return { ...item, elapsed };
        })
      );
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="shelf-strip" role="group" aria-label="Live freshness tracking">
      {items.map((item, i) => {
        const fraction = Math.min(item.elapsed / item.lifespanSec, 1);
        const state = stateForFraction(fraction);
        const secondsLeft = Math.max(0, Math.round(item.lifespanSec - item.elapsed));
        return (
          <div className={`shelf-card shelf-card--${state}`} key={i}>
            <div className="shelf-card__fill" style={{ height: `${fraction * 100}%` }} />
            <div className="shelf-card__content">
              <span className="shelf-card__name">{item.name}</span>
              <span className="shelf-card__time mono">
                {state === "expired" ? "spoiled" : `${secondsLeft}d left`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = `
:root {
  --purple-deep: #2D1B3D;
  --purple-mid: #4A2B5E;
  --purple-soft: #7B5B9A;
  --purple-pale: #B8A0C9;
  --purple-wash: #F0EBF5;
  --cream: #F5F0EB;
  --beige: #E8E0D8;
  --ink: #1A1420;
  --ink-soft: #4A4050;
  --gold: #C4A882;
  --gold-light: #DEC9B0;
  --brick: #8B5E4A;
  --leaf-green: #6B8F71;
  --green-pale: #A8C4AC;
  --shadow: 0 4px 24px rgba(45, 27, 61, 0.08);
  --shadow-hover: 0 8px 40px rgba(45, 27, 61, 0.14);
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --transition: 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.mono {
  font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
  letter-spacing: 0.02em;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--cream);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  transition: var(--transition);
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
}

.btn--primary {
  background: var(--purple-mid);
  color: white;
  border-color: var(--purple-mid);
}

.btn--primary:hover {
  background: var(--purple-deep);
  border-color: var(--purple-deep);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.btn--ghost {
  background: transparent;
  color: var(--purple-mid);
  border-color: var(--purple-pale);
}

.btn--ghost:hover {
  background: var(--purple-wash);
  border-color: var(--purple-soft);
}

.btn--accent {
  background: var(--gold);
  color: var(--purple-deep);
  border-color: var(--gold);
}

.btn--accent:hover {
  background: var(--gold-light);
  border-color: var(--gold-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-hover);
}

.landing {
  display: flex;
  flex-direction: column;
  gap: 96px;
  padding: 64px 32px 96px;
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
}

.landing__hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 64px;
  align-items: center;
}

.landing__eyebrow {
  color: var(--purple-soft);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 16px;
  font-weight: 500;
  position: relative;
  padding-left: 40px;
}

.landing__eyebrow::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 24px;
  height: 1.5px;
  background: var(--gold);
  transform: translateY(-50%);
}

.landing__hero-text h1 {
  font-size: clamp(2.4rem, 4.5vw, 3.6rem);
  line-height: 1.15;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--purple-deep);
}

.landing__hero-text h1 strong {
  font-weight: 500;
  color: var(--purple-mid);
}

.landing__lede {
  font-size: 1.05rem;
  color: var(--ink-soft);
  max-width: 480px;
  margin: 24px 0 32px;
  font-weight: 350;
  line-height: 1.7;
}

.landing__cta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.landing__hero-visual {
  background: linear-gradient(145deg, var(--purple-deep), var(--purple-mid));
  border-radius: var(--radius-lg);
  padding: 32px 28px 28px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}

.landing__hero-visual::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(123, 91, 154, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.landing__hero-visual-label {
  color: rgba(247, 243, 232, 0.4);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin: 0 0 18px;
  font-weight: 400;
}

/* Wabi-sabi shelf styling */
.shelf-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.shelf-card {
  position: relative;
  height: 96px;
  border-radius: var(--radius-sm);
  background: rgba(247, 243, 232, 0.04);
  border: 1px solid rgba(247, 243, 232, 0.06);
  overflow: hidden;
  transition: var(--transition);
}

.shelf-card:hover {
  border-color: rgba(247, 243, 232, 0.15);
  transform: translateY(-2px);
}

.shelf-card__fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transition: height 0.4s ease, background 0.8s ease;
  background: var(--green-pale);
  opacity: 0.7;
}

.shelf-card--aging .shelf-card__fill {
  background: var(--gold-light);
  opacity: 0.6;
}

.shelf-card--near_expiry .shelf-card__fill {
  background: var(--gold);
  opacity: 0.7;
}

.shelf-card--expired .shelf-card__fill {
  background: var(--brick);
  opacity: 0.8;
}

.shelf-card__content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 14px;
}

.shelf-card__name {
  color: rgba(247, 243, 232, 0.9);
  font-weight: 400;
  font-size: 0.82rem;
  letter-spacing: 0.01em;
}

.shelf-card__time {
  color: rgba(247, 243, 232, 0.5);
  font-size: 0.65rem;
  font-weight: 350;
}

/* Minimalist section dividers */
.landing__seam {
  display: flex;
  justify-content: center;
  margin: -48px 0 0;
}

.landing__pipeline h2 {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 40px;
  text-align: center;
  letter-spacing: -0.01em;
  color: var(--purple-deep);
}

.pipeline {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.pipeline__step {
  padding: 24px 20px;
  border-top: 2px solid var(--purple-pale);
  transition: var(--transition);
}

.pipeline__step:hover {
  border-top-color: var(--purple-soft);
  background: var(--purple-wash);
  border-radius: var(--radius-sm);
}

.pipeline__num {
  display: block;
  font-size: 0.65rem;
  color: var(--purple-soft);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 12px;
  font-weight: 500;
}

.pipeline__step h3 {
  font-size: 1.05rem;
  font-weight: 450;
  margin-bottom: 8px;
  color: var(--purple-deep);
}

.pipeline__step p {
  color: var(--ink-soft);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 350;
  line-height: 1.6;
}

.landing__split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: var(--radius-md);
  padding: 32px;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid rgba(184, 160, 201, 0.15);
}

.card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.landing__split-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.landing__split-card h3 {
  font-size: 1.2rem;
  font-weight: 450;
  color: var(--purple-deep);
  letter-spacing: -0.01em;
}

.landing__split-card p {
  color: var(--ink-soft);
  margin: 0;
  flex: 1;
  font-weight: 350;
  line-height: 1.7;
}

.landing__split-card .btn {
  align-self: flex-start;
  margin-top: 8px;
}

/* Imperfect, wabi-sabi decorative touches */
.landing__hero::after {
  content: '';
  position: absolute;
  bottom: 80px;
  right: 20%;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, var(--purple-pale) 1px, transparent 1px);
  background-size: 8px 8px;
  opacity: 0.1;
  pointer-events: none;
  border-radius: 50%;
}

/* Subtle texture overlay */
.landing {
  position: relative;
}

.landing::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(123, 91, 154, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(196, 168, 130, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

@media (max-width: 880px) {
  .landing__hero {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .pipeline {
    grid-template-columns: repeat(2, 1fr);
  }
  .landing__split {
    grid-template-columns: 1fr;
  }
  .landing__hero-text h1 {
    font-size: clamp(2rem, 5vw, 2.8rem);
  }
}

@media (max-width: 480px) {
  .shelf-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .landing {
    padding: 40px 18px 64px;
    gap: 64px;
  }
  .pipeline {
    grid-template-columns: 1fr;
  }
  .landing__cta-row {
    flex-direction: column;
  }
  .landing__cta-row .btn {
    text-align: center;
    justify-content: center;
  }
  .landing__split-card .btn {
    align-self: stretch;
    text-align: center;
  }
}
`;

export default function Landing() {
  return (
    <div className="landing">
      <style>{styles}</style>

      <section className="landing__hero">
        <div className="landing__hero-text">
          <p className="landing__eyebrow mono">preserving what matters</p>
          <h1>
            Food doesn't have to die quietly<br />
            in the back of your fridge.
          </h1>
          <p className="landing__lede">
            WasteNot watches what's about to spoil at home, tells you what to cook with it, and
            routes restaurant surplus to NGOs before it ever hits a bin — built for households
            and kitchens across Bangladesh.
          </p>
          <div className="landing__cta-row">
            <Link to="/signup" className="btn btn--accent">
              Start tracking your fridge
            </Link>
            <Link to="/signup?role=restaurant" className="btn btn--ghost">
              I run a restaurant or NGO
            </Link>
          </div>
        </div>
        <div className="landing__hero-visual">
          <p className="landing__hero-visual-label mono">live shelf</p>
          <ShelfStrip />
        </div>
      </section>

      <section className="landing__pipeline">
        <h2>From forgotten to rescued</h2>
        <div className="pipeline">
          <div className="pipeline__step">
            <span className="pipeline__num mono">01</span>
            <h3>Log it in seconds</h3>
            <p>Snap a label or speak the item — OCR and voice handle the typing.</p>
          </div>
          <div className="pipeline__step">
            <span className="pipeline__num mono">02</span>
            <h3>Catch it before it turns</h3>
            <p>A fridge-camera freshness check flags items as they age, not after.</p>
          </div>
          <div className="pipeline__step">
            <span className="pipeline__num mono">03</span>
            <h3>Use what's about to go</h3>
            <p>Recipe suggestions built specifically around what's expiring this week.</p>
          </div>
          <div className="pipeline__step">
            <span className="pipeline__num mono">04</span>
            <h3>Or send it onward</h3>
            <p>Restaurants post surplus; nearby NGOs claim it with a routed pickup.</p>
          </div>
        </div>
      </section>

      <section className="landing__split">
        <div className="card landing__split-card">
          <h3>For households</h3>
          <p>
            A running shelf of everything in your fridge, freezer, and pantry — what's fresh,
            what's aging, what needs to be eaten tonight.
          </p>
          <Link to="/signup" className="btn btn--primary">
            Track my kitchen
          </Link>
        </div>
        <div className="card landing__split-card">
          <h3>For restaurants &amp; NGOs</h3>
          <p>
            Post surplus the moment a shift ends. NGOs nearby see it immediately, ranked by how
            fast they can actually get there.
          </p>
          <Link to="/signup?role=restaurant" className="btn btn--primary">
            Post surplus food
          </Link>
        </div>
      </section>
    </div>
  );
}


