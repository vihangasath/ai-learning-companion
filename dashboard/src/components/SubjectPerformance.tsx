import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts"
const data = [
  { subject:"CS",score:91 },
  { subject:"Math",score:82 },
  { subject:"Physics",score:74 },
  { subject:"History",score:65 },
]
const COLORS = ["#7c3aed","#2563eb","#059669","#ea580c"]
export default function SubjectPerformance({ theme }: any) {
  const { card, border, text, muted } = theme
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"16px"}}>
        <div>
          <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Subject Performance</div>
          <div style={{color:muted,fontSize:"12px"}}>Quiz accuracy this month</div>
        </div>
        <span style={{fontSize:"11px",color:"#7c3aed",fontWeight:600,background:"#ede9fe",padding:"3px 10px",borderRadius:"6px"}}>🏆 CS is top</span>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} layout="vertical" margin={{right:30}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0edf8" horizontal={false}/>
          <XAxis type="number" tick={{ fontSize:11,fill:muted }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>v+"%"}/>
          <YAxis type="category" dataKey="subject" tick={{ fontSize:13,fill:text,fontWeight:500 }} axisLine={false} tickLine={false} width={55}/>
          <Tooltip contentStyle={{ background:card,border:`1px solid ${border}`,borderRadius:10,color:text,fontSize:12 }} formatter={(v:any)=>[v+"%","Accuracy"]}/>
          <Bar dataKey="score" radius={[0,8,8,0]} barSize={18} label={{ position:"right",fontSize:11,fill:muted,formatter:(v:any)=>v+"%" }}>
            {data.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
