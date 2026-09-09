import { useState } from "react"
import Card from "../components/Card"
import { useCurrentUser } from "../hooks/useCurrentUser"

function Toggle({ on, onClick, accent }: any) {
  return (
    <div onClick={onClick} style={{ width:"40px",height:"22px",borderRadius:"11px",background:on?accent:"rgba(113,113,122,0.3)",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:"3px",left:on?"21px":"3px",width:"16px",height:"16px",borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.25)" }}/>
    </div>
  )
}

export default function SettingsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, setDark, hover, inputBg } = theme
  const { user } = useCurrentUser()
  const [notif, setNotif] = useState({ reminders:true,streak:true,weekly:false,achievements:true })
  const [goal, setGoal] = useState("2 hours")
  const [diff, setDiff] = useState("Intermediate")
  const [lang, setLang] = useState("English")

  const Row = ({ label, desc, control }: any) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:`1px solid ${border}` }}>
      <div>
        <div style={{ color:text,fontWeight:"500",fontSize:"13px" }}>{label}</div>
        {desc && <div style={{ color:muted,fontSize:"12px",marginTop:"2px" }}>{desc}</div>}
      </div>
      {control}
    </div>
  )
  const Sel = ({ val, opts, onChange }: any) => (
    <select value={val} onChange={e=>onChange(e.target.value)} style={{ border:`1px solid ${border}`,borderRadius:"6px",padding:"6px 10px",fontSize:"12px",background:inputBg,color:text,cursor:"pointer",outline:"none" }}>
      {opts.map((o: string) => <option key={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ paddingBottom:"16px" }}>
      <div style={{ marginBottom:"20px" }}>
        <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Settings</h1>
        <p style={{ fontSize:"13px",color:textSec }}>Manage your account and preferences</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px" }}>
        <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
          <Card theme={theme}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px" }}>Appearance</div>
            <Row label="Dark mode" desc="Switch between light and dark" control={<Toggle on={dark} onClick={()=>setDark(!dark)} accent={accent}/>}/>
            <Row label="Compact view" desc="Reduce spacing density" control={<Toggle on={false} onClick={()=>{}} accent={accent}/>}/>
          </Card>
          <Card theme={theme}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px" }}>Learning</div>
            <Row label="Daily goal" desc="Target study hours" control={<Sel val={goal} opts={["30 min","1 hour","1.5 hours","2 hours","3 hours"]} onChange={setGoal}/>}/>
            <Row label="Difficulty" desc="Default content level" control={<Sel val={diff} opts={["Beginner","Intermediate","Advanced"]} onChange={setDiff}/>}/>
            <Row label="Language" desc="Interface language" control={<Sel val={lang} opts={["English","Sinhala","Tamil"]} onChange={setLang}/>}/>
          </Card>
          <Card theme={theme} style={{ padding:"16px" }}>
            <div style={{ fontSize:"12px",color:"#ef4444",fontWeight:"600",marginBottom:"8px" }}>Danger Zone</div>
            <div style={{ fontSize:"12px",color:muted,marginBottom:"10px" }}>These actions cannot be undone.</div>
            <div style={{ display:"flex",gap:"6px" }}>
              <button style={{ padding:"7px 12px",borderRadius:"6px",border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.06)",color:"#ef4444",fontSize:"12px",cursor:"pointer" }}>Reset Progress</button>
              <button style={{ padding:"7px 12px",borderRadius:"6px",border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.06)",color:"#ef4444",fontSize:"12px",cursor:"pointer" }}>Delete Account</button>
            </div>
          </Card>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"14px" }}>
          <Card theme={theme}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px" }}>Notifications</div>
            <Row label="Study reminders" desc="Daily reminder to study" control={<Toggle on={notif.reminders} onClick={()=>setNotif(n=>({...n,reminders:!n.reminders}))} accent={accent}/>}/>
            <Row label="Streak alerts" desc="Alert when streak at risk" control={<Toggle on={notif.streak} onClick={()=>setNotif(n=>({...n,streak:!n.streak}))} accent={accent}/>}/>
            <Row label="Weekly summary" desc="Progress email each week" control={<Toggle on={notif.weekly} onClick={()=>setNotif(n=>({...n,weekly:!n.weekly}))} accent={accent}/>}/>
            <Row label="Achievements" desc="Badge and milestone alerts" control={<Toggle on={notif.achievements} onClick={()=>setNotif(n=>({...n,achievements:!n.achievements}))} accent={accent}/>}/>
          </Card>
          <Card theme={theme}>
            <div style={{ fontSize:"11px",fontWeight:"600",color:accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px" }}>Account</div>
            <Row label="Full name" desc="" control={<div style={{ color:text,fontSize:"13px" }}>{user?.name ?? "—"}</div>}/>
            <Row label="Email" desc="" control={<div style={{ color:muted,fontSize:"13px" }}>{user?.email ?? "—"}</div>}/>
            <Row label="University" desc="" control={<div style={{ color:muted,fontSize:"13px" }}>—</div>}/>
            <Row label="Plan" desc="" control={<span style={{ fontSize:"11px",color:accent,background:`${accent}15`,padding:"2px 8px",borderRadius:"4px",fontWeight:"500" }}>Free</span>}/>
          </Card>
        </div>
      </div>
    </div>
  )
}
