// ╔══════════════════════════════════════════════════════════════════╗
// ║  SeasonCredit v3 — Complete Advanced React Frontend              ║
// ║  Pages: Home, Login, Onboard, Dashboard, Calculator,            ║
// ║         Marketplace, Dataset, AddUser, Admin, NBFC Portal       ║
// ║  Features: OTP Login, Bank Statement Upload, Credit Bureau,      ║
// ║            WhatsApp Notify, UPI QR, Admin Dashboard, NBFC Portal ║
// ╚══════════════════════════════════════════════════════════════════╝

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,
         LineElement, PointElement, ArcElement, RadialLinearScale,
         Title, Tooltip, Legend, Filler } from "chart.js"
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler)

const API    = "http://localhost:8000"
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

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

const T  = "#0d9488"
const NV = "#0a0f1e"
const DK = "#0f172a"

function fmt(n) { return Math.round(n||0).toLocaleString("en-IN") }
function fmtL(n) {
  if (!n) return "₹0"
  if (n>=10000000) return "₹"+(n/10000000).toFixed(1)+"Cr"
  if (n>=100000)   return "₹"+(n/100000).toFixed(1)+"L"
  return "₹"+fmt(n)
}
function localScore(rev) {
  const mean=rev.reduce((a,b)=>a+b,0)/12,std=Math.sqrt(rev.map(r=>(r-mean)**2).reduce((a,b)=>a+b,0)/12),cv=std/mean
  const C=Math.round(Math.max(0,25-cv*10)),h1=rev.slice(0,6).reduce((a,b)=>a+b,0)/6,h2=rev.slice(6).reduce((a,b)=>a+b,0)/6
  const G=Math.round(Math.min(25,Math.max(0,15+((h2-h1)/h1)*30))),peak=Math.max(...rev)
  const R=Math.round(Math.min(25,(peak/50000)*3)),Rb=Math.round((rev.filter(r=>r>mean*0.3).length/12)*25)
  const total=Math.min(100,C+G+R+Rb),rate=total>=80?12:total>=65?14:total>=50?16:null
  return {total,consistency:C,growth:G,capacity:R,reliability:Rb,eligible:total>=50,rate,
          peak_months:MONTHS.filter((_,i)=>rev[i]>mean*2),
          max_loan:Math.round(peak*0.5/10000)*10000,annual_rev:Math.round(rev.reduce((a,b)=>a+b,0)),
          scoring_method:"SeasonScore™ Only — No CIBIL Required ✅",grade:total>=80?"A":total>=65?"B":total>=50?"C":"D"}
}

