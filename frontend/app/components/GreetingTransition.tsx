"use client";
import { useEffect, useState } from "react";

const BG = "#060c1a";
const BLUE_LT = "#60a5fa";
const BLUE_XLT = "#93c5fd";
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

interface Props { name: string; onDone: () => void; }

export default function GreetingTransition({ name, onDone }: Props) {
  const [phase, setPhase] = useState<"in"|"hold"|"out">("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 50);
    const t2 = setTimeout(() => setPhase("out"), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);
  const opacity = phase==="in" ? 0 : phase==="hold" ? 1 : 0;
  const translateY = phase==="in" ? 20 : phase==="hold" ? 0 : -16;
  return (
    <div style={{ position:"fixed", inset:0, background:BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:FONT, zIndex:9999, overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ opacity, transform:`translateY(${translateY}px)`, transition:"opacity 0.6s ease, transform 0.6s ease", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:BLUE_LT, marginBottom:24, opacity:0.8 }}>PSU Macro Planner</div>
        <div style={{ fontSize:62, fontWeight:900, letterSpacing:"-0.03em", lineHeight:1.05, background:`linear-gradient(130deg, ${BLUE_XLT} 0%, #ffffff 45%, ${BLUE_LT} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          Hi, {name.split(" ")[0] || name}!
        </div>
        <div style={{ marginTop:16, fontSize:17, color:"rgba(148,163,184,0.85)", fontWeight:400 }}>Your meal plans are ready.</div>
        <div style={{ marginTop:40, display:"flex", justifyContent:"center", gap:8 }}>
          {[0,1,2].map((i) => (
            <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:BLUE_LT, opacity:0.6, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:0.9;transform:scale(1.2)} }`}</style>
    </div>
  );
}
