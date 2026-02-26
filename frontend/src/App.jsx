// ╔══════════════════════════════════════════════════════════════╗
// ║  SeasonCredit v2 — Complete React Frontend                   ║
// ║  Pages: Home, Onboard, Dashboard, Calculator,                ║
// ║         Marketplace, Dataset, Add User                       ║
// ║  Features: No-CIBIL flow, Live add user, Bank details        ║
// ║  Team FinSentinel — FINCODE 2026                             ║
// ╚══════════════════════════════════════════════════════════════╝

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend
} from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend)

const API    = "http://localhost:8000"
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"]

const REVENUE_PATTERNS = {
  festival_retail: [45000,42000,38000,35000,40000,38000,42000,55000,120000,340000,380000,95000],
  agriculture:     [30000,28000,80000,220000,280000,180000,40000,35000,32000,30000,28000,25000],
  coaching:        [50000,55000,180000,200000,80000,160000,170000,90000,60000,55000,50000,48000],
  catering:        [180000,200000,80000,60000,55000,50000,55000,60000,80000,100000,220000,280000],
  tourism:         [200000,180000,80000,60000,220000,280000,200000,160000,80000,60000,55000,240000],
  firecracker:     [20000,18000,22000,20000,19000,21000,22000,24000,280000,340000,360000,25000],
  wedding:         [280000,240000,60000,40000,35000,30000,35000,40000,60000,80000,260000,320000],
  religious:       [25000,22000,45000,20000,30000,28000,32000,280000,220000,180000,55000,30000],
}

function fmt(n) { return Math.round(n||0).toLocaleString("en-IN") }
function fmtL(n) {
  if (n >= 10000000) return "₹" + (n/10000000).toFixed(1) + "Cr"
  if (n >= 100000)   return "₹" + (n/100000).toFixed(1) + "L"
  return "₹" + fmt(n)
}

const teal  = "#0d9488"
const navy  = "#0a0f1e"
const dark  = "#0f172a"
const card  = "#ffffff"

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════

export default function App() {
  const [page,     setPage]     = useState("home")
  const [result,   setResult]   = useState(null)
  const [userForm, setUserForm] = useState(null)
  const [options,  setOptions]  = useState(null)
  const [stats,    setStats]    = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/options`).catch(() => null),
      axios.get(`${API}/api/dataset-stats`).catch(() => null),
      axios.get(`${API}/api/users`).catch(() => null),
    ]).then(([opt, st, users]) => {
      if (opt)   setOptions(opt.data)
      if (st)    setStats(st.data)
      if (users) setAllUsers(users.data.users || [])
    })
  }, [])

  function showToast(msg, type="success") {
    setToast({msg, type})
    setTimeout(() => setToast(null), 3500)
  }

  function refreshUsers() {
    axios.get(`${API}/api/users`).then(r =>
      setAllUsers(r.data.users || [])).catch(()=>{})
  }

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif",
                  background:"#f0f4f8", minHeight:"100vh" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:80, right:20,
                      zIndex:9999, padding:"14px 20px",
                      borderRadius:12, fontWeight:600,
                      fontSize:"0.88rem",
                      background: toast.type==="success"
                        ? "#dcfce7" : "#fee2e2",
                      color: toast.type==="success"
                        ? "#166534" : "#991b1b",
                      boxShadow:"0 4px 20px rgba(0,0,0,0.15)",
                      animation:"fadeIn 0.3s ease" }}>
          {toast.type==="success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      <Nav page={page} setPage={setPage} />

      {page==="home"        && <HomePage      setPage={setPage} stats={stats} />}
      {page==="onboard"     && <OnboardPage   setPage={setPage} setResult={setResult} setUserForm={setUserForm} options={options} showToast={showToast} refreshUsers={refreshUsers} />}
      {page==="dashboard"   && <DashboardPage result={result} userForm={userForm} setPage={setPage} />}
      {page==="calculator"  && <CalculatorPage options={options} />}
      {page==="marketplace" && <MarketplacePage result={result} userForm={userForm} />}
      {page==="dataset"     && <DatasetPage   stats={stats} allUsers={allUsers} />}
      {page==="adduser"     && <AddUserPage   setPage={setPage} options={options} showToast={showToast} refreshUsers={refreshUsers} setResult={setResult} setUserForm={setUserForm} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════════

function Nav({ page, setPage }) {
  const tabs = [
    ["home","🏠 Home"],["onboard","📋 Apply"],
    ["dashboard","📊 Dashboard"],["calculator","⚡ Calculator"],
    ["marketplace","🏦 Marketplace"],["dataset","📁 Dataset"],
    ["adduser","➕ Add User"]
  ]
  return (
    <nav style={{ background:navy, height:64, display:"flex",
                  alignItems:"center", padding:"0 1.5rem",
                  justifyContent:"space-between",
                  position:"sticky", top:0, zIndex:200,
                  boxShadow:"0 2px 20px rgba(0,0,0,0.4)" }}>
      <div style={{ display:"flex", alignItems:"center",
                    gap:10, cursor:"pointer" }}
           onClick={() => setPage("home")}>
        <div style={{ width:38, height:38,
                      background:`linear-gradient(135deg,${teal},#34d399)`,
                      borderRadius:10, display:"flex",
                      alignItems:"center", justifyContent:"center",
                      fontSize:"1.2rem" }}>🌱</div>
        <div>
          <div style={{ fontWeight:800, fontSize:"1.1rem",
                        color:"white", lineHeight:1 }}>SeasonCredit</div>
          <div style={{ fontSize:"0.6rem", color:"#14b8a6",
                        fontWeight:600 }}>NO CIBIL REQUIRED</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:2, flexWrap:"wrap" }}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={() => setPage(id)}
            style={{ padding:"7px 12px", borderRadius:8,
                     border:"none", cursor:"pointer",
                     fontSize:"0.78rem", fontWeight:600,
                     background: page===id ? teal : "transparent",
                     color: page===id ? "white" : "#94a3b8",
                     transition:"all 0.2s" }}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

// ════════════════════════════════════════════════════════════
// HOME PAGE
// ════════════════════════════════════════════════════════════

