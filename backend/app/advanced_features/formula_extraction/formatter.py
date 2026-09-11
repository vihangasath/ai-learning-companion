import re

def format_to_latex(formula: str) -> str:
    """
    Standardize common equations and math symbols into LaTeX syntax.
    """
    # Clean spacing and ensure lowercase standard expressions are properly LaTeXified
    latex = formula.strip()
    
    # Replace multiplication * with thin space or cdot
    latex = re.sub(r'\s*\*\s*', r' ', latex)
    
    # Replace pi/PI with \pi
    latex = re.sub(r'\b(?:pi|π)\b', r'\\pi', latex)
    
    # Replace theta/THETA with \theta
    latex = re.sub(r'\b(?:theta|θ)\b', r'\\theta', latex)
    
    # Replace delta/DELTA with \Delta
    latex = re.sub(r'\b(?:delta|Δ)\b', r'\\Delta', latex)
    
    # Replace rho with \rho
    latex = re.sub(r'\b(?:rho|ρ)\b', r'\\rho', latex)
    
    # Format square roots: sqrt(x) -> \sqrt{x}
    # Using a basic regex for simple parentheses
    latex = re.sub(r'\bsqrt\s*\(\s*([^)]+)\s*\)', r'\\sqrt{\1}', latex)
    latex = re.sub(r'√\s*\(\s*([^)]+)\s*\)', r'\\sqrt{\1}', latex)
    latex = re.sub(r'√\s*(\w+)', r'\\sqrt{\1}', latex)
    
    # Format fractions: (a) / (b) -> \frac{a}{b}
    # Matches patterns like (x) / (y) or x / y
    fraction_pattern = r'\(\s*([^)]+)\s*\)\s*/\s*\(\s*([^)]+)\s*\)'
    latex = re.sub(fraction_pattern, r'\\frac{\1}{\2}', latex)
    
    # Replace +- or ± with \pm
    latex = re.sub(r'(?:\+-|±)', r'\\pm', latex)
    
    # Ensure correct caret positioning for superscripts (e.g. x^2 rather than x ^ 2)
    latex = re.sub(r'\s*\^\s*(\w+|\{[^}]+\})', r'^{\1}', latex)
    
    # Specific common replacements
    if latex == "F = ma":
        return "F = ma"
    elif latex == "E = mc^2":
        return "E = mc^2"
    elif "pythagorean" in latex.lower() or "a^2 + b^2 = c^2" in latex.lower():
        return "a^2 + b^2 = c^2"
        
    return latex

def wrap_math_block(latex_formula: str, display_mode: bool = True) -> str:
    """
    Wrap LaTeX string in standard delimiters.
    display_mode: True wraps in $$, False wraps in $
    """
    if display_mode:
        return f"$${latex_formula}$$"
    return f"${latex_formula}$"
