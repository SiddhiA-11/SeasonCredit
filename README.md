# 🌱 SeasonCredit v3.0 — Advanced
## Team FinSentinel | FINCODE 2026

---

## 🆕 Everything New in v3

| Feature | Status |
|---------|--------|
| OTP Login (mobile-first) | ✅ |
| Session token management | ✅ |
| 6-step onboarding | ✅ |
| Bank statement upload + analysis | ✅ |
| CIBIL auto-check via PAN | ✅ |
| Radar chart score breakdown | ✅ |
| Score history graph | ✅ |
| Dashboard tabs (overview/analytics/profile) | ✅ |
| Loan apply + UPI QR code | ✅ |
| Repayment tracking | ✅ |
| Notification system | ✅ |
| Admin Dashboard (🔐 finsentinel2026) | ✅ |
| NBFC Partner Portal | ✅ |
| Credit bureau check simulation | ✅ |
| WhatsApp notification simulation | ✅ |
| 10 pages total | ✅ |

---

## 📁 Structure

```
seasoncredit3/
├── backend/
│   ├── main.py          ← All 25+ API endpoints
│   ├── schema.sql       ← Paste in Supabase SQL Editor
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── App.jsx      ← 10 complete pages
│
└── ml_engine/
    └── season_model.py
```

---

## 🚀 Setup

### Step 1 — Supabase
```
1. supabase.com → New project
2. SQL Editor → paste schema.sql → Run
3. Copy URL and anon key
```

### Step 2 — Backend
```bash
cd backend
cp .env.example .env
# Fill SUPABASE_URL and SUPABASE_KEY

python3 -m pip install fastapi uvicorn "supabase>=2.3.0" python-dotenv "pandas>=2.2.0" numpy openpyxl httpx pydantic

python3 -m uvicorn main:app --reload
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Step 3 — Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## 🔑 Admin Access
- URL: Click 🔐 Admin in nav
- Key: `finsentinel2026`

---

## 📡 Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| POST /api/auth/send-otp | Send OTP |
| POST /api/auth/verify-otp | Verify OTP → token |
| POST /api/users/register | Full KYC onboard |
| POST /api/users/quick-add | Judge demo add |
| GET  /api/users | All users |
| POST /api/loans/apply | Apply for loan |
| POST /api/credit-bureau/check | CIBIL check |
| POST /api/bank-statement/analyze | Analyze statement |
| GET  /api/admin/dashboard | Admin stats |
| GET  /api/nbfc/{id}/dashboard | NBFC portal |
| GET  /api/options | All dropdowns |

---

## 🧮 SeasonScore Formula
```
Score = C + G + R + Rb  (max 100)

No CIBIL  → 100% SeasonScore™
With CIBIL → 70% Season + 30% CIBIL (mapped)

Grade A (80-100) → 12% p.a.
Grade B (65-79)  → 14% p.a.
Grade C (50-64)  → 16% p.a.
Grade D (<50)    → Not eligible
```

---

## 💰 Unit Economics
- Revenue per loan: ₹13,500
- Cost per loan: ₹1,100
- Gross margin: 92%
- NPA rate: 4-6% (vs 12% industry)
- Break-even: 500 loans/month

*Team FinSentinel | FINCODE 2026*
