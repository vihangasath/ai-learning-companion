from typing import Dict, Any, List
import os

class PDFExtractor:
    """
    Handles parsing and text extraction from PDF files using the pypdf library.
    """
    
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extract raw text content from a PDF file.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at: {file_path}")
            
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            
            full_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    full_text.append(text)
                    
            return "\n\n--- Page Break ---\n\n".join(full_text)
        except ImportError:
            # Fallback warning if pypdf is not installed
            raise ImportError("The 'pypdf' package is required. Please install it using: pip install pypdf")
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF file: {e}")

    @staticmethod
    def extract_pages(file_path: str) -> List[str]:
        """
        Extract text as a list of page strings.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at: {file_path}")
            
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            
            pages_text = []
            for page in reader.pages:
                text = page.extract_text() or ""
                pages_text.append(text)
                
            return pages_text
        except Exception as e:
            raise RuntimeError(f"Failed to read PDF pages: {e}")
