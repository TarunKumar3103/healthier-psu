"use client";
import { useEffect, useState } from "react";

const BG_COL = "rgba(8,16,45,0.85)";
const G_BORDER = "rgba(96,165,250,0.18)";
const BLUE_LT = "#60a5fa";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

const GOAL_META: Record<string, { accent: string; label: string; bg: string }> = {
  physique: { accent:"#60a5fa", label:"Physique", bg:"rgba(96,165,250,0.12)" },
  brain: { accent:"#818cf8", label:"Brain Health", bg:"rgba(129,140,248,0.12)" },
  skin: { accent:"#f9a8d4", label:"Skin Health", bg:"rgba(249,168,212,0.12)" },
};

interface TrackerEntry { id: string; date: string; plan_label: string; calories: number; protein_g: number; goal_type: string; }

interface Props { token: string; apiUrl: string; refreshKey: number; }

export default function TrackerColumn({ token, apiUrl, refreshKey }: Props) {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein_g: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${apiUrl}/tracker/week`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (j.ok) { setEntries(j.entries || []); setTotals(j.totals || { calories:0, protein_g:0 }); }
    } catch {}
    setLoading(false);
  }

  async function removeEntry(entryId: string) {
    try {
      await fetch(`${apiUrl}/tracker/entry/${encodeURIComponent(entryId)}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== entryId);
        setTotals({ calories:updated.reduce((s,e)=>s+e.calories,0), protein_g:updated.reduce((s,e)=>s+e.protein_g,0) });
        return updated;
      });
    } catch {}
  }

  const today = new Date();
  const last7: string[] = Array.from({length:7},(_,i) => { const d=new Date(today); d.setDate(d.getDate()-(6-i)); return d.toISOString().split("T")[0]; });
  const byDate = entries.reduce<Record<string, TrackerEntry[]>>((acc,e) => { if(!acc[e.date])acc[e.date]=[]; acc[e.date].push(e); return acc; }, {});
  const calByDay = last7.map((d) => (byDate[d]||[]).reduce((s,e)=>s+e.calories,0));
  const maxCal = Math.max(...calByDay, 2000);
  const sortedDates = Object.keys(byDate).sort((a,b) => b.localeCompare(a));

  return (
    <div style={{ background:BG_COL, border:`1px solid ${G_BORDER}`, borderRadius:20, fontFamily:FONT, overflow:"hidden", boxShadow:"0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", maxHeight:"calc(100vh - 48px)" }}>
      <div style={{ padding:"16px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0 }}>
        <div style={{ fontSize:13, fontWeight:800, color:TEXT, letterSpacing:"-0.01em", marginBottom:2 }}>Weekly Tracker</div>
        <div style={{ fontSize:10, color:MUTED }}>Last 7 days</div>
      </div>

      {/* Bar chart */}
      <div style={{ padding:"12px 16px 0", flexShrink:0 }}>
        <div style={{ fontSize:8, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:MUTED, marginBottom:8 }}>Daily Calories</div>
        <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:48 }}>
          {last7.map((d, i) => {
            const cal = calByDay[i];
            const dayLabel = new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday:"short" });
            const barH = cal > 0 ? Math.max(4, Math.round((cal / maxCal) * 40)) : 2;
            const isToday = d === today.toISOString().split("T")[0];
            return (
              <div key={d} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                <div style={{ width:"100%", height:`${barH}px`, borderRadius:3, background:cal>0?(isToday?BLUE_LT:"rgba(96,165,250,0.45)"):"rgba(255,255,255,0.08)", transition:"height 0.3s ease", boxShadow:cal>0&&isToday?`0 0 8px ${BLUE_LT}60`:undefined }} />
                <div style={{ fontSize:8, color:isToday?BLUE_LT:MUTED, fontWeight:isToday?700:400 }}>{dayLabel}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly totals */}
      <div style={{ padding:"10px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0, display:"flex", gap:8 }}>
        <div style={{ flex:1, padding:"8px 10px", borderRadius:10, background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.15)" }}>
          <div style={{ fontSize:8, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Week Cals</div>
          <div style={{ fontSize:16, fontWeight:800, color:BLUE_LT }}>{totals.calories.toLocaleString()}</div>
        </div>
        <div style={{ flex:1, padding:"8px 10px", borderRadius:10, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.15)" }}>
          <div style={{ fontSize:8, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2 }}>Week Protein</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#f87171" }}>{totals.protein_g}g</div>
        </div>
      </div>

      {/* Entry list */}
      <div style={{ overflowY:"auto", flex:1, padding:"8px 10px" }}>
        {loading && <div style={{ textAlign:"center", padding:16, color:MUTED, fontSize:12 }}>Loading…</div>}
        {!loading && entries.length === 0 && (
          <div style={{ textAlign:"center", padding:"24px 12px", color:MUTED, fontSize:12, lineHeight:1.7 }}>No entries this week.<br/>Save a plan to track it.</div>
        )}
        {!loading && sortedDates.map((date) => (
          <div key={date}>
            <div style={{ fontSize:9, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.08em", padding:"6px 6px 4px" }}>
              {new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" })}
            </div>
            {byDate[date].map((entry) => {
              const gm = GOAL_META[entry.goal_type] || GOAL_META.physique;
              return (
                <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:10, background:gm.bg, border:`1px solid ${gm.accent}28`, marginBottom:5 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:TEXT, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{entry.plan_label}</div>
                    <div style={{ fontSize:10, color:MUTED, marginTop:2 }}>
                      <span style={{ color:gm.accent }}>{entry.calories} kcal</span>
                      <span style={{ margin:"0 4px" }}>·</span>
                      <span>{entry.protein_g}g protein</span>
                      <span style={{ margin:"0 4px" }}>·</span>
                      <span style={{ color:gm.accent, fontSize:9 }}>{gm.label}</span>
                    </div>
                  </div>
                  <button onClick={() => removeEntry(entry.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.2)", fontSize:14, padding:"2px 4px", borderRadius:4, flexShrink:0, lineHeight:1 }} title="Remove">×</button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
