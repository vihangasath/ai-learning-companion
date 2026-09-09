export interface ExtractedFormula {
  id: string
  name: string
  rawText: string
  latex: string
  displayMath: string
}

export function extractFormulasFromText(text: string): ExtractedFormula[] {
  if (!text || text.trim() === "") return []

  const results: ExtractedFormula[] = []

  const patterns = [
    { regex: /force\s+equals?\s+mass\s+(?:times|\*)\s+acceleration|f\s*=\s*m\s*\*?\s*a/i, name: "Newton's Second Law", raw: "F = ma", latex: "F = m \\cdot a" },
    { regex: /energy\s+equals?\s+mass\s+times\s+speed\s+of\s+light\s+squared|e\s*=\s*m\s*c\^?2/i, name: "Mass-Energy Equivalence", raw: "E = mc^2", latex: "E = m c^{2}" },
    { regex: /area\s+of\s+a?\s*circle\s+is\s+pi\s+r\s+squared|a\s*=\s*(?:pi|\\pi|\pi)\s*r\^?2/i, name: "Area of a Circle", raw: "A = πr²", latex: "A = \\pi r^{2}" },
    { regex: /pythagorean\s+theorem|a\^?2\s*\+\s*b\^?2\s*=\s*c\^?2/i, name: "Pythagorean Theorem", raw: "a² + b² = c²", latex: "a^{2} + b^{2} = c^{2}" },
    { regex: /derivative|d\s*y\s*\/\s*d\s*x\s*=\s*f'\s*\(\s*x\s*\)/i, name: "Definition of Derivative", raw: "dy/dx = f'(x)", latex: "\\frac{dy}{dx} = f'(x)" },
    { regex: /quadratic\s+formula|x\s*=\s*\(-b\s*\\\+\\\-\s*sqrt\(b\^2-4ac\)\)\/2a/i, name: "Quadratic Formula", raw: "x = (-b ± √(b²-4ac)) / 2a", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
  ]

  let idCounter = 1
  for (const p of patterns) {
    if (p.regex.test(text)) {
      results.push({
        id: `f-${idCounter++}`,
        name: p.name,
        rawText: p.raw,
        latex: p.latex,
        displayMath: `$$${p.latex}$$`,
      })
    }
  }

  if (results.length === 0) {
    const mathMatch = text.match(/([a-zA-Z0-9_\+\-\*\/\^\(\)\s=]{3,30})/g)
    if (mathMatch) {
      mathMatch.forEach((m, idx) => {
        const trimmed = m.trim()
        if (trimmed.includes("=") || trimmed.includes("^")) {
          results.push({
            id: `f-gen-${idx + 1}`,
            name: `Expression #${idx + 1}`,
            rawText: trimmed,
            latex: trimmed.replace(/\*/g, "\\cdot ").replace(/\^(\d+)/g, "^{$1}"),
            displayMath: `$$${trimmed}$$`,
          })
        }
      })
    }
  }

  return results
}