function HomePage({ setPage, stats }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${navy},#0d3d38,#0f766e)`,
                    minHeight:"calc(100vh - 64px)", display:"flex",
                    alignItems:"center", padding:"4rem 2rem" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center",
                        gap:8, background:"rgba(20,184,166,0.15)",
                        border:"1px solid rgba(20,184,166,0.3)",
                        color:"#14b8a6", padding:"8px 16px",
                        borderRadius:20, fontSize:"0.82rem",
                        fontWeight:700, marginBottom:"1.5rem" }}>
            🇮🇳 India's First Seasonal-Intelligence Lending Platform
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"3.2rem",
                       fontWeight:900, color:"white", lineHeight:1.1,
                       marginBottom:"1.5rem" }}>
            Credit That Understands<br/>
            <span style={{ background:"linear-gradient(90deg,#14b8a6,#34d399)",
                           WebkitBackgroundClip:"text",
                           WebkitTextFillColor:"transparent" }}>
              Your Seasonal Calendar
            </span>
          </h1>
          <p style={{ color:"#94a3b8", fontSize:"1.05rem",
                      lineHeight:1.8, marginBottom:"1rem",
                      maxWidth:600 }}>
            6.3 crore seasonal businesses earn 70% income in just 45 days.
            Banks demand fixed EMIs. <strong style={{color:"white"}}>SeasonCredit</strong> gives
            ₹500 EMI in off-season, ₹15,000 in peak — automatically via UPI.
          </p>

          {/* No CIBIL badge */}
          <div style={{ display:"inline-flex", alignItems:"center",
                        gap:8, background:"rgba(34,197,94,0.15)",
                        border:"1px solid rgba(34,197,94,0.4)",
                        color:"#4ade80", padding:"10px 18px",
                        borderRadius:12, fontSize:"0.9rem",
                        fontWeight:700, marginBottom:"2rem" }}>
            ✅ No CIBIL Score Required — We Generate Your SeasonScore™
          </div>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button onClick={() => setPage("onboard")}
              style={{ background:`linear-gradient(135deg,${teal},#0f766e)`,
                       color:"white", padding:"15px 32px",
                       borderRadius:12, fontWeight:700,
                       fontSize:"1rem", cursor:"pointer",
                       border:"none",
                       boxShadow:"0 4px 20px rgba(13,148,136,0.5)" }}>
              Apply Now — Get SeasonScore™ →
            </button>
            <button onClick={() => setPage("adduser")}
              style={{ background:"rgba(255,255,255,0.1)",
                       color:"white", padding:"15px 32px",
                       borderRadius:12, fontWeight:700,
                       fontSize:"1rem", cursor:"pointer",
                       border:"1px solid rgba(255,255,255,0.25)" }}>
              ➕ Add New User
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid",
                        gridTemplateColumns:"repeat(4,1fr)",
                        gap:"1rem", marginTop:"3rem" }}>
            {[["6.3Cr","Seasonal MSMEs"],
              ["₹20L Cr","Credit Gap"],
              [stats?.total_records||"50","Dataset Records"],
              [stats?.eligible_rate||"100%","Eligible Rate"]
            ].map(([n,l]) => (
              <div key={l} style={{ background:"rgba(255,255,255,0.05)",
                                    border:"1px solid rgba(255,255,255,0.1)",
                                    borderRadius:12, padding:"1rem",
                                    textAlign:"center" }}>
                <div style={{ fontSize:"1.6rem", fontWeight:900,
                              color:"#14b8a6",
                              fontFamily:"'Syne',sans-serif" }}>{n}</div>
                <div style={{ fontSize:"0.7rem", color:"#64748b",
                              marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background:"white", padding:"4rem 2rem" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Syne',sans-serif",
                     fontSize:"2rem", fontWeight:800, color:dark,
                     marginBottom:"0.5rem" }}>
          How SeasonCredit Works
        </h2>
        <p style={{ textAlign:"center", color:"#64748b",
                    marginBottom:"3rem" }}>
          From zero CIBIL to approved loan in 3 steps
        </p>
        <div style={{ display:"grid",
                      gridTemplateColumns:"repeat(3,1fr)",
                      gap:"2rem", maxWidth:900, margin:"0 auto" }}>
          {[
            ["01","Enter Business Details","Name, city, bank account, business type — no ITR needed"],
            ["02","We Generate SeasonScore™","Our AI analyzes your 12-month revenue pattern. No CIBIL required."],
            ["03","Get Loan + Smart EMI","Approved in 24hrs. Pay ₹500 in off-season, ₹15,000 in peak via UPI auto-debit."],
          ].map(([n,t,d]) => (
            <div key={n} style={{ textAlign:"center", padding:"2rem",
                                  background:"#f8fafc", borderRadius:16,
                                  border:"1px solid #e2e8f0" }}>
              <div style={{ width:56, height:56, borderRadius:"50%",
                            background:`linear-gradient(135deg,${teal},#14b8a6)`,
                            display:"flex", alignItems:"center",
                            justifyContent:"center",
                            fontFamily:"'Syne',sans-serif",
                            fontSize:"1.2rem", fontWeight:800,
                            color:"white", margin:"0 auto 1rem" }}>{n}</div>
              <div style={{ fontWeight:700, fontSize:"1rem",
                            color:dark, marginBottom:"0.5rem" }}>{t}</div>
              <div style={{ fontSize:"0.85rem", color:"#64748b",
                            lineHeight:1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ background:"#f8fafc", padding:"4rem 2rem" }}>
        <h2 style={{ textAlign:"center", fontFamily:"'Syne',sans-serif",
                     fontSize:"2rem", fontWeight:800, color:dark,
                     marginBottom:"2.5rem" }}>
          SeasonCredit vs Traditional Banks
        </h2>
        <div style={{ maxWidth:700, margin:"0 auto",
                      borderRadius:16, overflow:"hidden",
                      boxShadow:"0 4px 30px rgba(0,0,0,0.08)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                {["Feature","Traditional Bank","🌱 SeasonCredit"].map((h,i) => (
                  <th key={h} style={{ padding:"1rem 1.5rem",
                    background:i===2?teal:i===1?"#f1f5f9":"#f8fafc",
                    color:i===2?"white":"#334155",
                    fontWeight:700, fontSize:"0.88rem",
                    textAlign:i===0?"left":"center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[["CIBIL Required","✅ Mandatory","❌ Not Required"],
                ["Approval Time","30–45 days","✅ 24 hours"],
                ["Collateral","Required","✅ Zero"],
                ["Off-Season EMI","Full ₹15,000+","✅ Only ₹500"],
                ["Disbursal","Lump sum","✅ Smart Tranches"],
                ["Interest Rate","18–24%","✅ 12–16%"],
                ["Score Basis","CIBIL only","✅ SeasonScore™"],
              ].map(([f,b,s]) => (
                <tr key={f}>
                  <td style={{ padding:"0.85rem 1.5rem",fontSize:"0.87rem",
                               fontWeight:500,color:"#334155",
                               background:"#fafafa",
                               borderBottom:"1px solid #e2e8f0" }}>{f}</td>
                  <td style={{ padding:"0.85rem 1.5rem",textAlign:"center",
                               color:"#94a3b8",fontSize:"0.87rem",
                               background:"#f8fafc",
                               borderBottom:"1px solid #e2e8f0" }}>{b}</td>
                  <td style={{ padding:"0.85rem 1.5rem",textAlign:"center",
                               background:"#ccfbf1",fontWeight:700,
                               color:"#0f766e",fontSize:"0.87rem",
                               borderBottom:"1px solid #e2e8f0" }}>{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// INPUT COMPONENTS
// ════════════════════════════════════════════════════════════

function Field({ label, type="text", value, onChange,
                 placeholder="", required=false, hint="" }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={{ display:"block", fontSize:"0.82rem",
                      fontWeight:700, color:"#334155",
                      marginBottom:4 }}>
        {label}{required && <span style={{color:"#ef4444"}}> *</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(type==="number"
          ? Number(e.target.value) : e.target.value)}
        style={{ width:"100%", padding:"11px 14px",
                 border:"1.5px solid #e2e8f0",
                 borderRadius:10, fontSize:"0.9rem",
                 fontFamily:"'DM Sans',sans-serif",
                 boxSizing:"border-box",
                 outline:"none",
                 transition:"border-color 0.2s" }}
        onFocus={e => e.target.style.borderColor=teal}
        onBlur={e  => e.target.style.borderColor="#e2e8f0"} />
      {hint && <div style={{fontSize:"0.72rem",color:"#94a3b8",marginTop:3}}>{hint}</div>}
    </div>
  )
}

function Select({ label, value, onChange, options=[], required=false }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={{ display:"block", fontSize:"0.82rem",
                      fontWeight:700, color:"#334155",
                      marginBottom:4 }}>
        {label}{required && <span style={{color:"#ef4444"}}> *</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width:"100%", padding:"11px 14px",
                 border:"1.5px solid #e2e8f0", borderRadius:10,
                 fontSize:"0.9rem",
                 fontFamily:"'DM Sans',sans-serif",
                 background:"white", cursor:"pointer",
                 outline:"none" }}
        onFocus={e => e.target.style.borderColor=teal}
        onBlur={e  => e.target.style.borderColor="#e2e8f0"}>
        <option value="">— Select —</option>
        {options.map(o => (
          <option key={o.value||o} value={o.value||o}>
            {o.label||o}
          </option>
        ))}
      </select>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom:"1.5rem", paddingBottom:"0.75rem",
                  borderBottom:"2px solid #f1f5f9" }}>
      <div style={{ fontSize:"1rem", fontWeight:800, color:dark,
                    display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:"1.3rem" }}>{icon}</span>{title}
      </div>
      {subtitle && <div style={{ fontSize:"0.78rem", color:"#64748b",
                                  marginTop:2 }}>{subtitle}</div>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ONBOARD PAGE — Full KYC + Bank + Revenue
// ════════════════════════════════════════════════════════════

function OnboardPage({ setPage, setResult, setUserForm,
                       options, showToast, refreshUsers }) {
  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)

  const defaultOpts = {
    business_types: Object.keys(REVENUE_PATTERNS).map(k => ({value:k,label:k.replace("_"," ")})),
    states: ["Maharashtra","Rajasthan","Delhi","Gujarat","Karnataka","Tamil Nadu","Uttar Pradesh","West Bengal"],
    banks:  ["SBI","HDFC Bank","ICICI Bank","PNB","Axis Bank","Canara Bank"],
    account_types: ["Savings Account","Current Account","Business Account"],
    loan_purposes: ["Stock Purchase","Working Capital","Equipment","Marketing","Expansion"],
  }
  const O = options || defaultOpts

  const [form, setForm] = useState({
    // Personal
    full_name:"", mobile:"", email:"",
    aadhaar_last4:"", pan_number:"",
    // Business
    business_name:"", business_type:"", business_address:"",
    city:"", state:"", pincode:"", years_active:1,
    num_employees:1, gst_number:"", udyam_number:"",
    // Bank
    bank_name:"", account_number:"", ifsc_code:"",
    account_type:"", upi_id:"",
    // Loan
    loan_amount:300000, loan_purpose:"",
    // CIBIL
    has_cibil:false, cibil_score:"",
  })

  const [revenue, setRevenue] = useState(Array(12).fill(0))

  function setF(key, val) { setForm(f => ({...f, [key]:val})) }

  function handleTypeChange(type) {
    setF("business_type", type)
    setRevenue(REVENUE_PATTERNS[type] || Array(12).fill(0))
  }

  function validate(s) {
    if (s===1) return form.full_name && form.mobile && form.aadhaar_last4
    if (s===2) return form.business_name && form.business_type && form.city && form.state
    if (s===3) return form.bank_name && form.account_number && form.ifsc_code && form.account_type
    if (s===4) return revenue.some(r => r > 0) && form.loan_amount
    return true
  }

  async function submit() {
    setLoading(true)
    try {
      const payload = {
        ...form,
        cibil_score: form.has_cibil && form.cibil_score ? Number(form.cibil_score) : null,
        monthly_revenue: revenue,
        years_active: Number(form.years_active),
        num_employees: Number(form.num_employees),
        loan_amount: Number(form.loan_amount),
      }
      const res = await axios.post(`${API}/api/onboard`, payload)
      setResult(res.data)
      setUserForm(form)
      refreshUsers()
      showToast(`SeasonScore ${res.data.score.total}/100 — ${res.data.score.eligible ? "Eligible!" : "Score too low"}`)
      setStep(6)
    } catch(e) {
      // Offline fallback
      const score = localScore(revenue)
      setResult({score, user:{...form}, user_id:"DEMO01"})
      setUserForm(form)
      showToast("Score calculated (offline mode)")
      setStep(6)
    }
    setLoading(false)
  }

  const steps = ["Personal","Business","Bank","Revenue","CIBIL","Result"]

  return (
    <div style={{ maxWidth:680, margin:"0 auto", padding:"2rem 1.5rem" }}>
      {/* Step bar */}
      <div style={{ display:"flex", alignItems:"center",
                    marginBottom:"2rem", gap:0 }}>
        {steps.map((s,i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
            <div style={{ display:"flex", flexDirection:"column",
                          alignItems:"center", flex:1 }}>
              <div style={{ width:30, height:30, borderRadius:"50%",
                            display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:"0.75rem",
                            fontWeight:800,
                            background: i+1<step?"#16a34a":i+1===step?teal:"#e2e8f0",
                            color: i+1<=step?"white":"#64748b" }}>
                {i+1<step?"✓":i+1}
              </div>
              <div style={{ fontSize:"0.62rem", marginTop:3,
                            color:i+1===step?teal:"#94a3b8",
                            fontWeight:i+1===step?700:400 }}>{s}</div>
            </div>
            {i<steps.length-1 && (
              <div style={{ height:2, flex:0.5, marginBottom:16,
                            background:i+1<step?"#16a34a":"#e2e8f0" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ background:card, borderRadius:20, padding:"2rem",
                    boxShadow:"0 4px 30px rgba(0,0,0,0.08)" }}>

        {/* ── STEP 1: PERSONAL ── */}
        {step===1 && (
          <div>
            <SectionTitle icon="👤" title="Personal Details"
              subtitle="KYC information — required for loan processing" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              <Field label="Full Name" value={form.full_name} required
                onChange={v=>setF("full_name",v)} placeholder="As per Aadhaar" />
              <Field label="Mobile Number" value={form.mobile} required
                onChange={v=>setF("mobile",v)} placeholder="10-digit number"
                hint="OTP will be sent for verification" />
              <Field label="Email Address" value={form.email}
                onChange={v=>setF("email",v)} placeholder="Optional" />
              <Field label="Aadhaar Last 4 Digits" value={form.aadhaar_last4} required
                onChange={v=>setF("aadhaar_last4",v)} placeholder="XXXX"
                hint="We only store last 4 digits" />
              <Field label="PAN Number" value={form.pan_number}
                onChange={v=>setF("pan_number",v.toUpperCase())}
                placeholder="ABCDE1234F (optional)" />
            </div>
          </div>
        )}

        {/* ── STEP 2: BUSINESS ── */}
        {step===2 && (
          <div>
            <SectionTitle icon="🏪" title="Business Details"
              subtitle="Tell us about your seasonal business" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              <Field label="Business Name" value={form.business_name} required
                onChange={v=>setF("business_name",v)}
                placeholder="e.g. Priya's Diwali Store" />
              <div>
                <Select label="Business Type *" value={form.business_type}
                  onChange={handleTypeChange}
                  options={O.business_types||defaultOpts.business_types} />
              </div>
              <Field label="Business Address" value={form.business_address}
                onChange={v=>setF("business_address",v)}
                placeholder="Shop / Market address" />
              <Field label="City" value={form.city} required
                onChange={v=>setF("city",v)} placeholder="e.g. Jaipur" />
              <Select label="State *" value={form.state}
                onChange={v=>setF("state",v)}
                options={O.states||defaultOpts.states} />
              <Field label="Pincode" value={form.pincode}
                onChange={v=>setF("pincode",v)} placeholder="6-digit pincode" />
              <Field label="Years in Business" type="number"
                value={form.years_active} required
                onChange={v=>setF("years_active",v)} placeholder="e.g. 5" />
              <Field label="Number of Employees" type="number"
                value={form.num_employees}
                onChange={v=>setF("num_employees",v)} />
              <Field label="GST Number" value={form.gst_number}
                onChange={v=>setF("gst_number",v.toUpperCase())}
                placeholder="Optional — if registered" />
              <Field label="Udyam Registration" value={form.udyam_number}
                onChange={v=>setF("udyam_number",v.toUpperCase())}
                placeholder="Optional — MSME certificate" />
            </div>
          </div>
        )}

        {/* ── STEP 3: BANK ── */}
        {step===3 && (
          <div>
            <SectionTitle icon="🏦" title="Bank Account Details"
              subtitle="For loan disbursal and UPI auto-repayment" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 1rem" }}>
              <Select label="Bank Name *" value={form.bank_name}
                onChange={v=>setF("bank_name",v)}
                options={O.banks||defaultOpts.banks} />
              <Select label="Account Type *" value={form.account_type}
                onChange={v=>setF("account_type",v)}
                options={O.account_types||defaultOpts.account_types} />
              <Field label="Account Number" value={form.account_number} required
                onChange={v=>setF("account_number",v)}
                placeholder="Enter bank account number" />
              <Field label="IFSC Code" value={form.ifsc_code} required
                onChange={v=>setF("ifsc_code",v.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                hint="11-character code on cheque book" />
              <Field label="UPI ID" value={form.upi_id}
                onChange={v=>setF("upi_id",v)}
                placeholder="e.g. 9876543210@okaxis"
                hint="For auto-debit UPI intercept repayment" />
            </div>
            <div style={{ background:"#eff6ff", borderRadius:12,
                          padding:"1rem", marginTop:"0.5rem",
                          fontSize:"0.82rem", color:"#1d4ed8",
                          borderLeft:"3px solid #3b82f6" }}>
              ⚡ <strong>UPI Intercept:</strong> 10% of every UPI sale auto-routes to
              loan repayment. No manual EMI needed. ₹500 minimum in off-season.
            </div>
          </div>
        )}

        {/* ── STEP 4: REVENUE ── */}
        {step===4 && (
          <div>
            <SectionTitle icon="📊" title="Monthly Revenue"
              subtitle="Enter approximate monthly earnings — pre-filled based on your business type" />
            <div style={{ background:"#f0fdf4", borderRadius:10,
                          padding:"0.75rem 1rem", marginBottom:"1rem",
                          fontSize:"0.82rem", color:"#166534" }}>
              ✅ Values pre-filled based on <strong>{form.business_type?.replace("_"," ") || "your business type"}</strong>.
              Adjust as needed — approximate is fine!
            </div>
            <div style={{ display:"grid",
                          gridTemplateColumns:"repeat(4,1fr)",
                          gap:"0.6rem" }}>
              {MONTHS.map((m,i) => {
                const avg = revenue.reduce((a,b)=>a+b,0)/12
                const isPeak = revenue[i] > avg*2
                return (
                  <div key={m}>
                    <div style={{ fontSize:"0.7rem", fontWeight:700,
                                  color: isPeak?"#16a34a":teal,
                                  textAlign:"center", marginBottom:3 }}>
                      {m} {isPeak?"🔥":""}
                    </div>
                    <input type="number" value={revenue[i]}
                      onChange={e => {
                        const n = [...revenue]
                        n[i] = Number(e.target.value)
                        setRevenue(n)
                      }}
                      style={{ width:"100%", padding:"8px 6px",
                               border:`1.5px solid ${isPeak?"#16a34a":"#e2e8f0"}`,
                               borderRadius:8, textAlign:"center",
                               fontSize:"0.8rem", boxSizing:"border-box",
                               background:isPeak?"#f0fdf4":"white" }} />
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop:"1rem" }}>
              <Select label="Loan Purpose *" value={form.loan_purpose}
                onChange={v=>setF("loan_purpose",v)}
                options={O.loan_purposes||defaultOpts.loan_purposes} />
              <Field label="Loan Amount (₹)" type="number"
                value={form.loan_amount} required
                onChange={v=>setF("loan_amount",v)}
                hint="Between ₹1L – ₹10L based on your SeasonScore" />
            </div>
          </div>
        )}

        {/* ── STEP 5: CIBIL ── */}
        {step===5 && (
          <div>
            <SectionTitle icon="📋" title="Credit Score (Optional)"
              subtitle="SeasonCredit works WITHOUT CIBIL — but having it gives better rates" />

            <div style={{ background:"#dcfce7", borderRadius:16,
                          padding:"1.5rem", marginBottom:"1.5rem",
                          border:"2px solid #86efac" }}>
              <div style={{ fontWeight:800, fontSize:"1rem",
                            color:"#166534", marginBottom:"0.5rem" }}>
                ✅ No CIBIL? No Problem!
              </div>
              <div style={{ fontSize:"0.85rem", color:"#15803d",
                            lineHeight:1.7 }}>
                SeasonCredit generates your <strong>SeasonScore™</strong> based
                purely on your seasonal revenue pattern. This is our key innovation
                — we don't penalize seasonal businesses for low CIBIL.
              </div>
            </div>

            <div style={{ display:"flex", gap:"1rem", marginBottom:"1.5rem" }}>
              {[false, true].map(val => (
                <div key={String(val)}
                  onClick={() => setF("has_cibil", val)}
                  style={{ flex:1, padding:"1.2rem",
                           borderRadius:12, cursor:"pointer",
                           border:`2px solid ${form.has_cibil===val?teal:"#e2e8f0"}`,
                           background:form.has_cibil===val?"#ccfbf1":"white",
                           textAlign:"center" }}>
                  <div style={{ fontSize:"1.5rem",
                                marginBottom:"0.5rem" }}>
                    {val ? "📊" : "❌"}
                  </div>
                  <div style={{ fontWeight:700, color:dark,
                                fontSize:"0.9rem" }}>
                    {val ? "I have CIBIL score" : "I don't have CIBIL"}
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"#64748b",
                                marginTop:3 }}>
                    {val ? "Blended scoring — better rates"
                         : "SeasonScore only — still eligible"}
                  </div>
                </div>
              ))}
            </div>

            {form.has_cibil && (
              <Field label="CIBIL Score" type="number"
                value={form.cibil_score}
                onChange={v=>setF("cibil_score",v)}
                placeholder="300–900"
                hint="Higher CIBIL + SeasonScore = lower interest rate" />
            )}

            <div style={{ background:"#f8fafc", borderRadius:12,
                          padding:"1rem", fontSize:"0.8rem",
                          color:"#64748b", lineHeight:1.7 }}>
              📊 <strong>Scoring Formula:</strong><br/>
              • <strong>No CIBIL:</strong> 100% SeasonScore™<br/>
              • <strong>With CIBIL:</strong> 70% SeasonScore™ + 30% CIBIL Score<br/>
              Score ≥ 80 → 12% | ≥ 65 → 14% | ≥ 50 → 16%
            </div>
          </div>
        )}

        {/* ── STEP 6: RESULT ── */}
        {step===6 && (
          <ScoreResult result={null} form={form}
            onDashboard={() => setPage("dashboard")}
            onMarket={() => setPage("marketplace")} />
        )}

        {/* Navigation */}
        {step < 6 && (
          <div style={{ display:"flex", gap:"1rem", marginTop:"1.5rem" }}>
            {step > 1 && (
              <button onClick={() => setStep(s=>s-1)}
                style={{ flex:1, padding:"13px",
                         background:"#f8fafc",
                         border:"1.5px solid #e2e8f0",
                         borderRadius:12, fontWeight:700,
                         cursor:"pointer", color:dark }}>
                ← Back
              </button>
            )}
            {step < 5 ? (
              <button onClick={() => {
                if (!validate(step)) {
                  alert("Please fill all required fields (*)")
                  return
                }
                setStep(s=>s+1)
              }}
                style={{ flex:2, padding:"13px",
                         background:`linear-gradient(135deg,${teal},#0f766e)`,
                         color:"white", border:"none",
                         borderRadius:12, fontWeight:700,
                         cursor:"pointer", fontSize:"0.95rem" }}>
                Continue →
              </button>
            ) : (
              <button onClick={submit} disabled={loading}
                style={{ flex:2, padding:"13px",
                         background:`linear-gradient(135deg,${teal},#0f766e)`,
                         color:"white", border:"none",
                         borderRadius:12, fontWeight:700,
                         cursor:"pointer", fontSize:"0.95rem",
                         opacity:loading?0.7:1 }}>
                {loading ? "⏳ Calculating SeasonScore..." : "🚀 Calculate SeasonScore™"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// SCORE RESULT CARD
// ════════════════════════════════════════════════════════════

function ScoreResult({ result, form, onDashboard, onMarket }) {
  const [liveResult, setLiveResult] = useState(result)

  useEffect(() => {
    if (!result && form) {
      const revenue = REVENUE_PATTERNS[form.business_type] ||
                      REVENUE_PATTERNS.festival_retail
      const s = localScore(revenue)
      setLiveResult({ score: s, user: form, user_id: "LIVE" })
    }
  }, [])

  const R = liveResult
  if (!R) return <div style={{textAlign:"center",padding:"2rem",color:"#64748b"}}>Loading...</div>

  const score = R.score?.total || R.score?.season_score || 0
  const rate  = R.score?.rate
  const peaks = R.score?.peak_months || []
  const method = R.score?.scoring_method || ""
  const eligible = R.score?.eligible

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
        <div style={{ width:120, height:120, borderRadius:"50%",
                      background:`conic-gradient(${teal} ${score*3.6}deg, #e2e8f0 0deg)`,
                      display:"flex", alignItems:"center",
                      justifyContent:"center", margin:"0 auto 1rem",
                      position:"relative" }}>
          <div style={{ width:90, height:90, borderRadius:"50%",
                        background:"white", display:"flex",
                        alignItems:"center", justifyContent:"center",
                        flexDirection:"column" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"2rem", fontWeight:900,
                          color:teal, lineHeight:1 }}>{score}</div>
            <div style={{ fontSize:"0.65rem", color:"#64748b" }}>/100</div>
          </div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif",
                      fontSize:"1.3rem", fontWeight:800,
                      color:dark }}>SeasonScore™</div>
        {method && (
          <div style={{ fontSize:"0.75rem", color:"#64748b",
                        marginTop:3 }}>{method}</div>
        )}
        <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                      background:eligible?"#dcfce7":"#fee2e2",
                      color:eligible?"#16a34a":"#dc2626",
                      padding:"6px 14px", borderRadius:8,
                      fontSize:"0.82rem", fontWeight:700,
                      marginTop:"0.75rem" }}>
          {eligible ? `✅ Eligible — ${rate}% p.a.` : "❌ Score below 50"}
        </div>
      </div>

      {/* Breakdown */}
      {[["Consistency",R.score?.consistency||0],
        ["Growth",R.score?.growth||0],
        ["Capacity",R.score?.capacity||0],
        ["Reliability",R.score?.reliability||0]
      ].map(([l,v]) => (
        <div key={l} style={{ marginBottom:"0.6rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:"0.78rem", marginBottom:3 }}>
            <span style={{color:"#334155"}}>{l}</span>
            <span style={{fontWeight:700,color:teal}}>{v}/25</span>
          </div>
          <div style={{ background:"#e2e8f0", height:6, borderRadius:3 }}>
            <div style={{ background:`linear-gradient(90deg,${teal},#14b8a6)`,
                          height:"100%", borderRadius:3,
                          width:`${(v/25)*100}%`,
                          transition:"width 1s ease" }} />
          </div>
        </div>
      ))}

      {peaks.length > 0 && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                      background:"linear-gradient(135deg,#f97316,#ef4444)",
                      color:"white", padding:"6px 12px",
                      borderRadius:8, fontSize:"0.8rem",
                      fontWeight:700, marginTop:"0.75rem" }}>
          🔥 Peak Season: {peaks.join(", ")}
        </div>
      )}

      {eligible && rate && (
        <div style={{ background:"#f0fdf4", borderRadius:12,
                      padding:"1rem", marginTop:"1rem" }}>
          <div style={{ fontSize:"0.75rem", fontWeight:700,
                        color:"#15803d" }}>💚 Annual Saving vs Moneylender (40%)</div>
          <div style={{ fontFamily:"'Syne',sans-serif",
                        fontSize:"1.8rem", fontWeight:900,
                        color:"#16a34a" }}>
            {fmtL(300000*(0.40-rate/100))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:"0.75rem", marginTop:"1.25rem" }}>
        <button onClick={onDashboard}
          style={{ flex:1, padding:"12px",
                   background:`linear-gradient(135deg,${teal},#0f766e)`,
                   color:"white", border:"none", borderRadius:12,
                   fontWeight:700, cursor:"pointer" }}>
          View Dashboard →
        </button>
        <button onClick={onMarket}
          style={{ flex:1, padding:"12px",
                   background:"#f8fafc",
                   border:"1.5px solid #e2e8f0",
                   borderRadius:12, fontWeight:700,
                   cursor:"pointer", color:dark }}>
          View Lenders →
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ════════════════════════════════════════════════════════════

function DashboardPage({ result, userForm, setPage }) {
  const name    = userForm?.business_name || result?.user?.business_name || "Your Business"
  const city    = userForm?.city || result?.user?.city || "India"
  const btype   = userForm?.business_type || result?.user?.business_type || "festival_retail"
  const revenue = REVENUE_PATTERNS[btype] || REVENUE_PATTERNS.festival_retail
  const score   = result?.score?.total || 74
  const rate    = result?.score?.rate || 14
  const loanAmt = Number(userForm?.loan_amount || result?.user?.loan_amount || 300000)
  const avg     = revenue.reduce((a,b)=>a+b,0)/12

  const chartData = {
    labels: MONTHS,
    datasets: [{
      type:"bar", label:"Revenue",
      data: revenue,
      backgroundColor: revenue.map(r =>
        r>avg*2?"rgba(22,163,74,0.8)":r>avg?"rgba(13,148,136,0.8)":"rgba(148,163,184,0.6)"),
      borderRadius:6, borderSkipped:false
    }]
  }

  const totalRepayable = Math.round(loanAmt*(1+rate/100))

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${navy},#1e293b)`,
                    padding:"2rem", color:"white" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif",
                       fontSize:"1.5rem", fontWeight:800 }}>
            Welcome, {name} 👋
          </h2>
          <p style={{ color:"#64748b", fontSize:"0.88rem", marginTop:4 }}>
            SeasonCredit Dashboard · {btype.replace("_"," ")} · {city}
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto",
                    padding:"2rem 1.5rem" }}>
        {/* Top stat cards */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"repeat(4,1fr)",
                      gap:"1rem", marginBottom:"1.5rem" }}>
          {[["🎯",`${score}/100`,"SeasonScore™","#ccfbf1"],
            ["💰",fmtL(loanAmt),"Loan Amount","#f0fdf4"],
            ["📅",result?.score?.peak_months?.join(", ")||"Oct–Nov","Peak Season","#fefce8"],
            ["📉",rate+"%","Interest Rate","#dcfce7"],
          ].map(([icon,val,label,bg]) => (
            <div key={label} style={{ background:"white",
                                      borderRadius:14, padding:"1.2rem",
                                      boxShadow:"0 2px 15px rgba(0,0,0,0.06)",
                                      display:"flex", alignItems:"center",
                                      gap:"1rem" }}>
              <div style={{ width:46, height:46, borderRadius:12,
                            background:bg, display:"flex",
                            alignItems:"center", justifyContent:"center",
                            fontSize:"1.3rem" }}>{icon}</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",
                              fontSize:"1.25rem", fontWeight:800,
                              color:dark }}>{val}</div>
                <div style={{ fontSize:"0.72rem", color:"#64748b",
                              marginTop:2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Score card + Chart */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"280px 1fr",
                      gap:"1.5rem", marginBottom:"1.5rem" }}>
          <div style={{ background:`linear-gradient(135deg,${navy},#1e3a5f)`,
                        borderRadius:16, padding:"1.5rem",
                        color:"white" }}>
            <div style={{ fontSize:"0.75rem", fontWeight:700,
                          color:"#64748b", textTransform:"uppercase",
                          letterSpacing:"1px", marginBottom:"1rem" }}>
              SeasonScore™
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"4rem", fontWeight:900,
                          background:"linear-gradient(135deg,#14b8a6,#34d399)",
                          WebkitBackgroundClip:"text",
                          WebkitTextFillColor:"transparent",
                          lineHeight:1 }}>{score}</div>
            <div style={{ color:"#94a3b8", fontSize:"0.8rem",
                          marginTop:4, marginBottom:"1rem" }}>
              {result?.score?.scoring_method || "SeasonScore Only"}
            </div>
            {[["Consistency",result?.score?.consistency||18],
              ["Growth",result?.score?.growth||20],
              ["Capacity",result?.score?.capacity||19],
              ["Reliability",result?.score?.reliability||17]
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", alignItems:"center",
                                    gap:8, marginTop:8 }}>
                <span style={{ fontSize:"0.72rem", color:"#94a3b8",
                               width:90, flexShrink:0 }}>{l}</span>
                <div style={{ flex:1, height:5,
                              background:"rgba(255,255,255,0.1)",
                              borderRadius:3 }}>
                  <div style={{ width:`${(v/25)*100}%`, height:"100%",
                                borderRadius:3,
                                background:"linear-gradient(90deg,#0d9488,#14b8a6)" }} />
                </div>
                <span style={{ fontSize:"0.72rem", color:"white",
                               fontWeight:700, width:24,
                               textAlign:"right" }}>{v}</span>
              </div>
            ))}
            <div style={{ display:"inline-flex", alignItems:"center",
                          gap:5, background:"#dcfce7", color:"#16a34a",
                          padding:"6px 12px", borderRadius:8,
                          fontSize:"0.78rem", fontWeight:700,
                          marginTop:"1rem" }}>
              ✅ Eligible — {rate}% p.a.
            </div>
          </div>

          <div style={{ background:"white", borderRadius:16,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:"0.8rem", fontWeight:700,
                          color:"#64748b", textTransform:"uppercase",
                          letterSpacing:"0.5px", marginBottom:"1rem" }}>
              📊 Revenue Pulse — 12 Months
            </div>
            <Bar data={chartData} options={{
              responsive:true,
              plugins:{ legend:{display:false} },
              scales:{ y:{ ticks:{ callback: v=>"₹"+(v/1000).toFixed(0)+"K" }}}
            }} />
          </div>
        </div>

        {/* Loan Summary + Calendar Preview */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"1fr 1fr",
                      gap:"1.5rem", marginBottom:"1.5rem" }}>
          {/* Loan breakdown */}
          <div style={{ background:`linear-gradient(135deg,${navy},#0d3d38)`,
                        borderRadius:16, padding:"1.5rem", color:"white" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"1rem", fontWeight:800,
                          marginBottom:"1rem" }}>
              💼 Loan Breakdown
            </div>
            {[["Total Loan",fmtL(loanAmt),"white"],
              ["Interest ("+rate+"%)",fmtL(Math.round(loanAmt*rate/100)),"#94a3b8"],
              ["Total Repayable",fmtL(totalRepayable),"#14b8a6"],
              ["Supplier Tranche (60%)",fmtL(Math.round(loanAmt*0.6)),"#4ade80"],
              ["Operations Tranche (40%)",fmtL(Math.round(loanAmt*0.4)),"#86efac"],
              ["Saving vs Moneylender",fmtL(Math.round(loanAmt*(0.4-rate/100))),"#4ade80"],
            ].map(([l,v,c]) => (
              <div key={l} style={{ display:"flex",
                                    justifyContent:"space-between",
                                    padding:"8px 0",
                                    borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontSize:"0.82rem", color:"#94a3b8" }}>{l}</span>
                <span style={{ fontSize:"0.9rem", fontWeight:700,
                               color:c }}>{v}</span>
              </div>
            ))}
          </div>

          {/* EMI Preview */}
          <div style={{ background:"white", borderRadius:16,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"1rem", fontWeight:800,
                          color:dark, marginBottom:"1rem" }}>
              📅 Dynamic EMI Preview
            </div>
            <div style={{ display:"grid",
                          gridTemplateColumns:"1fr 1fr",
                          gap:"0.75rem", marginBottom:"1rem" }}>
              {[["🔥 Peak EMI","₹15,000","Max/month","#dcfce7","#16a34a"],
                ["💤 Off-Season","₹500","Minimum","#eff6ff","#1d4ed8"],
              ].map(([t,v,s,bg,c]) => (
                <div key={t} style={{ background:bg, borderRadius:12,
                                      padding:"1rem", textAlign:"center" }}>
                  <div style={{ fontSize:"0.78rem", fontWeight:700,
                                color:c }}>{t}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",
                                fontSize:"1.5rem", fontWeight:900,
                                color:c }}>{v}</div>
                  <div style={{ fontSize:"0.7rem", color:"#64748b" }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:"0.78rem", color:"#64748b",
                          background:"#f8fafc", borderRadius:8,
                          padding:"0.75rem", lineHeight:1.7 }}>
              <strong>Formula:</strong> R = max(₹500, min(₹15,000, 10% × Monthly Sales))<br/>
              <strong>UPI Intercept:</strong> 10% of every sale auto-routes to repayment
            </div>
            <button onClick={() => setPage("calculator")}
              style={{ width:"100%", padding:"10px",
                       background:`linear-gradient(135deg,${teal},#0f766e)`,
                       color:"white", border:"none", borderRadius:10,
                       fontWeight:700, cursor:"pointer",
                       marginTop:"1rem", fontSize:"0.88rem" }}>
              ⚡ Open Full Calculator →
            </button>
          </div>
        </div>

        {/* User Details Card */}
        {userForm && (
          <div style={{ background:"white", borderRadius:16,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"1rem", fontWeight:800,
                          color:dark, marginBottom:"1rem" }}>
              👤 Applicant Profile
            </div>
            <div style={{ display:"grid",
                          gridTemplateColumns:"repeat(4,1fr)",
                          gap:"1rem" }}>
              {[["Name",userForm.full_name],
                ["Mobile",userForm.mobile],
                ["City",userForm.city+", "+userForm.state],
                ["Bank",userForm.bank_name],
                ["Account Type",userForm.account_type],
                ["IFSC",userForm.ifsc_code],
                ["Business Type",userForm.business_type?.replace("_"," ")],
                ["CIBIL",userForm.has_cibil ? (userForm.cibil_score||"Provided") : "Not Required"],
              ].map(([l,v]) => (
                <div key={l} style={{ padding:"0.75rem",
                                      background:"#f8fafc",
                                      borderRadius:10 }}>
                  <div style={{ fontSize:"0.68rem", color:"#94a3b8",
                                fontWeight:600, textTransform:"uppercase",
                                letterSpacing:"0.5px" }}>{l}</div>
                  <div style={{ fontSize:"0.85rem", fontWeight:600,
                                color:dark, marginTop:2 }}>{v||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// CALCULATOR PAGE
// ════════════════════════════════════════════════════════════

function CalculatorPage({ options }) {
  const [loan,  setLoan]  = useState(300000)
  const [score, setScore] = useState(74)
  const [btype, setBtype] = useState("festival_retail")

  const rate     = score>=80?12:score>=65?14:16
  const total    = Math.round(loan*(1+rate/100))
  const saving   = Math.round(loan*(0.40-rate/100))
  const revenue  = REVENUE_PATTERNS[btype] || REVENUE_PATTERNS.festival_retail
  const mean     = revenue.reduce((a,b)=>a+b,0)/12

  const calendar = MONTHS.map((m,i) => {
    const rev = revenue[i]
    const emi = Math.max(500, Math.min(15000, rev*0.10))
    return {month:m, revenue:rev, emi:Math.round(emi),
            status:rev>mean*2?"Peak 🔥":rev>mean?"Rising 📈":"Off-Season 💤",
            color:rev>mean*2?"#16a34a":rev>mean?teal:"#94a3b8"}
  })

  const O = options || {}

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${navy},#1e293b)`,
                    padding:"2rem", color:"white" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",
                     fontWeight:800, fontSize:"1.5rem" }}>
          ⚡ Dynamic Financial Impact Calculator
        </h2>
        <p style={{ color:"#64748b", marginTop:4 }}>
          All values update instantly as you adjust
        </p>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto",
                    padding:"2rem 1.5rem" }}>
        <div style={{ display:"grid",
                      gridTemplateColumns:"320px 1fr",
                      gap:"1.5rem", alignItems:"start" }}>
          {/* Controls */}
          <div style={{ background:"white", borderRadius:16,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:800, color:dark,
                          marginBottom:"1.5rem" }}>
              Adjust Parameters
            </div>

            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ display:"flex",
                            justifyContent:"space-between",
                            marginBottom:"0.4rem" }}>
                <span style={{ fontSize:"0.85rem", fontWeight:700,
                               color:"#334155" }}>Loan Amount</span>
                <span style={{ fontFamily:"'Syne',sans-serif",
                               fontSize:"1.1rem", fontWeight:900,
                               color:teal }}>{fmtL(loan)}</span>
              </div>
              <input type="range" min={100000} max={1000000}
                step={10000} value={loan}
                onChange={e=>setLoan(Number(e.target.value))}
                style={{ width:"100%", accentColor:teal }} />
              <div style={{ display:"flex", justifyContent:"space-between",
                            fontSize:"0.7rem", color:"#94a3b8" }}>
                <span>₹1L</span><span>₹10L</span>
              </div>
            </div>

            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ display:"flex",
                            justifyContent:"space-between",
                            marginBottom:"0.4rem" }}>
                <span style={{ fontSize:"0.85rem", fontWeight:700,
                               color:"#334155" }}>SeasonScore™</span>
                <span style={{ fontFamily:"'Syne',sans-serif",
                               fontSize:"1.1rem", fontWeight:900,
                               color:teal }}>{score}/100</span>
              </div>
              <input type="range" min={50} max={100}
                step={1} value={score}
                onChange={e=>setScore(Number(e.target.value))}
                style={{ width:"100%", accentColor:teal }} />
              <div style={{ display:"flex", justifyContent:"space-between",
                            fontSize:"0.7rem", color:"#94a3b8" }}>
                <span>50 (min)</span><span>100 (max)</span>
              </div>
            </div>

            <div style={{ marginBottom:"1.5rem" }}>
              <label style={{ display:"block", fontSize:"0.85rem",
                              fontWeight:700, color:"#334155",
                              marginBottom:4 }}>Business Type</label>
              <select value={btype} onChange={e=>setBtype(e.target.value)}
                style={{ width:"100%", padding:"10px 12px",
                         border:"1.5px solid #e2e8f0",
                         borderRadius:10, fontSize:"0.88rem",
                         fontFamily:"'DM Sans',sans-serif" }}>
                {(O.business_types||Object.keys(REVENUE_PATTERNS)).map(t => (
                  <option key={t.value||t} value={t.value||t}>
                    {t.label||(t+"").replace("_"," ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Formula */}
            <div style={{ background:navy, borderRadius:12,
                          padding:"1rem" }}>
              <div style={{ fontSize:"0.75rem", color:"#64748b",
                            fontWeight:700, marginBottom:"0.5rem" }}>
                Dynamic EMI Formula
              </div>
              <pre style={{ fontFamily:"monospace", fontSize:"0.78rem",
                            color:"#ccfbf1", lineHeight:1.8, margin:0 }}>
{`R = max(₹500,
  min(₹15,000,
    10% × Sales))

Rate: ${rate}% p.a.
Score: ${score}/100`}
              </pre>
            </div>
          </div>

          {/* Results */}
          <div>
            {/* Impact cards */}
            <div style={{ display:"grid",
                          gridTemplateColumns:"repeat(3,1fr)",
                          gap:"1rem", marginBottom:"1.5rem" }}>
              {[["Interest Rate",`${rate}%`,"Based on SeasonScore",teal],
                ["Total Repayable",fmtL(total),"Loan + interest",teal],
                ["💚 You Save",fmtL(saving),"vs 40% moneylender","#16a34a"],
                ["Peak EMI","₹15,000","Max per month",teal],
                ["Off-Season EMI","₹500","Minimum keep-alive","#3b82f6"],
                ["Supplier (60%)",fmtL(Math.round(loan*0.60)),"Direct to vendor",teal],
              ].map(([l,v,s,c]) => (
                <div key={l} style={{ background:"white",
                                      borderRadius:14, padding:"1.2rem",
                                      boxShadow:"0 2px 15px rgba(0,0,0,0.06)",
                                      borderTop:`3px solid ${c}` }}>
                  <div style={{ fontSize:"0.72rem", color:"#64748b",
                                fontWeight:700, textTransform:"uppercase",
                                letterSpacing:"0.4px" }}>{l}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif",
                                fontSize:"1.45rem", fontWeight:900,
                                color:c, marginTop:4 }}>{v}</div>
                  <div style={{ fontSize:"0.72rem", color:"#94a3b8",
                                marginTop:2 }}>{s}</div>
                </div>
              ))}
            </div>

            {/* Repayment Calendar */}
            <div style={{ background:"white", borderRadius:16,
                          padding:"1.5rem",
                          boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight:800, color:dark,
                            marginBottom:"1rem" }}>
                📅 12-Month Dynamic Repayment Calendar
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",
                                borderCollapse:"collapse",
                                fontSize:"0.82rem" }}>
                  <thead>
                    <tr>
                      {["Month","Expected Revenue","Dynamic EMI","Status"].map(h => (
                        <th key={h} style={{ padding:"8px 12px",
                                            background:"#f8fafc",
                                            color:"#334155",
                                            fontWeight:700,
                                            textAlign:"left",
                                            borderBottom:"2px solid #e2e8f0" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map(row => (
                      <tr key={row.month}>
                        <td style={{ padding:"8px 12px",
                                     fontWeight:700, color:dark,
                                     borderBottom:"1px solid #f1f5f9" }}>
                          {row.month}
                        </td>
                        <td style={{ padding:"8px 12px",
                                     color:"#334155",
                                     borderBottom:"1px solid #f1f5f9" }}>
                          ₹{fmt(row.revenue)}
                        </td>
                        <td style={{ padding:"8px 12px",
                                     fontWeight:700,
                                     color:row.color,
                                     borderBottom:"1px solid #f1f5f9" }}>
                          ₹{fmt(row.emi)}
                        </td>
                        <td style={{ padding:"8px 12px",
                                     borderBottom:"1px solid #f1f5f9" }}>
                          <span style={{ background:
                                         row.color==="#16a34a"?"#dcfce7":
                                         row.color===teal?"#ccfbf1":"#f1f5f9",
                                         color:row.color,
                                         padding:"3px 10px",
                                         borderRadius:6,
                                         fontSize:"0.78rem",
                                         fontWeight:600 }}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// MARKETPLACE PAGE
// ════════════════════════════════════════════════════════════

function MarketplacePage({ result, userForm }) {
  const [accepted, setAccepted] = useState(null)
  const score   = result?.score?.total || 74
  const loanAmt = Number(userForm?.loan_amount || result?.user?.loan_amount || 300000)
  const name    = userForm?.business_name || result?.user?.business_name || "Your Business"
  const bank    = userForm?.bank_name || "Your Bank"

  const base = 16 - ((score-50)*0.08)
  const offers = [
    {lender:"FinGrow Capital",   rate:Math.round((base-0.5)*10)/10, fee:1.5, hours:24, badge:"⭐ Best Rate",  color:"#16a34a"},
    {lender:"QuickCapital NBFC", rate:Math.round((base+1.0)*10)/10, fee:1.0, hours:12, badge:"⚡ Fastest",    color:"#0d9488"},
    {lender:"Lendingkart",       rate:Math.round((base+0.5)*10)/10, fee:2.0, hours:36, badge:"🏦 Trusted",    color:"#1d4ed8"},
    {lender:"Capital Float",     rate:Math.round((base+1.5)*10)/10, fee:1.2, hours:20, badge:"📱 Digital",    color:"#7c3aed"},
    {lender:"SeasonFund Pro",    rate:Math.round((base+2.5)*10)/10, fee:0.5, hours:48, badge:"💰 Low Fee",    color:"#f97316"},
  ].filter(o => o.rate < 20)

  if (accepted) return (
    <div style={{ textAlign:"center", padding:"4rem 2rem" }}>
      <div style={{ width:80, height:80, background:"#dcfce7",
                    borderRadius:"50%", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:"2.5rem", margin:"0 auto 1.5rem" }}>✅</div>
      <h2 style={{ fontFamily:"'Syne',sans-serif",
                   fontSize:"2rem", fontWeight:900,
                   color:dark, marginBottom:"0.5rem" }}>
        Loan Approved!
      </h2>
      <p style={{ color:"#64748b", marginBottom:"2rem" }}>
        {accepted.lender} · {fmtL(loanAmt)} at {accepted.rate}% p.a.
        · Disbursing in {accepted.hours} hours to {bank}
      </p>
      <div style={{ display:"grid",
                    gridTemplateColumns:"repeat(3,1fr)",
                    gap:"1rem", maxWidth:500, margin:"0 auto 2rem" }}>
        {[["Supplier (60%)",fmtL(Math.round(loanAmt*0.6)),"#dcfce7","#16a34a"],
          ["Operations (40%)",fmtL(Math.round(loanAmt*0.4)),"#ccfbf1",teal],
          ["UPI Intercept","10%/sale","#eff6ff","#1d4ed8"],
        ].map(([l,v,bg,c]) => (
          <div key={l} style={{ background:bg, borderRadius:12,
                                padding:"1rem", textAlign:"center" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",
                          fontSize:"1.1rem", fontWeight:800,
                          color:c }}>{v}</div>
            <div style={{ fontSize:"0.72rem", color:"#64748b",
                          marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setAccepted(null)}
        style={{ background:`linear-gradient(135deg,${teal},#0f766e)`,
                 color:"white", padding:"12px 28px",
                 borderRadius:12, border:"none",
                 fontWeight:700, cursor:"pointer" }}>
        ← Back to Marketplace
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${navy},#1e293b)`,
                    padding:"2rem", color:"white" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",
                     fontWeight:800, fontSize:"1.5rem" }}>
          🏦 NBFC Lender Marketplace
        </h2>
        <p style={{ color:"#64748b", marginTop:4 }}>
          Multiple lenders competing — pick the best rate
        </p>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto",
                    padding:"2rem 1.5rem" }}>
        {/* Profile bar */}
        <div style={{ background:"#ccfbf1", borderRadius:14,
                      padding:"1rem 1.5rem", marginBottom:"1.5rem",
                      display:"flex", alignItems:"center",
                      justifyContent:"space-between", flexWrap:"wrap",
                      gap:"0.75rem" }}>
          <div>
            <div style={{ fontWeight:800, color:"#0f766e" }}>{name}</div>
            <div style={{ fontSize:"0.8rem", color:"#64748b" }}>
              SeasonScore: {score} · {offers.length} lenders competing
            </div>
          </div>
          <div style={{ fontSize:"0.82rem", fontWeight:700,
                        color:teal }}>
            🔒 Bank: {bank} · Loan: {fmtL(loanAmt)}
          </div>
        </div>

        {offers.map((o, i) => (
          <div key={o.lender} style={{ background:"white",
                                       borderRadius:16, padding:"1.5rem",
                                       marginBottom:"1rem",
                                       boxShadow:"0 2px 15px rgba(0,0,0,0.06)",
                                       border:`2px solid ${i===0?"#16a34a":"transparent"}` }}>
            <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:"0.75rem" }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",
                              fontWeight:800, fontSize:"1.1rem",
                              color:dark }}>{o.lender}</div>
                <span style={{ display:"inline-block", padding:"3px 10px",
                               borderRadius:6, fontSize:"0.75rem",
                               fontWeight:700, marginTop:3,
                               background:i===0?"#dcfce7":"#f1f5f9",
                               color:o.color }}>{o.badge}</span>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif",
                            fontSize:"2.2rem", fontWeight:900,
                            color:teal }}>
                {o.rate}%
                <span style={{ fontSize:"0.85rem", color:"#64748b",
                               fontWeight:400 }}> p.a.</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:"1.5rem",
                          fontSize:"0.82rem", color:"#64748b",
                          marginBottom:"1rem", flexWrap:"wrap" }}>
              <span>💼 Fee: {o.fee}%  (₹{fmt(Math.round(loanAmt*o.fee/100))})</span>
              <span>⚡ {o.hours} hrs disbursal</span>
              <span>💰 Total: {fmtL(Math.round(loanAmt*(1+o.rate/100)))}</span>
              <span>💚 Save: {fmtL(Math.round(loanAmt*(0.18-o.rate/100)))}</span>
            </div>
            <button onClick={() => setAccepted(o)}
              style={{ width:"100%", padding:"12px",
                       background:i===0
                         ?`linear-gradient(135deg,${teal},#0f766e)`:"#f8fafc",
                       color:i===0?"white":dark,
                       border:i===0?"none":"1.5px solid #e2e8f0",
                       borderRadius:10, fontWeight:700,
                       cursor:"pointer", fontSize:"0.9rem" }}>
              {i===0 ? "✅ Accept Best Offer" : "View & Accept"}
            </button>
          </div>
        ))}

        {/* UPI Flow */}
        <div style={{ background:"#f8fafc", borderRadius:14,
                      padding:"1.5rem", marginTop:"1rem" }}>
          <div style={{ fontWeight:800, color:dark,
                        marginBottom:"1rem" }}>
            ⚡ How UPI Auto-Repayment Works
          </div>
          <div style={{ display:"flex", alignItems:"center",
                        justifyContent:"space-between" }}>
            {[["👤","Customer Pays","Scans your QR"],
              ["🏦","Virtual A/C","Auto-intercept"],
              ["🔐","10% → EMI","Auto deducted"],
              ["✅","90% → You","Your account"],
            ].map(([ic,l,s],i,arr) => (
              <div key={l} style={{ display:"flex",
                                    alignItems:"center", flex:1 }}>
                <div style={{ flex:1, textAlign:"center" }}>
                  <div style={{ width:46, height:46, borderRadius:12,
                                background:teal, display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                fontSize:"1.3rem",
                                margin:"0 auto 0.5rem" }}>{ic}</div>
                  <div style={{ fontSize:"0.78rem", fontWeight:700,
                                color:"#0f766e" }}>{l}</div>
                  <div style={{ fontSize:"0.68rem", color:"#64748b",
                                marginTop:2 }}>{s}</div>
                </div>
                {i<arr.length-1 && (
                  <div style={{ color:teal, fontSize:"1.2rem",
                                padding:"0 4px",
                                marginBottom:18 }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ADD USER PAGE — For judge demo
// ════════════════════════════════════════════════════════════

function AddUserPage({ setPage, options, showToast,
                       refreshUsers, setResult, setUserForm }) {
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(null)

  const O = options || {}
  const defaultOpts = {
    business_types: Object.keys(REVENUE_PATTERNS).map(k=>({value:k,label:k.replace("_"," ")})),
    states: ["Maharashtra","Rajasthan","Delhi","Gujarat","Karnataka","Tamil Nadu","UP","WB"],
    banks: ["SBI","HDFC Bank","ICICI Bank","PNB","Axis Bank","Kotak Bank"],
    account_types: ["Savings Account","Current Account","Business Account"],
    loan_purposes: ["Stock Purchase","Working Capital","Equipment","Marketing"],
  }

  const [form, setForm] = useState({
    full_name:"", mobile:"", email:"",
    business_name:"", business_type:"festival_retail",
    city:"", state:"", years_active:3,
    bank_name:"", account_number:"", ifsc_code:"",
    account_type:"Savings Account",
    loan_amount:300000, loan_purpose:"Stock Purchase",
    has_cibil:false, cibil_score:"",
    aadhaar_last4:"",
  })

  const [revenue, setRevenue] = useState(
    REVENUE_PATTERNS.festival_retail)

  function setF(k,v) { setForm(f=>({...f,[k]:v})) }
  function handleType(t) {
    setF("business_type",t)
    setRevenue(REVENUE_PATTERNS[t]||REVENUE_PATTERNS.festival_retail)
  }

  async function addUser() {
    if (!form.full_name||!form.mobile||!form.business_name) {
      alert("Please fill Name, Mobile and Business Name at minimum")
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        monthly_revenue: revenue,
        years_active: Number(form.years_active),
        loan_amount:  Number(form.loan_amount),
        cibil_score:  form.has_cibil&&form.cibil_score
                      ? Number(form.cibil_score) : null,
        aadhaar_last4: form.aadhaar_last4 || "0000",
      }
      const res = await axios.post(`${API}/api/add-user`, payload)
      setDone(res.data)
      setResult(res.data)
      setUserForm(form)
      refreshUsers()
      showToast(`${form.full_name} added! ID: ${res.data.user_id} | Score: ${res.data.score.total}`)
    } catch(e) {
      const score = localScore(revenue)
      const uid = "U"+Math.random().toString(36).slice(2,6).toUpperCase()
      const r = {user_id:uid, user:form, score,
                 message:`✅ ${form.full_name} added! (offline)`}
      setDone(r)
      setResult(r)
      setUserForm(form)
      showToast(`${form.full_name} added! Score: ${score.total}`)
    }
    setLoading(false)
  }

  if (done) return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"3rem 1.5rem" }}>
      <div style={{ background:"white", borderRadius:20, padding:"2.5rem",
                    boxShadow:"0 4px 30px rgba(0,0,0,0.08)",
                    textAlign:"center" }}>
        <div style={{ width:70, height:70, background:"#dcfce7",
                      borderRadius:"50%", display:"flex",
                      alignItems:"center", justifyContent:"center",
                      fontSize:"2rem", margin:"0 auto 1.5rem" }}>✅</div>
        <h2 style={{ fontFamily:"'Syne',sans-serif",
                     fontSize:"1.5rem", fontWeight:900,
                     color:dark }}>User Added Successfully!</h2>
        <p style={{ color:"#64748b", marginTop:"0.5rem",
                    marginBottom:"1.5rem" }}>
          {done.message || `${form.full_name} is now in the system`}
        </p>

        <div style={{ display:"grid",
                      gridTemplateColumns:"1fr 1fr 1fr",
                      gap:"1rem", marginBottom:"1.5rem" }}>
          {[["User ID",done.user_id,teal],
            ["SeasonScore™",done.score?.total+"/100",
             done.score?.eligible?"#16a34a":"#dc2626"],
            ["Interest Rate",
             done.score?.rate?(done.score.rate+"%"):"N/A",teal],
          ].map(([l,v,c]) => (
            <div key={l} style={{ background:"#f8fafc",
                                  borderRadius:12, padding:"1rem" }}>
              <div style={{ fontSize:"0.7rem", color:"#94a3b8",
                            fontWeight:600 }}>{l}</div>
              <div style={{ fontFamily:"'Syne',sans-serif",
                            fontSize:"1.3rem", fontWeight:900,
                            color:c, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"#f0fdf4", borderRadius:12,
                      padding:"1rem", marginBottom:"1.5rem",
                      fontSize:"0.82rem", color:"#166534",
                      textAlign:"left", lineHeight:1.7 }}>
          ✅ <strong>Scoring Method:</strong> {done.score?.scoring_method}<br/>
          📅 <strong>Peak Months:</strong> {done.score?.peak_months?.join(", ")||"—"}<br/>
          💰 <strong>Max Loan:</strong> {fmtL(done.score?.max_loan||0)}
        </div>

        <div style={{ display:"flex", gap:"0.75rem" }}>
          <button onClick={() => setPage("dashboard")}
            style={{ flex:1, padding:"12px",
                     background:`linear-gradient(135deg,${teal},#0f766e)`,
                     color:"white", border:"none",
                     borderRadius:12, fontWeight:700,
                     cursor:"pointer" }}>
            View Dashboard →
          </button>
          <button onClick={() => { setDone(null); setForm({
            full_name:"",mobile:"",email:"",business_name:"",
            business_type:"festival_retail",city:"",state:"",
            years_active:3,bank_name:"",account_number:"",
            ifsc_code:"",account_type:"Savings Account",
            loan_amount:300000,loan_purpose:"Stock Purchase",
            has_cibil:false,cibil_score:"",aadhaar_last4:""
          }); setRevenue(REVENUE_PATTERNS.festival_retail) }}
            style={{ flex:1, padding:"12px",
                     background:"#f8fafc",
                     border:"1.5px solid #e2e8f0",
                     borderRadius:12, fontWeight:700,
                     cursor:"pointer", color:dark }}>
            Add Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:700, margin:"0 auto",
                  padding:"2rem 1.5rem" }}>
      <div style={{ background:"#fffbeb", border:"2px solid #fcd34d",
                    borderRadius:14, padding:"1rem 1.5rem",
                    marginBottom:"1.5rem", fontSize:"0.85rem",
                    color:"#92400e" }}>
        ⚡ <strong>Judge Demo Mode:</strong> Quick add a new user with
        auto-filled revenue data. SeasonScore generates instantly!
      </div>

      <div style={{ background:card, borderRadius:20, padding:"2rem",
                    boxShadow:"0 4px 30px rgba(0,0,0,0.08)" }}>
        <SectionTitle icon="➕" title="Add New User"
          subtitle="All fields optional except Name, Mobile and Business Name" />

        <div style={{ display:"grid",
                      gridTemplateColumns:"1fr 1fr",
                      gap:"0 1rem" }}>
          <Field label="Full Name *" value={form.full_name}
            onChange={v=>setF("full_name",v)}
            placeholder="Customer full name" />
          <Field label="Mobile *" value={form.mobile}
            onChange={v=>setF("mobile",v)}
            placeholder="10-digit mobile" />
          <Field label="Email" value={form.email}
            onChange={v=>setF("email",v)} placeholder="Optional" />
          <Field label="Aadhaar Last 4" value={form.aadhaar_last4}
            onChange={v=>setF("aadhaar_last4",v)}
            placeholder="Optional" />
          <Field label="Business Name *" value={form.business_name}
            onChange={v=>setF("business_name",v)}
            placeholder="Shop / business name" />
          <div>
            <Select label="Business Type"
              value={form.business_type}
              onChange={handleType}
              options={O.business_types||defaultOpts.business_types} />
          </div>
          <Field label="City" value={form.city}
            onChange={v=>setF("city",v)} placeholder="City" />
          <Select label="State" value={form.state}
            onChange={v=>setF("state",v)}
            options={O.states||defaultOpts.states} />
          <Field label="Years in Business" type="number"
            value={form.years_active}
            onChange={v=>setF("years_active",v)} />
          <Select label="Loan Purpose" value={form.loan_purpose}
            onChange={v=>setF("loan_purpose",v)}
            options={O.loan_purposes||defaultOpts.loan_purposes} />
          <Select label="Bank Name" value={form.bank_name}
            onChange={v=>setF("bank_name",v)}
            options={O.banks||defaultOpts.banks} />
          <Select label="Account Type" value={form.account_type}
            onChange={v=>setF("account_type",v)}
            options={O.account_types||defaultOpts.account_types} />
          <Field label="Account Number" value={form.account_number}
            onChange={v=>setF("account_number",v)}
            placeholder="Bank account number" />
          <Field label="IFSC Code" value={form.ifsc_code}
            onChange={v=>setF("ifsc_code",v.toUpperCase())}
            placeholder="e.g. SBIN0001234" />
          <Field label="Loan Amount (₹)" type="number"
            value={form.loan_amount}
            onChange={v=>setF("loan_amount",v)} />
        </div>

        {/* CIBIL toggle */}
        <div style={{ marginTop:"0.5rem", marginBottom:"1rem" }}>
          <label style={{ display:"flex", alignItems:"center",
                          gap:10, cursor:"pointer" }}>
            <input type="checkbox" checked={form.has_cibil}
              onChange={e=>setF("has_cibil",e.target.checked)}
              style={{ width:18, height:18, accentColor:teal }} />
            <span style={{ fontSize:"0.88rem", fontWeight:600,
                           color:"#334155" }}>
              Customer has CIBIL score?
            </span>
          </label>
          {form.has_cibil && (
            <div style={{ marginTop:"0.5rem", paddingLeft:28 }}>
              <Field label="CIBIL Score (300–900)"
                type="number" value={form.cibil_score}
                onChange={v=>setF("cibil_score",v)}
                hint="Blends 70% SeasonScore + 30% CIBIL" />
            </div>
          )}
        </div>

        {/* Revenue preview */}
        <div style={{ background:"#f8fafc", borderRadius:12,
                      padding:"1rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.82rem", fontWeight:700,
                        color:"#334155", marginBottom:"0.75rem" }}>
            📊 Revenue Pattern (auto-filled, editable)
          </div>
          <div style={{ display:"grid",
                        gridTemplateColumns:"repeat(6,1fr)",
                        gap:"0.4rem" }}>
            {MONTHS.map((m,i) => (
              <div key={m}>
                <div style={{ fontSize:"0.65rem", textAlign:"center",
                              fontWeight:700, color:"#64748b",
                              marginBottom:2 }}>{m}</div>
                <input type="number" value={revenue[i]}
                  onChange={e => {
                    const n = [...revenue]
                    n[i] = Number(e.target.value)
                    setRevenue(n)
                  }}
                  style={{ width:"100%", padding:"5px 4px",
                           border:"1px solid #e2e8f0",
                           borderRadius:6, textAlign:"center",
                           fontSize:"0.72rem", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={addUser} disabled={loading}
          style={{ width:"100%", padding:"15px",
                   background:`linear-gradient(135deg,${teal},#0f766e)`,
                   color:"white", border:"none", borderRadius:14,
                   fontWeight:800, fontSize:"1rem",
                   cursor:"pointer", opacity:loading?0.7:1,
                   boxShadow:"0 4px 15px rgba(13,148,136,0.4)" }}>
          {loading ? "⏳ Generating SeasonScore..." : "➕ Add User & Generate SeasonScore™"}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DATASET PAGE
// ════════════════════════════════════════════════════════════

function DatasetPage({ stats, allUsers }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const users = allUsers.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (u.full_name||"").toLowerCase().includes(q) ||
      (u.business_name||"").toLowerCase().includes(q) ||
      (u.city||"").toLowerCase().includes(q)
    const matchFilter = filter==="all" ||
      (filter==="eligible" && u.eligible) ||
      (filter==="nocibil" && !u.has_cibil)
    return matchSearch && matchFilter
  })

  const typeData = {
    labels: ["Festival Retail","Agriculture","Coaching","Catering","Tourism","Firecracker","Wedding","Religious"],
    datasets: [{ data:[11,8,6,5,4,4,7,5],
                 backgroundColor:["#0d9488","#14b8a6","#0891b2","#1d4ed8","#7c3aed","#f97316","#16a34a","#dc2626"],
                 borderWidth:2, borderColor:"#fff" }]
  }

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${navy},#1e293b)`,
                    padding:"2rem", color:"white" }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif",
                     fontWeight:800, fontSize:"1.5rem" }}>
          📁 SME Dataset — Real Seasonal Business Records
        </h2>
        <p style={{ color:"#64748b", marginTop:4 }}>
          SIDBI MSME Pulse 2023 + Live Entries
        </p>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto",
                    padding:"2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"repeat(4,1fr)",
                      gap:"1rem", marginBottom:"1.5rem" }}>
          {[["📋",stats?.total_records||50,"Total Records"],
            ["🎯",stats?.avg_season_score||77.3,"Avg SeasonScore"],
            ["✅",stats?.eligible_rate||"100%","Eligible Rate"],
            ["💰",fmtL(stats?.avg_annual_rev||1581686),"Avg Annual Rev"],
          ].map(([ic,v,l]) => (
            <div key={l} style={{ background:"white", borderRadius:14,
                                  padding:"1.2rem",
                                  boxShadow:"0 2px 15px rgba(0,0,0,0.06)",
                                  display:"flex", alignItems:"center",
                                  gap:"0.75rem" }}>
              <div style={{ fontSize:"1.5rem" }}>{ic}</div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif",
                              fontSize:"1.4rem", fontWeight:900,
                              color:teal }}>{v}</div>
                <div style={{ fontSize:"0.72rem", color:"#64748b",
                              marginTop:2 }}>{l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display:"grid",
                      gridTemplateColumns:"1fr 1fr",
                      gap:"1.5rem", marginBottom:"1.5rem" }}>
          <div style={{ background:"white", borderRadius:14,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:700, color:"#64748b",
                          fontSize:"0.85rem", marginBottom:"1rem",
                          textTransform:"uppercase", letterSpacing:"0.5px" }}>
              By Business Type
            </div>
            <Doughnut data={typeData} options={{
              plugins:{ legend:{ position:"right",
                labels:{font:{size:10}} } }
            }} />
          </div>
          <div style={{ background:"white", borderRadius:14,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:700, color:"#64748b",
                          fontSize:"0.85rem", marginBottom:"1rem",
                          textTransform:"uppercase", letterSpacing:"0.5px" }}>
              Score Distribution
            </div>
            <Bar data={{
              labels:["50-60","60-70","70-80","80-90","90-100"],
              datasets:[{data:[3,12,18,12,5],
                backgroundColor:teal, borderRadius:6}]
            }} options={{
              plugins:{legend:{display:false}},
              scales:{y:{beginAtZero:true}}
            }} />
          </div>
        </div>

        {/* Live user table */}
        {allUsers.length > 0 && (
          <div style={{ background:"white", borderRadius:14,
                        padding:"1.5rem",
                        boxShadow:"0 2px 15px rgba(0,0,0,0.06)",
                        marginBottom:"1.5rem" }}>
            <div style={{ display:"flex",
                          justifyContent:"space-between",
                          alignItems:"center",
                          marginBottom:"1rem", flexWrap:"wrap",
                          gap:"0.75rem" }}>
              <div style={{ fontWeight:800, color:dark }}>
                🔴 Live Entries ({allUsers.length})
              </div>
              <div style={{ display:"flex", gap:"0.5rem" }}>
                <input type="text" placeholder="🔍 Search..."
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  style={{ padding:"8px 12px",
                           border:"1.5px solid #e2e8f0",
                           borderRadius:8, fontSize:"0.85rem" }} />
                <select value={filter} onChange={e=>setFilter(e.target.value)}
                  style={{ padding:"8px 12px",
                           border:"1.5px solid #e2e8f0",
                           borderRadius:8, fontSize:"0.85rem" }}>
                  <option value="all">All</option>
                  <option value="eligible">Eligible Only</option>
                  <option value="nocibil">No CIBIL</option>
                </select>
              </div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",
                              borderCollapse:"collapse",
                              fontSize:"0.82rem" }}>
                <thead>
                  <tr>
                    {["ID","Name","Business","City","Score","Rate","Loan","CIBIL","Status"].map(h => (
                      <th key={h} style={{ padding:"8px 12px",
                                          background:"#f8fafc",
                                          fontWeight:700, color:"#334155",
                                          textAlign:"left",
                                          borderBottom:"2px solid #e2e8f0",
                                          whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ padding:"8px 12px", color:"#64748b",
                                   borderBottom:"1px solid #f1f5f9",
                                   fontFamily:"monospace",
                                   fontSize:"0.78rem" }}>{u.id}</td>
                      <td style={{ padding:"8px 12px", fontWeight:600,
                                   color:dark,
                                   borderBottom:"1px solid #f1f5f9" }}>
                        {u.full_name}
                      </td>
                      <td style={{ padding:"8px 12px", color:"#334155",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        {u.business_name}
                      </td>
                      <td style={{ padding:"8px 12px", color:"#64748b",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        {u.city}
                      </td>
                      <td style={{ padding:"8px 12px",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        <span style={{ fontWeight:800,
                                       color: u.season_score>=80?"#16a34a":
                                              u.season_score>=65?teal:"#f97316" }}>
                          {u.season_score}
                        </span>
                      </td>
                      <td style={{ padding:"8px 12px", color:teal,
                                   fontWeight:700,
                                   borderBottom:"1px solid #f1f5f9" }}>
                        {u.interest_rate}%
                      </td>
                      <td style={{ padding:"8px 12px", color:"#334155",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        {fmtL(u.loan_amount||0)}
                      </td>
                      <td style={{ padding:"8px 12px",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        <span style={{ background:u.has_cibil?"#eff6ff":"#f0fdf4",
                                       color:u.has_cibil?"#1d4ed8":"#16a34a",
                                       padding:"2px 8px", borderRadius:6,
                                       fontSize:"0.75rem", fontWeight:700 }}>
                          {u.has_cibil?"CIBIL":"No CIBIL"}
                        </span>
                      </td>
                      <td style={{ padding:"8px 12px",
                                   borderBottom:"1px solid #f1f5f9" }}>
                        <span style={{ background:u.eligible?"#dcfce7":"#fee2e2",
                                       color:u.eligible?"#16a34a":"#dc2626",
                                       padding:"2px 8px", borderRadius:6,
                                       fontSize:"0.75rem", fontWeight:700 }}>
                          {u.eligible?"✅ Eligible":"❌ No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ background:"#f8fafc", borderRadius:12,
                      padding:"1rem 1.5rem",
                      fontSize:"0.8rem", color:"#64748b",
                      borderLeft:`4px solid ${teal}` }}>
          📚 <strong>Data Sources:</strong> SIDBI MSME Pulse Report 2023 ·
          Ministry of MSME Annual Report · RBI Account Aggregator Framework ·
          Synthetic modeling based on seasonal patterns
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LOCAL SCORE (Offline fallback)
// ════════════════════════════════════════════════════════════

function localScore(rev) {
  const mean = rev.reduce((a,b)=>a+b,0)/12
  const std  = Math.sqrt(rev.map(r=>(r-mean)**2).reduce((a,b)=>a+b,0)/12)
  const cv   = std/mean
  const C    = Math.round(Math.max(0,25-cv*10))
  const h1   = rev.slice(0,6).reduce((a,b)=>a+b,0)/6
  const h2   = rev.slice(6).reduce((a,b)=>a+b,0)/6
  const gr   = (h2-h1)/h1
  const G    = Math.round(Math.min(25,Math.max(0,15+gr*30)))
  const peak = Math.max(...rev)
  const R    = Math.round(Math.min(25,(peak/50000)*3))
  const Rb   = Math.round((rev.filter(r=>r>mean*0.3).length/12)*25)
  const total= Math.min(100,C+G+R+Rb)
  const rate = total>=80?12:total>=65?14:total>=50?16:null
  const peaks= MONTHS.filter((_,i)=>rev[i]>mean*2)
  return {total,consistency:C,growth:G,capacity:R,reliability:Rb,
          eligible:total>=50,rate,peak_months:peaks,
          max_loan:Math.round(peak*0.5/10000)*10000,
          min_loan:Math.round(peak*0.25/10000)*10000,
          annual_rev:Math.round(rev.reduce((a,b)=>a+b,0)),
          scoring_method:"SeasonScore Only — No CIBIL Required ✅"}
}
