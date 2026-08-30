export default function Topbar({ page, theme, onOpenVoiceModal }: any) {
  const { dark, border, text, textSec, muted, accent, setDark, inputBg } = theme
  return (
    <div style={{ height:"57px",background:dark?"#111113":"#ffffff",borderBottom:`1px solid ${border}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:"12px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"6px",flexShrink:0 }}>
        <span style={{ fontSize:"13px",color:muted }}>Pages</span>
        <span style={{ fontSize:"13px",color:muted }}>/</span>
        <span style={{ fontSize:"13px",color:text,fontWeight:"500" }}>{page}</span>
      </div>
      <div style={{ flex:1,maxWidth:"380px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"8px",background:inputBg,border:`1px solid ${border}`,borderRadius:"8px",padding:"7px 12px" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search courses, topics..." style={{ background:"transparent",border:"none",outline:"none",fontSize:"13px",color:text,width:"100%" }}/>
          <span style={{ fontSize:"10px",color:muted,background:dark?"rgba(255,255,255,0.06)":"#e4e4e7",padding:"2px 6px",borderRadius:"4px",flexShrink:0 }}>⌘K</span>
        </div>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:"8px",flexShrink:0 }}>
        <button
          onClick={onOpenVoiceModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: `${accent}18`,
            border: `1px solid ${accent}40`,
            borderRadius: "6px",
            padding: "5px 10px",
            color: accent,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500"
          }}
        >
          <span>🎤</span> Voice AI
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:"5px",background:inputBg,border:`1px solid ${border}`,borderRadius:"6px",padding:"5px 10px" }}>
          <span style={{ fontSize:"12px" }}>🔥</span>
          <span style={{ fontSize:"12px",fontWeight:"500",color:"#f59e0b" }}>12-day streak</span>
        </div>
        <button onClick={()=>setDark(!dark)} style={{ background:inputBg,border:`1px solid ${border}`,borderRadius:"6px",padding:"6px 10px",cursor:"pointer",fontSize:"12px",color:textSec,display:"flex",alignItems:"center",gap:"5px" }}>
          {dark?<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>Light</>:<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>Dark</>}
        </button>
      </div>
    </div>
  )
}
