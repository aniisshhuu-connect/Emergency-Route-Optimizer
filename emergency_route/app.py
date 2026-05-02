from flask import Flask, render_template, request, jsonify
import random
import heapq

app = Flask(__name__)

# Base graph definition
BASE_GRAPH = {
    'A': {'B': 5, 'D': 4, 'C': 5},
    'B': {'A': 5, 'F': 8, 'D': 3},
    'C': {'A': 5, 'D': 3, 'G': 8},
    'D': {'A': 4, 'B': 3, 'C': 3, 'E': 4},
    'E': {'D': 4, 'F': 4, 'H': 6, 'G': 4},
    'F': {'B': 8, 'E': 4, 'I': 5},
    'G': {'C': 8, 'E': 4, 'J': 5},
    'H': {'E': 6, 'I': 4, 'L': 7, 'J': 4},
    'I': {'F': 5, 'H': 4, 'K': 3, 'L': 6},
    'J': {'G': 5, 'H': 4, 'L': 6},
    'K': {'I': 3, 'L': 4},
    'L': {'H': 7, 'I': 6, 'J': 6, 'K': 4}
}

# --- PHASE 1: Dijkstra Algorithm ---
# Computes the shortest path from start to end based on given weights.
def dijkstra(graph, start, end):
    queue = [(0, start, [start])]
    visited = set()

    while queue:
        (cost, node, path) = heapq.heappop(queue)

        if node in visited:
            continue
        visited.add(node)

        if node == end:
            return cost, path

        for neighbor, weight in graph[node].items():
            if neighbor not in visited:
                heapq.heappush(queue, (cost + weight, neighbor, path + [neighbor]))
    
    return float('inf'), []

# --- PHASE 2: Backtracking ---
# Recursively generates all possible paths from start to end.
def find_all_paths(graph, start, end, path=None):
    if path is None:
        path = []
    path = path + [start]
    if start == end:
        return [path]
    if start not in graph:
        return []
    paths = []
    for node in graph[start]:
        if node not in path:
            newpaths = find_all_paths(graph, node, end, path)
            for newpath in newpaths:
                paths.append(newpath)
    return paths

# Helper to calculate the cost of a given path based on the graph's current weights
def calculate_path_cost(graph, path):
    cost = 0
    for i in range(len(path) - 1):
        cost += graph[path[i]][path[i+1]]
    return cost

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    start_node = data.get('start')
    end_node = data.get('end')
    simulate_traffic = data.get('simulate_traffic', False)

    if not start_node or not end_node:
        return jsonify({'error': 'Start and end nodes required'}), 400

    # Phase 1 usage: Find normal cost and path (Baseline without traffic)
    normal_cost, normal_path = dijkstra(BASE_GRAPH, start_node, end_node)

    # --- PHASE 3: Randomization ---
    # Apply random delay (traffic) to edge weights
    current_graph = {node: {} for node in BASE_GRAPH}
    edges_with_delay = {}
    
    # Ensuring undirected graph delays are symmetric
    visited_edges = set()
    for u in BASE_GRAPH:
        for v, weight in BASE_GRAPH[u].items():
            edge = tuple(sorted([u, v]))
            if edge not in visited_edges:
                visited_edges.add(edge)
                # Apply delay between 1 and 5 if traffic simulation is ON
                delay = random.randint(1, 5) if simulate_traffic else 0
                edges_with_delay[edge] = delay
            
            # Apply the generated delay
            delay = edges_with_delay[tuple(sorted([u, v]))]
            current_graph[u][v] = weight + delay

    # Phase 2 usage: Find all paths to evaluate them under new traffic conditions
    all_paths = find_all_paths(current_graph, start_node, end_node)

    # Find the best path considering delays
    best_cost = float('inf')
    best_path = []
    for path in all_paths:
        cost = calculate_path_cost(current_graph, path)
        if cost < best_cost:
            best_cost = cost
            best_path = path

    # Determine cost of the original shortest path under new traffic conditions
    normal_path_new_cost = calculate_path_cost(current_graph, normal_path) if normal_path else float('inf')

    # Calculate time saved by choosing the new best path over the old normal path
    time_saved = normal_path_new_cost - best_cost

    return jsonify({
        'base_graph': BASE_GRAPH,
        'current_graph': current_graph,
        'normal_path': normal_path,
        'normal_cost': normal_cost,
        'normal_path_new_cost': normal_path_new_cost,
        'best_path': best_path,
        'best_cost': best_cost,
        'time_saved': max(0, time_saved),
        'delays': [{'edge': f"{u}-{v}", 'delay': delay} for (u, v), delay in edges_with_delay.items() if delay > 0]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5555)
