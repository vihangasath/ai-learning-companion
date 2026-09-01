import re
from typing import Dict, List

# List of typical section header patterns
SECTION_PATTERNS = {
    "Abstract": [r"\babstract\b", r"\bsummary\b"],
    "Introduction": [r"\b1\.?\s+introduction\b", r"\bintroduction\b", r"\bbackground\b"],
    "Methodology": [r"\b2\.?\s+methodology\b", r"\b3\.?\s+methods\b", r"\bmethodology\b", r"\bexperimental\s+setup\b", r"\bproposed\s+method\b"],
    "Results": [r"\bresults?\b", r"\bdiscussion\b", r"\bresults?\s+and\s+discussion\b", r"\bevaluation\b"],
    "Conclusion": [r"\bconclusions?\b", r"\bsummary\s+and\s+conclusions?\b", r"\bfuture\s+work\b"],
    "References": [r"\breferences\b", r"\bbibliography\b", r"\bworks\s+cited\b"]
}

class SectionParser:
    """
    Parses full research paper texts into logical segments/sections.
    """
    
    @staticmethod
    def parse_sections(text: str) -> Dict[str, str]:
        """
        Parses text and groups paragraphs into logical academic sections.
        """
        lines = text.split("\n")
        sections: Dict[str, List[str]] = {
            "Title/Header": [],
            "Abstract": [],
            "Introduction": [],
            "Methodology": [],
            "Results": [],
            "Conclusion": [],
            "References": []
        }
        
        current_section = "Title/Header"
        
        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue
                
            # Check if this line looks like a header matching one of our sections
            matched_section = None
            # Limit header checking to relatively short lines
            if len(trimmed) < 60:
                for sec_name, regexes in SECTION_PATTERNS.items():
                    for reg in regexes:
                        if re.search(reg, trimmed, re.IGNORECASE):
                            matched_section = sec_name
                            break
                    if matched_section:
                        break
                        
            if matched_section:
                current_section = matched_section
                # Also record the header line
                sections[current_section].append(line)
            else:
                sections[current_section].append(line)
                
        # Merge lists to single strings
        merged_sections = {}
        for sec, content in sections.items():
            merged_sections[sec] = "\n".join(content).strip()
            
        # Clean empty ones
        return {k: v for k, v in merged_sections.items() if v}
