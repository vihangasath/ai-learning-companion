import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import Card from "../components/Card"

const radar = [
  { subject:"Math",score:82 },{ subject:"Physics",score:74 },{ subject:"CS",score:91 },
  { subject:"History",score:65 },{ subject:"Chemistry",score:77 },{ subject:"English",score:88 },
]
const quizTrend = [
  { week:"W1",score:72 },{ week:"W2",score:78 },{ week:"W3",score:75 },{ week:"W4",score:83 },
  { week:"W5",score:81 },{ week:"W6",score:88 },{ week:"W7",score:84 },{ week:"W8",score:91 },
]
const subjects = [
  { name:"Computer Science",score:91,trend:"+4%",color:"#14b8a6" },
  { name:"Mathematics",score:82,trend:"+7%",color:"#3b82f6" },
  { name:"Physics",score:74,trend:"+2%",color:"#8b5cf6" },
  { name:"History",score:65,trend:"-1%",color:"#f59e0b" },
  { name:"Chemistry",score:77,trend:"+5%",color:"#22c55e" },
  { name:"English",score:88,trend:"+3%",color:"#ec4899" },
]

export default function PerformancePage({ theme }: any) {
  const { text, textSec, muted, accent, border, card, dark } = theme
  const tip = { background: card, border: `1px solid ${border}`, borderRadius: "8px", color: text, fontSize: "12px" }
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div>
        <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Performance</h1>
        <p style={{ fontSize:"13px",color:textSec }}>Track your quiz scores and subject mastery levels</p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"2px" }}>Skill Radar</div>
          <div style={{ fontSize:"12px",color:muted,marginBottom:"12px" }}>Mastery across all subjects</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radar}>
              <PolarGrid stroke={dark?"rgba(255,255,255,0.06)":"#e4e4e7"}/>
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:11,fill:muted }}/>
              <Radar dataKey="score" stroke={accent} fill={accent} fillOpacity={0.15} strokeWidth={2}/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"2px" }}>Quiz Score Trend</div>
          <div style={{ fontSize:"12px",color:muted,marginBottom:"16px" }}>Weekly average over 8 weeks</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={quizTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark?"rgba(255,255,255,0.04)":"#f4f4f5"} vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize:11,fill:muted }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11,fill:muted }} axisLine={false} tickLine={false} domain={[60,100]}/>
              <Tooltip contentStyle={tip} formatter={(v:any)=>[v+"%","Score"]}/>
              <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={2} dot={{ fill:accent,r:4,stroke:card,strokeWidth:2 }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <Card theme={theme}>
        <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"16px" }}>Subject Breakdown</div>
        <div style={{ display:"flex",flexDirection:"column",gap:"12px" }}>
          {subjects.map(s=>(
            <div key={s.name} style={{ display:"flex",alignItems:"center",gap:"12px" }}>
              <div style={{ width:"136px",fontSize:"13px",color:text,flexShrink:0 }}>{s.name}</div>
              <div style={{ flex:1,height:"6px",background:dark?"rgba(255,255,255,0.06)":"#f4f4f5",borderRadius:"3px",overflow:"hidden" }}>
                <div style={{ height:"6px",width:`${s.score}%`,background:s.color,borderRadius:"3px",transition:"width 0.5s" }}/>
              </div>
              <div style={{ width:"32px",fontSize:"13px",fontWeight:"500",color:text,textAlign:"right",flexShrink:0 }}>{s.score}%</div>
              <div style={{ width:"36px",fontSize:"12px",color:s.trend.startsWith("+")?"#22c55e":"#ef4444",flexShrink:0 }}>{s.trend}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
