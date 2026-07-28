const items = [
  { accent:"#7c3aed", bg:"#ede9fe", icon:"▶", title:"Gradient Descent explained", meta:"CS · Today 9:14 AM · 32 min", tag:"Video" },
  { accent:"#059669", bg:"#d1fae5", icon:"✓", title:"Calculus basics quiz", meta:"Math · Today 8:30 AM · 88%", tag:"Quiz" },
  { accent:"#2563eb", bg:"#dbeafe", icon:"⟳", title:"Linear Algebra flashcards", meta:"Math · Yesterday · 20 cards", tag:"Flashcard" },
  { accent:"#ea580c", bg:"#fff7ed", icon:"▶", title:"Python for Data Science", meta:"CS · Yesterday · 48 min", tag:"Video" },
]
export default function RecentActivity({ theme }: any) {
  const { card, border, text, muted, sub } = theme
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
        <div>
          <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Recent Activity</div>
          <div style={{color:muted,fontSize:"12px"}}>Your latest learning sessions</div>
        </div>
        <span style={{fontSize:"12px",color:"#7c3aed",fontWeight:500,cursor:"pointer"}}>See all →</span>
      </div>
      <div>
        {items.map((item,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:i<items.length-1?`1px solid ${border}`:"none"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"10px",background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"14px",color:item.accent,fontWeight:700}}>{item.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:text,fontSize:"13px",fontWeight:500,marginBottom:"2px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
              <div style={{fontSize:"11px",color:muted}}>{item.meta}</div>
            </div>
            <span style={{fontSize:"11px",fontWeight:600,padding:"3px 9px",borderRadius:"6px",background:item.bg,color:item.accent,flexShrink:0}}>{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
