"""
SeasonCredit v2 — Upload Excel Dataset to Supabase
Run: python3 upload_dataset.py
"""
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv()

def upload():
    url = os.getenv("SUPABASE_URL","")
    key = os.getenv("SUPABASE_KEY","")
    if not url or "supabase.co" not in url:
        print("❌ SUPABASE_URL not set in .env")
        return
    try:
        from supabase import create_client
        sb = create_client(url, key)
        print("✅ Supabase connected")
    except Exception as e:
        print(f"❌ {e}"); return

    for fname in ["SeasonCredit_Seasonal_Business_Data.xlsx",
                  "../SeasonCredit_Seasonal_Business_Data.xlsx"]:
        if os.path.exists(fname):
            excel_file = fname; break
    else:
        print("❌ Excel file not found — place it in backend folder")
        return

    df = pd.read_excel(excel_file)
    print(f"✅ Loaded {len(df)} records")
    print(f"   Columns: {df.columns.tolist()}")

    records = []
    for _, row in df.iterrows():
        records.append({
            "id":               str(row["Business_ID"]),
            "business_name":    str(row["Business_Name"]),
            "business_type":    str(row["Seasonal_Type"]),
            "city":             str(row["City"]),
            "years_active":     int(row["Years_Active"]),
            "peak_season":      str(row["Peak_Season"]),
            "off_season":       str(row["Off_Season"]),
            "annual_revenue":   float(row["Annual_Revenue_INR"]),
            "season_score":     int(row["SeasonScore"]),
            "eligible_loan":    float(row["Eligible_Loan_INR"]),
            "interest_rate":    float(row["Interest_Rate_%"]),
            "supplier_split":   float(row.get("Supplier_Split_%",60)),
            "operations_split": float(row.get("Operations_Split_%",40)),
            "upi_payment":      float(row.get("UPI_Payment_%",10)),
            "default_risk":     float(row["Default_Risk_%"]),
            "jan": float(row["Jan_Revenue"]),
            "feb": float(row["Feb_Revenue"]),
            "mar": float(row["Mar_Revenue"]),
            "apr": float(row["Apr_Revenue"]),
            "may": float(row["May_Revenue"]),
            "jun": float(row["Jun_Revenue"]),
            "jul": float(row["Jul_Revenue"]),
            "aug": float(row["Aug_Revenue"]),
            "sep": float(row["Sep_Revenue"]),
            "oct": float(row["Oct_Revenue"]),
            "nov": float(row["Nov_Revenue"]),
            "dec": float(row["Dec_Revenue"]),
        })

    total = 0
    for i in range(0, len(records), 10):
        batch = records[i:i+10]
        try:
            sb.table("sme_dataset").upsert(batch).execute()
            total += len(batch)
            print(f"   ✅ {i+1}–{i+len(batch)}")
        except Exception as e:
            print(f"   ❌ Batch {i+1}: {e}")

    print(f"\n🎉 Done! {total} records uploaded to sme_dataset")

if __name__ == "__main__":
    upload()
