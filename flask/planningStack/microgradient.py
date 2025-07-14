import pandas as pd
import networkx as nx
import matplotlib.pyplot as plt
from scipy.spatial.distance import euclidean
from networkx.algorithms.approximation import traveling_salesman_problem

from generatePaths import get_scale_microgradient

# === Solve Segment TSP ===
def solve_tsp_with_required_edges_fixed(G: nx.Graph, required_edges):
    positions = nx.get_node_attributes(G, 'pos')
    node_to_super = {}
    supernode_counter = 100

    for u, v in required_edges:
        if u in node_to_super and v in node_to_super:
            if node_to_super[u] != node_to_super[v]:
                old, new = node_to_super[v], node_to_super[u]
                for k, v_ in list(node_to_super.items()):
                    if v_ == old:
                        node_to_super[k] = new
        elif u in node_to_super:
            node_to_super[v] = node_to_super[u]
        elif v in node_to_super:
            node_to_super[u] = node_to_super[v]
        else:
            node_to_super[u] = supernode_counter
            node_to_super[v] = supernode_counter
            supernode_counter += 1

    contracted_G = nx.Graph()
    node_map = {}
    for node in G.nodes:
        mapped = node_to_super.get(node, node)
        node_map[node] = mapped
        contracted_G.add_node(mapped)

    for u, v in G.edges:
        u_mapped, v_mapped = node_map[u], node_map[v]
        if u_mapped != v_mapped:
            dist = euclidean(positions[u], positions[v])
            if contracted_G.has_edge(u_mapped, v_mapped):
                contracted_G[u_mapped][v_mapped]['weight'] = min(contracted_G[u_mapped][v_mapped]['weight'], dist)
            else:
                contracted_G.add_edge(u_mapped, v_mapped, weight=dist)

    tsp_path = traveling_salesman_problem(contracted_G, weight='weight', cycle=True)

    super_to_nodes = {}
    for node, supernode in node_map.items():
        super_to_nodes.setdefault(supernode, []).append(node)

    expanded_tour = []
    seen = set()
    for sn in tsp_path:
        for n in super_to_nodes.get(sn, [sn]):
            if n not in seen:
                seen.add(n)
                expanded_tour.append(n)

    pos = nx.get_node_attributes(G, 'pos')
    plt.figure(figsize=(10, 8))
    nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=500, edgelist=[])

    path_edges = list(zip(expanded_tour, expanded_tour[1:] + [expanded_tour[0]]))
    required_set = {tuple(sorted(e)) for e in required_edges}
    required_in_tour = [e for e in path_edges if tuple(sorted(e)) in required_set]
    other_edges = [e for e in path_edges if tuple(sorted(e)) not in required_set]

    nx.draw_networkx_edges(G, pos, edgelist=other_edges, edge_color='red', width=1.5)
    nx.draw_networkx_edges(G, pos, edgelist=required_in_tour, edge_color='green', width=2.5, style='dashed')
    plt.title("TSP Tour with Required Edges (Microgradient)")
    plt.axis('equal')
    # plt.show()

    return expanded_tour

def solve_segment_tsp_fixed(segments):
    point_to_node, node_to_point = {}, {}
    segment_edges, current_node = [], 0

    for x1, y1, x2, y2 in segments:
        # Clamp negative coordinates to boundary (0)
        p1 = (max(x1, 0), max(y1, 0))
        p2 = (max(x2, 0), max(y2, 0))
        for p in (p1, p2):
            if p not in point_to_node:
                point_to_node[p] = current_node
                node_to_point[current_node] = p
                current_node += 1
        n1, n2 = point_to_node[p1], point_to_node[p2]
        segment_edges.append((n1, n2))

    G = nx.Graph()
    for node, point in node_to_point.items():
        G.add_node(node, pos=point)
    for u in G.nodes:
        for v in G.nodes:
            if u < v:
                dist = euclidean(node_to_point[u], node_to_point[v])
                G.add_edge(u, v, weight=dist)

    tour = solve_tsp_with_required_edges_fixed(G, segment_edges)
    return tour, G, segment_edges, node_to_point




def generate_microgradient_path(starting_point):

    # === Load CSV ===
    df = pd.read_csv("./planningStack/csv_data/microgradient.csv")
    segments = list(zip(df['end_c'], df['end_r'], df['flipped_head_c'], df['flipped_head_r']))


    # starting_point format: [(x,y)] ex: [(0,0)]

    x_coord = starting_point[0][0] / get_scale_microgradient('planningStack/csv_data/microgradient.csv')[0]
    y_coord = starting_point[0][1] / get_scale_microgradient('planningStack/csv_data/microgradient.csv')[1]    

    # === Run Pipeline ===
    tour, G, required_edges, node_to_point = solve_segment_tsp_fixed(segments)

    # === Export with (0, 0) Prepended ===
    export_rows = [{'order': 0, 'x': x_coord, 'y': y_coord}]  # Add origin
    for i, node_id in enumerate(tour):
        x, y = node_to_point[node_id]
        export_rows.append({'order': i + 1, 'x': x, 'y': y})  # Increment order by 1

    points_df = pd.DataFrame(export_rows)
    points_df.to_csv("./planningStack/csv_data/microgradient_ordered.csv", index=False)
    print("Saved node points with origin prepended to microgradient_ordered.csv")
