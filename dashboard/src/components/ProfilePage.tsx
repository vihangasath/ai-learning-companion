export default function ProfilePage({ theme }: any) {
  const { card, border, text, muted, dark } = theme
  const stat = (label: string, value: string, color: string) => (
    <div style={{textAlign:"center",padding:"16px 8px"}}>
      <div style={{fontSize:"22px",fontWeight:700,color}}>{value}</div>
      <div style={{fontSize:"12px",color:muted,marginTop:"4px"}}>{label}</div>
    </div>
  )
  const badge = (label: string, color: string, bg: string) => (
    <span style={{display:"inline-flex",alignItems:"center",padding:"5px 12px",borderRadius:"20px",background:bg,color,fontSize:"12px",fontWeight:500,margin:"3px"}}>
      {label}
    </span>
  )
  return (
    <div style={{width:"100%",maxWidth:"100%"}}>
      <div style={{marginBottom:"24px"}}>
        <div style={{fontSize:"22px",fontWeight:700,color:text}}>Profile</div>
        <div style={{fontSize:"13px",color:muted,marginTop:"4px"}}>Your learning identity and achievements</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"20px"}}>
        <div style={{background:card,borderRadius:"14px",border:`1px solid ${border}`,padding:"28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"20px"}}>
            <div style={{width:"68px",height:"68px",borderRadius:"50%",background:"linear-gradient(135deg,#0ea5e9,#10b981)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"22px",fontWeight:700,flexShrink:0}}>VS</div>
            <div>
              <div style={{fontSize:"18px",fontWeight:700,color:text}}>Vihanga Sathsara</div>
              <div style={{fontSize:"13px",color:muted,marginTop:"2px"}}>Student · Member since Jan 2025</div>
            </div>
          </div>
          <div style={{marginBottom:"20px"}}>
            {badge("🔥 12-day streak","#b45309","#fffbeb")}
            {badge("⭐ Top learner","#0369a1","#e0f2fe")}
            {badge("🎯 Goal crusher","#065f46","#d1fae5")}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:`1px solid ${border}`,paddingTop:"4px"}}>
            {stat("Total hours","142h","#0ea5e9")}
            {stat("Videos","89","#10b981")}
            {stat("Quizzes","34","#f59e0b")}
            {stat("Avg score","84%","#06b6d4")}
          </div>
        </div>
        <div style={{background:card,borderRadius:"14px",border:`1px solid ${border}`,padding:"24px"}}>
          <div style={{fontSize:"14px",fontWeight:600,color:text,marginBottom:"16px"}}>Account details</div>
          {[["Full name","Vihanga Sathsara"],["Email","vihanga@student.com"],["University","University of Colombo"],["Course","Computer Science"],["Student ID","CS/2022/001"]].map(([label,val]) => (
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${border}`}}>
              <div style={{fontSize:"13px",color:muted}}>{label}</div>
              <div style={{fontSize:"13px",color:text,fontWeight:500}}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:card,borderRadius:"14px",border:`1px solid ${border}`,padding:"24px"}}>
        <div style={{fontSize:"14px",fontWeight:600,color:text,marginBottom:"16px"}}>Subject performance</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {[["Computer Science",91,"#0ea5e9"],["Mathematics",82,"#10b981"],["Physics",74,"#06b6d4"],["History",65,"#14b8a6"]].map(([sub,pct,color]) => (
            <div key={sub as string}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontSize:"13px",color:text,fontWeight:500}}>{sub as string}</span>
                <span style={{fontSize:"13px",color:muted}}>{pct}%</span>
              </div>
              <div style={{height:"6px",background:dark?"#1e2d3d":"#f1f5f9",borderRadius:"3px",overflow:"hidden"}}>
                <div style={{height:"6px",width:`${pct}%`,background:color as string,borderRadius:"3px",transition:"width 0.5s"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
