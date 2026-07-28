import { useState } from "react"
import Card from "../components/Card"
const results = [
  { title:"Introduction to Machine Learning",type:"Course",sub:"CS · 4.5h · Beginner",color:"#14b8a6" },
  { title:"Gradient Descent Algorithm",type:"Video",sub:"CS · 32 min",color:"#3b82f6" },
  { title:"Linear Algebra Flashcards",type:"Flashcard",sub:"Math · 38 cards",color:"#8b5cf6" },
  { title:"Calculus Quiz - Derivatives",type:"Quiz",sub:"Math · 15 questions",color:"#22c55e" },
  { title:"Python Data Structures",type:"Course",sub:"CS · 3h · Intermediate",color:"#f59e0b" },
  { title:"Quantum Wave Functions",type:"Video",sub:"Physics · 48 min",color:"#ec4899" },
]
const recent = ["machine learning","neural networks","calculus derivatives","python basics"]
const trending = ["Transformer models","Quantum computing","Linear regression","Big O notation","Thermodynamics"]

export default function SearchPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [query, setQuery] = useState("")
  const filtered = query.length > 1 ? results.filter(r => r.title.toLowerCase().includes(query.toLowerCase())) : []
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div>
        <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Search</h1>
        <p style={{ fontSize:"13px",color:textSec }}>Find courses, videos, quizzes and flashcards</p>
      </div>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute",left:"13px",top:"50%",transform:"translateY(-50%)",color:muted,fontSize:"13px" }}>🔍</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search topics, courses, videos..."
          style={{ width:"100%",padding:"10px 12px 10px 38px",borderRadius:"8px",border:`1px solid ${border}`,background:inputBg,color:text,fontSize:"13px",outline:"none" }}/>
      </div>
      {query.length > 1 ? (
        <Card theme={theme}>
          <div style={{ fontSize:"13px",color:muted,marginBottom:"12px" }}>{filtered.length} results for &quot;{query}&quot;</div>
          {filtered.length === 0 ? (
            <div style={{ color:muted,fontSize:"13px",textAlign:"center",padding:"20px" }}>No results. Try a different keyword.</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:"6px" }}>
              {filtered.map((r,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"8px",background:hover,cursor:"pointer" }}>
                  <div style={{ width:"6px",height:"6px",borderRadius:"50%",background:r.color,flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ color:text,fontSize:"13px",fontWeight:"500" }}>{r.title}</div>
                    <div style={{ fontSize:"11px",color:muted }}>{r.sub}</div>
                  </div>
                  <span style={{ fontSize:"10px",color:r.color,background:`${r.color}15`,padding:"2px 7px",borderRadius:"4px",fontWeight:"500",flexShrink:0 }}>{r.type}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
          <Card theme={theme}>
            <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"12px" }}>Recent</div>
            {recent.map(r=>(
              <div key={r} onClick={()=>setQuery(r)} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"6px",cursor:"pointer",marginBottom:"2px" }}>
                <span style={{ color:muted,fontSize:"11px" }}>↺</span>
                <span style={{ color:text,fontSize:"13px" }}>{r}</span>
              </div>
            ))}
          </Card>
          <Card theme={theme}>
            <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"12px" }}>Trending</div>
            {trending.map((t,i)=>(
              <div key={t} onClick={()=>setQuery(t)} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"8px 10px",borderRadius:"6px",cursor:"pointer",marginBottom:"2px" }}>
                <span style={{ color:accent,fontSize:"11px",fontWeight:"600",width:"14px" }}>#{i+1}</span>
                <span style={{ color:text,fontSize:"13px" }}>{t}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
