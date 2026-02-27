-- ╔══════════════════════════════════════════╗
-- ║  SeasonCredit v3 — Supabase SQL Schema   ║
-- ║  Paste entire file in SQL Editor → Run   ║
-- ╚══════════════════════════════════════════╝

DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sme_dataset CASCADE;

-- USERS
CREATE TABLE users (
  id               TEXT PRIMARY KEY,
  mobile           TEXT,
  email            TEXT,
  full_name        TEXT NOT NULL,
  aadhaar_last4    TEXT,
  pan_number       TEXT,
  business_name    TEXT,
  business_type    TEXT,
  business_address TEXT,
  city             TEXT,
  state            TEXT,
  pincode          TEXT,
  years_active     INT,
  num_employees    INT DEFAULT 1,
  gst_number       TEXT,
  udyam_number     TEXT,
  bank_name        TEXT,
  account_number   TEXT,
  ifsc_code        TEXT,
  account_type     TEXT,
  upi_id           TEXT,
  loan_amount      DECIMAL,
  loan_purpose     TEXT,
  has_cibil        BOOLEAN DEFAULT FALSE,
  cibil_score      INT,
  season_score     INT,
  score_grade      TEXT,
  interest_rate    DECIMAL,
  eligible         BOOLEAN,
  peak_months      TEXT[],
  annual_revenue   DECIMAL,
  max_loan         DECIMAL,
  default_risk     DECIMAL,
  scoring_method   TEXT,
  preferred_language TEXT DEFAULT 'English',
  kyc_status       TEXT DEFAULT 'basic',
  loan_status      TEXT DEFAULT 'pending',
  status           TEXT DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT NOW()
);

-- LOANS
CREATE TABLE loans (
  id               TEXT PRIMARY KEY,
  user_id          TEXT REFERENCES users(id),
  user_name        TEXT,
  business_name    TEXT,
  lender_id        TEXT,
  lender_name      TEXT,
  amount           DECIMAL,
  interest_rate    DECIMAL,
  total_repayable  DECIMAL,
  purpose          TEXT,
  season_score     INT,
  supplier_tranche DECIMAL,
  ops_tranche      DECIMAL,
  upi_intercept    BOOLEAN DEFAULT TRUE,
  status           TEXT DEFAULT 'approved',
  disbursal_hours  INT,
  disbursal_date   TIMESTAMP,
  bank_name        TEXT,
  ifsc             TEXT,
  account_number   TEXT,
  flagged          BOOLEAN DEFAULT FALSE,
  flag_reason      TEXT,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- REPAYMENTS
CREATE TABLE repayments (
  id          TEXT PRIMARY KEY,
  loan_id     TEXT REFERENCES loans(id),
  month       TEXT,
  amount_paid DECIMAL,
  upi_ref     TEXT,
  source      TEXT DEFAULT 'UPI Intercept',
  paid_at     TIMESTAMP DEFAULT NOW()
);

-- SME DATASET
CREATE TABLE sme_dataset (
  id               TEXT PRIMARY KEY,
  business_name    TEXT,
  business_type    TEXT,
  city             TEXT,
  years_active     INT,
  peak_season      TEXT,
  off_season       TEXT,
  annual_revenue   DECIMAL,
  season_score     INT,
  eligible_loan    DECIMAL,
  interest_rate    DECIMAL,
  default_risk     DECIMAL,
  jan DECIMAL, feb DECIMAL, mar DECIMAL, apr DECIMAL,
  may DECIMAL, jun DECIMAL, jul DECIMAL, aug DECIMAL,
  sep DECIMAL, oct DECIMAL, nov DECIMAL, dec DECIMAL
);

-- RLS
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON users      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON loans      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON repayments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON sme_dataset FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_score  ON users(season_score);
CREATE INDEX idx_loans_user   ON loans(user_id);
CREATE INDEX idx_loans_lender ON loans(lender_id);
