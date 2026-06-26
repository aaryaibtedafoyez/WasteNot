# WasteNot

A MERN-stack food tracking and surplus redistribution platform. Households track what's in their fridge/pantry and get recipe ideas before things spoil; restaurants post surplus food that nearby NGOs can claim.

This build is a **real, working MERN application** — not a demo shell. Auth, the database schema, food-item CRUD, expiry math, OCR label scanning, and the donation/claim flow are all live and functional against a real MongoDB instance. Two pieces are explicitly mocked because they need infrastructure beyond a single build session — see **What's real vs. mocked** below.

## Stack

- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT auth, Tesseract.js (OCR), Google Generative AI SDK (Gemini)
- **Frontend**: React 19 (Vite), React Router v6, Axios

## Project structure

```
wastenot/
├── server/          Express API
│   ├── config/       DB connection
│   ├── controllers/  Route handlers
│   ├── middleware/   Auth, upload, error handling
│   ├── models/       Mongoose schemas (User, FoodItem, Donation)
│   ├── routes/       Express routers
│   ├── utils/        Freshness mock, route mock, Gemini integration
│   └── server.js
└── client/          React app
    └── src/
        ├── api/        Axios client + endpoint wrappers
        ├── components/ Reusable UI (Navbar, item cards, modals)
        ├── context/    Auth context
        └── pages/      Landing, Login, Signup, Dashboard, Recipes, Donations
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp  .env
```

Edit `.env`:

- `MONGO_URI` — point this at a local MongoDB (`mongodb://localhost:27017/wastenot`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`).
- `GEMINI_API_KEY` — get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). The recipe feature works without one (it falls back to a static suggestion) but won't be "live."

```bash
npm run dev
```

This starts the API on `http://localhost:5000`. Visit `http://localhost:5000/api/health` to confirm it's up.

### 2. Frontend

```bash
cd client
npm install
cp ..env
npm run dev
```

This starts the app on `http://localhost:5173`. The `.env`'s `VITE_API_URL` should point at your running backend (defaults to `http://localhost:5000/api`).

### 3. Try it

1. Sign up as a **Household** account → you land on the Dashboard.
2. Add an item with a near-future expiry date, or use **Scan a label** to upload a photo of packaging — real OCR will try to read the expiry date and product name off it.
3. Click **Check freshness** on an item to run the freshness scoring.
4. Visit **Recipes** to get suggestions for what's expiring soon (live if `GEMINI_API_KEY` is set).
5. In a separate browser/incognito window, sign up as a **Restaurant** account, post some surplus food.
6. Sign up as an **NGO** account, visit **Surplus**, and claim the posted donation — you'll see a route distance/ETA estimate.

## What's real vs. mocked

| Feature | Status | Notes |
|---|---|---|
| Auth (signup/login/JWT) | ✅ Real | bcrypt hashing, JWT sessions |
| Food item CRUD + expiry tracking | ✅ Real | Full Mongoose schema, real date math |
| OCR label scanning | ✅ Real | Tesseract.js, runs locally, no API key needed |
| Recipe suggestions | ✅ Real | Calls Gemini (`gemini-1.5-flash`); falls back gracefully without a key |
| Donation posting/claiming | ✅ Real | Full CRUD, status transitions, geo schema |
| **CNN freshness/color detection** | 🟡 Mocked | No trained model exists. `server/utils/freshnessMock.js` simulates realistic scores from expiry-date math + category decay rates + jitter, with the exact same output shape a real model would return. Swap-in point documented in the file. |
| **AR 3D shelf view** | ❌ Not built | Out of scope for this session — real WebXR/AR.js integration is substantial additional work. The Dashboard instead shows a 2D shelf grid with live freshness bars. |
| **Route optimization (OSRM/Maps)** | 🟡 Mocked | `server/utils/routeMock.js` computes haversine distance with a routing-factor multiplier instead of calling a real routing API. Same output shape (`distanceKm`, `etaMinutes`) as OSRM/Google Directions, documented swap-in point. |

## Known limitations / next steps

- No image is actually analyzed for freshness — only its associated item's category and expiry date. Wiring a real CNN means training or sourcing a freshness-classification model and standing up an inference endpoint (e.g. Replicate, a small TF Serving container, or a SageMaker endpoint).
- Voice-based logging (mentioned in the original pitch) isn't implemented yet — would use the Web Speech API on the frontend, transcribing to the same `addedVia: "voice"` field that already exists in the schema.
- The route-optimization swap-in is the easiest of the three "mocked" pieces to make real — drop an OSRM or Google Maps Directions API call into `estimateRoute()` and keep the same return shape.
- No automated test suite is wired up yet beyond the manual logic checks done during development. Consider adding Jest/Vitest for the freshness math and an integration suite (e.g. Supertest) for the API routes.
