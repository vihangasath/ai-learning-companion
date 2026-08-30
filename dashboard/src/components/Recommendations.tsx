const items = [
  { title:"Neural Networks basics", subject:"CS", time:"45 min", level:"Beginner", accent:"#7c3aed", bg:"#ede9fe", match:98 },
  { title:"Linear algebra for ML", subject:"Math", time:"30 min", level:"Intermediate", accent:"#2563eb", bg:"#dbeafe", match:94 },
  { title:"Quantum mechanics intro", subject:"Physics", time:"60 min", level:"Advanced", accent:"#059669", bg:"#d1fae5", match:87 },
]
export default function Recommendations({ theme }: any) {
  const { card, border, text, muted, sub } = theme
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
        <div>
          <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Recommended For You</div>
          <div style={{color:muted,fontSize:"12px"}}>Matched to your learning pattern</div>
        </div>
        <span style={{fontSize:"12px",color:"#7c3aed",fontWeight:500,cursor:"pointer"}}>See all →</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {items.map(item => (
          <div key={item.title} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"12px",background:sub,border:`1px solid ${border}`,cursor:"pointer"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"18px"}}>📚</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:text,fontSize:"13px",fontWeight:500,marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
              <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                <span style={{fontSize:"11px",color:muted}}>{item.subject}</span>
                <span style={{fontSize:"10px",color:border}}>·</span>
                <span style={{fontSize:"11px",color:muted}}>{item.time}</span>
                <span style={{fontSize:"10px",color:border}}>·</span>
                <span style={{fontSize:"11px",color:item.accent,fontWeight:600,background:item.bg,padding:"1px 7px",borderRadius:"5px"}}>{item.level}</span>
              </div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:"14px",fontWeight:700,color:item.accent}}>{item.match}%</div>
              <div style={{fontSize:"10px",color:muted}}>match</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
