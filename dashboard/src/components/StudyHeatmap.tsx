const lightColors = ["#f4f2fa","#ddd6fe","#a78bfa","#7c3aed","#4c1d95"]
const cells = Array.from({ length: 70 }, () => {
  const r = Math.random(); return r<0.3?0:r<0.55?1:r<0.75?2:r<0.9?3:4
})
const activeDays = cells.filter(c=>c>0).length
export default function StudyHeatmap({ theme }: any) {
  const { card, border, text, muted } = theme
  const pct = Math.round((activeDays/70)*100)
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"16px"}}>
        <div>
          <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Study Consistency</div>
          <div style={{color:muted,fontSize:"12px"}}>Last 70 days of learning activity</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:"20px",fontWeight:700,color:"#7c3aed"}}>{pct}%</div>
          <div style={{fontSize:"11px",color:muted}}>Consistency</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:"5px",marginBottom:"12px"}}>
        {cells.map((level,i) => (
          <div key={i} title={`Day ${i+1}`} style={{height:"18px",borderRadius:"4px",background:lightColors[level],transition:"transform 0.1s",cursor:"pointer"}}/>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
          <span style={{fontSize:"11px",color:muted}}>Less</span>
          {lightColors.map((c,i)=><div key={i} style={{width:"11px",height:"11px",borderRadius:"3px",background:c,border:"1px solid #ede9fe"}}/>)}
          <span style={{fontSize:"11px",color:muted}}>More</span>
        </div>
        <span style={{fontSize:"11px",color:muted}}>{activeDays}/70 active days</span>
      </div>
    </div>
  )
}
