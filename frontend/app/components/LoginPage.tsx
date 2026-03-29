"use client";
import { useState } from "react";

const BG = "#060c1a";
const GLASS = "rgba(255,255,255,0.05)";
const G_BORDER = "rgba(96,165,250,0.25)";
const BLUE_LT = "#60a5fa";
const BLUE_XLT = "#93c5fd";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

interface Props {
  apiUrl: string;
  onSuccess: (user: { name: string; email: string; token: string }) => void;
}

export default function LoginPage({ apiUrl, onSuccess }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); setError("");
    try {
      const endpoint = mode === "signin" ? "/auth/login" : "/auth/register";
      const r = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const j = await r.json();
      if (!j.ok) { setError(j.error ?? "Something went wrong."); }
      else { onSuccess({ name: j.name, email: email.trim(), token: j.token }); }
    } catch { setError("Cannot reach the backend. Is it running?"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:FONT, color:TEXT, padding:20, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"relative", width:"100%", maxWidth:420, background:GLASS, border:`1px solid ${G_BORDER}`, borderRadius:24, padding:"36px 32px 32px", boxShadow:"0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
        <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:1, background:"linear-gradient(90deg, transparent, rgba(147,197,253,0.6), transparent)", borderRadius:999 }} />
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:28, fontWeight:900, letterSpacing:"-0.025em", background:`linear-gradient(130deg, ${BLUE_XLT} 0%, #ffffff 45%, ${BLUE_LT} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:6 }}>PSU Macro Planner</div>
          <div style={{ fontSize:13, color:MUTED }}>Penn State Dining · Meal Planner</div>
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:3, marginBottom:24 }}>
          {(["signin","signup"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, padding:"8px 0", borderRadius:10, border:"none", background:mode===m?"rgba(59,130,246,0.28)":"transparent", color:mode===m?BLUE_LT:MUTED, fontWeight:mode===m?700:400, fontSize:13, cursor:"pointer", transition:"all 0.18s" }}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:18 }}>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key==="Enter" && submit()} placeholder="you@psu.edu" autoComplete="email" style={inputStyle} />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <div style={{ position:"relative" }}>
              <input type={showPass?"text":"password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key==="Enter" && submit()} placeholder="••••••••" autoComplete={mode==="signin"?"current-password":"new-password"} style={{ ...inputStyle, paddingRight:44 }} />
              <button onClick={() => setShowPass((v) => !v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:MUTED, fontSize:12, padding:0 }}>{showPass?"Hide":"Show"}</button>
            </div>
          </div>
        </div>
        {error && <div style={{ marginBottom:14, padding:"9px 14px", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, color:"#fca5a5", fontSize:13 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ width:"100%", padding:"13px 0", borderRadius:14, border:"none", background:loading?"rgba(59,130,246,0.25)":`linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)`, color:"#fff", fontWeight:900, fontSize:15, cursor:loading?"not-allowed":"pointer", boxShadow:loading?"none":"0 4px 24px rgba(59,130,246,0.45), inset 0 1px 0 rgba(255,255,255,0.15)", letterSpacing:"0.02em", transition:"all 0.2s" }}>
          {loading ? (mode==="signin"?"Signing in…":"Creating account…") : (mode==="signin"?"Sign In":"Create Account")}
        </button>
        <p style={{ textAlign:"center", marginTop:18, fontSize:13, color:MUTED }}>
          {mode==="signin"?"Don't have an account? ":"Already have an account? "}
          <button onClick={() => { setMode(mode==="signin"?"signup":"signin"); setError(""); }} style={{ background:"none", border:"none", color:BLUE_LT, cursor:"pointer", fontWeight:600, fontSize:13, padding:0 }}>
            {mode==="signin"?"Sign up":"Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ color:"#94a3b8", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.09em", marginBottom:6 }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid rgba(96,165,250,0.25)", background:"rgba(255,255,255,0.07)", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box",
};
