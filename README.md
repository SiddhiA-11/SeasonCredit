# 🌱 SeasonCredit v2.0
## India's First Seasonal-Intelligence Lending Platform
**Team FinSentinel — FINCODE 2026**

---

## 🆕 What's New in v2

- ✅ **No CIBIL Required** — SeasonScore™ generates without CIBIL
- ✅ **With CIBIL** — Blended scoring (70% Season + 30% CIBIL)
- ✅ **Add User Live** — Judge can add new user, score generates instantly
- ✅ **Full KYC Form** — Name, Aadhaar, PAN, Bank details, IFSC
- ✅ **All Dropdowns** — Business type, State, Bank, Account type
- ✅ **Live User Table** — See all added users in Dataset page
- ✅ **Search & Filter** — Filter by eligible / no-CIBIL
- ✅ **Dynamic EMI** — ₹500 off-season, ₹15,000 peak
- ✅ **5 NBFC Lenders** — Competing marketplace

---

## 📁 Project Structure

```
seasoncredit/
├── backend/
│   ├── main.py              ← FastAPI — ALL endpoints
│   ├── database.py          ← Supabase + SQL schema
│   ├── upload_dataset.py    ← Upload Excel to Supabase
│   ├── requirements.txt     ← Python packages
│   └── .env.example         ← Copy to .env
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── App.jsx          ← Complete React app (7 pages)
│
└── ml_engine/
    └── season_model.py      ← SeasonScore + Prophet (standalone)
```

---

## 🚀 Setup — Step by Step

### Step 1 — Supabase (5 mins)
```
1. supabase.com → New project → "SeasonCredit"
2. SQL Editor → paste SQL from database.py → Run
3. Settings → API → copy URL and anon key
```

### Step 2 — Backend
```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_KEY in .env

python3 -m pip install fastapi uvicorn "supabase>=2.3.0" python-dotenv "pandas>=2.2.0" numpy openpyxl httpx pydantic

# Upload your dataset (optional)
python3 upload_dataset.py

# Start API
python3 -m uvicorn main:app --reload
```
API runs at: **http://localhost:8000**
Docs at:     **http://localhost:8000/docs**

### Step 3 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/onboard` | Full KYC onboarding + SeasonScore |
| POST | `/api/add-user` | Quick add user (judge demo) |
| GET  | `/api/users` | All users |
| GET  | `/api/users/{id}` | Single user |
| POST | `/api/calculate-emi` | Dynamic EMI |
| POST | `/api/lender-offers` | NBFC marketplace |
| GET  | `/api/dataset-stats` | Statistics |
| GET  | `/api/financial-impact` | Impact analysis |
| GET  | `/api/options` | All dropdown options |

---

## 🧮 SeasonScore™ Formula

```
SeasonScore = C + G + R + Rb  (max 100)

No CIBIL  → 100% SeasonScore™
With CIBIL → 70% SeasonScore + 30% CIBIL (mapped 300-900 → 0-100)

Score ≥ 80 → 12% p.a.
Score ≥ 65 → 14% p.a.
Score ≥ 50 → 16% p.a.
Score < 50 → Not eligible
```

---

## 🎯 Demo Flow for Judges

**Scenario 1 — No CIBIL User:**
1. Go to **Apply** → fill name, mobile, select business type
2. Enter bank details → skip to CIBIL step → select "I don't have CIBIL"
3. Submit → See SeasonScore generated instantly without CIBIL

**Scenario 2 — Add New User Live:**
1. Go to **Add User** tab
2. Enter any name, mobile, select business type
3. Click "Add User & Generate SeasonScore™"
4. Score generates in 2 seconds
5. Check **Dataset** tab — new user appears in live table

**Scenario 3 — Calculator:**
1. Go to **Calculator** → drag loan slider
2. Watch EMI, interest, savings update live
3. Show 12-month repayment calendar

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Chart.js |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| ML | Facebook Prophet + NumPy |
| Payments | Razorpay UPI (planned) |
| Hosting | Vercel + Railway |

---

*Team FinSentinel | FINCODE 2026 | FiSOC × Code Club*
