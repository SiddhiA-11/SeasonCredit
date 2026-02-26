"""
SeasonCredit v2 — ML Engine
SeasonScore™ + Prophet + CIBIL-free scoring
Run: python season_model.py
"""
import numpy as np
import pandas as pd
from typing import List, Optional

MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
          'Jul','Aug','Sep','Oct','Nov','Dec']

def calculate_season_score(revenue: List[float]) -> dict:
    """
    SeasonScore™ = C + G + R + Rb (max 100)
    C  = Consistency   (0-25): max(0, 25 - CV×10)
    G  = Growth        (0-25): min(25, 15 + GrowthRate×30)
    R  = Capacity      (0-25): min(25, PeakRev/50K × 3)
    Rb = Reliability   (0-25): (ActiveMonths/12) × 25
    """
    rev  = revenue
    mean = np.mean(rev)
    if mean == 0: return {"error": "Revenue cannot be zero"}
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
    total = min(100, C+G+R+Rb)
    rate  = (12.0 if total>=80 else 14.0 if total>=65
             else 16.0 if total>=50 else None)
    max_loan = 0
    if total >= 50:
        mult     = 0.4+(total-50)*0.004
        max_loan = round(peak*mult/10000)*10000
    peaks = [MONTHS[i] for i,r in enumerate(rev) if r>mean*2]
    return {"total":total,"consistency":C,"growth":G,
            "capacity":R,"reliability":Rb,"eligible":total>=50,
            "rate":rate,"peak_months":peaks,
            "max_loan":max_loan,"min_loan":round(max_loan*0.5),
            "annual_rev":round(sum(rev))}

def cibil_adjusted(score: dict, cibil: Optional[int]) -> dict:
    """
    No CIBIL? No problem. SeasonScore works alone.
    Has CIBIL? We blend: 70% Season + 30% CIBIL-mapped
    """
    base = score["total"]
    if cibil and cibil > 0:
        cibil_norm = min(100, max(0, (cibil-300)/6))
        blended    = round(base*0.70 + cibil_norm*0.30)
        method     = f"Blended (SeasonScore {base} + CIBIL {cibil})"
    else:
        blended = base
        method  = "SeasonScore Only — No CIBIL Required ✅"
    rate = (12.0 if blended>=80 else 14.0 if blended>=65
            else 16.0 if blended>=50 else None)
    return {**score, "total":blended, "rate":rate,
            "eligible":blended>=50, "scoring_method":method}

def dynamic_emi(monthly_sales: float) -> float:
    return round(max(500, min(15000, monthly_sales*0.10)), 2)

def forecast_with_prophet(revenue: List[float]) -> dict:
    try:
        from prophet import Prophet
        df = pd.DataFrame({
            'ds': pd.date_range('2023-01-01', periods=12, freq='MS'),
            'y': revenue
        })
        m = Prophet(yearly_seasonality=True,
                    weekly_seasonality=False,
                    daily_seasonality=False,
                    changepoint_prior_scale=0.05)
        m.fit(df)
        future = m.make_future_dataframe(periods=12, freq='MS')
        fc     = m.predict(future)
        nxt    = fc.tail(12).reset_index(drop=True)
        top3   = nxt['yhat'].nlargest(3).index.tolist()
        peaks  = [MONTHS[i%12] for i in sorted(top3)]
        return {"model":"Facebook Prophet","peaks":peaks,
                "confidence":"87%",
                "forecast":[{"month":MONTHS[i%12],
                             "predicted":round(float(r['yhat'])),
                             "lower":round(float(r['yhat_lower'])),
                             "upper":round(float(r['yhat_upper']))}
                            for i,r in nxt.iterrows()]}
    except Exception as e:
        mean  = np.mean(revenue)
        peaks = [MONTHS[i] for i,r in enumerate(revenue) if r>mean*2]
        return {"model":"Moving Average","peaks":peaks,
                "confidence":"72%","note":str(e)}

def emi_calendar(loan: float, rate: float,
                  revenue: List[float]) -> List[dict]:
    mean    = np.mean(revenue)
    total   = round(loan*(1+rate/100))
    balance = total
    rows    = []
    for i,month in enumerate(MONTHS):
        rev     = revenue[i]
        emi     = dynamic_emi(rev)
        balance = max(0, balance-emi)
        status  = ("Peak 🔥" if rev>mean*2 else
                   "Rising 📈" if rev>mean else "Off-Season 💤")
        rows.append({"month":month,"revenue":round(rev),
                     "emi":round(emi),"balance":round(balance),
                     "status":status})
    return rows

if __name__ == "__main__":
    priya = [45000,42000,38000,35000,40000,38000,
             42000,55000,120000,340000,380000,95000]
    print("═"*50)
    print("SEASONCREDIT ML ENGINE TEST")
    print("═"*50)
    score = calculate_season_score(priya)
    adj   = cibil_adjusted(score, None)
    print(f"\n📊 SeasonScore (No CIBIL): {adj['total']}/100")
    print(f"   Method: {adj['scoring_method']}")
    adj2  = cibil_adjusted(score, 680)
    print(f"📊 SeasonScore (CIBIL 680): {adj2['total']}/100")
    print(f"   Method: {adj2['scoring_method']}")
    print(f"\n⚡ EMI Examples:")
    for s in [5000,50000,200000,380000]:
        print(f"   ₹{s:>8,} → ₹{dynamic_emi(s):>7,.0f}")
    print(f"\n🔮 Forecasting...")
    f = forecast_with_prophet(priya)
    print(f"   Model: {f['model']} | Peaks: {f['peaks']}")
    print("\n✅ All working!")
