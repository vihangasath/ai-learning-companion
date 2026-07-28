export default function Card({ children, theme, style }: { children: React.ReactNode, theme: any, style?: React.CSSProperties }) {
  const { card, border } = theme
  return (
    <div style={{
      background: card,
      border: `1px solid ${border}`,
      borderRadius: "12px",
      padding: "20px",
      ...style
    }}>
      {children}
    </div>
  )
}
