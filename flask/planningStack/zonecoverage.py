import csv
import networkx as nx
import math
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import numpy as np

def euclidean_distance(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

def tsp_networkx(locations):
    if not locations:
        return []
    G = nx.complete_graph(len(locations))
    for i in G.nodes:
        for j in G.nodes:
            if i != j:
                dist = euclidean_distance(locations[i], locations[j])
                G[i][j]['weight'] = dist
    # Solve normally without start
    tour = nx.approximation.traveling_salesman_problem(G, cycle=True)
    coord_tour = [locations[i] for i in tour]
    
    # Rotate the tour to start at (0,0)
    for idx, point in enumerate(coord_tour):
        if point == (0, 0):
            coord_tour = coord_tour[idx:] + coord_tour[1:idx+1]
            break
    
    return coord_tour

def read_sampled_points(file_path):
    all_points = []
    with open(file_path, mode='r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            y = float(row["y"])
            x = float(row["x"])
            all_points.append((x, y))
    return all_points

def draw_tour(locations, tour):
    plt.figure(figsize=(10, 8))
    x_coords, y_coords = zip(*locations)
    plt.scatter(x_coords, y_coords, color='blue', label='Points')

    for i in range(len(tour) - 1):
        x1, y1 = tour[i]
        x2, y2 = tour[i + 1]
        plt.plot([x1, x2], [y1, y2], color='red')

    # Add number labels to show visiting sequence
    for idx, (x, y) in enumerate(tour):
        plt.text(x, y, str(idx), fontsize=8, ha='right', va='bottom', color='black')

    plt.title("Global TSP Tour Over All Regions")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.grid()
    # plt.show()



def save_tour_to_csv(tour, output_path):
    with open(output_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["order", "x", "y"])  # Column headers
        
        for idx, (x, y) in enumerate(tour):
            writer.writerow([idx, x, y])
    print(f"Tour saved to {output_path}")


# === Main Execution ===

def generate_zonecoverage_path(starting_point):

    # starting_point format: [(x,y)] ex: [(0,0)]

    sampled_points_file = "./planningStack/csv_data/zonecoverage.csv"
    all_locations = read_sampled_points(sampled_points_file)

    # Add starting point (0,0) at beginning
    all_locations = starting_point + all_locations

    print(len(all_locations), "points read from", sampled_points_file)

    global_tour = tsp_networkx(all_locations)
    draw_tour(all_locations, global_tour)

    # Save tour to CSV
    output_csv_file = "./planningStack/csv_data/zonecoverage_ordered.csv"
    save_tour_to_csv(global_tour, output_csv_file)



# generate_zonecoverage_path([(0.3680555555555556,0.3706293706293706)])