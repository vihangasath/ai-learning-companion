import { useState } from "react"
import Card from "../components/Card"
const bookmarks = [
  { title:"Attention Is All You Need",type:"Paper",sub:"AI Research · Saved 2 days ago",color:"#14b8a6" },
  { title:"3Blue1Brown - Neural Networks",type:"Video",sub:"CS · 1h 4min · YouTube",color:"#3b82f6" },
  { title:"MIT 18.06 Linear Algebra",type:"Course",sub:"Math · MIT OpenCourseWare",color:"#8b5cf6" },
  { title:"The Elements of Statistical Learning",type:"Book",sub:"Statistics · PDF · 745 pages",color:"#22c55e" },
  { title:"CS50 Intro to Computer Science",type:"Course",sub:"CS · Harvard · 10 weeks",color:"#f59e0b" },
  { title:"Feynman Lectures on Physics",type:"Book",sub:"Physics · PDF · 560 pages",color:"#ec4899" },
  { title:"Khan Academy Multivariable Calculus",type:"Course",sub:"Math · Free · Self-paced",color:"#06b6d4" },
  { title:"Deep Learning — Goodfellow et al.",type:"Book",sub:"CS · MIT Press · 800 pages",color:"#14b8a6" },
]
const filters = ["All","Video","Course","Paper","Book"]

export default function BookmarksPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover } = theme
  const [f, setF] = useState("All")
  const shown = f === "All" ? bookmarks : bookmarks.filter(b => b.type === f)
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div>
          <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Bookmarks</h1>
          <p style={{ fontSize:"13px",color:textSec }}>Your saved resources and study materials</p>
        </div>
        <div style={{ display:"flex",gap:"4px" }}>
          {filters.map(fi=>(
            <button key={fi} onClick={()=>setF(fi)} style={{ padding:"6px 12px",borderRadius:"6px",border:`1px solid ${f===fi?accent:border}`,color:f===fi?accent:muted,fontSize:"12px",cursor:"pointer",background:f===fi?`${accent}10`:"transparent",fontWeight:f===fi?"500":"400" }}>{fi}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"10px" }}>
        {shown.map((b,i)=>(
          <Card key={i} theme={theme} style={{ display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",padding:"14px 16px" }}>
            <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:b.color,flexShrink:0 }}/>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:text,fontSize:"13px",fontWeight:"500",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{b.title}</div>
              <div style={{ fontSize:"11px",color:muted,marginTop:"2px" }}>{b.sub}</div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"6px",flexShrink:0 }}>
              <span style={{ fontSize:"10px",color:b.color,background:`${b.color}15`,padding:"2px 7px",borderRadius:"4px",fontWeight:"500" }}>{b.type}</span>
              <span style={{ fontSize:"11px",color:muted,cursor:"pointer" }}>✕</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
