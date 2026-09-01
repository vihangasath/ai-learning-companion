from typing import List, Dict, Any

class MindMapRenderer:
    """
    Renders mind map structures to different formats, including React Flow JSON
    and Mermaid.js markup.
    """
    
    @staticmethod
    def to_react_flow(positioned_nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Formats nodes and edges directly for React Flow library consumption.
        """
        react_nodes = []
        for node in positioned_nodes:
            react_nodes.append({
                "id": str(node["id"]),
                "data": {"label": node["label"]},
                "position": node.get("position", {"x": 0, "y": 0}),
                "type": "default"
            })
            
        react_edges = []
        for i, edge in enumerate(edges):
            react_edges.append({
                "id": f"e-{i}",
                "source": str(edge["source"]),
                "target": str(edge["target"]),
                "animated": True
            })
            
        return {
            "nodes": react_nodes,
            "edges": react_edges
        }

    @staticmethod
    def to_mermaid(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> str:
        """
        Formats mind map as a Mermaid flowchart string.
        """
        lines = ["graph TD"]
        
        # Build node mapping for labels
        node_labels = {}
        for node in nodes:
            nid = str(node["id"])
            lbl = node["label"].replace('"', '\\"')
            node_labels[nid] = lbl
            lines.append(f'    {nid}["{lbl}"]')
            
        # Draw edges
        for edge in edges:
            src = str(edge["source"])
            tgt = str(edge["target"])
            lines.append(f"    {src} --> {tgt}")
            
        return "\n".join(lines)
