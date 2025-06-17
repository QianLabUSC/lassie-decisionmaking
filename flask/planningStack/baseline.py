import pandas as pd
import networkx as nx
import math
import matplotlib.pyplot as plt


def euclidean_distance(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

def tsp_networkx(locations, start_idx=0):
    if not locations:
        return []

    G = nx.complete_graph(len(locations))

    for i in G.nodes:
        for j in G.nodes:
            if i != j:
                dist = euclidean_distance(locations[i], locations[j])
                G[i][j]['weight'] = dist

    tour = nx.approximation.traveling_salesman_problem(G, cycle=False, weight='weight')

    # Reorder so tour starts at start_idx
    start_pos = tour.index(start_idx)
    tour = tour[start_pos:] + tour[:start_pos]

    # Manually make it a cycle (returning to start)
    tour.append(start_idx)

    coord_tour = [locations[i] for i in tour]
    return coord_tour

def plot_points_only(points, width=10, height=10):
    x, y = zip(*points)
    plt.figure(figsize=(width, height))
    plt.scatter(x, y, color='red', s=30)
    plt.title("Sampled Points Only")
    plt.grid(True)
    plt.axis("equal")
    # plt.show()

def plot_tsp_tour(tour, width=10, height=10):
    if not tour:
        return

    x, y = zip(*tour)

    plt.figure(figsize=(width, height))
    plt.plot(x, y, 'o-', markersize=6, linewidth=1.5, color='red')

    for i, (xi, yi) in enumerate(tour):
        plt.text(xi + 0.5, yi + 0.5, f"{i}", fontsize=9)

    plt.title("TSP Tour (Approximate)")
    plt.grid(True)
    plt.axis("equal")
    # plt.show()

def save_tour_to_csv(tour, output_csv_path):
    tour_df = pd.DataFrame(tour, columns=["col", "row"])
    tour_df["order"] = range(len(tour))
    tour_df.to_csv(output_csv_path, index=False)
    print(f"Saved tour ordering to {output_csv_path}")

def main(csv_path):
    df = pd.read_csv(csv_path)
    points = list(df[['col', 'row']].itertuples(index=False, name=None))

    # Insert starting point (0,0) at the beginning
    points = [(0, 0)] + points

    plot_points_only(points)        
    tour = tsp_networkx(points, start_idx=0)
    plot_tsp_tour(tour)

    save_tour_to_csv(tour, "csv_data/ordered_baseline.csv")

if __name__ == "__main__":
    main("csv_data/baseline.csv")
