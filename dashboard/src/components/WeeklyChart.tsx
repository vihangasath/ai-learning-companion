import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
const data = [
  { day:"Mon",hours:1.8,goal:2 },{ day:"Tue",hours:2.5,goal:2 },{ day:"Wed",hours:1.2,goal:2 },
  { day:"Thu",hours:3.1,goal:2 },{ day:"Fri",hours:2.8,goal:2 },{ day:"Sat",hours:1.5,goal:2 },{ day:"Sun",hours:1.6,goal:2 },
]
export default function WeeklyChart({ theme }: any) {
  const { card, border, text, muted } = theme
  const total = data.reduce((a,b)=>a+b.hours,0).toFixed(1)
  const best = data.reduce((a,b)=>a.hours>b.hours?a:b)
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"16px"}}>
        <div>
          <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Weekly Study Activity</div>
          <div style={{color:muted,fontSize:"12px"}}>Hours per day vs your 2h goal</div>
        </div>
        <div style={{display:"flex",gap:"20px"}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"18px",fontWeight:700,color:"#7c3aed"}}>{total}h</div>
            <div style={{fontSize:"11px",color:muted}}>Total</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"18px",fontWeight:700,color:"#059669"}}>{best.day}</div>
            <div style={{fontSize:"11px",color:muted}}>Best day</div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0edf8" vertical={false}/>
          <XAxis dataKey="day" tick={{ fontSize:11,fill:muted }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize:11,fill:muted }} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{ background:card,border:`1px solid ${border}`,borderRadius:10,color:text,fontSize:12,boxShadow:"0 8px 24px rgba(124,58,237,0.12)" }} formatter={(v:any,n:string)=>[v+"h",n==="hours"?"Study time":"Goal"]}/>
          <Area type="monotone" dataKey="goal" stroke="#059669" strokeWidth={1.5} strokeDasharray="5 3" fill="none" dot={false}/>
          <Area type="monotone" dataKey="hours" stroke="#7c3aed" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill:"#7c3aed",r:4,strokeWidth:2,stroke:"#fff" }} activeDot={{ r:6,fill:"#7c3aed",stroke:"#fff",strokeWidth:2 }}/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{display:"flex",gap:"20px",marginTop:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"14px",height:"3px",background:"#7c3aed",borderRadius:"2px"}}/><span style={{fontSize:"11px",color:muted}}>Study time</span></div>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}><div style={{width:"14px",height:"0",border:"1.5px dashed #059669"}}/><span style={{fontSize:"11px",color:muted}}>Daily goal</span></div>
      </div>
    </div>
  )
}
