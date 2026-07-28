import { useState } from "react"
import Card from "../components/Card"
const items = [
  { title:"Neural Networks & Deep Learning",sub:"Computer Science",time:"4h 30min",level:"Beginner",match:98,color:"#14b8a6",rating:4.8,enrolled:12400 },
  { title:"Linear Algebra for Machine Learning",sub:"Mathematics",time:"3h 15min",level:"Intermediate",match:94,color:"#3b82f6",rating:4.7,enrolled:8900 },
  { title:"Quantum Mechanics Fundamentals",sub:"Physics",time:"5h",level:"Advanced",match:87,color:"#8b5cf6",rating:4.6,enrolled:5300 },
  { title:"Advanced Python & Data Science",sub:"Computer Science",time:"6h",level:"Intermediate",match:91,color:"#22c55e",rating:4.9,enrolled:21000 },
  { title:"Statistical Analysis Basics",sub:"Mathematics",time:"2h 45min",level:"Beginner",match:85,color:"#f59e0b",rating:4.5,enrolled:7600 },
  { title:"Organic Chemistry Reactions",sub:"Chemistry",time:"4h",level:"Intermediate",match:82,color:"#ec4899",rating:4.4,enrolled:4100 },
]
const tabs = ["All","CS","Mathematics","Physics","Chemistry"]
const diffColor: Record<string,string> = { Beginner:"#22c55e",Intermediate:"#f59e0b",Advanced:"#ef4444" }

export default function RecommendationsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover } = theme
  const [tab, setTab] = useState("All")
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div>
          <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Recommendations</h1>
          <p style={{ fontSize:"13px",color:textSec }}>Curated courses based on your learning history</p>
        </div>
        <div style={{ display:"flex",gap:"4px" }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"6px 12px",borderRadius:"6px",border:`1px solid ${tab===t?accent:border}`,color:tab===t?accent:muted,fontSize:"12px",cursor:"pointer",background:tab===t?`${accent}10`:"transparent",fontWeight:tab===t?"500":"400" }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px" }}>
        {items.map(item=>(
          <Card key={item.title} theme={theme} style={{ cursor:"pointer" }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:"10px",marginBottom:"12px" }}>
              <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:item.color,flexShrink:0,marginTop:"5px" }}/>
              <div style={{ flex:1 }}>
                <div style={{ color:text,fontWeight:"500",fontSize:"13px",lineHeight:1.4,marginBottom:"3px" }}>{item.title}</div>
                <div style={{ fontSize:"11px",color:muted }}>{item.sub}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap" }}>
              <span style={{ fontSize:"11px",color:muted }}>{item.time}</span>
              <span style={{ fontSize:"10px",color:muted }}>·</span>
              <span style={{ fontSize:"11px",color:diffColor[item.level],fontWeight:"500" }}>{item.level}</span>
              <span style={{ fontSize:"10px",color:muted }}>·</span>
              <span style={{ fontSize:"11px",color:muted }}>⭐ {item.rating}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:"6px",background:hover,border:`1px solid ${border}` }}>
              <span style={{ fontSize:"12px",color:item.color,fontWeight:"600" }}>{item.match}% match</span>
              <span style={{ fontSize:"11px",color:muted }}>{(item.enrolled/1000).toFixed(1)}k enrolled</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
