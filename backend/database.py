"""
SeasonCredit v2 — Supabase Database Layer
Run SUPABASE_SQL in Supabase SQL Editor first!
"""
import os
from dotenv import load_dotenv
load_dotenv()

SUPABASE_SQL = """
-- Run this ENTIRE block in Supabase SQL Editor

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id               TEXT PRIMARY KEY,
  full_name        TEXT NOT NULL,
  mobile           TEXT,
  email            TEXT,
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
  interest_rate    DECIMAL,
  eligible         BOOLEAN,
  peak_months      TEXT[],
  annual_revenue   DECIMAL,
  max_loan         DECIMAL,
  status           TEXT DEFAULT 'active',
  created_at       TIMESTAMP DEFAULT NOW()
);

-- SME Dataset table
CREATE TABLE IF NOT EXISTS sme_dataset (
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
  supplier_split   DECIMAL,
  operations_split DECIMAL,
  upi_payment      DECIMAL,
  default_risk     DECIMAL,
  jan DECIMAL, feb DECIMAL, mar DECIMAL, apr DECIMAL,
  may DECIMAL, jun DECIMAL, jul DECIMAL, aug DECIMAL,
  sep DECIMAL, oct DECIMAL, nov DECIMAL, dec DECIMAL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON sme_dataset FOR ALL USING (true) WITH CHECK (true);
"""

def get_client():
    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL","")
        key = os.getenv("SUPABASE_KEY","")
        if "supabase.co" in url:
            return create_client(url, key)
    except Exception:
        pass
    return None

def save_user(user_id: str, data: dict) -> bool:
    sb = get_client()
    if not sb: return False
    try:
        sb.table("users").upsert({**data,"id":user_id}).execute()
        return True
    except Exception as e:
        print(f"DB save error: {e}")
        return False

def get_all_users() -> list:
    sb = get_client()
    if not sb: return []
    try:
        r = sb.table("users").select("*").order(
            "created_at", desc=True).execute()
        return r.data or []
    except Exception:
        return []

def get_user(user_id: str) -> dict:
    sb = get_client()
    if not sb: return {}
    try:
        r = sb.table("users").select("*").eq("id",user_id).execute()
        return r.data[0] if r.data else {}
    except Exception:
        return {}

def upload_dataset(records: list) -> str:
    sb = get_client()
    if not sb: return "Supabase not configured"
    try:
        r = sb.table("sme_dataset").upsert(records).execute()
        return f"Uploaded {len(r.data)} records"
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    sb = get_client()
    print("✅ Connected!" if sb else "❌ Not connected — check .env")
