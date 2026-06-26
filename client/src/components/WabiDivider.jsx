// A deliberately irregular, hand-drawn-feeling divider stroke - the
// wabi-sabi counterpoint to a straight ruled <hr>. Each render uses one of
// a few pre-set "imperfect" paths so it never looks machine-uniform, but
// stays deterministic (no per-render randomness that would cause layout
// shift on re-render).
const PATHS = [
  "M2 8c14-5 22 4 36-1s24 6 38 1 22-5 36 0 22 4 34 0",
  "M2 7c12 4 20-6 36-1s26 3 38-2 20 5 36 0 24-3 34 2",
  "M2 9c16-6 24 3 38-2s22 7 36 1 20-6 34 1 22 3 32-1",
];

export default function WabiDivider({ variant = 0, color = "var(--turmeric)" }) {
  const d = PATHS[variant % PATHS.length];
  return (
    <span className="wabi-divider" aria-hidden="true">
      <svg viewBox="0 0 150 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}