// ════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [page,    setPage]    = useState("home")
  const [auth,    setAuth]    = useState(null)   // {token, user_id, mobile}
  const [result,  setResult]  = useState(null)
  const [userForm,setUserForm]= useState(null)
  const [options, setOptions] = useState(null)
  const [allUsers,setAllUsers]= useState([])
  const [toast,   setToast]   = useState(null)
  const [notifs,  setNotifs]  = useState([])
  const [showNotifs,setShowNotifs]=useState(false)

  useEffect(()=>{
    axios.get(`${API}/api/options`).then(r=>setOptions(r.data)).catch(()=>{})
    axios.get(`${API}/api/users`).then(r=>setAllUsers(r.data.users||[])).catch(()=>{})
  },[])

  useEffect(()=>{
    if(auth?.user_id){
      axios.get(`${API}/api/notifications/${auth.user_id}`).then(r=>setNotifs(r.data.notifications||[])).catch(()=>{})
    }
  },[auth, result])

  function showToast(msg, type="success"){
    setToast({msg,type}); setTimeout(()=>setToast(null),4000)
  }
  function refreshUsers(){
    axios.get(`${API}/api/users`).then(r=>setAllUsers(r.data.users||[])).catch(()=>{})
  }

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#f0f4f8",minHeight:"100vh"}}>
      {toast&&(
        <div style={{position:"fixed",top:76,right:20,zIndex:9999,padding:"14px 20px",
                     borderRadius:12,fontWeight:600,fontSize:"0.88rem",
                     background:toast.type==="success"?"#dcfce7":"#fee2e2",
                     color:toast.type==="success"?"#166534":"#991b1b",
                     boxShadow:"0 4px 20px rgba(0,0,0,0.15)",animation:"fadeIn 0.3s ease"}}>
          {toast.type==="success"?"✅ ":"❌ "}{toast.msg}
        </div>
      )}
      <Nav page={page} setPage={setPage} auth={auth} setAuth={setAuth}
           notifs={notifs} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
           setNotifs={setNotifs} />
      {page==="home"       &&<HomePage    setPage={setPage} />}
      {page==="login"      &&<LoginPage   setPage={setPage} setAuth={setAuth} showToast={showToast} />}
      {page==="onboard"    &&<OnboardPage setPage={setPage} setResult={setResult} setUserForm={setUserForm}
                                          options={options} showToast={showToast} refreshUsers={refreshUsers} auth={auth} />}
      {page==="dashboard"  &&<DashboardPage result={result} userForm={userForm} setPage={setPage} auth={auth} showToast={showToast} />}
      {page==="calculator" &&<CalculatorPage options={options} />}
      {page==="marketplace"&&<MarketplacePage result={result} userForm={userForm} showToast={showToast} auth={auth} />}
      {page==="dataset"    &&<DatasetPage allUsers={allUsers} />}
      {page==="adduser"    &&<AddUserPage setPage={setPage} options={options} showToast={showToast}
                                          refreshUsers={refreshUsers} setResult={setResult} setUserForm={setUserForm} />}
      {page==="admin"      &&<AdminPage showToast={showToast} allUsers={allUsers} />}
      {page==="nbfc"       &&<NBFCPortalPage showToast={showToast} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════════
function Nav({page,setPage,auth,setAuth,notifs,showNotifs,setShowNotifs,setNotifs}){
  const unread = notifs.filter(n=>!n.read).length
  const tabs = [
    ["home","🏠"],["onboard","📋 Apply"],["dashboard","📊 Dashboard"],
    ["calculator","⚡ Calc"],["marketplace","🏦 Lenders"],
    ["dataset","📁 Data"],["adduser","➕ Add"],
    ["admin","🔐 Admin"],["nbfc","🏛 NBFC"],
  ]
  return(
    <nav style={{background:NV,height:64,display:"flex",alignItems:"center",
                 padding:"0 1.2rem",justifyContent:"space-between",
                 position:"sticky",top:0,zIndex:200,
                 boxShadow:"0 2px 20px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
           onClick={()=>setPage("home")}>
        <div style={{width:36,height:36,background:`linear-gradient(135deg,${T},#34d399)`,
                     borderRadius:9,display:"flex",alignItems:"center",
                     justifyContent:"center",fontSize:"1.1rem"}}>🌱</div>
        <div>
          <div style={{fontWeight:800,fontSize:"1rem",color:"white",lineHeight:1}}>SeasonCredit</div>
          <div style={{fontSize:"0.55rem",color:"#14b8a6",fontWeight:700}}>NO CIBIL REQUIRED</div>
        </div>
      </div>
      <div style={{display:"flex",gap:1,flexWrap:"wrap",alignItems:"center"}}>
        {tabs.map(([id,label])=>(
          <button key={id} onClick={()=>setPage(id)}
            style={{padding:"6px 10px",borderRadius:7,border:"none",cursor:"pointer",
                    fontSize:"0.75rem",fontWeight:600,
                    background:page===id?T:"transparent",
                    color:page===id?"white":"#94a3b8",transition:"all 0.2s"}}>
            {label}
          </button>
        ))}
        {/* Notifications */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowNotifs(!showNotifs)}
            style={{padding:"6px 10px",borderRadius:7,border:"none",cursor:"pointer",
                    background:"transparent",color:"#94a3b8",fontSize:"0.9rem",position:"relative"}}>
            🔔{unread>0&&<span style={{position:"absolute",top:0,right:0,
                                        background:"#ef4444",color:"white",
                                        borderRadius:"50%",fontSize:"0.55rem",
                                        width:14,height:14,display:"flex",
                                        alignItems:"center",justifyContent:"center",
                                        fontWeight:800}}>{unread}</span>}
          </button>
          {showNotifs&&(
            <div style={{position:"absolute",right:0,top:40,width:280,
                         background:"white",borderRadius:12,
                         boxShadow:"0 4px 20px rgba(0,0,0,0.15)",zIndex:999,overflow:"hidden"}}>
              <div style={{padding:"0.75rem 1rem",borderBottom:"1px solid #f1f5f9",
                           fontWeight:700,fontSize:"0.85rem",color:DK}}>
                Notifications {unread>0&&`(${unread} unread)`}
              </div>
              {notifs.length===0?<div style={{padding:"1rem",color:"#94a3b8",fontSize:"0.82rem"}}>No notifications</div>:
                notifs.slice(-5).reverse().map(n=>(
                  <div key={n.id} style={{padding:"0.75rem 1rem",
                                          borderBottom:"1px solid #f8fafc",
                                          background:n.read?"white":"#f0fdf4"}}>
                    <div style={{fontSize:"0.8rem",color:DK}}>{n.message}</div>
                    <div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>
                      {new Date(n.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
        {auth?(
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:"0.75rem",color:"#64748b"}}>{auth.mobile}</span>
            <button onClick={()=>{setAuth(null);setPage("home")}}
              style={{padding:"5px 10px",borderRadius:7,border:"1px solid #374151",
                      background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:"0.72rem"}}>
              Logout
            </button>
          </div>
        ):(
          <button onClick={()=>setPage("login")}
            style={{padding:"6px 14px",borderRadius:7,border:"none",cursor:"pointer",
                    background:T,color:"white",fontWeight:700,fontSize:"0.78rem"}}>
            Login / Register
          </button>
        )}
      </div>
    </nav>
  )
}

// ════════════════════════════════════════════════════════════
// HOME PAGE
// ════════════════════════════════════════════════════════════
function HomePage({setPage}){
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#0d3d38,#0f766e)`,
                   minHeight:"calc(100vh - 64px)",display:"flex",
                   alignItems:"center",padding:"4rem 2rem"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
                       background:"rgba(20,184,166,0.15)",border:"1px solid rgba(20,184,166,0.3)",
                       color:"#14b8a6",padding:"8px 16px",borderRadius:20,
                       fontSize:"0.82rem",fontWeight:700,marginBottom:"1.5rem"}}>
            🇮🇳 India's First Seasonal-Intelligence Lending Platform
          </div>
          <h1 style={{fontSize:"3rem",fontWeight:900,color:"white",lineHeight:1.1,marginBottom:"1rem"}}>
            Credit Without CIBIL.<br/>
            <span style={{background:"linear-gradient(90deg,#14b8a6,#34d399)",
                          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              Built for Seasonal India.
            </span>
          </h1>
          <p style={{color:"#94a3b8",fontSize:"1rem",lineHeight:1.8,marginBottom:"0.75rem",maxWidth:600}}>
            6.3 crore seasonal businesses earn 70% income in 45 days. Banks demand fixed EMIs.
            SeasonCredit gives <strong style={{color:"white"}}>₹500 EMI in off-season, ₹15,000 in peak</strong> — automatically via UPI.
          </p>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,
                       background:"rgba(34,197,94,0.15)",border:"1px solid rgba(34,197,94,0.4)",
                       color:"#4ade80",padding:"10px 18px",borderRadius:12,
                       fontSize:"0.9rem",fontWeight:700,marginBottom:"2rem"}}>
            ✅ No CIBIL Score Required · OTP Login · UPI Auto-Repayment
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:"3rem"}}>
            <button onClick={()=>setPage("login")}
              style={{background:`linear-gradient(135deg,${T},#0f766e)`,color:"white",
                      padding:"14px 28px",borderRadius:12,fontWeight:700,fontSize:"0.95rem",
                      cursor:"pointer",border:"none",boxShadow:"0 4px 20px rgba(13,148,136,0.5)"}}>
              🚀 Get SeasonScore™ →
            </button>
            <button onClick={()=>setPage("adduser")}
              style={{background:"rgba(255,255,255,0.1)",color:"white",padding:"14px 28px",
                      borderRadius:12,fontWeight:700,fontSize:"0.95rem",cursor:"pointer",
                      border:"1px solid rgba(255,255,255,0.25)"}}>
              ➕ Add User (Demo)
            </button>
            <button onClick={()=>setPage("admin")}
              style={{background:"rgba(255,255,255,0.07)",color:"#94a3b8",padding:"14px 28px",
                      borderRadius:12,fontWeight:700,fontSize:"0.95rem",cursor:"pointer",
                      border:"1px solid rgba(255,255,255,0.15)"}}>
              🔐 Admin Dashboard
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem"}}>
            {[["6.3Cr","Seasonal MSMEs"],["₹20L Cr","Credit Gap"],["92%","Gross Margin"],["4-6%","NPA Rate"]].map(([n,l])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                                   borderRadius:12,padding:"1rem",textAlign:"center"}}>
                <div style={{fontSize:"1.5rem",fontWeight:900,color:"#14b8a6"}}>{n}</div>
                <div style={{fontSize:"0.7rem",color:"#64748b",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Features */}
      <div style={{background:"white",padding:"4rem 2rem"}}>
        <h2 style={{textAlign:"center",fontSize:"1.8rem",fontWeight:800,color:DK,marginBottom:"2.5rem"}}>
          Everything Built. Everything Live.
        </h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1.5rem",maxWidth:1100,margin:"0 auto"}}>
          {[["📱","OTP Login","Mobile-first auth with session management"],
            ["🧮","SeasonScore™","AI credit score without CIBIL"],
            ["⚡","Dynamic EMI","₹500 off-season to ₹15K peak"],
            ["🏦","5 NBFC Lenders","Competing marketplace"],
            ["📊","Admin Dashboard","Full analytics and control"],
            ["🏛","NBFC Portal","Lender portfolio management"],
            ["💳","Credit Bureau","CIBIL check + SeasonScore reporting"],
            ["📁","Bank Analysis","Upload statement, auto-extract revenue"],
          ].map(([ic,t,d])=>(
            <div key={t} style={{textAlign:"center",padding:"1.5rem",background:"#f8fafc",
                                 borderRadius:14,border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:"1.8rem",marginBottom:"0.5rem"}}>{ic}</div>
              <div style={{fontWeight:700,color:DK,marginBottom:"0.3rem",fontSize:"0.92rem"}}>{t}</div>
              <div style={{fontSize:"0.78rem",color:"#64748b",lineHeight:1.5}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// LOGIN PAGE — OTP FLOW
// ════════════════════════════════════════════════════════════
function LoginPage({setPage,setAuth,showToast}){
  const [step,   setStep]   = useState(1)
  const [mobile, setMobile] = useState("")
  const [otp,    setOtp]    = useState("")
  const [demo,   setDemo]   = useState("")
  const [loading,setLoading]= useState(false)

  async function sendOTP(){
    if(mobile.length!==10){showToast("Enter valid 10-digit mobile","error");return}
    setLoading(true)
    try{
      const r = await axios.post(`${API}/api/auth/send-otp`,{mobile,purpose:"login"})
      setDemo(r.data.demo_otp||"")
      setStep(2)
      showToast(`OTP sent to ${mobile}`)
    }catch(e){
      // Offline fallback
      setDemo("123456")
      setStep(2)
      showToast("OTP sent (demo mode)")
    }
    setLoading(false)
  }

  async function verifyOTP(){
    if(otp.length!==6){showToast("Enter 6-digit OTP","error");return}
    setLoading(true)
    try{
      const r = await axios.post(`${API}/api/auth/verify-otp`,{mobile,otp})
      setAuth({token:r.data.token,user_id:r.data.user_id,mobile})
      showToast("✅ Logged in successfully!")
      setPage(r.data.is_registered?"dashboard":"onboard")
    }catch(e){
      if(otp==="123456"||otp===demo){
        const token="demo_"+Date.now()
        setAuth({token,user_id:null,mobile})
        showToast("Logged in (demo mode)")
        setPage("onboard")
      }else{
        showToast("Invalid OTP","error")
      }
    }
    setLoading(false)
  }

  return(
    <div style={{maxWidth:420,margin:"4rem auto",padding:"0 1.5rem"}}>
      <div style={{background:"white",borderRadius:20,padding:"2.5rem",
                   boxShadow:"0 4px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🌱</div>
          <div style={{fontWeight:800,fontSize:"1.3rem",color:DK}}>
            {step===1?"Welcome to SeasonCredit":"Enter OTP"}
          </div>
          <div style={{fontSize:"0.82rem",color:"#64748b",marginTop:4}}>
            {step===1?"Login with your mobile number":"6-digit OTP sent to "+mobile}
          </div>
        </div>
        {step===1?(
          <>
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:"#334155",marginBottom:4}}>
                Mobile Number *
              </label>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <div style={{padding:"11px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,
                             fontSize:"0.9rem",color:"#64748b",background:"#f8fafc"}}>+91</div>
                <input type="tel" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/,"").slice(0,10))}
                  placeholder="10-digit number" maxLength={10}
                  style={{flex:1,padding:"11px 14px",border:"1.5px solid #e2e8f0",
                          borderRadius:10,fontSize:"0.9rem",outline:"none"}}
                  onKeyDown={e=>e.key==="Enter"&&sendOTP()} />
              </div>
            </div>
            <button onClick={sendOTP} disabled={loading}
              style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${T},#0f766e)`,
                      color:"white",border:"none",borderRadius:12,fontWeight:700,
                      cursor:"pointer",fontSize:"0.95rem",opacity:loading?0.7:1}}>
              {loading?"Sending...":"Send OTP →"}
            </button>
            <div style={{textAlign:"center",marginTop:"1rem",fontSize:"0.78rem",color:"#94a3b8"}}>
              By continuing, you agree to our Terms & Privacy Policy
            </div>
          </>
        ):(
          <>
            <div style={{background:"#f0fdf4",borderRadius:12,padding:"0.75rem 1rem",
                         marginBottom:"1rem",fontSize:"0.82rem",color:"#166534",textAlign:"center"}}>
              {demo&&`Demo OTP: ${demo}`}
            </div>
            <div style={{marginBottom:"1rem"}}>
              <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:"#334155",marginBottom:4}}>
                Enter 6-Digit OTP
              </label>
              <input type="tel" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/,"").slice(0,6))}
                placeholder="• • • • • •" maxLength={6} autoFocus
                style={{width:"100%",padding:"14px",border:"1.5px solid #e2e8f0",borderRadius:10,
                        fontSize:"1.5rem",textAlign:"center",letterSpacing:"0.5rem",
                        fontWeight:800,outline:"none",boxSizing:"border-box"}}
                onKeyDown={e=>e.key==="Enter"&&verifyOTP()} />
            </div>
            <button onClick={verifyOTP} disabled={loading}
              style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${T},#0f766e)`,
                      color:"white",border:"none",borderRadius:12,fontWeight:700,
                      cursor:"pointer",fontSize:"0.95rem",opacity:loading?0.7:1}}>
              {loading?"Verifying...":"Verify & Continue →"}
            </button>
            <button onClick={()=>{setStep(1);setOtp("")}}
              style={{width:"100%",padding:"10px",marginTop:"0.5rem",background:"transparent",
                      border:"none",color:"#64748b",cursor:"pointer",fontSize:"0.82rem"}}>
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// FIELD / SELECT HELPERS
// ════════════════════════════════════════════════════════════
function Field({label,type="text",value,onChange,placeholder="",required=false,hint=""}){
  return(
    <div style={{marginBottom:"0.9rem"}}>
      <label style={{display:"block",fontSize:"0.8rem",fontWeight:700,color:"#334155",marginBottom:3}}>
        {label}{required&&<span style={{color:"#ef4444"}}> *</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)}
        style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",
                borderRadius:9,fontSize:"0.88rem",boxSizing:"border-box",outline:"none"}}
        onFocus={e=>e.target.style.borderColor=T}
        onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
      {hint&&<div style={{fontSize:"0.7rem",color:"#94a3b8",marginTop:2}}>{hint}</div>}
    </div>
  )
}
function Sel({label,value,onChange,options=[],required=false}){
  return(
    <div style={{marginBottom:"0.9rem"}}>
      <label style={{display:"block",fontSize:"0.8rem",fontWeight:700,color:"#334155",marginBottom:3}}>
        {label}{required&&<span style={{color:"#ef4444"}}> *</span>}
      </label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,
                fontSize:"0.88rem",background:"white",outline:"none"}}>
        <option value="">— Select —</option>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  )
}
function SecTitle({icon,title,sub}){
  return(
    <div style={{marginBottom:"1.2rem",paddingBottom:"0.6rem",borderBottom:"2px solid #f1f5f9"}}>
      <div style={{fontWeight:800,color:DK,display:"flex",alignItems:"center",gap:7}}>
        <span style={{fontSize:"1.2rem"}}>{icon}</span>{title}
      </div>
      {sub&&<div style={{fontSize:"0.75rem",color:"#64748b",marginTop:2}}>{sub}</div>}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ONBOARD PAGE — 6 STEPS
// ════════════════════════════════════════════════════════════
function OnboardPage({setPage,setResult,setUserForm,options,showToast,refreshUsers,auth}){
  const [step,   setStep]   = useState(1)
  const [loading,setLoading]= useState(false)
  const [cibilResult,setCibilResult]=useState(null)

  const dOpts={
    business_types:Object.keys(REVENUE_PATTERNS).map(k=>({value:k,label:k.replace(/_/g," ")})),
    states:["Maharashtra","Rajasthan","Delhi","Gujarat","Karnataka","Tamil Nadu","UP","WB"],
    banks:["SBI","HDFC Bank","ICICI Bank","PNB","Axis Bank","Kotak Bank"],
    account_types:["Savings Account","Current Account","Business Account"],
    loan_purposes:["Stock Purchase","Working Capital","Equipment","Marketing","Expansion"],
  }
  const O=options||dOpts

  const [form,setForm]=useState({
    full_name:"",mobile:auth?.mobile||"",email:"",aadhaar_last4:"",pan_number:"",
    business_name:"",business_type:"",business_address:"",city:"",state:"",
    pincode:"",years_active:1,num_employees:1,gst_number:"",udyam_number:"",
    bank_name:"",account_number:"",ifsc_code:"",account_type:"",upi_id:"",
    loan_amount:300000,loan_purpose:"",has_cibil:false,cibil_score:"",
    preferred_language:"English",
  })
  const [revenue,setRevenue]=useState(Array(12).fill(0))
  const [useStatement,setUseStatement]=useState(false)
  const [statements,setStatements]=useState("")

  function setF(k,v){setForm(f=>({...f,[k]:v}))}
  function handleType(t){setF("business_type",t);setRevenue(REVENUE_PATTERNS[t]||Array(12).fill(0))}

  async function checkCibil(){
    if(!form.pan_number){showToast("Enter PAN to check CIBIL","error");return}
    try{
      const r=await axios.post(`${API}/api/credit-bureau/check`,{pan_number:form.pan_number,full_name:form.full_name})
      setCibilResult(r.data)
      if(r.data.found){setF("has_cibil",true);setF("cibil_score",r.data.cibil_score)}
      showToast(`CIBIL: ${r.data.cibil_score} (${r.data.credit_band})`)
    }catch(e){showToast("CIBIL check failed","error")}
  }

  async function analyzeStatement(){
    try{
      const txns=JSON.parse(statements)
      const r=await axios.post(`${API}/api/bank-statement/analyze`,{user_id:"temp",transactions:txns})
      setRevenue(r.data.analysis.monthly_revenue)
      showToast("✅ Bank statement analyzed!")
      setUseStatement(false)
    }catch(e){showToast("Invalid JSON format","error")}
  }

  async function submit(){
    setLoading(true)
    try{
      const payload={...form,cibil_score:form.has_cibil&&form.cibil_score?Number(form.cibil_score):null,
                     monthly_revenue:revenue,years_active:Number(form.years_active),
                     num_employees:Number(form.num_employees),loan_amount:Number(form.loan_amount),
                     token:auth?.token||"demo_token"}
      const r=await axios.post(`${API}/api/users/register`,payload)
      setResult(r.data);setUserForm(form);refreshUsers()
      showToast(`SeasonScore ${r.data.score.total}/100!`)
      setStep(7)
    }catch(e){
      const score=localScore(revenue)
      setResult({score,user:form,user_id:"DEMO"});setUserForm(form)
      showToast("Score calculated (offline)");setStep(7)
    }
    setLoading(false)
  }

  const steps=["Personal","Business","Bank","Revenue","CIBIL","Language","Result"]
  const avg=revenue.reduce((a,b)=>a+b,0)/12

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"2rem 1.5rem"}}>
      {/* Step bar */}
      <div style={{display:"flex",alignItems:"center",marginBottom:"1.5rem"}}>
        {steps.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",
                           alignItems:"center",justifyContent:"center",fontSize:"0.72rem",fontWeight:800,
                           background:i+1<step?"#16a34a":i+1===step?T:"#e2e8f0",
                           color:i+1<=step?"white":"#64748b"}}>
                {i+1<step?"✓":i+1}
              </div>
              <div style={{fontSize:"0.58rem",marginTop:2,color:i+1===step?T:"#94a3b8",fontWeight:i+1===step?700:400}}>{s}</div>
            </div>
            {i<steps.length-1&&<div style={{height:2,flex:0.5,marginBottom:14,background:i+1<step?"#16a34a":"#e2e8f0"}}/>}
          </div>
        ))}
      </div>

      <div style={{background:"white",borderRadius:18,padding:"1.8rem",boxShadow:"0 4px 30px rgba(0,0,0,0.08)"}}>
        {/* STEP 1 */}
        {step===1&&(
          <div>
            <SecTitle icon="👤" title="Personal Details" sub="KYC — Aadhaar only, no ITR needed" />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
              <Field label="Full Name" value={form.full_name} required onChange={v=>setF("full_name",v)} placeholder="As per Aadhaar"/>
              <Field label="Mobile" value={form.mobile} required onChange={v=>setF("mobile",v)} placeholder="10 digits" hint={auth?.mobile?"Pre-filled from login":""}/>
              <Field label="Email" value={form.email} onChange={v=>setF("email",v)} placeholder="Optional"/>
              <Field label="Aadhaar Last 4 Digits" value={form.aadhaar_last4} required onChange={v=>setF("aadhaar_last4",v)} placeholder="XXXX" hint="Only last 4 stored"/>
              <Field label="PAN Number" value={form.pan_number} onChange={v=>setF("pan_number",v.toUpperCase())} placeholder="ABCDE1234F (optional)" hint="Used for CIBIL check in Step 5"/>
            </div>
          </div>
        )}
        {/* STEP 2 */}
        {step===2&&(
          <div>
            <SecTitle icon="🏪" title="Business Details" sub="Tell us about your seasonal business"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
              <Field label="Business Name" value={form.business_name} required onChange={v=>setF("business_name",v)} placeholder="Shop name"/>
              <Sel label="Business Type *" value={form.business_type} onChange={handleType} options={O.business_types||dOpts.business_types}/>
              <Field label="Business Address" value={form.business_address} onChange={v=>setF("business_address",v)} placeholder="Shop address"/>
              <Field label="City" value={form.city} required onChange={v=>setF("city",v)} placeholder="e.g. Jaipur"/>
              <Sel label="State *" value={form.state} onChange={v=>setF("state",v)} options={O.states||dOpts.states}/>
              <Field label="Pincode" value={form.pincode} onChange={v=>setF("pincode",v)} placeholder="6-digit"/>
              <Field label="Years in Business" type="number" value={form.years_active} required onChange={v=>setF("years_active",v)}/>
              <Field label="Employees" type="number" value={form.num_employees} onChange={v=>setF("num_employees",v)}/>
              <Field label="GST Number" value={form.gst_number} onChange={v=>setF("gst_number",v.toUpperCase())} placeholder="Optional"/>
              <Field label="Udyam Registration" value={form.udyam_number} onChange={v=>setF("udyam_number",v.toUpperCase())} placeholder="Optional"/>
            </div>
          </div>
        )}
        {/* STEP 3 */}
        {step===3&&(
          <div>
            <SecTitle icon="🏦" title="Bank Account Details" sub="For loan disbursal and UPI auto-repayment"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
              <Sel label="Bank Name *" value={form.bank_name} onChange={v=>setF("bank_name",v)} options={O.banks||dOpts.banks}/>
              <Sel label="Account Type *" value={form.account_type} onChange={v=>setF("account_type",v)} options={O.account_types||dOpts.account_types}/>
              <Field label="Account Number *" value={form.account_number} required onChange={v=>setF("account_number",v)} placeholder="Account number"/>
              <Field label="IFSC Code *" value={form.ifsc_code} required onChange={v=>setF("ifsc_code",v.toUpperCase())} placeholder="SBIN0001234" hint="11-char on cheque"/>
              <Field label="UPI ID" value={form.upi_id} onChange={v=>setF("upi_id",v)} placeholder="mobile@okaxis" hint="For auto-debit repayment"/>
            </div>
            <div style={{background:"#eff6ff",borderRadius:10,padding:"0.9rem",
                         fontSize:"0.8rem",color:"#1d4ed8",borderLeft:"3px solid #3b82f6",marginTop:"0.5rem"}}>
              ⚡ <strong>UPI Intercept:</strong> 10% of every UPI sale auto-routes to loan repayment. ₹500 minimum in off-season.
            </div>
          </div>
        )}
        {/* STEP 4 */}
        {step===4&&(
          <div>
            <SecTitle icon="📊" title="Monthly Revenue" sub="Enter your approximate monthly earnings"/>
            <div style={{display:"flex",gap:"0.5rem",marginBottom:"1rem"}}>
              <button onClick={()=>setUseStatement(!useStatement)}
                style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${T}`,
                        background:useStatement?T:"white",color:useStatement?"white":T,
                        cursor:"pointer",fontSize:"0.8rem",fontWeight:700}}>
                📄 Upload Bank Statement
              </button>
              <div style={{fontSize:"0.78rem",color:"#94a3b8",display:"flex",alignItems:"center"}}>
                or manually enter below
              </div>
            </div>
            {useStatement&&(
              <div style={{background:"#f8fafc",borderRadius:10,padding:"1rem",marginBottom:"1rem"}}>
                <div style={{fontSize:"0.8rem",fontWeight:700,color:"#334155",marginBottom:"0.5rem"}}>
                  Paste bank transactions as JSON:
                </div>
                <textarea value={statements} onChange={e=>setStatements(e.target.value)}
                  placeholder='[{"date":"2024-01-15","type":"credit","amount":45000,"month":1}]'
                  style={{width:"100%",height:100,padding:"8px",border:"1px solid #e2e8f0",
                          borderRadius:8,fontSize:"0.78rem",fontFamily:"monospace",
                          boxSizing:"border-box",resize:"vertical"}}/>
                <button onClick={analyzeStatement}
                  style={{marginTop:"0.5rem",padding:"8px 16px",borderRadius:8,border:"none",
                          background:T,color:"white",cursor:"pointer",fontWeight:700,fontSize:"0.8rem"}}>
                  Analyze Statement
                </button>
              </div>
            )}
            <div style={{background:"#f0fdf4",borderRadius:9,padding:"0.7rem 1rem",
                         marginBottom:"1rem",fontSize:"0.8rem",color:"#166534"}}>
              ✅ Pre-filled for <strong>{form.business_type?.replace(/_/g," ")||"your business type"}</strong>. Adjust as needed.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.5rem"}}>
              {MONTHS.map((m,i)=>{
                const isPeak=revenue[i]>avg*2
                return(
                  <div key={m}>
                    <div style={{fontSize:"0.68rem",fontWeight:700,textAlign:"center",marginBottom:2,
                                 color:isPeak?"#16a34a":T}}>{m}{isPeak?" 🔥":""}</div>
                    <input type="number" value={revenue[i]}
                      onChange={e=>{const n=[...revenue];n[i]=Number(e.target.value);setRevenue(n)}}
                      style={{width:"100%",padding:"7px 4px",
                              border:`1.5px solid ${isPeak?"#16a34a":"#e2e8f0"}`,
                              borderRadius:7,textAlign:"center",fontSize:"0.78rem",
                              boxSizing:"border-box",background:isPeak?"#f0fdf4":"white"}}/>
                  </div>
                )
              })}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem",marginTop:"1rem"}}>
              <Sel label="Loan Purpose *" value={form.loan_purpose} onChange={v=>setF("loan_purpose",v)} options={O.loan_purposes||dOpts.loan_purposes}/>
              <Field label="Loan Amount (₹)" type="number" value={form.loan_amount} required onChange={v=>setF("loan_amount",v)} hint="₹1L–₹10L based on SeasonScore"/>
            </div>
          </div>
        )}
        {/* STEP 5 */}
        {step===5&&(
          <div>
            <SecTitle icon="📋" title="Credit Score Check" sub="Optional — SeasonCredit works WITHOUT CIBIL"/>
            <div style={{background:"#dcfce7",borderRadius:14,padding:"1.2rem",
                         marginBottom:"1.2rem",border:"2px solid #86efac"}}>
              <div style={{fontWeight:800,color:"#166534",marginBottom:"0.4rem"}}>✅ No CIBIL? No Problem!</div>
              <div style={{fontSize:"0.82rem",color:"#15803d",lineHeight:1.7}}>
                We generate <strong>SeasonScore™</strong> from your revenue pattern alone.
                If you have CIBIL, we blend it for potentially better rates.
              </div>
            </div>
            {form.pan_number&&(
              <button onClick={checkCibil}
                style={{width:"100%",padding:"11px",borderRadius:10,
                        border:`1.5px solid ${T}`,background:"white",
                        color:T,fontWeight:700,cursor:"pointer",
                        fontSize:"0.88rem",marginBottom:"1rem"}}>
                🔍 Auto-Check CIBIL via PAN: {form.pan_number}
              </button>
            )}
            {cibilResult&&(
              <div style={{background:"#f0f9ff",borderRadius:10,padding:"1rem",
                           marginBottom:"1rem",fontSize:"0.82rem"}}>
                <div style={{fontWeight:700,color:"#0369a1"}}>CIBIL Check Result</div>
                <div style={{marginTop:"0.4rem",color:"#334155",lineHeight:1.8}}>
                  Score: <strong>{cibilResult.cibil_score}</strong> ({cibilResult.credit_band})<br/>
                  Active Loans: {cibilResult.active_loans} | DPD 30+: {cibilResult.dpd_30}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem"}}>
              {[false,true].map(val=>(
                <div key={String(val)} onClick={()=>setF("has_cibil",val)}
                  style={{flex:1,padding:"1rem",borderRadius:10,cursor:"pointer",textAlign:"center",
                          border:`2px solid ${form.has_cibil===val?T:"#e2e8f0"}`,
                          background:form.has_cibil===val?"#ccfbf1":"white"}}>
                  <div style={{fontSize:"1.3rem",marginBottom:"0.3rem"}}>{val?"📊":"❌"}</div>
                  <div style={{fontWeight:700,color:DK,fontSize:"0.85rem"}}>
                    {val?"I have CIBIL":"No CIBIL"}
                  </div>
                  <div style={{fontSize:"0.72rem",color:"#64748b",marginTop:2}}>
                    {val?"Blended 70/30 scoring":"100% SeasonScore"}
                  </div>
                </div>
              ))}
            </div>
            {form.has_cibil&&(
              <Field label="CIBIL Score (300–900)" type="number" value={form.cibil_score}
                onChange={v=>setF("cibil_score",v)} placeholder="e.g. 680"
                hint="Higher CIBIL + SeasonScore = lower interest rate"/>
            )}
          </div>
        )}
        {/* STEP 6 */}
        {step===6&&(
          <div>
            <SecTitle icon="🌐" title="Preferences" sub="Customize your experience"/>
            <Sel label="Preferred Language" value={form.preferred_language}
              onChange={v=>setF("preferred_language",v)}
              options={O.languages||["English","Hindi","Marathi","Tamil","Telugu","Gujarati"]}/>
            <div style={{background:"#f8fafc",borderRadius:12,padding:"1.2rem",marginTop:"0.5rem"}}>
              <div style={{fontWeight:700,color:DK,marginBottom:"0.75rem",fontSize:"0.88rem"}}>
                📋 Application Summary
              </div>
              {[["Name",form.full_name],["Business",form.business_name],["Type",form.business_type?.replace(/_/g," ")],
                ["City",form.city+", "+form.state],["Bank",form.bank_name],["Loan","₹"+fmt(form.loan_amount)],
                ["CIBIL",form.has_cibil?(form.cibil_score||"Provided"):"Not Required"],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",
                                     padding:"5px 0",borderBottom:"1px solid #f1f5f9",fontSize:"0.82rem"}}>
                  <span style={{color:"#64748b"}}>{l}</span>
                  <span style={{fontWeight:600,color:DK}}>{v||"—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* STEP 7 — RESULT */}
        {step===7&&<ScoreResult result={null} form={form} revenue={revenue}
          onDashboard={()=>setPage("dashboard")} onMarket={()=>setPage("marketplace")}/>}

        {/* Navigation */}
        {step<7&&(
          <div style={{display:"flex",gap:"0.75rem",marginTop:"1.2rem"}}>
            {step>1&&(
              <button onClick={()=>setStep(s=>s-1)}
                style={{flex:1,padding:"12px",background:"#f8fafc",border:"1.5px solid #e2e8f0",
                        borderRadius:11,fontWeight:700,cursor:"pointer",color:DK}}>← Back</button>
            )}
            {step<6?(
              <button onClick={()=>setStep(s=>s+1)}
                style={{flex:2,padding:"12px",background:`linear-gradient(135deg,${T},#0f766e)`,
                        color:"white",border:"none",borderRadius:11,fontWeight:700,cursor:"pointer"}}>
                Continue →
              </button>
            ):(
              <button onClick={submit} disabled={loading}
                style={{flex:2,padding:"12px",background:`linear-gradient(135deg,${T},#0f766e)`,
                        color:"white",border:"none",borderRadius:11,fontWeight:700,cursor:"pointer",
                        opacity:loading?0.7:1}}>
                {loading?"⏳ Generating SeasonScore...":"🚀 Get SeasonScore™"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// SCORE RESULT
// ════════════════════════════════════════════════════════════
function ScoreResult({result,form,revenue,onDashboard,onMarket}){
  const rev   = revenue || REVENUE_PATTERNS[form?.business_type] || REVENUE_PATTERNS.festival_retail
  const score = result?.score || localScore(rev)
  const s     = score.total
  const rate  = score.rate

  const radarData={
    labels:["Consistency","Growth","Capacity","Reliability"],
    datasets:[{label:"SeasonScore",
      data:[score.consistency,score.growth,score.capacity,score.reliability],
      backgroundColor:"rgba(13,148,136,0.2)",borderColor:T,pointBackgroundColor:T,pointRadius:5}]
  }

  return(
    <div>
      <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
        <div style={{width:110,height:110,borderRadius:"50%",
                     background:`conic-gradient(${T} ${s*3.6}deg,#e2e8f0 0deg)`,
                     display:"flex",alignItems:"center",justifyContent:"center",
                     margin:"0 auto 0.75rem",position:"relative"}}>
          <div style={{width:82,height:82,borderRadius:"50%",background:"white",
                       display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            <div style={{fontSize:"1.8rem",fontWeight:900,color:T,lineHeight:1}}>{s}</div>
            <div style={{fontSize:"0.6rem",color:"#64748b"}}>/100</div>
          </div>
        </div>
        <div style={{fontWeight:800,fontSize:"1.1rem",color:DK}}>SeasonScore™ — Grade {score.grade}</div>
        <div style={{fontSize:"0.73rem",color:"#64748b",marginTop:2}}>{score.scoring_method}</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:"0.5rem",
                     background:score.eligible?"#dcfce7":"#fee2e2",
                     color:score.eligible?"#16a34a":"#dc2626",
                     padding:"5px 12px",borderRadius:7,fontSize:"0.8rem",fontWeight:700}}>
          {score.eligible?`✅ Eligible — ${rate}% p.a.`:"❌ Score below 50 — Not eligible"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        <div>
          {[["Consistency",score.consistency],["Growth",score.growth],
            ["Capacity",score.capacity],["Reliability",score.reliability]].map(([l,v])=>(
            <div key={l} style={{marginBottom:"0.5rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",marginBottom:2}}>
                <span style={{color:"#334155"}}>{l}</span>
                <span style={{fontWeight:700,color:T}}>{v}/25</span>
              </div>
              <div style={{background:"#e2e8f0",height:5,borderRadius:3}}>
                <div style={{background:`linear-gradient(90deg,${T},#14b8a6)`,height:"100%",
                             borderRadius:3,width:`${(v/25)*100}%`,transition:"width 1s ease"}}/>
              </div>
            </div>
          ))}
          {score.peak_months?.length>0&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:"0.5rem",
                         background:"linear-gradient(135deg,#f97316,#ef4444)",color:"white",
                         padding:"5px 10px",borderRadius:7,fontSize:"0.75rem",fontWeight:700}}>
              🔥 Peak: {score.peak_months.join(", ")}
            </div>
          )}
        </div>
        <div style={{height:160}}>
          <Radar data={radarData} options={{responsive:true,maintainAspectRatio:false,
            plugins:{legend:{display:false}},scales:{r:{min:0,max:25,ticks:{stepSize:5,font:{size:8}}}}}}/>
        </div>
      </div>
      {score.eligible&&(
        <div style={{background:"#f0fdf4",borderRadius:10,padding:"0.8rem",marginTop:"0.75rem"}}>
          <div style={{fontSize:"0.72rem",fontWeight:700,color:"#15803d"}}>💚 Saving vs Moneylender (40%)</div>
          <div style={{fontSize:"1.5rem",fontWeight:900,color:"#16a34a"}}>
            {fmtL(300000*(0.40-rate/100))}
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:"0.6rem",marginTop:"1rem"}}>
        <button onClick={onDashboard}
          style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T},#0f766e)`,
                  color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer"}}>
          Dashboard →
        </button>
        <button onClick={onMarket}
          style={{flex:1,padding:"11px",background:"#f8fafc",border:"1.5px solid #e2e8f0",
                  borderRadius:10,fontWeight:700,cursor:"pointer",color:DK}}>
          Lenders →
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════
function DashboardPage({result,userForm,setPage,auth,showToast}){
  const name   = userForm?.business_name||result?.user?.business_name||"Your Business"
  const btype  = userForm?.business_type||result?.user?.business_type||"festival_retail"
  const revenue= REVENUE_PATTERNS[btype]||REVENUE_PATTERNS.festival_retail
  const score  = result?.score?.total||74
  const rate   = result?.score?.rate||14
  const loan   = Number(userForm?.loan_amount||result?.user?.loan_amount||300000)
  const avg    = revenue.reduce((a,b)=>a+b,0)/12
  const [scoreHistory,setScoreHistory]=useState([])
  const [activeTab,setActiveTab]=useState("overview")

  useEffect(()=>{
    if(auth?.user_id){
      axios.get(`${API}/api/users/${auth.user_id}/score-history`).then(r=>setScoreHistory(r.data.history||[])).catch(()=>{})
    }
  },[auth])

  const chartData={
    labels:MONTHS,
    datasets:[{type:"bar",label:"Revenue",data:revenue,
      backgroundColor:revenue.map(r=>r>avg*2?"rgba(22,163,74,0.8)":r>avg?"rgba(13,148,136,0.8)":"rgba(148,163,184,0.5)"),
      borderRadius:5}]
  }

  const lineData=scoreHistory.length>0?{
    labels:scoreHistory.map(h=>h.date),
    datasets:[{label:"SeasonScore",data:scoreHistory.map(h=>h.score),borderColor:T,
               backgroundColor:"rgba(13,148,136,0.1)",tension:0.4,fill:true,pointRadius:4}]
  }:null

  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:"1.3rem",fontWeight:800}}>{name} Dashboard</h2>
            <p style={{color:"#64748b",fontSize:"0.82rem",marginTop:2}}>
              {btype.replace(/_/g," ")} · {userForm?.city||"India"} · Score: {score}/100
            </p>
          </div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            {["overview","analytics","profile"].map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)}
                style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",
                        background:activeTab===t?T:"rgba(255,255,255,0.1)",
                        color:"white",fontSize:"0.78rem",fontWeight:600,textTransform:"capitalize"}}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"1.5rem"}}>
        {activeTab==="overview"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[["🎯",`${score}/100`,"SeasonScore™","#ccfbf1"],
                ["💰",fmtL(loan),"Loan Amount","#f0fdf4"],
                ["📅",result?.score?.peak_months?.join(",")||"Oct–Nov","Peak","#fefce8"],
                ["📉",rate+"%","Interest","#dcfce7"]].map(([ic,val,lbl,bg])=>(
                <div key={lbl} style={{background:"white",borderRadius:13,padding:"1.1rem",
                                       boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                                       display:"flex",alignItems:"center",gap:"0.75rem"}}>
                  <div style={{width:42,height:42,borderRadius:10,background:bg,
                               display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem"}}>{ic}</div>
                  <div>
                    <div style={{fontSize:"1.2rem",fontWeight:900,color:DK}}>{val}</div>
                    <div style={{fontSize:"0.68rem",color:"#64748b",marginTop:1}}>{lbl}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:"1.5rem",marginBottom:"1.5rem"}}>
              <div style={{background:`linear-gradient(135deg,${NV},#1e3a5f)`,borderRadius:14,padding:"1.3rem",color:"white"}}>
                <div style={{fontSize:"0.68rem",color:"#64748b",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"0.75rem"}}>SeasonScore™</div>
                <div style={{fontSize:"3.5rem",fontWeight:900,color:"#14b8a6",lineHeight:1}}>{score}</div>
                <div style={{color:"#94a3b8",fontSize:"0.75rem",marginBottom:"0.75rem"}}>{result?.score?.scoring_method||"SeasonScore Only"}</div>
                {[["Consistency",result?.score?.consistency||18],["Growth",result?.score?.growth||20],
                  ["Capacity",result?.score?.capacity||19],["Reliability",result?.score?.reliability||17]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                    <span style={{fontSize:"0.68rem",color:"#94a3b8",width:80,flexShrink:0}}>{l}</span>
                    <div style={{flex:1,height:4,background:"rgba(255,255,255,0.1)",borderRadius:2}}>
                      <div style={{width:`${(v/25)*100}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${T},#14b8a6)`}}/>
                    </div>
                    <span style={{fontSize:"0.68rem",color:"white",fontWeight:700,width:20,textAlign:"right"}}>{v}</span>
                  </div>
                ))}
                <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:"0.75rem",
                             background:"#dcfce7",color:"#16a34a",padding:"5px 10px",
                             borderRadius:7,fontSize:"0.74rem",fontWeight:700}}>
                  ✅ Eligible — {rate}% p.a.
                </div>
              </div>
              <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:"0.75rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"0.75rem"}}>📊 Revenue Pulse</div>
                <Bar data={chartData} options={{responsive:true,plugins:{legend:{display:false}},
                  scales:{y:{ticks:{callback:v=>"₹"+(v/1000).toFixed(0)+"K"}}}}}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
              <div style={{background:`linear-gradient(135deg,${NV},#0d3d38)`,borderRadius:14,padding:"1.3rem",color:"white"}}>
                <div style={{fontWeight:800,fontSize:"0.95rem",marginBottom:"0.75rem"}}>💼 Loan Breakdown</div>
                {[["Loan Amount",fmtL(loan),"white"],
                  [`Interest (${rate}%)`,fmtL(Math.round(loan*rate/100)),"#94a3b8"],
                  ["Total Repayable",fmtL(Math.round(loan*(1+rate/100))),"#14b8a6"],
                  ["Supplier (60%)",fmtL(Math.round(loan*0.6)),"#4ade80"],
                  ["Operations (40%)",fmtL(Math.round(loan*0.4)),"#86efac"],
                  ["Saving vs ML",fmtL(Math.round(loan*(0.4-rate/100))),"#4ade80"]].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                    <span style={{fontSize:"0.78rem",color:"#94a3b8"}}>{l}</span>
                    <span style={{fontSize:"0.85rem",fontWeight:700,color:c}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
                <div style={{fontWeight:800,color:DK,fontSize:"0.95rem",marginBottom:"0.75rem"}}>⚡ Dynamic EMI</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.75rem"}}>
                  {[["🔥 Peak","₹15,000","#dcfce7","#16a34a"],["💤 Off-Season","₹500","#eff6ff","#1d4ed8"]].map(([t,v,bg,c])=>(
                    <div key={t} style={{background:bg,borderRadius:10,padding:"0.9rem",textAlign:"center"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,color:c}}>{t}</div>
                      <div style={{fontSize:"1.3rem",fontWeight:900,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:"0.75rem",color:"#64748b",background:"#f8fafc",borderRadius:8,padding:"0.7rem",lineHeight:1.7}}>
                  <strong>Formula:</strong> R = max(₹500, min(₹15,000, 10% × Sales))<br/>
                  <strong>UPI Intercept:</strong> 10% auto-routes to repayment
                </div>
                <button onClick={()=>setPage("calculator")}
                  style={{width:"100%",padding:"9px",marginTop:"0.75rem",
                          background:`linear-gradient(135deg,${T},#0f766e)`,
                          color:"white",border:"none",borderRadius:9,fontWeight:700,cursor:"pointer",fontSize:"0.82rem"}}>
                  Open Calculator →
                </button>
              </div>
            </div>
          </>
        )}
        {activeTab==="analytics"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
            <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <div style={{fontWeight:700,color:"#64748b",fontSize:"0.82rem",textTransform:"uppercase",marginBottom:"0.75rem"}}>Score History</div>
              {lineData?<Line data={lineData} options={{responsive:true,plugins:{legend:{display:false}},
                scales:{y:{min:40,max:100}}}}/>:
                <div style={{textAlign:"center",padding:"2rem",color:"#94a3b8",fontSize:"0.82rem"}}>
                  Login to see score history
                </div>}
            </div>
            <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <div style={{fontWeight:700,color:"#64748b",fontSize:"0.82rem",textTransform:"uppercase",marginBottom:"0.75rem"}}>Revenue Seasonality</div>
              <Bar data={{
                labels:MONTHS,
                datasets:[{label:"Revenue",data:revenue,
                  backgroundColor:revenue.map(r=>r>avg*2?"rgba(22,163,74,0.7)":r>avg?"rgba(13,148,136,0.7)":"rgba(148,163,184,0.4)"),
                  borderRadius:4}]
              }} options={{responsive:true,plugins:{legend:{display:false}},
                scales:{y:{ticks:{callback:v=>"₹"+(v/1000).toFixed(0)+"K"}}}}}/>
            </div>
          </div>
        )}
        {activeTab==="profile"&&userForm&&(
          <div style={{background:"white",borderRadius:14,padding:"1.5rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{fontWeight:800,color:DK,marginBottom:"1rem"}}>👤 Applicant Profile</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem"}}>
              {[["Name",userForm.full_name],["Mobile",userForm.mobile],["Email",userForm.email||"—"],
                ["Aadhaar",userForm.aadhaar_last4?"XXXX"+userForm.aadhaar_last4:"—"],
                ["Business",userForm.business_name],["Type",userForm.business_type?.replace(/_/g," ")],
                ["City",userForm.city],["State",userForm.state],
                ["Bank",userForm.bank_name],["Account",userForm.account_type],["IFSC",userForm.ifsc_code],
                ["CIBIL",userForm.has_cibil?(userForm.cibil_score||"Provided"):"Not Required"],
                ["Language",userForm.preferred_language],["Years",userForm.years_active+" yrs"],
                ["GST",userForm.gst_number||"—"],["Udyam",userForm.udyam_number||"—"],
              ].map(([l,v])=>(
                <div key={l} style={{padding:"0.65rem",background:"#f8fafc",borderRadius:9}}>
                  <div style={{fontSize:"0.65rem",color:"#94a3b8",fontWeight:600,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:"0.82rem",fontWeight:600,color:DK,marginTop:1}}>{v||"—"}</div>
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
// CALCULATOR
// ════════════════════════════════════════════════════════════
function CalculatorPage({options}){
  const [loan,setLoan]=useState(300000)
  const [score,setScore]=useState(74)
  const [btype,setBtype]=useState("festival_retail")
  const rate=score>=80?12:score>=65?14:16
  const total=Math.round(loan*(1+rate/100))
  const saving=Math.round(loan*(0.40-rate/100))
  const revenue=REVENUE_PATTERNS[btype]||REVENUE_PATTERNS.festival_retail
  const mean=revenue.reduce((a,b)=>a+b,0)/12
  const calendar=MONTHS.map((m,i)=>{
    const rev=revenue[i],emi=Math.max(500,Math.min(15000,rev*0.10))
    return{month:m,revenue:rev,emi:Math.round(emi),
           status:rev>mean*2?"Peak 🔥":rev>mean?"Rising 📈":"Off-Season 💤",
           color:rev>mean*2?"#16a34a":rev>mean?T:"#94a3b8"}
  })
  const O=options||{}
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white"}}>
        <h2 style={{fontWeight:800,fontSize:"1.3rem"}}>⚡ Dynamic Financial Impact Calculator</h2>
        <p style={{color:"#64748b",marginTop:4,fontSize:"0.82rem"}}>All values update instantly</p>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:"1.5rem",alignItems:"start"}}>
          <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{fontWeight:800,color:DK,marginBottom:"1.2rem"}}>Adjust Parameters</div>
            {[["Loan Amount",loan,100000,1000000,10000,v=>setLoan(v),fmtL(loan)],
              ["SeasonScore™",score,50,100,1,v=>setScore(v),score+"/100"]].map(([l,val,mn,mx,st,fn,disp])=>(
              <div key={l} style={{marginBottom:"1.2rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.3rem"}}>
                  <span style={{fontSize:"0.82rem",fontWeight:700,color:"#334155"}}>{l}</span>
                  <span style={{fontSize:"1rem",fontWeight:900,color:T}}>{disp}</span>
                </div>
                <input type="range" min={mn} max={mx} step={st} value={val}
                  onChange={e=>fn(Number(e.target.value))}
                  style={{width:"100%",accentColor:T}}/>
              </div>
            ))}
            <div style={{marginBottom:"1.2rem"}}>
              <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:"#334155",marginBottom:4}}>Business Type</label>
              <select value={btype} onChange={e=>setBtype(e.target.value)}
                style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:"0.85rem"}}>
                {(O.business_types||Object.keys(REVENUE_PATTERNS)).map(t=>(
                  <option key={t.value||t} value={t.value||t}>{t.label||(t+"").replace(/_/g," ")}</option>
                ))}
              </select>
            </div>
            <div style={{background:NV,borderRadius:10,padding:"0.9rem"}}>
              <div style={{fontSize:"0.72rem",color:"#64748b",fontWeight:700,marginBottom:"0.4rem"}}>EMI Formula</div>
              <pre style={{fontFamily:"monospace",fontSize:"0.75rem",color:"#ccfbf1",lineHeight:1.8,margin:0}}>
{`R = max(₹500,
  min(₹15,000,
    10% × Sales))

Rate: ${rate}% p.a.`}
              </pre>
            </div>
          </div>
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[["Rate",`${rate}%`,T],["Total Repayable",fmtL(total),T],["💚 Saving",fmtL(saving),"#16a34a"],
                ["Peak EMI","₹15,000",T],["Off-Season EMI","₹500","#3b82f6"],["Supplier (60%)",fmtL(Math.round(loan*0.6)),T]].map(([l,v,c])=>(
                <div key={l} style={{background:"white",borderRadius:12,padding:"1.1rem",
                                     boxShadow:"0 2px 12px rgba(0,0,0,0.05)",borderTop:`3px solid ${c}`}}>
                  <div style={{fontSize:"0.68rem",color:"#64748b",fontWeight:700,textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:"1.3rem",fontWeight:900,color:c,marginTop:3}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:14,padding:"1.3rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <div style={{fontWeight:800,color:DK,marginBottom:"0.75rem"}}>📅 12-Month Repayment Calendar</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.8rem"}}>
                  <thead>
                    <tr>{["Month","Revenue","Dynamic EMI","Status"].map(h=>(
                      <th key={h} style={{padding:"7px 10px",background:"#f8fafc",fontWeight:700,
                                          color:"#334155",textAlign:"left",borderBottom:"2px solid #e2e8f0"}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {calendar.map(row=>(
                      <tr key={row.month}>
                        <td style={{padding:"7px 10px",fontWeight:700,color:DK,borderBottom:"1px solid #f1f5f9"}}>{row.month}</td>
                        <td style={{padding:"7px 10px",color:"#334155",borderBottom:"1px solid #f1f5f9"}}>₹{fmt(row.revenue)}</td>
                        <td style={{padding:"7px 10px",fontWeight:700,color:row.color,borderBottom:"1px solid #f1f5f9"}}>₹{fmt(row.emi)}</td>
                        <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                          <span style={{background:row.color==="#16a34a"?"#dcfce7":row.color===T?"#ccfbf1":"#f1f5f9",
                                        color:row.color,padding:"2px 8px",borderRadius:5,fontSize:"0.73rem",fontWeight:600}}>
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
// MARKETPLACE
// ════════════════════════════════════════════════════════════
function MarketplacePage({result,userForm,showToast,auth}){
  const [accepted,setAccepted]=useState(null)
  const [applying,setApplying]=useState(false)
  const score=result?.score?.total||74
  const loan=Number(userForm?.loan_amount||result?.user?.loan_amount||300000)
  const name=userForm?.business_name||result?.user?.business_name||"Your Business"
  const bank=userForm?.bank_name||"Your Bank"
  const base=16-((score-50)*0.08)
  const offers=[
    {id:"L001",lender:"FinGrow Capital",  rate:Math.round((base-0.5)*10)/10,fee:1.5,hours:24,badge:"⭐ Best Rate",color:"#16a34a"},
    {id:"L002",lender:"QuickCapital",     rate:Math.round((base+1.0)*10)/10,fee:1.0,hours:12,badge:"⚡ Fastest",  color:T},
    {id:"L003",lender:"Lendingkart",      rate:Math.round((base+0.5)*10)/10,fee:2.0,hours:36,badge:"🏦 Trusted",  color:"#1d4ed8"},
    {id:"L004",lender:"Capital Float",    rate:Math.round((base+1.5)*10)/10,fee:1.2,hours:20,badge:"📱 Digital",  color:"#7c3aed"},
    {id:"L005",lender:"SeasonFund Pro",   rate:Math.round((base+2.5)*10)/10,fee:0.5,hours:48,badge:"💰 Low Fee",  color:"#f97316"},
  ].filter(o=>o.rate<20)

  async function acceptOffer(o){
    setApplying(true)
    try{
      const uid=result?.user_id||auth?.user_id||"DEMO"
      const r=await axios.post(`${API}/api/loans/apply`,{user_id:uid,lender_id:o.id,amount:loan,purpose:userForm?.loan_purpose||"Stock Purchase"})
      setAccepted({...o,...r.data})
      showToast(`Loan approved! ID: ${r.data.loan_id}`)
    }catch(e){
      setAccepted({...o,loan_id:"LN"+Math.random().toString(36).slice(2,8).toUpperCase()})
      showToast("Loan approved (demo)")
    }
    setApplying(false)
  }

  if(accepted) return(
    <div style={{maxWidth:600,margin:"0 auto",padding:"3rem 1.5rem",textAlign:"center"}}>
      <div style={{background:"white",borderRadius:20,padding:"2.5rem",boxShadow:"0 4px 30px rgba(0,0,0,0.08)"}}>
        <div style={{width:70,height:70,background:"#dcfce7",borderRadius:"50%",
                     display:"flex",alignItems:"center",justifyContent:"center",
                     fontSize:"2rem",margin:"0 auto 1.2rem"}}>✅</div>
        <h2 style={{fontSize:"1.4rem",fontWeight:900,color:DK}}>Loan Approved!</h2>
        <p style={{color:"#64748b",marginTop:"0.4rem",marginBottom:"1.2rem"}}>
          {accepted.lender} · {fmtL(loan)} at {accepted.rate}% · {accepted.hours}hrs to disbursal
        </p>
        <div style={{marginBottom:"1rem",fontSize:"0.82rem",color:"#64748b"}}>
          Loan ID: <strong style={{color:T}}>{accepted.loan_id||accepted.loan?.id}</strong>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem",marginBottom:"1.2rem"}}>
          {[["Supplier 60%",fmtL(Math.round(loan*0.6)),"#dcfce7","#16a34a"],
            ["Operations 40%",fmtL(Math.round(loan*0.4)),"#ccfbf1",T],
            ["UPI Intercept","10%/sale","#eff6ff","#1d4ed8"]].map(([l,v,bg,c])=>(
            <div key={l} style={{background:bg,borderRadius:10,padding:"0.75rem"}}>
              <div style={{fontSize:"1rem",fontWeight:800,color:c}}>{v}</div>
              <div style={{fontSize:"0.68rem",color:"#64748b",marginTop:1}}>{l}</div>
            </div>
          ))}
        </div>
        {/* UPI QR */}
        <div style={{margin:"1rem 0"}}>
          <div style={{fontSize:"0.78rem",fontWeight:700,color:"#334155",marginBottom:"0.5rem"}}>📱 UPI Repayment QR</div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=seasoncredit@okaxis&am=${loan}&tn=${accepted.loan_id}&size=150x150`}
               alt="UPI QR" style={{borderRadius:8,border:"1px solid #e2e8f0"}} onError={e=>e.target.style.display="none"}/>
        </div>
        <button onClick={()=>setAccepted(null)}
          style={{background:`linear-gradient(135deg,${T},#0f766e)`,color:"white",padding:"11px 24px",
                  borderRadius:11,border:"none",fontWeight:700,cursor:"pointer"}}>
          ← Back to Marketplace
        </button>
      </div>
    </div>
  )

  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white"}}>
        <h2 style={{fontWeight:800,fontSize:"1.3rem"}}>🏦 NBFC Lender Marketplace</h2>
        <p style={{color:"#64748b",marginTop:4,fontSize:"0.82rem"}}>Multiple lenders competing — pick best rate</p>
      </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{background:"#ccfbf1",borderRadius:12,padding:"0.9rem 1.2rem",
                     marginBottom:"1.2rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800,color:"#0f766e"}}>{name}</div>
            <div style={{fontSize:"0.78rem",color:"#64748b"}}>Score: {score} · {offers.length} offers available</div>
          </div>
          <div style={{fontSize:"0.8rem",fontWeight:700,color:T}}>Bank: {bank} · {fmtL(loan)}</div>
        </div>
        {offers.map((o,i)=>(
          <div key={o.lender} style={{background:"white",borderRadius:14,padding:"1.3rem",
                                      marginBottom:"0.9rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                                      border:`2px solid ${i===0?"#16a34a":"transparent"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.6rem"}}>
              <div>
                <div style={{fontWeight:800,fontSize:"1rem",color:DK}}>{o.lender}</div>
                <span style={{display:"inline-block",padding:"2px 9px",borderRadius:6,fontSize:"0.72rem",
                              fontWeight:700,marginTop:2,background:i===0?"#dcfce7":"#f1f5f9",color:o.color}}>{o.badge}</span>
              </div>
              <div style={{fontSize:"2rem",fontWeight:900,color:T}}>
                {o.rate}%<span style={{fontSize:"0.78rem",color:"#64748b",fontWeight:400}}> p.a.</span>
              </div>
            </div>
            <div style={{display:"flex",gap:"1.2rem",fontSize:"0.78rem",color:"#64748b",marginBottom:"0.75rem",flexWrap:"wrap"}}>
              <span>Fee: {o.fee}% (₹{fmt(Math.round(loan*o.fee/100))})</span>
              <span>⚡ {o.hours}hrs</span>
              <span>Total: {fmtL(Math.round(loan*(1+o.rate/100)))}</span>
              <span>💚 Save: {fmtL(Math.round(loan*(0.18-o.rate/100)))}</span>
            </div>
            <button onClick={()=>acceptOffer(o)} disabled={applying}
              style={{width:"100%",padding:"11px",
                      background:i===0?`linear-gradient(135deg,${T},#0f766e)`:"#f8fafc",
                      color:i===0?"white":DK,border:i===0?"none":"1.5px solid #e2e8f0",
                      borderRadius:9,fontWeight:700,cursor:"pointer",opacity:applying?0.7:1}}>
              {applying?"Processing...":i===0?"✅ Accept Best Offer":"View & Accept"}
            </button>
          </div>
        ))}
        {/* UPI Flow */}
        <div style={{background:"#f8fafc",borderRadius:12,padding:"1.2rem",marginTop:"0.75rem"}}>
          <div style={{fontWeight:800,color:DK,marginBottom:"0.75rem"}}>⚡ UPI Auto-Repayment Flow</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            {[["👤","Customer Pays","Scans QR"],["🏦","Virtual A/C","Auto intercept"],
              ["🔐","10% → EMI","Auto deducted"],["✅","90% → You","Instant credit"]].map(([ic,l,s],i,arr)=>(
              <div key={l} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{width:42,height:42,borderRadius:10,background:T,display:"flex",
                               alignItems:"center",justifyContent:"center",fontSize:"1.2rem",
                               margin:"0 auto 0.4rem"}}>{ic}</div>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:"#0f766e"}}>{l}</div>
                  <div style={{fontSize:"0.65rem",color:"#64748b",marginTop:1}}>{s}</div>
                </div>
                {i<arr.length-1&&<div style={{color:T,fontSize:"1rem",padding:"0 3px",marginBottom:16}}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ADD USER
// ════════════════════════════════════════════════════════════
function AddUserPage({setPage,options,showToast,refreshUsers,setResult,setUserForm}){
  const [loading,setLoading]=useState(false)
  const [done,setDone]=useState(null)
  const dOpts={
    business_types:Object.keys(REVENUE_PATTERNS).map(k=>({value:k,label:k.replace(/_/g," ")})),
    states:["Maharashtra","Rajasthan","Delhi","Gujarat","Karnataka","Tamil Nadu","UP","WB"],
    banks:["SBI","HDFC Bank","ICICI Bank","PNB","Axis Bank","Kotak Bank"],
    account_types:["Savings Account","Current Account","Business Account"],
    loan_purposes:["Stock Purchase","Working Capital","Equipment","Marketing"],
  }
  const O=options||dOpts
  const [form,setForm]=useState({
    full_name:"",mobile:"",email:"",business_name:"",business_type:"festival_retail",
    city:"",state:"",years_active:3,bank_name:"",account_number:"",ifsc_code:"",
    account_type:"Savings Account",loan_amount:300000,loan_purpose:"Stock Purchase",
    has_cibil:false,cibil_score:"",aadhaar_last4:"",
  })
  const [revenue,setRevenue]=useState(REVENUE_PATTERNS.festival_retail)
  function setF(k,v){setForm(f=>({...f,[k]:v}))}

  async function addUser(){
    if(!form.full_name||!form.mobile||!form.business_name){alert("Name, Mobile and Business Name required");return}
    setLoading(true)
    try{
      const r=await axios.post(`${API}/api/users/quick-add`,{
        ...form,monthly_revenue:revenue,years_active:Number(form.years_active),
        loan_amount:Number(form.loan_amount),
        cibil_score:form.has_cibil&&form.cibil_score?Number(form.cibil_score):null,
        aadhaar_last4:form.aadhaar_last4||"0000"})
      setDone(r.data);setResult(r.data);setUserForm(form);refreshUsers()
      showToast(`${form.full_name} added! Score: ${r.data.score.total}`)
    }catch(e){
      const score=localScore(revenue)
      const uid="SC"+Math.random().toString(36).slice(2,8).toUpperCase()
      const r={user_id:uid,user:form,score,message:`✅ Added (offline)`}
      setDone(r);setResult(r);setUserForm(form)
      showToast(`${form.full_name} added! Score: ${score.total}`)
    }
    setLoading(false)
  }

  if(done) return(
    <div style={{maxWidth:600,margin:"0 auto",padding:"3rem 1.5rem"}}>
      <div style={{background:"white",borderRadius:20,padding:"2.5rem",boxShadow:"0 4px 30px rgba(0,0,0,0.08)",textAlign:"center"}}>
        <div style={{width:65,height:65,background:"#dcfce7",borderRadius:"50%",display:"flex",
                     alignItems:"center",justifyContent:"center",fontSize:"2rem",margin:"0 auto 1.2rem"}}>✅</div>
        <h2 style={{fontSize:"1.3rem",fontWeight:900,color:DK}}>User Added!</h2>
        <p style={{color:"#64748b",marginBottom:"1.2rem"}}>{done.message}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem",marginBottom:"1.2rem"}}>
          {[["User ID",done.user_id,T],
            ["SeasonScore™",done.score?.total+"/100",done.score?.eligible?"#16a34a":"#dc2626"],
            ["Rate",done.score?.rate?(done.score.rate+"%"):"N/A",T]].map(([l,v,c])=>(
            <div key={l} style={{background:"#f8fafc",borderRadius:10,padding:"0.9rem"}}>
              <div style={{fontSize:"0.68rem",color:"#94a3b8",fontWeight:600}}>{l}</div>
              <div style={{fontSize:"1.2rem",fontWeight:900,color:c,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#f0fdf4",borderRadius:10,padding:"0.9rem",marginBottom:"1.2rem",
                     fontSize:"0.8rem",color:"#166534",textAlign:"left",lineHeight:1.8}}>
          ✅ <strong>Method:</strong> {done.score?.scoring_method}<br/>
          📅 <strong>Peak:</strong> {done.score?.peak_months?.join(", ")||"—"}<br/>
          💰 <strong>Max Loan:</strong> {fmtL(done.score?.max_loan||0)}
        </div>
        <div style={{display:"flex",gap:"0.6rem"}}>
          <button onClick={()=>setPage("dashboard")}
            style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T},#0f766e)`,
                    color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer"}}>
            Dashboard →
          </button>
          <button onClick={()=>{setDone(null);setForm({full_name:"",mobile:"",email:"",
            business_name:"",business_type:"festival_retail",city:"",state:"",years_active:3,
            bank_name:"",account_number:"",ifsc_code:"",account_type:"Savings Account",
            loan_amount:300000,loan_purpose:"Stock Purchase",has_cibil:false,cibil_score:"",aadhaar_last4:""})
            setRevenue(REVENUE_PATTERNS.festival_retail)}}
            style={{flex:1,padding:"11px",background:"#f8fafc",border:"1.5px solid #e2e8f0",
                    borderRadius:10,fontWeight:700,cursor:"pointer",color:DK}}>
            Add Another
          </button>
        </div>
      </div>
    </div>
  )

  return(
    <div style={{maxWidth:700,margin:"0 auto",padding:"1.5rem"}}>
      <div style={{background:"#fffbeb",border:"2px solid #fcd34d",borderRadius:12,
                   padding:"0.9rem 1.2rem",marginBottom:"1.2rem",fontSize:"0.82rem",color:"#92400e"}}>
        ⚡ <strong>Judge Demo Mode:</strong> Add any user live — score generates in 2 seconds!
      </div>
      <div style={{background:"white",borderRadius:18,padding:"1.8rem",boxShadow:"0 4px 30px rgba(0,0,0,0.08)"}}>
        <SecTitle icon="➕" title="Add New User" sub="Minimum: Name, Mobile, Business Name"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 1rem"}}>
          <Field label="Full Name *" value={form.full_name} onChange={v=>setF("full_name",v)} placeholder="Customer name"/>
          <Field label="Mobile *" value={form.mobile} onChange={v=>setF("mobile",v)} placeholder="10-digit"/>
          <Field label="Email" value={form.email} onChange={v=>setF("email",v)} placeholder="Optional"/>
          <Field label="Aadhaar Last 4" value={form.aadhaar_last4} onChange={v=>setF("aadhaar_last4",v)} placeholder="Optional"/>
          <Field label="Business Name *" value={form.business_name} onChange={v=>setF("business_name",v)} placeholder="Shop name"/>
          <Sel label="Business Type" value={form.business_type} onChange={v=>{setF("business_type",v);setRevenue(REVENUE_PATTERNS[v]||REVENUE_PATTERNS.festival_retail)}} options={O.business_types||dOpts.business_types}/>
          <Field label="City" value={form.city} onChange={v=>setF("city",v)} placeholder="City"/>
          <Sel label="State" value={form.state} onChange={v=>setF("state",v)} options={O.states||dOpts.states}/>
          <Field label="Years" type="number" value={form.years_active} onChange={v=>setF("years_active",v)}/>
          <Sel label="Loan Purpose" value={form.loan_purpose} onChange={v=>setF("loan_purpose",v)} options={O.loan_purposes||dOpts.loan_purposes}/>
          <Sel label="Bank" value={form.bank_name} onChange={v=>setF("bank_name",v)} options={O.banks||dOpts.banks}/>
          <Sel label="Account Type" value={form.account_type} onChange={v=>setF("account_type",v)} options={O.account_types||dOpts.account_types}/>
          <Field label="Account Number" value={form.account_number} onChange={v=>setF("account_number",v)} placeholder="Account number"/>
          <Field label="IFSC Code" value={form.ifsc_code} onChange={v=>setF("ifsc_code",v.toUpperCase())} placeholder="SBIN0001234"/>
          <Field label="Loan Amount (₹)" type="number" value={form.loan_amount} onChange={v=>setF("loan_amount",v)}/>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:"0.75rem"}}>
          <input type="checkbox" checked={form.has_cibil} onChange={e=>setF("has_cibil",e.target.checked)}
            style={{width:16,height:16,accentColor:T}}/>
          <span style={{fontSize:"0.85rem",fontWeight:600,color:"#334155"}}>Has CIBIL score?</span>
        </label>
        {form.has_cibil&&<Field label="CIBIL Score" type="number" value={form.cibil_score} onChange={v=>setF("cibil_score",v)} hint="300–900"/>}
        {/* Revenue */}
        <div style={{background:"#f8fafc",borderRadius:10,padding:"0.9rem",marginBottom:"1.2rem"}}>
          <div style={{fontSize:"0.8rem",fontWeight:700,color:"#334155",marginBottom:"0.6rem"}}>
            📊 Revenue Pattern (auto-filled, editable)
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"0.3rem"}}>
            {MONTHS.map((m,i)=>(
              <div key={m}>
                <div style={{fontSize:"0.62rem",textAlign:"center",fontWeight:700,color:"#64748b",marginBottom:1}}>{m}</div>
                <input type="number" value={revenue[i]}
                  onChange={e=>{const n=[...revenue];n[i]=Number(e.target.value);setRevenue(n)}}
                  style={{width:"100%",padding:"4px 3px",border:"1px solid #e2e8f0",borderRadius:5,
                          textAlign:"center",fontSize:"0.68rem",boxSizing:"border-box"}}/>
              </div>
            ))}
          </div>
        </div>
        <button onClick={addUser} disabled={loading}
          style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,${T},#0f766e)`,
                  color:"white",border:"none",borderRadius:12,fontWeight:800,fontSize:"0.95rem",
                  cursor:"pointer",opacity:loading?0.7:1,boxShadow:"0 4px 15px rgba(13,148,136,0.4)"}}>
          {loading?"⏳ Generating SeasonScore...":"➕ Add User & Generate SeasonScore™"}
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// DATASET
// ════════════════════════════════════════════════════════════
function DatasetPage({allUsers}){
  const [search,setSearch]=useState("")
  const [filter,setFilter]=useState("all")
  const users=allUsers.filter(u=>{
    const q=search.toLowerCase()
    const ms=!q||(u.full_name||"").toLowerCase().includes(q)||(u.business_name||"").toLowerCase().includes(q)||(u.city||"").toLowerCase().includes(q)
    const mf=filter==="all"||(filter==="eligible"&&u.eligible)||(filter==="nocibil"&&!u.has_cibil)
    return ms&&mf
  })
  const scores=allUsers.map(u=>u.season_score||77)
  const typeData={
    labels:["Festival","Agriculture","Coaching","Catering","Tourism","Firecracker","Wedding","Religious"],
    datasets:[{data:[11,8,6,5,4,4,7,5],
      backgroundColor:[T,"#14b8a6","#0891b2","#1d4ed8","#7c3aed","#f97316","#16a34a","#dc2626"],
      borderWidth:2,borderColor:"#fff"}]
  }
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white"}}>
        <h2 style={{fontWeight:800,fontSize:"1.3rem"}}>📁 SME Dataset</h2>
        <p style={{color:"#64748b",marginTop:4,fontSize:"0.82rem"}}>SIDBI MSME Pulse 2023 + Live Entries</p>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
          {[["📋",Math.max(50,allUsers.length),"Total Records"],
            ["🎯",round1(np_mean(scores)),"Avg Score"],
            ["✅",allUsers.length>0?Math.round(scores.filter(s=>s>=50).length/scores.length*100)+"%":"100%","Eligible"],
            ["💰",fmtL(Math.round(allUsers.reduce((a,u)=>a+(u.annual_revenue||1581686),0)/Math.max(1,allUsers.length))),"Avg Revenue"]].map(([ic,v,l])=>(
            <div key={l} style={{background:"white",borderRadius:12,padding:"1.1rem",
                                 boxShadow:"0 2px 12px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:"0.65rem"}}>
              <div style={{fontSize:"1.4rem"}}>{ic}</div>
              <div>
                <div style={{fontSize:"1.3rem",fontWeight:900,color:T}}>{v}</div>
                <div style={{fontSize:"0.68rem",color:"#64748b",marginTop:1}}>{l}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem"}}>
          <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:"0.78rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",marginBottom:"0.75rem"}}>By Business Type</div>
            <Doughnut data={typeData} options={{plugins:{legend:{position:"right",labels:{font:{size:9}}}}}}/>
          </div>
          <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{fontSize:"0.78rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",marginBottom:"0.75rem"}}>Score Distribution</div>
            <Bar data={{labels:["50-60","60-70","70-80","80-90","90-100"],
              datasets:[{data:[3,12,18,12,5],backgroundColor:T,borderRadius:5}]}}
              options={{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}}/>
          </div>
        </div>
        {allUsers.length>0&&(
          <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.75rem",flexWrap:"wrap",gap:"0.5rem"}}>
              <div style={{fontWeight:800,color:DK}}>🔴 Live Entries ({allUsers.length})</div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <input type="text" placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}
                  style={{padding:"7px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:"0.82rem"}}/>
                <select value={filter} onChange={e=>setFilter(e.target.value)}
                  style={{padding:"7px 11px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:"0.82rem"}}>
                  <option value="all">All</option>
                  <option value="eligible">Eligible</option>
                  <option value="nocibil">No CIBIL</option>
                </select>
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem"}}>
                <thead>
                  <tr>{["ID","Name","Business","City","Score","Grade","Rate","Loan","CIBIL","Status"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",background:"#f8fafc",fontWeight:700,color:"#334155",textAlign:"left",borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id}>
                      <td style={{padding:"7px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9",fontFamily:"monospace",fontSize:"0.72rem"}}>{u.id}</td>
                      <td style={{padding:"7px 10px",fontWeight:600,color:DK,borderBottom:"1px solid #f1f5f9"}}>{u.full_name}</td>
                      <td style={{padding:"7px 10px",color:"#334155",borderBottom:"1px solid #f1f5f9"}}>{u.business_name}</td>
                      <td style={{padding:"7px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{u.city}</td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{fontWeight:800,color:u.season_score>=80?"#16a34a":u.season_score>=65?T:"#f97316"}}>{u.season_score}</span>
                      </td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{background:"#f0fdf4",color:"#16a34a",padding:"2px 7px",borderRadius:5,fontWeight:700,fontSize:"0.72rem"}}>{u.score_grade||"B"}</span>
                      </td>
                      <td style={{padding:"7px 10px",color:T,fontWeight:700,borderBottom:"1px solid #f1f5f9"}}>{u.interest_rate}%</td>
                      <td style={{padding:"7px 10px",color:"#334155",borderBottom:"1px solid #f1f5f9"}}>{fmtL(u.loan_amount)}</td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{background:u.has_cibil?"#eff6ff":"#f0fdf4",color:u.has_cibil?"#1d4ed8":"#16a34a",padding:"2px 7px",borderRadius:5,fontSize:"0.72rem",fontWeight:700}}>
                          {u.has_cibil?"CIBIL":"No CIBIL"}
                        </span>
                      </td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{background:u.eligible?"#dcfce7":"#fee2e2",color:u.eligible?"#16a34a":"#dc2626",padding:"2px 7px",borderRadius:5,fontSize:"0.72rem",fontWeight:700}}>
                          {u.eligible?"✅":"❌"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
function round1(n){return isNaN(n)?77:Math.round(n*10)/10}
function np_mean(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:77}

// ════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════
function AdminPage({showToast,allUsers}){
  const [key,setKey]=useState("")
  const [authed,setAuthed]=useState(false)
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(false)
  const [activeTab,setActiveTab]=useState("overview")

  async function login(){
    if(key==="finsentinel2026"){setAuthed(true);loadData()}
    else{showToast("Invalid admin key","error")}
  }
  async function loadData(){
    setLoading(true)
    try{
      const r=await axios.get(`${API}/api/admin/dashboard?admin_key=finsentinel2026`)
      setData(r.data)
    }catch(e){
      setData({overview:{total_users:allUsers.length,total_loans:0,total_loan_book:0,
        avg_season_score:round1(np_mean(allUsers.map(u=>u.season_score||77))),
        eligible_users:allUsers.filter(u=>u.eligible).length,no_cibil_users:allUsers.filter(u=>!u.has_cibil).length,
        approved_loans:0,total_repaid:0},
        score_distribution:{"A (80-100)":5,"B (65-79)":18,"C (50-64)":12,"D (<50)":0},
        by_business_type:{}})
    }
    setLoading(false)
  }

  if(!authed) return(
    <div style={{maxWidth:400,margin:"4rem auto",padding:"0 1.5rem"}}>
      <div style={{background:"white",borderRadius:18,padding:"2.5rem",boxShadow:"0 4px 30px rgba(0,0,0,0.08)",textAlign:"center"}}>
        <div style={{fontSize:"2rem",marginBottom:"1rem"}}>🔐</div>
        <div style={{fontWeight:800,fontSize:"1.2rem",color:DK,marginBottom:"0.4rem"}}>Admin Dashboard</div>
        <div style={{fontSize:"0.8rem",color:"#64748b",marginBottom:"1.5rem"}}>Enter admin key to access</div>
        <input type="password" value={key} onChange={e=>setKey(e.target.value)}
          placeholder="Admin key" onKeyDown={e=>e.key==="Enter"&&login()}
          style={{width:"100%",padding:"11px 13px",border:"1.5px solid #e2e8f0",borderRadius:10,
                  fontSize:"0.9rem",boxSizing:"border-box",outline:"none",marginBottom:"0.75rem"}}/>
        <div style={{fontSize:"0.72rem",color:"#94a3b8",marginBottom:"0.75rem"}}>Demo key: finsentinel2026</div>
        <button onClick={login}
          style={{width:"100%",padding:"12px",background:`linear-gradient(135deg,${T},#0f766e)`,
                  color:"white",border:"none",borderRadius:10,fontWeight:700,cursor:"pointer"}}>
          Access Dashboard →
        </button>
      </div>
    </div>
  )

  const ov=data?.overview||{}
  const scoreData={
    labels:Object.keys(data?.score_distribution||{}),
    datasets:[{data:Object.values(data?.score_distribution||{}),backgroundColor:[T,"#14b8a6","#0891b2","#94a3b8"],borderWidth:0}]
  }

  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h2 style={{fontWeight:800,fontSize:"1.3rem"}}>🔐 Admin Dashboard</h2>
          <p style={{color:"#64748b",marginTop:4,fontSize:"0.82rem"}}>FinSentinel Operations Center</p>
        </div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          {["overview","users","loans"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{padding:"7px 12px",borderRadius:7,border:"none",cursor:"pointer",
                      background:activeTab===t?T:"rgba(255,255,255,0.1)",
                      color:"white",fontSize:"0.75rem",fontWeight:600,textTransform:"capitalize"}}>
              {t}
            </button>
          ))}
          <button onClick={loadData}
            style={{padding:"7px 12px",borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",
                    background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:"0.75rem"}}>
            🔄 Refresh
          </button>
        </div>
      </div>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"1.5rem"}}>
        {activeTab==="overview"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[["👥",ov.total_users||0,"Total Users"],["✅",ov.eligible_users||0,"Eligible"],
                ["🏦",ov.total_loans||0,"Loans"],["💰",fmtL(ov.total_loan_book||0),"Loan Book"]].map(([ic,v,l])=>(
                <div key={l} style={{background:"white",borderRadius:12,padding:"1.1rem",
                                     boxShadow:"0 2px 12px rgba(0,0,0,0.05)",textAlign:"center"}}>
                  <div style={{fontSize:"1.5rem",marginBottom:"0.4rem"}}>{ic}</div>
                  <div style={{fontSize:"1.5rem",fontWeight:900,color:T}}>{v}</div>
                  <div style={{fontSize:"0.7rem",color:"#64748b",marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem"}}>
              <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:"0.78rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",marginBottom:"0.75rem"}}>Score Distribution</div>
                <Doughnut data={scoreData} options={{plugins:{legend:{position:"right",labels:{font:{size:10}}}}}}/>
              </div>
              <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:"0.78rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",marginBottom:"0.75rem"}}>Key Metrics</div>
                {[["Avg SeasonScore",ov.avg_season_score||77.3+"/100"],["No-CIBIL Users",ov.no_cibil_users||0],
                  ["Collection Rate",ov.total_loan_book>0?Math.round(ov.total_repaid/ov.total_loan_book*100)+"%":"—"],
                  ["Expected NPA","4–6% (vs 12% industry)"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <span style={{fontSize:"0.82rem",color:"#64748b"}}>{l}</span>
                    <span style={{fontWeight:700,color:DK,fontSize:"0.88rem"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {activeTab==="users"&&(
          <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{fontWeight:800,color:DK,marginBottom:"0.75rem"}}>All Users ({allUsers.length})</div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.78rem"}}>
                <thead>
                  <tr>{["ID","Name","Business","City","Score","Eligible","KYC","Created"].map(h=>(
                    <th key={h} style={{padding:"7px 10px",background:"#f8fafc",fontWeight:700,color:"#334155",textAlign:"left",borderBottom:"2px solid #e2e8f0"}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {allUsers.map(u=>(
                    <tr key={u.id}>
                      <td style={{padding:"7px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9",fontFamily:"monospace",fontSize:"0.7rem"}}>{u.id}</td>
                      <td style={{padding:"7px 10px",fontWeight:600,color:DK,borderBottom:"1px solid #f1f5f9"}}>{u.full_name}</td>
                      <td style={{padding:"7px 10px",color:"#334155",borderBottom:"1px solid #f1f5f9"}}>{u.business_name}</td>
                      <td style={{padding:"7px 10px",color:"#64748b",borderBottom:"1px solid #f1f5f9"}}>{u.city}</td>
                      <td style={{padding:"7px 10px",fontWeight:800,color:T,borderBottom:"1px solid #f1f5f9"}}>{u.season_score}</td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{background:u.eligible?"#dcfce7":"#fee2e2",color:u.eligible?"#16a34a":"#dc2626",padding:"2px 7px",borderRadius:5,fontWeight:700,fontSize:"0.7rem"}}>{u.eligible?"✅":"❌"}</span>
                      </td>
                      <td style={{padding:"7px 10px",borderBottom:"1px solid #f1f5f9"}}>
                        <span style={{background:u.kyc_status==="verified"?"#f0fdf4":"#fefce8",color:u.kyc_status==="verified"?"#16a34a":"#92400e",padding:"2px 7px",borderRadius:5,fontWeight:700,fontSize:"0.7rem"}}>{u.kyc_status||"basic"}</span>
                      </td>
                      <td style={{padding:"7px 10px",color:"#94a3b8",borderBottom:"1px solid #f1f5f9",fontSize:"0.7rem"}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab==="loans"&&(
          <div style={{background:"white",borderRadius:12,padding:"1.2rem",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",textAlign:"center",padding:"3rem",color:"#64748b"}}>
            <div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🏦</div>
            <div>No loans yet. Loans appear here once users accept offers in the Marketplace.</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// NBFC PORTAL
// ════════════════════════════════════════════════════════════
function NBFCPortalPage({showToast}){
  const [selected,setSelected]=useState("L001")
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(false)
  const lenders=[
    {id:"L001",name:"FinGrow Capital",rate:"13.5%",cap:"₹5Cr"},
    {id:"L002",name:"QuickCapital",rate:"15%",cap:"₹3Cr"},
    {id:"L003",name:"Lendingkart",rate:"14.5%",cap:"₹8Cr"},
    {id:"L004",name:"Capital Float",rate:"15.5%",cap:"₹4Cr"},
    {id:"L005",name:"SeasonFund Pro",rate:"16.5%",cap:"₹2.5Cr"},
  ]
  async function loadPortal(id){
    setSelected(id);setLoading(true)
    try{
      const r=await axios.get(`${API}/api/nbfc/${id}/dashboard?admin_key=finsentinel2026`)
      setData(r.data)
    }catch(e){
      setData({lender:lenders.find(l=>l.id===id),portfolio:{total_loans:0,total_disbursed:0,total_repaid:0,outstanding:0,collection_efficiency:0,avg_season_score:74}})
    }
    setLoading(false)
  }
  useEffect(()=>{loadPortal("L001")},[])

  const p=data?.portfolio||{}
  return(
    <div>
      <div style={{background:`linear-gradient(135deg,${NV},#1e293b)`,padding:"1.5rem 2rem",color:"white"}}>
        <h2 style={{fontWeight:800,fontSize:"1.3rem"}}>🏛 NBFC Partner Portal</h2>
        <p style={{color:"#64748b",marginTop:4,fontSize:"0.82rem"}}>Lender portfolio management and analytics</p>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
          {lenders.map(l=>(
            <button key={l.id} onClick={()=>loadPortal(l.id)}
              style={{padding:"8px 14px",borderRadius:9,border:`2px solid ${selected===l.id?T:"#e2e8f0"}`,
                      background:selected===l.id?"#ccfbf1":"white",color:selected===l.id?"#0f766e":DK,
                      cursor:"pointer",fontSize:"0.78rem",fontWeight:700}}>
              {l.name}
            </button>
          ))}
        </div>
        {data&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
              {[["💼",p.total_loans||0,"Total Loans"],["💰",fmtL(p.total_disbursed||0),"Disbursed"],
                ["✅",fmtL(p.total_repaid||0),"Repaid"],["📊",(p.collection_efficiency||0)+"%","Collection"]].map(([ic,v,l])=>(
                <div key={l} style={{background:"white",borderRadius:12,padding:"1.1rem",
                                     boxShadow:"0 2px 12px rgba(0,0,0,0.05)",textAlign:"center"}}>
                  <div style={{fontSize:"1.3rem",marginBottom:"0.3rem"}}>{ic}</div>
                  <div style={{fontSize:"1.3rem",fontWeight:900,color:T}}>{v}</div>
                  <div style={{fontSize:"0.68rem",color:"#64748b",marginTop:1}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:12,padding:"1.5rem",
                         boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
              <div style={{fontWeight:800,color:DK,marginBottom:"0.75rem"}}>
                {data.lender?.name||lenders.find(l=>l.id===selected)?.name} — Portfolio Details
              </div>
              {[["Avg SeasonScore of Portfolio",p.avg_season_score||74],
                ["Outstanding Loan Balance",fmtL(p.outstanding||0)],
                ["Capital Available",fmtL(data.lender?.capital_available||5000000)],
                ["Capital Deployed",fmtL(p.total_disbursed||0)],
                ["Expected NPA","4.2% (below 6% threshold)"],
                ["UPI Intercept Active","Yes — all loans"]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
                                     borderBottom:"1px solid #f1f5f9",fontSize:"0.85rem"}}>
                  <span style={{color:"#64748b"}}>{l}</span>
                  <span style={{fontWeight:700,color:DK}}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
