import numpy as np
import pandas as pd

def generateBaselinePath(num_points_between=10):
    # Load the data
    df = pd.read_csv('generatedPaths/ordered_baseline.csv')

    # Extract first two points based on 'order'
    point0 = df[df['order'] == 0].iloc[0]
    point1 = df[df['order'] == 1].iloc[0]

    scale = 100
    x0, y0 = point0['col'] / scale, point0['row'] / scale # scale down to graph on website coordinates
    x1, y1 = point1['col'] / scale, point1['row'] / scale # scale down to graph on website coordinates

    # Generate interpolated points (including endpoints)
    x_values = np.linspace(x0, x1, num=num_points_between+2)  # +2 to include endpoints
    y_values = np.linspace(y0, y1, num=num_points_between+2)

    # Return as dictionary
    return {
        "x": list(x_values),
        "y": list(y_values)
    }

def generateZonecoveragePath(num_points_between=10):
    # Load the data
    df = pd.read_csv('generatedPaths/zonecoverage_ordered.csv')

    # Extract first two points based on 'order'
    point0 = df[df['order'] == 0].iloc[0]
    point1 = df[df['order'] == 1].iloc[0]

    scale = 148
    x0, y0 = point0['x'] / scale, point0['y'] / scale # scale down to graph on website coordinates
    x1, y1 = point1['x'] / scale, point1['y'] / scale # scale down to graph on website coordinates

    # Generate interpolated points (including endpoints)
    x_values = np.linspace(x0, x1, num=num_points_between+2)  # +2 to include endpoints
    y_values = np.linspace(y0, y1, num=num_points_between+2)

    # Return as dictionary
    return {
        "x": list(x_values),
        "y": list(y_values)
    }

def generateMicrogradientPath(num_points_between=10):
    # Load the data
    df = pd.read_csv('generatedPaths/microgradient_ordered.csv')

    # Extract first two points based on 'order'
    point0 = df[df['order'] == 0].iloc[0]
    point1 = df[df['order'] == 1].iloc[0]

    scale = 150
    x0, y0 = point0['x'] / scale, point0['y'] / scale # scale down to graph on website coordinates
    x1, y1 = point1['x'] / scale, point1['y'] / scale # scale down to graph on website coordinates

    # Generate interpolated points (including endpoints)
    x_values = np.linspace(x0, x1, num=num_points_between+2)  # +2 to include endpoints
    y_values = np.linspace(y0, y1, num=num_points_between+2)

    # Return as dictionary
    return {
        "x": list(x_values),
        "y": list(y_values)
    }



# # Example usage:
# result = generateBaselinePath(num_points_between=50)
# print(result)
