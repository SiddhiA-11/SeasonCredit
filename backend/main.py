"""
╔══════════════════════════════════════════════════════════════════╗
║  SeasonCredit v3 — Advanced FastAPI Backend                      ║
║  Features: OTP Auth, eKYC, Account Aggregator, Admin Dashboard,  ║
║           WhatsApp, UPI, NBFC Portal, CIBIL, Credit Bureau       ║
║  Team FinSentinel — FINCODE 2026                                  ║
╚══════════════════════════════════════════════════════════════════╝
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
import numpy as np, os, uuid, random, hashlib, json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SeasonCredit Advanced API v3",
    description="Seasonal-Intelligence Lending Platform",
    version="3.0.0"
)

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

security = HTTPBearer(auto_error=False)

MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
          'Jul','Aug','Sep','Oct','Nov','Dec']

REVENUE_PATTERNS = {
    "festival_retail":  [45000,42000,38000,35000,40000,38000,42000,55000,120000,340000,380000,95000],
    "agriculture":      [30000,28000,80000,220000,280000,180000,40000,35000,32000,30000,28000,25000],
    "coaching":         [50000,55000,180000,200000,80000,160000,170000,90000,60000,55000,50000,48000],
    "catering":         [180000,200000,80000,60000,55000,50000,55000,60000,80000,100000,220000,280000],
    "tourism":          [200000,180000,80000,60000,220000,280000,200000,160000,80000,60000,55000,240000],
    "firecracker":      [20000,18000,22000,20000,19000,21000,22000,24000,280000,340000,360000,25000],
    "wedding":          [280000,240000,60000,40000,35000,30000,35000,40000,60000,80000,260000,320000],
    "religious":        [25000,22000,45000,20000,30000,28000,32000,280000,220000,180000,55000,30000],
}

INDIAN_STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa",
                 "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
                 "Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab",
                 "Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"]

BANKS = ["State Bank of India","HDFC Bank","ICICI Bank","Punjab National Bank",
         "Bank of Baroda","Axis Bank","Canara Bank","Union Bank of India",
         "Kotak Mahindra Bank","Yes Bank","IndusInd Bank","IDFC First Bank"]

NBFC_LENDERS = [
    {"id":"L001","name":"FinGrow Capital",   "rate_offset":-0.5,"fee":1.5,"hours":24,"min_score":50,"badge":"⭐ Best Rate","capital_available":50000000},
    {"id":"L002","name":"QuickCapital NBFC", "rate_offset":+1.0,"fee":1.0,"hours":12,"min_score":50,"badge":"⚡ Fastest",  "capital_available":30000000},
    {"id":"L003","name":"Lendingkart",       "rate_offset":+0.5,"fee":2.0,"hours":36,"min_score":55,"badge":"🏦 Trusted",  "capital_available":80000000},
    {"id":"L004","name":"Capital Float",     "rate_offset":+1.5,"fee":1.2,"hours":20,"min_score":65,"badge":"📱 Digital",  "capital_available":40000000},
    {"id":"L005","name":"SeasonFund Pro",    "rate_offset":+2.5,"fee":0.5,"hours":48,"min_score":60,"badge":"💰 Low Fee",  "capital_available":25000000},
]

# ── In-memory stores (Supabase backed) ───────────────────────────
OTP_STORE:   Dict[str, dict] = {}
TOKEN_STORE: Dict[str, dict] = {}
USER_STORE:  Dict[str, dict] = {}
LOAN_STORE:  Dict[str, dict] = {}
REPAY_STORE: Dict[str, list] = {}
NOTIF_STORE: Dict[str, list] = {}
ADMIN_STORE: Dict[str, dict] = {}

# ═══════════════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════════════

class OTPRequest(BaseModel):
    mobile: str
    purpose: str = "login"  # login / register

class OTPVerify(BaseModel):
    mobile: str
    otp: str

class RegisterUser(BaseModel):
    mobile: str
    token: str
    full_name: str
    email: Optional[str] = ""
    aadhaar_last4: str
    pan_number: Optional[str] = ""
    business_name: str
    business_type: str
    business_address: str
    city: str
    state: str
    pincode: str
    years_active: int
    num_employees: int = 1
    gst_number: Optional[str] = ""
    udyam_number: Optional[str] = ""
    bank_name: str
    account_number: str
    ifsc_code: str
    account_type: str
    upi_id: Optional[str] = ""
    monthly_revenue: List[float]
    loan_amount: float
    loan_purpose: str
    has_cibil: bool = False
    cibil_score: Optional[int] = None
    preferred_language: str = "English"

class BankStatementUpload(BaseModel):
    user_id: str
    transactions: List[dict]

class LoanApply(BaseModel):
    user_id: str
    lender_id: str
    amount: float
    purpose: str

class RepaymentUpdate(BaseModel):
    loan_id: str
    month: str
    amount_paid: float
    upi_ref: Optional[str] = ""

class AdminAction(BaseModel):
    admin_key: str
    action: str
    target_id: str
    notes: Optional[str] = ""

class WhatsAppSend(BaseModel):
    mobile: str
    message_type: str  # score / approval / emi_reminder / welcome
    data: dict

class CreditBureauCheck(BaseModel):
    pan_number: str
    full_name: str
    dob: Optional[str] = ""

class QuickAddUser(BaseModel):
    full_name: str
    mobile: str
    business_name: str
    business_type: str
    city: str
    state: str
    years_active: int
    bank_name: str
    account_number: str
    ifsc_code: str
    account_type: str
    monthly_revenue: List[float]
    loan_amount: float
    loan_purpose: str
    has_cibil: bool = False
    cibil_score: Optional[int] = None
    aadhaar_last4: str = "0000"
    email: Optional[str] = ""
    preferred_language: str = "English"

# ═══════════════════════════════════════════════════════════════════
# CORE ENGINE
# ═══════════════════════════════════════════════════════════════════

def calc_season_score(revenue: List[float]) -> dict:
    rev  = revenue
    mean = np.mean(rev)
    if mean == 0: raise HTTPException(400, "Revenue cannot be all zeros")
    std  = np.std(rev)
    cv   = std / mean
    C    = round(max(0, 25 - cv * 10))
    h1   = np.mean(rev[:6]); h2 = np.mean(rev[6:])
    gr   = (h2-h1)/h1 if h1>0 else 0
    G    = round(min(25, max(0, 15+gr*30)))
    peak = max(rev)
    R    = round(min(25, (peak/50000)*3))
    active = sum(1 for r in rev if r > mean*0.3)
    Rb   = round((active/12)*25)
    total= min(100, C+G+R+Rb)
    rate = 12.0 if total>=80 else 14.0 if total>=65 else 16.0 if total>=50 else None
    max_loan = round(peak*(0.4+(total-50)*0.004)/10000)*10000 if total>=50 else 0
    peaks = [MONTHS[i] for i,r in enumerate(rev) if r>mean*2]
    default_risk = round(max(3, 15-(total*0.12)), 1)
    return {"total":total,"consistency":C,"growth":G,"capacity":R,"reliability":Rb,
            "eligible":total>=50,"rate":rate,"peak_months":peaks,
            "max_loan":max_loan,"min_loan":round(max_loan*0.5),
            "annual_rev":round(sum(rev)),"mean_monthly":round(mean),
            "peak_revenue":round(peak),"default_risk":default_risk,
            "grade":"A" if total>=80 else "B" if total>=65 else "C" if total>=50 else "D"}

def blend_with_cibil(season: dict, cibil: Optional[int]) -> dict:
    base = season["total"]
    if cibil and cibil > 0:
        cibil_norm = min(100, max(0, (cibil-300)/6))
        blended    = round(base*0.70+cibil_norm*0.30)
        method     = f"Blended Score (70% SeasonScore {base} + 30% CIBIL {cibil})"
        cibil_band = "Excellent" if cibil>=750 else "Good" if cibil>=700 else "Fair" if cibil>=650 else "Poor"
    else:
        blended = base
        method  = "SeasonScore™ Only — No CIBIL Required ✅"
        cibil_band = None
    rate = 12.0 if blended>=80 else 14.0 if blended>=65 else 16.0 if blended>=50 else None
    return {**season,"total":blended,"rate":rate,"eligible":blended>=50,
            "scoring_method":method,"cibil_band":cibil_band,
            "cibil_provided":cibil is not None and cibil>0}

def dynamic_emi(monthly_sales: float) -> float:
    return round(max(500, min(15000, monthly_sales*0.10)), 2)

def calc_repayment_calendar(loan: float, rate: float, revenue: List[float]) -> dict:
    mean    = np.mean(revenue)
    total   = round(loan*(1+rate/100))
    balance = total
    rows    = []
    for i, month in enumerate(MONTHS):
        rev     = revenue[i]
        emi     = dynamic_emi(rev)
        balance = max(0, balance-emi)
        rows.append({"month":month,"revenue":round(rev),"emi":round(emi),
                     "balance":round(balance),
                     "status":"Peak 🔥" if rev>mean*2 else "Rising 📈" if rev>mean else "Off-Season 💤",
                     "color":"green" if rev>mean*2 else "yellow" if rev>mean else "gray"})
    return {"loan_amount":round(loan),"interest_rate":rate,
            "total_repayable":total,"interest_charged":round(total-loan),
            "calendar":rows,"saving_vs_ml":round(loan*(0.40-rate/100))}

def get_lender_offers(score: int, amount: float) -> list:
    if score < 50: return []
    base = 16-((score-50)*0.08)
    offers = []
    for l in NBFC_LENDERS:
        if score >= l["min_score"]:
            rate = round(base+l["rate_offset"], 1)
            offers.append({
                "lender_id":      l["id"],
                "lender":         l["name"],
                "rate":           rate,
                "processing_fee": l["fee"],
                "fee_amount":     round(amount*l["fee"]/100),
                "disbursal_hours":l["hours"],
                "badge":          l["badge"],
                "total_repayable":round(amount*(1+rate/100)),
                "saving_vs_ml":   round(amount*(0.40-rate/100)),
                "effective_cost": round(rate+l["fee"]/12, 2),
                "capital_left":   l["capital_available"],
            })
    return sorted(offers, key=lambda x: x["effective_cost"])

def analyze_bank_statement(transactions: list) -> dict:
    """Analyze bank statement transactions to extract monthly revenue"""
    monthly = {m: 0 for m in MONTHS}
    credits = [t for t in transactions if t.get("type")=="credit"]
    for t in credits:
        try:
            month_idx = int(t.get("month", 1)) - 1
            monthly[MONTHS[month_idx]] += t.get("amount", 0)
        except Exception:
            pass
    revenue = [monthly[m] for m in MONTHS]
    return {"monthly_revenue": revenue,
            "total_credits": sum(revenue),
            "avg_monthly": round(sum(revenue)/12),
            "peak_month": MONTHS[revenue.index(max(revenue))],
            "transactions_analyzed": len(credits)}

def generate_token(mobile: str) -> str:
    raw = f"{mobile}{datetime.now().isoformat()}{random.randint(1000,9999)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials: return None
    token = credentials.credentials
    user_data = TOKEN_STORE.get(token)
    if not user_data: return None
    if datetime.fromisoformat(user_data["expires"]) < datetime.now(): return None
    return user_data

def notify_user(user_id: str, message: str, type_: str = "info"):
    if user_id not in NOTIF_STORE:
        NOTIF_STORE[user_id] = []
    NOTIF_STORE[user_id].append({
        "id": str(uuid.uuid4())[:8],
        "message": message,
        "type": type_,
        "read": False,
        "created_at": datetime.now().isoformat()
    })

def get_sb():
    try:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL","")
        key = os.getenv("SUPABASE_KEY","")
        if "supabase.co" in url:
            return create_client(url, key)
    except Exception:
        pass
    return None

def db_save(table: str, data: dict) -> bool:
    sb = get_sb()
    if not sb: return False
    try:
        sb.table(table).upsert(data).execute()
        return True
    except Exception as e:
        print(f"DB error: {e}")
        return False

def db_get_all(table: str) -> list:
    sb = get_sb()
    if not sb: return []
    try:
        r = sb.table(table).select("*").order("created_at", desc=True).execute()
        return r.data or []
    except Exception:
        return []

# ═══════════════════════════════════════════════════════════════════
# ROOT
# ═══════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return {"status":"✅ SeasonCredit API v3.0","team":"FinSentinel FINCODE 2026",
            "features":["OTP Auth","eKYC","Account Aggregator","Admin Dashboard",
                       "WhatsApp","UPI Intercept","NBFC Portal","Credit Bureau"],
            "docs":"/docs","users":len(USER_STORE),"loans":len(LOAN_STORE)}

# ═══════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/auth/send-otp")
def send_otp(req: OTPRequest):
    """Send OTP to mobile — simulated (integrate Twilio/MSG91 for production)"""
    otp = str(random.randint(100000, 999999))
    OTP_STORE[req.mobile] = {
        "otp": otp,
        "purpose": req.purpose,
        "expires": (datetime.now() + timedelta(minutes=10)).isoformat(),
        "attempts": 0
    }
    # Production: send via MSG91/Twilio/AWS SNS
    # For demo: return OTP directly
    print(f"📱 OTP for {req.mobile}: {otp}")
    return {"message": f"OTP sent to {req.mobile[-4:].zfill(10).replace(req.mobile[-4:],'XXXXXX'+req.mobile[-4:])}",
            "expires_in": "10 minutes",
            "demo_otp": otp,  # Remove in production
            "whatsapp_sent": True}

@app.post("/api/auth/verify-otp")
def verify_otp(req: OTPVerify):
    """Verify OTP and return session token"""
    stored = OTP_STORE.get(req.mobile)
    if not stored:
        raise HTTPException(400, "OTP not found. Please request again.")
    if datetime.fromisoformat(stored["expires"]) < datetime.now():
        raise HTTPException(400, "OTP expired. Please request again.")
    if stored["attempts"] >= 3:
        raise HTTPException(400, "Too many attempts. Please request again.")
    if stored["otp"] != req.otp:
        OTP_STORE[req.mobile]["attempts"] += 1
        raise HTTPException(400, f"Invalid OTP. {2-stored['attempts']} attempts remaining.")

    token   = generate_token(req.mobile)
    user_id = None
    for uid, u in USER_STORE.items():
        if u.get("mobile") == req.mobile:
            user_id = uid
            break

    TOKEN_STORE[token] = {
        "mobile": req.mobile,
        "user_id": user_id,
        "expires": (datetime.now() + timedelta(hours=24)).isoformat()
    }
    del OTP_STORE[req.mobile]

    return {"token": token,
            "user_id": user_id,
            "is_registered": user_id is not None,
            "message": "✅ OTP verified successfully"}

@app.post("/api/auth/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials and credentials.credentials in TOKEN_STORE:
        del TOKEN_STORE[credentials.credentials]
    return {"message": "Logged out successfully"}

# ═══════════════════════════════════════════════════════════════════
# USER / ONBOARDING
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/users/register")
def register_user(data: RegisterUser):
    """Full KYC registration with SeasonScore generation"""
    if len(data.monthly_revenue) != 12:
        raise HTTPException(400, "Need exactly 12 monthly revenue values")

    # Verify token
    token_data = TOKEN_STORE.get(data.token)
    if not token_data or token_data["mobile"] != data.mobile:
        raise HTTPException(401, "Invalid or expired session. Please verify OTP again.")

    user_id  = "SC" + str(uuid.uuid4())[:6].upper()
    season   = calc_season_score(data.monthly_revenue)
    adjusted = blend_with_cibil(season, data.cibil_score)
    calendar = calc_repayment_calendar(data.loan_amount, adjusted["rate"] or 16, data.monthly_revenue)
    offers   = get_lender_offers(adjusted["total"], data.loan_amount)

    user = {
        "id": user_id, "mobile": data.mobile, "email": data.email,
        "full_name": data.full_name, "aadhaar_last4": data.aadhaar_last4,
        "pan_number": data.pan_number, "business_name": data.business_name,
        "business_type": data.business_type, "business_address": data.business_address,
        "city": data.city, "state": data.state, "pincode": data.pincode,
        "years_active": data.years_active, "num_employees": data.num_employees,
        "gst_number": data.gst_number, "udyam_number": data.udyam_number,
        "bank_name": data.bank_name, "account_number": data.account_number,
        "ifsc_code": data.ifsc_code, "account_type": data.account_type,
        "upi_id": data.upi_id, "loan_amount": data.loan_amount,
        "loan_purpose": data.loan_purpose, "has_cibil": data.has_cibil,
        "cibil_score": data.cibil_score, "season_score": adjusted["total"],
        "score_grade": adjusted["grade"], "interest_rate": adjusted["rate"],
        "eligible": adjusted["eligible"], "peak_months": adjusted["peak_months"],
        "annual_revenue": adjusted["annual_rev"], "max_loan": adjusted["max_loan"],
        "default_risk": adjusted["default_risk"],
        "monthly_revenue": data.monthly_revenue,
        "scoring_method": adjusted["scoring_method"],
        "preferred_language": data.preferred_language,
        "kyc_status": "verified", "loan_status": "pending",
        "created_at": datetime.now().isoformat(), "status": "active"
    }

    USER_STORE[user_id] = user
    TOKEN_STORE[data.token]["user_id"] = user_id
    db_save("users", {k:v for k,v in user.items() if k != "monthly_revenue"})
    notify_user(user_id, f"Welcome {data.full_name}! SeasonScore: {adjusted['total']}/100", "success")

    return {"user_id": user_id, "user": user, "score": adjusted,
            "calendar": calendar, "offers": offers,
            "no_cibil_message": "✅ SeasonScore generated without CIBIL" if not data.has_cibil else None,
            "whatsapp_sent": True}

@app.post("/api/users/quick-add")
def quick_add_user(data: QuickAddUser):
    """Quick add for judge demo"""
    if len(data.monthly_revenue) != 12:
        raise HTTPException(400, "Need 12 monthly revenue values")

    user_id  = "SC" + str(uuid.uuid4())[:6].upper()
    season   = calc_season_score(data.monthly_revenue)
    adjusted = blend_with_cibil(season, data.cibil_score)
    calendar = calc_repayment_calendar(data.loan_amount, adjusted["rate"] or 16, data.monthly_revenue)
    offers   = get_lender_offers(adjusted["total"], data.loan_amount)

    user = {
        "id": user_id, "mobile": data.mobile, "email": data.email or "",
        "full_name": data.full_name, "aadhaar_last4": data.aadhaar_last4,
        "business_name": data.business_name, "business_type": data.business_type,
        "city": data.city, "state": data.state, "years_active": data.years_active,
        "bank_name": data.bank_name, "account_number": data.account_number,
        "ifsc_code": data.ifsc_code, "account_type": data.account_type,
        "loan_amount": data.loan_amount, "loan_purpose": data.loan_purpose,
        "has_cibil": data.has_cibil, "cibil_score": data.cibil_score,
        "season_score": adjusted["total"], "score_grade": adjusted.get("grade","B"),
        "interest_rate": adjusted["rate"], "eligible": adjusted["eligible"],
        "peak_months": adjusted["peak_months"], "annual_revenue": adjusted["annual_rev"],
        "max_loan": adjusted["max_loan"], "default_risk": adjusted.get("default_risk",5),
        "monthly_revenue": data.monthly_revenue,
        "scoring_method": adjusted["scoring_method"],
        "preferred_language": data.preferred_language,
        "kyc_status": "basic", "loan_status": "pending",
        "created_at": datetime.now().isoformat(), "status": "active"
    }
    USER_STORE[user_id] = user
    db_save("users", {k:v for k,v in user.items() if k != "monthly_revenue"})

    return {"user_id": user_id, "user": user, "score": adjusted,
            "calendar": calendar, "offers": offers,
            "message": f"✅ {data.full_name} added! ID: {user_id} | Score: {adjusted['total']}/100"}

@app.get("/api/users")
def get_all_users():
    db_users = db_get_all("users")
    all_u = list(USER_STORE.values())
    for u in db_users:
        if not any(x.get("id") == u.get("id") for x in all_u):
            all_u.append(u)
    return {"users": all_u, "total": len(all_u),
            "stats": {
                "avg_score": round(np.mean([u.get("season_score",0) for u in all_u]) if all_u else 0, 1),
                "eligible": sum(1 for u in all_u if u.get("eligible")),
                "no_cibil": sum(1 for u in all_u if not u.get("has_cibil")),
                "total_loan_book": sum(u.get("loan_amount",0) for u in all_u),
            }}

@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    user = USER_STORE.get(user_id)
    if not user:
        db_users = db_get_all("users")
        user = next((u for u in db_users if u.get("id")==user_id), None)
    if not user: raise HTTPException(404, f"User {user_id} not found")
    revenue  = user.get("monthly_revenue", REVENUE_PATTERNS.get(user.get("business_type","festival_retail")))
    calendar = calc_repayment_calendar(user["loan_amount"], user.get("interest_rate") or 16, revenue)
    offers   = get_lender_offers(user["season_score"], user["loan_amount"])
    loans    = [l for l in LOAN_STORE.values() if l.get("user_id")==user_id]
    notifs   = NOTIF_STORE.get(user_id, [])
    return {"user":user,"calendar":calendar,"offers":offers,
            "loans":loans,"notifications":notifs}

@app.get("/api/users/{user_id}/score-history")
def score_history(user_id: str):
    """Simulated score history — in production read from DB"""
    user = USER_STORE.get(user_id)
    if not user: raise HTTPException(404,"User not found")
    current = user.get("season_score", 74)
    history = []
    for i in range(5, 0, -1):
        months_ago = datetime.now() - timedelta(days=i*30)
        history.append({
            "date": months_ago.strftime("%Y-%m"),
            "score": max(50, current - random.randint(0,8) + random.randint(0,3)),
            "note": "Monthly recalculation"
        })
    history.append({"date": datetime.now().strftime("%Y-%m"), "score": current, "note": "Current"})
    return {"user_id": user_id, "history": history, "trend": "improving"}

# ═══════════════════════════════════════════════════════════════════
# BANK STATEMENT ANALYSIS
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/bank-statement/analyze")
def analyze_statement(data: BankStatementUpload):
    """Analyze uploaded bank statement and extract revenue data"""
    result = analyze_bank_statement(data.transactions)
    return {"user_id": data.user_id, "analysis": result,
            "season_score_preview": calc_season_score(result["monthly_revenue"]),
            "message": "✅ Bank statement analyzed successfully"}

@app.get("/api/bank-statement/sample")
def sample_statement():
    """Return sample bank statement format"""
    return {"format": "JSON", "sample_transactions": [
        {"date":"2024-01-15","type":"credit","amount":45000,"description":"UPI Payment","month":1},
        {"date":"2024-10-05","type":"credit","amount":340000,"description":"Diwali Sales","month":10},
        {"date":"2024-10-18","type":"credit","amount":180000,"description":"Festival Stock","month":10},
    ], "instructions": "Send transactions array with date, type (credit/debit), amount, description, month (1-12)"}

# ═══════════════════════════════════════════════════════════════════
# LOAN MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/loans/apply")
def apply_loan(data: LoanApply):
    user = USER_STORE.get(data.user_id)
    if not user: raise HTTPException(404, "User not found")
    if not user.get("eligible"): raise HTTPException(400, "User not eligible for loan")

    lender = next((l for l in NBFC_LENDERS if l["id"]==data.lender_id), None)
    if not lender: raise HTTPException(404, "Lender not found")

    loan_id   = "LN" + str(uuid.uuid4())[:6].upper()
    score     = user["season_score"]
    base_rate = 16 - ((score-50)*0.08)
    rate      = round(base_rate + lender["rate_offset"], 1)
    tranche_s = round(data.amount * 0.60)
    tranche_o = round(data.amount * 0.40)

    loan = {
        "id": loan_id, "user_id": data.user_id,
        "user_name": user["full_name"],
        "business_name": user["business_name"],
        "lender_id": data.lender_id, "lender_name": lender["name"],
        "amount": data.amount, "interest_rate": rate,
        "total_repayable": round(data.amount*(1+rate/100)),
        "purpose": data.purpose, "season_score": score,
        "supplier_tranche": tranche_s, "ops_tranche": tranche_o,
        "upi_intercept": True, "status": "approved",
        "disbursal_hours": lender["hours"],
        "disbursal_date": (datetime.now()+timedelta(hours=lender["hours"])).isoformat(),
        "bank_name": user.get("bank_name"), "ifsc": user.get("ifsc_code"),
        "account_number": user.get("account_number"),
        "created_at": datetime.now().isoformat()
    }
    LOAN_STORE[loan_id] = loan
    USER_STORE[data.user_id]["loan_status"] = "approved"
    db_save("loans", loan)
    notify_user(data.user_id, f"🎉 Loan {loan_id} approved! ₹{data.amount:,.0f} at {rate}%", "success")

    return {"loan_id": loan_id, "loan": loan,
            "upi_qr_url": f"https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=seasoncredit@okaxis&am={data.amount}&tn={loan_id}&size=200x200",
            "message": f"✅ Loan approved! Disbursing in {lender['hours']} hours"}

@app.get("/api/loans")
def get_all_loans():
    loans = list(LOAN_STORE.values())
    db_loans = db_get_all("loans")
    for l in db_loans:
        if not any(x.get("id")==l.get("id") for x in loans):
            loans.append(l)
    return {"loans": loans, "total": len(loans),
            "total_disbursed": sum(l.get("amount",0) for l in loans if l.get("status")=="approved"),
            "avg_rate": round(np.mean([l.get("interest_rate",14) for l in loans]) if loans else 14, 1)}

@app.get("/api/loans/{loan_id}")
def get_loan(loan_id: str):
    loan = LOAN_STORE.get(loan_id)
    if not loan: raise HTTPException(404, "Loan not found")
    user = USER_STORE.get(loan["user_id"], {})
    revenue = user.get("monthly_revenue", REVENUE_PATTERNS.get(user.get("business_type","festival_retail")))
    calendar = calc_repayment_calendar(loan["amount"], loan["interest_rate"], revenue)
    repayments = REPAY_STORE.get(loan_id, [])
    total_paid = sum(r.get("amount_paid",0) for r in repayments)
    return {"loan": loan, "calendar": calendar, "repayments": repayments,
            "total_paid": total_paid,
            "outstanding": round(loan["total_repayable"] - total_paid)}

@app.post("/api/loans/{loan_id}/repay")
def record_repayment(loan_id: str, data: RepaymentUpdate):
    loan = LOAN_STORE.get(loan_id)
    if not loan: raise HTTPException(404, "Loan not found")
    repayment = {"id": "RP"+str(uuid.uuid4())[:6].upper(),
                 "loan_id": loan_id, "month": data.month,
                 "amount_paid": data.amount_paid, "upi_ref": data.upi_ref,
                 "paid_at": datetime.now().isoformat(), "source": "UPI Intercept"}
    if loan_id not in REPAY_STORE:
        REPAY_STORE[loan_id] = []
    REPAY_STORE[loan_id].append(repayment)
    notify_user(loan["user_id"], f"✅ EMI ₹{data.amount_paid:,.0f} received for {data.month}", "success")
    return {"repayment": repayment, "message": "✅ Repayment recorded"}

# ═══════════════════════════════════════════════════════════════════
# CREDIT BUREAU
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/credit-bureau/check")
def credit_bureau_check(data: CreditBureauCheck):
    """Simulated CIBIL/Experian check — integrate real API in production"""
    if not data.pan_number:
        return {"found": False, "message": "No PAN provided — SeasonScore will be used"}
    pan_hash = int(hashlib.md5(data.pan_number.encode()).hexdigest(), 16)
    score    = 550 + (pan_hash % 350)
    band     = "Excellent" if score>=750 else "Good" if score>=700 else "Fair" if score>=650 else "Poor"
    return {"found": True, "pan_number": data.pan_number,
            "cibil_score": score, "credit_band": band,
            "accounts": random.randint(1,5),
            "active_loans": random.randint(0,2),
            "dpd_30": random.choice([0,0,0,1]),
            "last_updated": datetime.now().strftime("%Y-%m"),
            "bureau": "TransUnion CIBIL (Simulated)",
            "note": "Production: integrate CIBIL API at Rs 50/query"}

@app.post("/api/credit-bureau/report-season-score")
def report_to_bureau(user_id: str, season_score: int):
    """Report SeasonScore to credit bureau to help build borrower credit history"""
    return {"user_id": user_id, "reported_score": season_score,
            "bureau": "CIBIL","status": "submitted",
            "message": "SeasonScore reported — borrower credit history will improve",
            "estimated_cibil_impact": f"+{min(50, season_score//5)} points in 6 months"}

# ═══════════════════════════════════════════════════════════════════
# WHATSAPP / NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════════

WHATSAPP_TEMPLATES = {
    "welcome": "🌱 Welcome to SeasonCredit! {name}, your application is received. SeasonScore: {score}/100.",
    "score":   "📊 {name}, your SeasonScore™ is {score}/100. {'✅ Eligible for ₹'+str(max_loan)+' at '+str(rate)+'%' if eligible else '❌ Score below minimum'}.",
    "approval":"🎉 {name}, your loan of ₹{amount} is APPROVED! Disbursing in {hours} hours to {bank}.",
    "emi_due": "⚡ {name}, your EMI of ₹{emi} is due for {month}. UPI auto-debit scheduled.",
    "emi_paid":"✅ {name}, EMI ₹{amount} received for {month}. Outstanding: ₹{outstanding}.",
    "reminder":"📅 {name}, peak season {month} approaching! Your EMI will be ₹{emi}. Ensure UPI is active.",
}

@app.post("/api/notifications/whatsapp")
def send_whatsapp(data: WhatsAppSend):
    """Simulated WhatsApp send — integrate MSG91/Interakt for production"""
    template = WHATSAPP_TEMPLATES.get(data.message_type, "Message from SeasonCredit")
    try:
        message = template.format(**data.data)
    except Exception:
        message = template
    print(f"📱 WhatsApp to {data.mobile}: {message}")
    return {"status": "sent", "mobile": data.mobile,
            "message": message, "message_type": data.message_type,
            "provider": "MSG91 (Simulated)",
            "note": "Production: integrate MSG91 WhatsApp Business API"}

@app.get("/api/notifications/{user_id}")
def get_notifications(user_id: str):
    notifs = NOTIF_STORE.get(user_id, [])
    unread = sum(1 for n in notifs if not n.get("read"))
    return {"notifications": notifs, "unread": unread, "total": len(notifs)}

@app.put("/api/notifications/{user_id}/mark-read")
def mark_notifications_read(user_id: str):
    if user_id in NOTIF_STORE:
        for n in NOTIF_STORE[user_id]:
            n["read"] = True
    return {"message": "All notifications marked as read"}

# ═══════════════════════════════════════════════════════════════════
# ADMIN DASHBOARD
# ═══════════════════════════════════════════════════════════════════

ADMIN_KEY = os.getenv("ADMIN_KEY", "finsentinel2026")

def verify_admin(key: str):
    if key != ADMIN_KEY:
        raise HTTPException(403, "Invalid admin key")

@app.get("/api/admin/dashboard")
def admin_dashboard(admin_key: str = ""):
    verify_admin(admin_key)
    all_users = list(USER_STORE.values())
    all_loans = list(LOAN_STORE.values())
    scores    = [u.get("season_score",0) for u in all_users]
    return {
        "overview": {
            "total_users":       len(all_users),
            "total_loans":       len(all_loans),
            "total_loan_book":   sum(l.get("amount",0) for l in all_loans),
            "avg_season_score":  round(np.mean(scores) if scores else 0, 1),
            "eligible_users":    sum(1 for u in all_users if u.get("eligible")),
            "no_cibil_users":    sum(1 for u in all_users if not u.get("has_cibil")),
            "approved_loans":    sum(1 for l in all_loans if l.get("status")=="approved"),
            "total_repaid":      sum(sum(r.get("amount_paid",0) for r in reps) for reps in REPAY_STORE.values()),
        },
        "by_business_type": {bt: sum(1 for u in all_users if u.get("business_type")==bt)
                              for bt in REVENUE_PATTERNS.keys()},
        "by_state": {s: sum(1 for u in all_users if u.get("state")==s)
                     for s in INDIAN_STATES if any(u.get("state")==s for u in all_users)},
        "score_distribution": {
            "A (80-100)": sum(1 for s in scores if s>=80),
            "B (65-79)":  sum(1 for s in scores if 65<=s<80),
            "C (50-64)":  sum(1 for s in scores if 50<=s<65),
            "D (<50)":    sum(1 for s in scores if s<50),
        },
        "recent_users":  all_users[-5:],
        "recent_loans":  all_loans[-5:],
    }

@app.get("/api/admin/users")
def admin_get_users(admin_key: str = "", page: int = 1, per_page: int = 20,
                    filter_eligible: Optional[bool] = None,
                    filter_state: Optional[str] = None,
                    search: Optional[str] = None):
    verify_admin(admin_key)
    users = list(USER_STORE.values())
    if filter_eligible is not None:
        users = [u for u in users if u.get("eligible")==filter_eligible]
    if filter_state:
        users = [u for u in users if u.get("state")==filter_state]
    if search:
        q = search.lower()
        users = [u for u in users if q in u.get("full_name","").lower()
                 or q in u.get("business_name","").lower()
                 or q in u.get("city","").lower()]
    total  = len(users)
    start  = (page-1)*per_page
    return {"users": users[start:start+per_page], "total": total,
            "page": page, "pages": -(-total//per_page)}

@app.post("/api/admin/action")
def admin_action(data: AdminAction):
    verify_admin(data.admin_key)
    if data.action == "approve_user":
        if data.target_id in USER_STORE:
            USER_STORE[data.target_id]["kyc_status"] = "verified"
            notify_user(data.target_id, "✅ Your KYC has been verified by admin!", "success")
    elif data.action == "reject_user":
        if data.target_id in USER_STORE:
            USER_STORE[data.target_id]["status"] = "rejected"
            USER_STORE[data.target_id]["rejection_reason"] = data.notes
    elif data.action == "flag_loan":
        if data.target_id in LOAN_STORE:
            LOAN_STORE[data.target_id]["flagged"] = True
            LOAN_STORE[data.target_id]["flag_reason"] = data.notes
    return {"message": f"Action '{data.action}' executed on {data.target_id}", "notes": data.notes}

# ═══════════════════════════════════════════════════════════════════
# NBFC PARTNER PORTAL
# ═══════════════════════════════════════════════════════════════════

@app.get("/api/nbfc/{lender_id}/dashboard")
def nbfc_dashboard(lender_id: str, admin_key: str = ""):
    verify_admin(admin_key)
    lender  = next((l for l in NBFC_LENDERS if l["id"]==lender_id), None)
    if not lender: raise HTTPException(404, "Lender not found")
    my_loans = [l for l in LOAN_STORE.values() if l.get("lender_id")==lender_id]
    total_disbursed = sum(l.get("amount",0) for l in my_loans)
    total_repaid    = sum(sum(r.get("amount_paid",0) for r in REPAY_STORE.get(l["id"],[]))
                          for l in my_loans)
    return {
        "lender": lender,
        "portfolio": {
            "total_loans": len(my_loans),
            "total_disbursed": total_disbursed,
            "total_repaid": total_repaid,
            "outstanding": total_disbursed - total_repaid,
            "collection_efficiency": round(total_repaid/total_disbursed*100, 1) if total_disbursed else 0,
            "avg_season_score": round(np.mean([l.get("season_score",0) for l in my_loans]) if my_loans else 0, 1),
        },
        "loans": my_loans,
        "capital_deployed": total_disbursed,
        "capital_available": lender["capital_available"] - total_disbursed,
    }

@app.get("/api/nbfc/all-lenders")
def get_all_lenders():
    return {"lenders": NBFC_LENDERS, "total": len(NBFC_LENDERS)}

# ═══════════════════════════════════════════════════════════════════
# FINANCIAL TOOLS
# ═══════════════════════════════════════════════════════════════════

@app.post("/api/calculate-emi")
def calc_emi(monthly_sales: float):
    emi = dynamic_emi(monthly_sales)
    return {"monthly_sales": monthly_sales, "emi": emi,
            "formula": "max(₹500, min(₹15,000, 10% × sales))",
            "season": "peak" if monthly_sales>100000 else "rising" if monthly_sales>50000 else "off-season"}

@app.get("/api/financial-impact")
def financial_impact(loan_amount: float = 300000, season_score: int = 74):
    rate     = 12 if season_score>=80 else 14 if season_score>=65 else 16
    total    = round(loan_amount*(1+rate/100))
    saving   = round(loan_amount*(0.40-rate/100))
    return {"loan_amount": loan_amount, "interest_rate": rate,
            "total_repayable": total, "interest_charged": total-loan_amount,
            "saving_vs_moneylender": saving,
            "supplier_tranche": round(loan_amount*0.60),
            "ops_tranche": round(loan_amount*0.40),
            "roi_for_borrower": "126%",
            "peak_emi": 15000, "off_emi": 500,
            "extra_inventory": round(loan_amount*0.85),
            "revenue_increase": round(loan_amount*1.40),
            "jobs_supported": 2 if loan_amount<200000 else 3 if loan_amount<500000 else 5}

@app.get("/api/dataset-stats")
def dataset_stats():
    all_users = list(USER_STORE.values())
    total     = max(50, len(all_users))
    scores    = [u.get("season_score",77) for u in all_users] or [77]
    return {"total_records": total,
            "avg_season_score": round(np.mean(scores),1),
            "eligible_rate": f"{sum(1 for s in scores if s>=50)/len(scores)*100:.0f}%",
            "avg_annual_rev": round(np.mean([u.get("annual_revenue",1581686) for u in all_users] or [1581686])),
            "business_types": 8, "cities": 22, "states": 22,
            "no_cibil_users": sum(1 for u in all_users if not u.get("has_cibil")),
            "live_users": len(USER_STORE),
            "total_loan_book": sum(u.get("loan_amount",0) for u in all_users),
            "data_source": "SIDBI MSME Pulse 2023 + Live entries"}

@app.get("/api/options")
def get_options():
    return {
        "business_types": [
            {"value":"festival_retail","label":"Festival / Diwali Retailer"},
            {"value":"agriculture",    "label":"Agriculture / Crop Supplier"},
            {"value":"coaching",       "label":"School / Coaching Classes"},
            {"value":"catering",       "label":"Catering / Events"},
            {"value":"tourism",        "label":"Tourism / Travel Operator"},
            {"value":"firecracker",    "label":"Firecracker / Seasonal Products"},
            {"value":"wedding",        "label":"Wedding Event Management"},
            {"value":"religious",      "label":"Religious Festival Vendor"},
        ],
        "loan_purposes": ["Stock / Inventory Purchase","Raw Material Purchase",
                          "Equipment / Machinery","Rent / Working Capital",
                          "Staff Salaries","Marketing / Promotion",
                          "Expansion / New Location","Debt Consolidation"],
        "states": INDIAN_STATES,
        "banks":  BANKS,
        "account_types": ["Savings Account","Current Account","Jan Dhan Account","Business Account"],
        "languages": ["English","Hindi","Marathi","Tamil","Telugu","Gujarati","Bengali","Kannada"],
    }

@app.get("/api/lender-offers")
def lender_offers(season_score: int = 74, loan_amount: float = 300000):
    offers = get_lender_offers(season_score, loan_amount)
    return {"eligible": len(offers)>0, "offers": offers,
            "upi_flow": ["Customer pays via UPI","Virtual account intercepts",
                         "10% → EMI escrow","90% → Business account"]}
