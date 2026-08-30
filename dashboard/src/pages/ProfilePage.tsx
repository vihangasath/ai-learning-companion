import Card from "../components/Card"
const subjects = [
  { name:"Computer Science",score:91,color:"#14b8a6" },
  { name:"Mathematics",score:82,color:"#3b82f6" },
  { name:"Physics",score:74,color:"#8b5cf6" },
  { name:"History",score:65,color:"#f59e0b" },
  { name:"Chemistry",score:77,color:"#22c55e" },
  { name:"English",score:88,color:"#ec4899" },
]
const achievements = [
  { name:"12-Day Streak",desc:"Studied 12 days in a row",color:"#f59e0b" },
  { name:"Top Learner",desc:"Top 5% this month",color:"#14b8a6" },
  { name:"Quiz Master",desc:"90%+ on 5 consecutive quizzes",color:"#3b82f6" },
  { name:"Bookworm",desc:"Saved 8+ resources",color:"#8b5cf6" },
  { name:"Speed Learner",desc:"3 courses in one week",color:"#22c55e" },
  { name:"Goal Crusher",desc:"Daily goal for 30 days",color:"#ec4899" },
]
const recentActivity = [
  { date:"Today", events:["Watched Gradient Descent — 32 min","Quiz: Calculus Basics — 88%"] },
  { date:"Yesterday", events:["Flashcards: Linear Algebra — 20 cards","Watched Python DS — 48 min"] },
  { date:"2 days ago", events:["Quiz: Data Structures — 92%","Bookmarked MIT 18.06 Lectures"] },
]

export default function ProfilePage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover } = theme
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"16px",paddingBottom:"16px" }}>
      <div>
        <h1 style={{ fontSize:"22px",fontWeight:"600",color:text,letterSpacing:"-0.03em",marginBottom:"4px" }}>Profile</h1>
        <p style={{ fontSize:"13px",color:textSec }}>Your learning identity and achievements</p>
      </div>

      <Card theme={theme}>
        <div style={{ display:"flex",alignItems:"center",gap:"18px",marginBottom:"20px" }}>
          <div style={{ width:"64px",height:"64px",borderRadius:"50%",background:`linear-gradient(135deg,${accent},#3b82f6)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"20px",fontWeight:"700",flexShrink:0 }}>KP</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"18px",fontWeight:"600",color:text,letterSpacing:"-0.02em" }}>Kasun Perera</div>
            <div style={{ fontSize:"13px",color:muted,marginTop:"3px" }}>Computer Science · University of Colombo · Since Jan 2025</div>
            <div style={{ display:"flex",gap:"6px",marginTop:"8px" }}>
              {["🔥 Streak","⭐ Top 5%","🎯 Goal"].map(b=>(
                <span key={b} style={{ fontSize:"11px",color:accent,background:`${accent}12`,padding:"3px 8px",borderRadius:"4px",fontWeight:"500" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",borderTop:`1px solid ${border}`,paddingTop:"16px" }}>
          {[["142h","Total hours","#14b8a6"],["89","Videos","#3b82f6"],["34","Quizzes","#8b5cf6"],["84%","Avg score","#22c55e"],["12","Day streak","#f59e0b"]].map(([v,l,c])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"20px",fontWeight:"600",color:c as string,letterSpacing:"-0.03em" }}>{v}</div>
              <div style={{ fontSize:"11px",color:muted,marginTop:"3px" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"14px" }}>Subject Performance</div>
          {subjects.map(s=>(
            <div key={s.name} style={{ marginBottom:"10px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"5px" }}>
                <span style={{ fontSize:"12px",color:text }}>{s.name}</span>
                <span style={{ fontSize:"12px",color:muted }}>{s.score}%</span>
              </div>
              <div style={{ height:"5px",background:dark?"rgba(255,255,255,0.06)":"#f4f4f5",borderRadius:"3px",overflow:"hidden" }}>
                <div style={{ height:"5px",width:`${s.score}%`,background:s.color,borderRadius:"3px" }}/>
              </div>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"14px" }}>Achievements</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px" }}>
            {achievements.map(a=>(
              <div key={a.name} style={{ padding:"10px 12px",borderRadius:"8px",border:`1px solid ${border}`,background:hover }}>
                <div style={{ width:"24px",height:"24px",borderRadius:"50%",background:`${a.color}18`,marginBottom:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <div style={{ width:"8px",height:"8px",borderRadius:"50%",background:a.color }}/>
                </div>
                <div style={{ fontSize:"12px",fontWeight:"500",color:text,marginBottom:"2px" }}>{a.name}</div>
                <div style={{ fontSize:"11px",color:muted,lineHeight:1.4 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card theme={theme}>
        <div style={{ fontSize:"14px",fontWeight:"500",color:text,marginBottom:"14px" }}>Recent Activity</div>
        {recentActivity.map(day=>(
          <div key={day.date} style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"11px",color:accent,fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px" }}>{day.date}</div>
            {day.events.map((e,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"7px 10px",borderRadius:"6px",marginBottom:"4px",background:hover }}>
                <div style={{ width:"5px",height:"5px",borderRadius:"50%",background:accent,flexShrink:0 }}/>
                <span style={{ fontSize:"12px",color:text }}>{e}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  )
}
