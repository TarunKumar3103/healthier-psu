"use client";
import { useState } from "react";

export type GoalType = "physique" | "brain" | "skin";

const BG = "#060c1a";
const MUTED = "#94a3b8";
const TEXT = "#f1f5f9";
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

const GOALS = [
  { type:"brain" as GoalType, icon:"🧠", label:"Brain Health", desc:"Omega-3s, antioxidants, and leafy greens for focus, memory, and cognitive performance.", accent:"#818cf8", glow:"rgba(129,140,248,0.13)", border:"rgba(129,140,248,0.38)", tags:["Omega-3 Rich","Antioxidants","Leafy Greens"] },
  { type:"physique" as GoalType, icon:"💪", label:"Physique", desc:"Protein-optimized plans built around your calorie and macro targets for body composition.", accent:"#60a5fa", glow:"rgba(96,165,250,0.13)", border:"rgba(96,165,250,0.38)", tags:["High Protein","Macro Tracked","Body Composition"] },
  { type:"skin" as GoalType, icon:"✨", label:"Skin Health", desc:"Anti-inflammatory, vitamin-rich foods for clear, glowing, and healthy-looking skin.", accent:"#f9a8d4", glow:"rgba(249,168,212,0.13)", border:"rgba(249,168,212,0.38)", tags:["Anti-Inflammatory","Vitamin C & E","Glow Foods"] },
] as const;

interface Props { name: string; onSelect: (goal: GoalType) => void; }

export default function GoalSelect({ name, onSelect }: Props) {
  const [hovered, setHovered] = useState<GoalType | null>(null);
  const [selected, setSelected] = useState<GoalType | null>(null);

  function choose(type: GoalType) {
    setSelected(type);
    setTimeout(() => onSelect(type), 280);
  }

  const firstName = name.split(" ")[0] || name;

  return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:FONT, color:TEXT, padding:"40px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"35%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ textAlign:"center", marginBottom:48, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#60a5fa", marginBottom:14, opacity:0.8 }}>PSU Macro Planner</div>
        <h1 style={{ fontSize:34, fontWeight:900, letterSpacing:"-0.025em", margin:"0 0 10px", background:"linear-gradient(130deg, #93c5fd 0%, #ffffff 45%, #60a5fa 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          What&apos;s your focus, {firstName}?
        </h1>
        <p style={{ color:MUTED, fontSize:14, margin:0 }}>Choose a wellness goal. You can switch anytime.</p>
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center", maxWidth:880, width:"100%", position:"relative", zIndex:1 }}>
        {GOALS.map((g) => {
          const isHov = hovered===g.type, isSel = selected===g.type, active = isHov||isSel;
          return (
            <button key={g.type} onClick={() => choose(g.type)} onMouseEnter={() => setHovered(g.type)} onMouseLeave={() => setHovered(null)}
              style={{ flex:"1 1 220px", maxWidth:264, padding:"32px 22px 28px", borderRadius:24, border:`1px solid ${active?g.border:"rgba(255,255,255,0.07)"}`, background:active?g.glow:"rgba(255,255,255,0.025)", cursor:"pointer", textAlign:"center", transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)", transform:isHov?"translateY(-6px) scale(1.015)":isSel?"scale(0.97)":"none", boxShadow:isHov?`0 24px 60px rgba(0,0,0,0.55), 0 0 50px ${g.glow}`:"0 4px 20px rgba(0,0,0,0.3)", display:"flex", flexDirection:"column", alignItems:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1, background:active?`linear-gradient(90deg, transparent, ${g.accent}88, transparent)`:"transparent", borderRadius:999 }} />
              <div style={{ fontSize:50, marginBottom:16, lineHeight:1 }}>{g.icon}</div>
              <div style={{ fontSize:19, fontWeight:800, color:active?g.accent:TEXT, marginBottom:10, transition:"color 0.2s", letterSpacing:"-0.01em" }}>{g.label}</div>
              <p style={{ fontSize:13, color:MUTED, lineHeight:1.6, margin:"0 0 18px", textAlign:"center" }}>{g.desc}</p>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", justifyContent:"center" }}>
                {g.tags.map((tag) => (
                  <span key={tag} style={{ padding:"3px 9px", borderRadius:999, background:active?g.glow:"rgba(255,255,255,0.05)", border:`1px solid ${active?g.border:"rgba(255,255,255,0.08)"}`, fontSize:10, fontWeight:700, color:active?g.accent:MUTED, letterSpacing:"0.05em", transition:"all 0.2s" }}>{tag}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
