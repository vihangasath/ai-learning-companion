const cards = [
  { label:"Study Hours", value:"14.5h", delta:"+2.3h this week", up:true, emoji:"⏱️", accent:"#7c3aed", light:"#ede9fe", bar:72 },
  { label:"Day Streak", value:"12", unit:"days", delta:"Personal best!", up:true, emoji:"🔥", accent:"#ea580c", light:"#fff7ed", bar:80 },
  { label:"Videos Done", value:"23", unit:"videos", delta:"+5 from last week", up:true, emoji:"🎬", accent:"#059669", light:"#d1fae5", bar:58 },
  { label:"Avg Quiz Score", value:"84", unit:"%", delta:"+6% improvement", up:true, emoji:"🧠", accent:"#2563eb", light:"#dbeafe", bar:84 },
]
export default function OverviewCards({ theme }: any) {
  const { card, border, text, muted } = theme
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px"}}>
      {cards.map(c => (
        <div key={c.label} style={{background:card,borderRadius:"16px",padding:"18px 20px",border:`1px solid ${border}`,boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"10px",background:c.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>{c.emoji}</div>
            <span style={{fontSize:"11px",color:c.accent,fontWeight:600,background:c.light,padding:"3px 8px",borderRadius:"6px"}}>{c.up?"↑":"↓"} {c.delta.split(" ")[0]}</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:"3px",marginBottom:"10px"}}>
            <span style={{fontSize:"28px",fontWeight:700,color:text,lineHeight:1}}>{c.value}</span>
            {c.unit && <span style={{fontSize:"13px",color:muted,fontWeight:400}}>{c.unit}</span>}
          </div>
          <div style={{height:"4px",background:"#f0edf8",borderRadius:"2px",marginBottom:"6px",overflow:"hidden"}}>
            <div style={{height:"4px",width:`${c.bar}%`,background:c.accent,borderRadius:"2px"}}/>
          </div>
          <div style={{fontSize:"11px",color:muted}}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}
