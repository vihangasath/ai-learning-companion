import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
const data = [{ name:"CS",value:38 },{ name:"Math",value:27 },{ name:"Physics",value:20 },{ name:"History",value:15 }]
const COLORS = ["#7c3aed","#2563eb","#059669","#ea580c"]
export default function TopicDonut({ theme }: any) {
  const { card, border, text, muted } = theme
  return (
    <div style={{background:card,borderRadius:"16px",border:`1px solid ${border}`,padding:"20px 22px",boxShadow:"0 1px 3px rgba(124,58,237,0.06)"}}>
      <div style={{color:text,fontWeight:600,fontSize:"15px",marginBottom:"2px"}}>Topic Distribution</div>
      <div style={{color:muted,fontSize:"12px",marginBottom:"8px"}}>Time spent per subject this month</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
            {data.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
          </Pie>
          <Tooltip contentStyle={{ background:card,border:`1px solid ${border}`,borderRadius:10,color:text,fontSize:12 }} formatter={(v:any)=>[v+"%","Share"]}/>
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:12,color:muted }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
