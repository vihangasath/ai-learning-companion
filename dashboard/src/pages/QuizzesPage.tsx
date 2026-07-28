import { useState } from "react"
import Card from "../components/Card"
const quizzes = [
  { name:"Machine Learning Basics",questions:10,time:"15 min",difficulty:"Beginner",score:88,done:true,color:"#14b8a6" },
  { name:"Calculus Derivatives",questions:15,time:"20 min",difficulty:"Intermediate",score:76,done:true,color:"#3b82f6" },
  { name:"Quantum Mechanics",questions:8,time:"12 min",difficulty:"Advanced",score:null,done:false,color:"#8b5cf6" },
  { name:"Data Structures",questions:12,time:"18 min",difficulty:"Intermediate",score:92,done:true,color:"#22c55e" },
  { name:"World War II",questions:20,time:"25 min",difficulty:"Beginner",score:null,done:false,color:"#f59e0b" },
  { name:"Python Advanced",questions:10,time:"15 min",difficulty:"Advanced",score:84,done:true,color:"#ec4899" },
]
const sampleQ = { question:"What is the time complexity of binary search?",options:["O(n)","O(log n)","O(n²)","O(1)"],correct:1 }
const diffColor: Record<string,string> = { Beginner:"#22c55e",Intermediate:"#f59e0b",Advanced:"#ef4444" }

export default function QuizzesPage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover, card: cardBg } = theme
  const [sel, setSel] = useState<number|null>(null)
  const [answered, setAnswered] = useState(false)
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div>
        <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Quizzes</h1>
        <p style={{ fontSize:"13px",color:textSec }}>Test your knowledge and track your scores</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px" }}>
        {quizzes.map(q=>(
          <Card key={q.name} theme={theme} style={{ cursor:"pointer" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px" }}>
              <div style={{ fontSize:"13px",fontWeight:"500",color:text,flex:1,marginRight:"8px",lineHeight:1.4 }}>{q.name}</div>
              <span style={{ fontSize:"10px",color:diffColor[q.difficulty],background:`${diffColor[q.difficulty]}15`,padding:"2px 6px",borderRadius:"4px",fontWeight:"500",flexShrink:0 }}>{q.difficulty}</span>
            </div>
            <div style={{ display:"flex",gap:"12px",marginBottom:"12px" }}>
              <span style={{ fontSize:"11px",color:muted }}>{q.questions} questions</span>
              <span style={{ fontSize:"11px",color:muted }}>{q.time}</span>
            </div>
            {q.done ? (
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:"6px",background:hover }}>
                <span style={{ fontSize:"11px",color:"#22c55e",fontWeight:"500" }}>✓ Completed</span>
                <span style={{ fontSize:"15px",fontWeight:"600",color:q.color }}>{q.score}%</span>
              </div>
            ) : (
              <div style={{ padding:"8px",borderRadius:"6px",background:`${q.color}15`,color:q.color,fontSize:"12px",fontWeight:"500",textAlign:"center" }}>Start quiz →</div>
            )}
          </Card>
        ))}
      </div>
      <Card theme={theme}>
        <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"2px" }}>Sample Question</div>
        <div style={{ fontSize:"12px",color:muted,marginBottom:"16px" }}>Data Structures · Question 1 of 12</div>
        <div style={{ color:text,fontSize:"14px",fontWeight:"500",marginBottom:"16px",lineHeight:1.5 }}>{sampleQ.question}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:"6px",marginBottom:"14px" }}>
          {sampleQ.options.map((opt,i)=>{
            const isSelected=sel===i
            const isCorrect=answered&&i===sampleQ.correct
            const isWrong=answered&&isSelected&&i!==sampleQ.correct
            return (
              <div key={i} onClick={()=>{if(!answered)setSel(i)}}
                style={{ padding:"10px 14px",borderRadius:"8px",border:`1px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":isSelected?accent:border}`,background:isCorrect?"rgba(34,197,94,0.08)":isWrong?"rgba(239,68,68,0.08)":isSelected?`${accent}0d`:"transparent",cursor:"pointer",color:text,fontSize:"13px",transition:"all 0.1s" }}>
                <span style={{ color:muted,marginRight:"10px" }}>{String.fromCharCode(65+i)}.</span>{opt}
              </div>
            )
          })}
        </div>
        <div style={{ display:"flex",gap:"8px" }}>
          {!answered&&sel!==null&&<button onClick={()=>setAnswered(true)} style={{ padding:"8px 16px",borderRadius:"6px",border:"none",background:accent,color:"#042f2e",cursor:"pointer",fontSize:"12px",fontWeight:"600" }}>Submit</button>}
          {answered&&<button onClick={()=>{setAnswered(false);setSel(null)}} style={{ padding:"8px 16px",borderRadius:"6px",border:`1px solid ${accent}`,background:"transparent",color:accent,cursor:"pointer",fontSize:"12px",fontWeight:"500" }}>Next →</button>}
        </div>
      </Card>
    </div>
  )
}
