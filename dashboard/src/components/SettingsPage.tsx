import { useState } from "react"
export default function SettingsPage({ theme }: any) {
  const { card, border, text, muted, dark, setDark } = theme
  const [notif, setNotif] = useState({ reminders:true, streak:true, weekly:false })
  const [goal, setGoal] = useState("2 hours")
  const [diff, setDiff] = useState("Intermediate")
  const Toggle = ({ on, onClick }: any) => (
    <div onClick={onClick} style={{width:"42px",height:"24px",borderRadius:"12px",background:on?"#0ea5e9":"#cbd5e1",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:"3px",left:on?"21px":"3px",width:"18px",height:"18px",borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
    </div>
  )
  const Row = ({ label, desc, control }: any) => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",borderBottom:`1px solid ${border}`}}>
      <div>
        <div style={{color:text,fontWeight:500,fontSize:"14px"}}>{label}</div>
        <div style={{color:muted,fontSize:"12px",marginTop:"2px"}}>{desc}</div>
      </div>
      {control}
    </div>
  )
  const sel = (val: string, opts: string[], onChange: any) => (
    <select value={val} onChange={e => onChange(e.target.value)} style={{border:`1px solid ${border}`,borderRadius:"8px",padding:"7px 12px",fontSize:"13px",background:card,color:text,cursor:"pointer",outline:"none"}}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  )
  return (
    <div style={{width:"100%",maxWidth:"100%"}}>
      <div style={{marginBottom:"24px"}}>
        <div style={{fontSize:"22px",fontWeight:700,color:text}}>Settings</div>
        <div style={{fontSize:"13px",color:muted,marginTop:"4px"}}>Manage your account preferences</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
        <div style={{background:card,borderRadius:"14px",border:`1px solid ${border}`,padding:"24px"}}>
          <div style={{fontSize:"11px",color:muted,fontWeight:600,letterSpacing:"0.8px",marginBottom:"4px"}}>APPEARANCE</div>
          <Row label="Dark mode" desc="Switch between light and dark theme" control={<Toggle on={dark} onClick={() => setDark(!dark)}/>}/>
          <Row label="Compact view" desc="Show more content with reduced spacing" control={<Toggle on={false} onClick={()=>{}}/>}/>
          <div style={{fontSize:"11px",color:muted,fontWeight:600,letterSpacing:"0.8px",marginTop:"20px",marginBottom:"4px"}}>LEARNING</div>
          <Row label="Daily goal" desc="Set your daily study time target" control={sel(goal,["30 minutes","1 hour","2 hours","3 hours"],setGoal)}/>
          <Row label="Difficulty" desc="Default difficulty for new content" control={sel(diff,["Beginner","Intermediate","Advanced"],setDiff)}/>
        </div>
        <div style={{background:card,borderRadius:"14px",border:`1px solid ${border}`,padding:"24px"}}>
          <div style={{fontSize:"11px",color:muted,fontWeight:600,letterSpacing:"0.8px",marginBottom:"4px"}}>NOTIFICATIONS</div>
          <Row label="Study reminders" desc="Get reminded to study every day" control={<Toggle on={notif.reminders} onClick={() => setNotif(n=>({...n,reminders:!n.reminders}))}/>}/>
          <Row label="Streak alerts" desc="Notify when your streak is at risk" control={<Toggle on={notif.streak} onClick={() => setNotif(n=>({...n,streak:!n.streak}))}/>}/>
          <Row label="Weekly summary" desc="Receive a weekly progress email" control={<Toggle on={notif.weekly} onClick={() => setNotif(n=>({...n,weekly:!n.weekly}))}/>}/>
          <div style={{fontSize:"11px",color:muted,fontWeight:600,letterSpacing:"0.8px",marginTop:"20px",marginBottom:"4px"}}>ACCOUNT</div>
          <Row label="Language" desc="Choose your preferred language" control={sel("English",["English","Sinhala","Tamil"],(v:any)=>{})}/>
          <Row label="Timezone" desc="Your local timezone" control={sel("Asia/Colombo",["Asia/Colombo","UTC","Asia/Singapore"],(v:any)=>{})}/>
        </div>
      </div>
    </div>
  )
}
