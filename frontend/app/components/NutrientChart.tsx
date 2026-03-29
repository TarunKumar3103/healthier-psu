"use client";

const PROTEIN_COLOR = "#f87171";
const CARBS_COLOR = "#34d399";
const FAT_COLOR = "#fbbf24";
const TEXT = "#f1f5f9";
const MUTED = "#94a3b8";
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx: number, cy: number, outerR: number, innerR: number, startDeg: number, endDeg: number): string {
  const span = endDeg - startDeg;
  if (span <= 0.5) return "";
  const gap = span > 5 ? 1.2 : 0;
  const s = startDeg + gap, e = endDeg - gap;
  const o1 = polarToXY(cx,cy,outerR,s), o2 = polarToXY(cx,cy,outerR,e);
  const i1 = polarToXY(cx,cy,innerR,e), i2 = polarToXY(cx,cy,innerR,s);
  const large = e-s>180?1:0;
  return [`M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)}`,`A ${outerR} ${outerR} 0 ${large} 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)}`,`L ${i1.x.toFixed(2)} ${i1.y.toFixed(2)}`,`A ${innerR} ${innerR} 0 ${large} 0 ${i2.x.toFixed(2)} ${i2.y.toFixed(2)}`,"Z"].join(" ");
}

interface MealTotals {
  breakfast: { totals: { calories: number } };
  lunch: { totals: { calories: number } };
  dinner: { totals: { calories: number } };
  extras: { totals: { calories: number } };
}

interface Props { calories: number | null; protein_g: number | null; meals?: MealTotals | null; accentColor?: string; }

export default function NutrientChart({ calories, protein_g, meals }: Props) {
  const hasData = calories != null && protein_g != null && calories > 0;
  let proteinKcal = 0, fatKcal = 0, carbsKcal = 0;
  if (hasData) {
    proteinKcal = (protein_g ?? 0) * 4;
    const remaining = Math.max(0, (calories ?? 0) - proteinKcal);
    fatKcal = remaining * 0.42; carbsKcal = remaining * 0.58;
  }
  const total = proteinKcal + fatKcal + carbsKcal || 1;
  const macros = [{ label:"Protein", kcal:proteinKcal, color:PROTEIN_COLOR },{ label:"Carbs", kcal:carbsKcal, color:CARBS_COLOR },{ label:"Fat", kcal:fatKcal, color:FAT_COLOR }];
  let currentAngle = 0;
  const slices = macros.map((m) => { const startDeg=currentAngle, endDeg=currentAngle+(m.kcal/total)*360; currentAngle=endDeg; return {...m,startDeg,endDeg}; });
  const cx=120,cy=120,outerR=100,innerR=62;
  const mealList = meals ? [
    {label:"Breakfast",cal:meals.breakfast.totals.calories,color:"#60a5fa"},
    {label:"Lunch",cal:meals.lunch.totals.calories,color:"#a78bfa"},
    {label:"Dinner",cal:meals.dinner.totals.calories,color:"#34d399"},
    {label:"Extras",cal:meals.extras.totals.calories,color:"#fbbf24"},
  ] : [];
  const mealMax = Math.max(...mealList.map((m) => m.cal), 1);
  return (
    <div style={{ background:"linear-gradient(145deg, rgba(220,240,255,0.06) 0%, rgba(10,20,55,0.55) 100%)", border:"1px solid rgba(180,210,255,0.14)", borderRadius:20, padding:"18px 16px 16px", fontFamily:FONT, boxShadow:"0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)" }}>
      <div style={{ fontSize:9, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.11em", marginBottom:16 }}>Macro Breakdown</div>
      {!hasData ? (
        <div style={{ textAlign:"center", padding:"28px 8px", color:MUTED, fontSize:12, lineHeight:1.7 }}>Generate a plan<br/>to see your macro<br/>breakdown</div>
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
            <svg width={240} height={240} style={{ overflow:"visible" }}>
              <circle cx={cx} cy={cy} r={(outerR+innerR)/2} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={outerR-innerR} />
              {slices.map((s) => (
                <path key={s.label} d={donutSlicePath(cx,cy,outerR,innerR,s.startDeg,s.endDeg)} fill={s.color} opacity={0.92} style={{ filter:`drop-shadow(0 0 6px ${s.color}90)`, transition:"opacity 0.3s" }} />
              ))}
              <text x={cx} y={cy-10} textAnchor="middle" fill={TEXT} fontSize={26} fontWeight={900} fontFamily={FONT}>{(calories??0).toLocaleString()}</text>
              <text x={cx} y={cy+13} textAnchor="middle" fill={MUTED} fontSize={12} fontFamily={FONT}>kcal total</text>
            </svg>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:14 }}>
            {slices.map((s) => (
              <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px", borderRadius:10, background:`${s.color}12`, border:`1px solid ${s.color}28` }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, boxShadow:`0 0 6px ${s.color}`, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:TEXT, fontWeight:600 }}>{s.label}</span>
                </div>
                <div style={{ textAlign:"right" }}>
                  <span style={{ fontSize:13, color:s.color, fontWeight:800 }}>{Math.round((s.kcal/total)*100)}%</span>
                  <span style={{ fontSize:10, color:MUTED, marginLeft:5 }}>{s.label==="Protein"?`${protein_g}g`:`~${Math.round(s.kcal)} kcal`}</span>
                </div>
              </div>
            ))}
          </div>
          {meals && (
            <>
              <div style={{ fontSize:9, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>By Meal</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {mealList.map((m) => (
                  <div key={m.label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:11, color:m.color, fontWeight:600 }}>{m.label}</span>
                      <span style={{ fontSize:10, color:MUTED }}>{m.cal} kcal</span>
                    </div>
                    <div style={{ height:5, borderRadius:999, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:999, width:`${(m.cal/mealMax)*100}%`, background:m.color, boxShadow:`0 0 8px ${m.color}80`, transition:"width 0.4s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ marginTop:12, padding:"7px 9px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", fontSize:9, color:MUTED, lineHeight:1.5 }}>* Carbs &amp; fat are estimated from total calories.</div>
        </>
      )}
    </div>
  );
}
