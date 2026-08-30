import re
from typing import Dict, Pattern

# Common mathematical and scientific regex patterns
FORMULA_PATTERNS: Dict[str, Pattern] = {
    # e.g., e = mc^2, E=mc2, E = mc^2
    "einstein_relativity": re.compile(r"\bE\s*=\s*m\s*c\s*\^?\s*2\b", re.IGNORECASE),
    
    # e.g., F = ma, F = m * a, f=ma
    "newton_second_law": re.compile(r"\bF\s*=\s*m\s*\*?\s*a\b", re.IGNORECASE),
    
    # e.g., a^2 + b^2 = c^2
    "pythagorean_theorem": re.compile(r"\ba\s*\^?\s*2\s*\+\s*b\s*\^?\s*2\s*=\s*c\s*\^?\s*2\b", re.IGNORECASE),
    
    # e.g., v = d / t, v = d/t
    "velocity_formula": re.compile(r"\bv\s*=\s*d\s*/\s*t\b", re.IGNORECASE),
    
    # e.g., A = pi * r^2, A = pi r^2
    "circle_area": re.compile(r"\bA\s*=\s*(?:pi|π)\s*\*?\s*r\s*\^?\s*2\b", re.IGNORECASE),
    
    # e.g., C = 2 * pi * r, C = 2 pi r
    "circle_circumference": re.compile(r"\bC\s*=\s*2\s*\*?\s*(?:pi|π)\s*\*?\s*r\b", re.IGNORECASE),
    
    # Quadratic formula style: x = (-b +- sqrt(b^2 - 4ac)) / 2a
    "quadratic_formula": re.compile(
        r"x\s*=\s*(?:\\\s*)?\(\s*-\s*b\s*(?:\+|-|±)\s*(?:sqrt|√)\s*\(\s*b\s*\^?\s*2\s*-\s*4\s*\*?\s*a\s*\*?\s*c\s*\)\s*\)\s*/\s*\(\s*2\s*\*?\s*a\s*\)",
        re.IGNORECASE
    ),
    
    # Euler's Identity: e^(i pi) + 1 = 0
    "euler_identity": re.compile(r"e\s*\^?\s*\(\s*i\s*\*?\s*(?:pi|π)\s*\)\s*\+\s*1\s*=\s*0", re.IGNORECASE),

    # general equations containing standard operators and variables
    "generic_equation": re.compile(r"\b[a-zA-Z_]\w*\s*=\s*[-+]?\s*\w+\s*[\+\-\*/\^]\s*\w+\b")
}

# Textual aliases for formulas to match from natural language description
TEXTUAL_FORMULA_ALIASES = [
    (r"\bforce\s+(?:equals|is)\s+mass\s+(?:times|\*)\s+acceleration\b", "F = ma"),
    (r"\benergy\s+(?:equals|is)\s+mass\s+(?:times|\*)\s+speed\s+of\s+light\s+squared\b", "E = mc^2"),
    (r"\barea\s+of\s+a\s+circle\b", "A = πr^2"),
    (r"\bpythagorean\s+theorem\b", "a^2 + b^2 = c^2"),
    (r"\bquadratic\s+equation\s+formula\b", "x = (-b ± √(b^2 - 4ac)) / (2a)"),
    (r"\bideal\s+gas\s+law\b", "PV = nRT"),
    (r"\bohms?\s+law\b", "V = IR"),
    (r"\bdensity\s+formula\b", "ρ = m/V")
]
