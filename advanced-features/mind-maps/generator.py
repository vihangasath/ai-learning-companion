import os
from typing import List, Dict, Any
from pydantic import BaseModel, Field

class MindMapEdge(BaseModel):
    source: str = Field(description="The ID of the source parent node")
    target: str = Field(description="The ID of the target child node")

class MindMapNode(BaseModel):
    id: str = Field(description="Unique short ID for the node (e.g. '1', '2', 'ml-intro')")
    label: str = Field(description="Short label or title for the topic/concept")

class MindMapStructure(BaseModel):
    nodes: List[MindMapNode] = Field(description="All concept nodes in the mind map")
    edges: List[MindMapEdge] = Field(description="Directional connections between nodes")

def generate_mind_map_from_text(text: str, api_key: str = None) -> Dict[str, Any]:
    """
    Generate a hierarchical mind map structure from educational text.
    """
    api_key = api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _mock_mind_map_generation(text)
        
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.output_parsers import JsonOutputParser

        model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2,
            openai_api_key=api_key
        )
        
        parser = JsonOutputParser(pydantic_object=MindMapStructure)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an educational designer. Convert the text into a logical mind map representing the hierarchy of topics and concepts.\nFormat Instructions:\n{format_instructions}"),
            ("user", "Analyze this text and build a mind map:\n{text}")
        ])
        
        chain = prompt | model | parser
        
        result = chain.invoke({
            "text": text,
            "format_instructions": parser.get_format_instructions()
        })
        
        return result
        
    except Exception as e:
        print(f"Mind map generation error: {e}")
        return _mock_mind_map_generation(text)

def _mock_mind_map_generation(text: str) -> Dict[str, Any]:
    """
    Generate a simple fallback mind map based on paragraphs and headers.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    nodes = []
    edges = []
    
    # Root node
    root_id = "1"
    root_label = "Main Subject"
    
    # Try to find a header
    for line in lines[:3]:
        if line.startswith("#"):
            root_label = line.lstrip("#").strip()
            break
        elif len(line) < 30:
            root_label = line
            break
            
    nodes.append({"id": root_id, "label": root_label})
    
    # Extract subtopics from lines that look like bullet points or short lines
    node_id = 2
    for line in lines:
        if line.startswith(("-", "*", "##", "###")):
            clean_label = line.lstrip("-*# \t")
            if 3 <= len(clean_label) <= 40:
                curr_id = str(node_id)
                nodes.append({"id": curr_id, "label": clean_label})
                edges.append({"source": root_id, "target": curr_id})
                node_id += 1
                if node_id > 10:  # limit to 10 nodes in fallback
                    break
                    
    # Fallback default if no nodes found
    if len(nodes) == 1:
        nodes.append({"id": "2", "label": "Key Concept 1"})
        nodes.append({"id": "3", "label": "Key Concept 2"})
        edges.append({"source": "1", "target": "2"})
        edges.append({"source": "1", "target": "3"})
        
    return {"nodes": nodes, "edges": edges}
