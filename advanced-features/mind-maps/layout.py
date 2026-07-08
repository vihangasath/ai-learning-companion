from typing import List, Dict, Any
from collections import defaultdict, deque

def calculate_tree_layout(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate (x, y) coordinates for mind map nodes using a basic hierarchical tree layout.
    Modifies the node dictionaries to include a 'position' field: {"x": val, "y": val}.
    """
    if not nodes:
        return []
        
    # Build graph
    adj = defaultdict(list)
    in_degree = defaultdict(int)
    node_map = {node["id"]: node for node in nodes}
    
    # Initialize degrees
    for n in nodes:
        in_degree[n["id"]] = 0
        
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        adj[src].append(tgt)
        in_degree[tgt] += 1
        
    # Find root nodes (in_degree == 0)
    roots = [node_id for node_id, deg in in_degree.items() if deg == 0]
    if not roots:
        # If there's a cycle, pick the first node
        roots = [nodes[0]["id"]]
        
    # BFS to determine levels and parent relationships
    levels = {}
    parent = {}
    
    queue = deque()
    for root in roots:
        queue.append((root, 0, None))
        
    while queue:
        curr, lvl, par = queue.popleft()
        if curr in levels:
            continue
        levels[curr] = lvl
        parent[curr] = par
        
        for child in adj[curr]:
            queue.append((child, lvl + 1, curr))
            
    # Group nodes by level
    nodes_by_level = defaultdict(list)
    for node_id, lvl in levels.items():
        nodes_by_level[lvl].append(node_id)
        
    # Set coordinates
    # Level height (vertical spacing)
    level_height = 120
    # Horizontal spacing between siblings
    sibling_spacing = 180
    
    positioned_nodes = []
    
    for lvl, level_node_ids in sorted(nodes_by_level.items()):
        n_nodes = len(level_node_ids)
        # Center the level horizontally around x = 0
        total_width = (n_nodes - 1) * sibling_spacing
        start_x = -total_width / 2.0
        
        for i, node_id in enumerate(level_node_ids):
            # Base node dict
            node = dict(node_map[node_id])
            
            x = start_x + (i * sibling_spacing)
            y = lvl * level_height
            
            node["position"] = {"x": round(x, 1), "y": round(y, 1)}
            positioned_nodes.append(node)
            
    # Include any unpositioned nodes (in case of disconnected subgraphs)
    positioned_ids = {n["id"] for n in positioned_nodes}
    for n_id, node in node_map.items():
        if n_id not in positioned_ids:
            node_copy = dict(node)
            node_copy["position"] = {"x": 0.0, "y": 0.0}
            positioned_nodes.append(node_copy)
            
    return positioned_nodes
