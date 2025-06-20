import numpy as np
import pandas as pd

def generateBaselinePath(num_points_between=10, step_size=1, start_from=0):
    # Load the data
    df = pd.read_csv('planningStack/csv_data/ordered_baseline.csv')
    
    # Get all points
    points = df.sort_values('order')
    
    # Get points from start_from to start_from + step_size
    selected_points = points[(points['order'] >= start_from) & (points['order'] <= start_from + step_size)]
    
    scale = 150
    x_coords = selected_points['x'].values / scale
    y_coords = selected_points['y'].values / scale

    # Generate interpolated points between each consecutive pair
    x_final = []
    y_final = []
    
    for i in range(len(x_coords) - 1):
        x0, x1 = x_coords[i], x_coords[i + 1]
        y0, y1 = y_coords[i], y_coords[i + 1]
        
        # Generate points for this segment
        x_segment = np.linspace(x0, x1, num=num_points_between+2)
        y_segment = np.linspace(y0, y1, num=num_points_between+2)
        
        # Add all points except the last one (to avoid duplicates)
        x_final.extend(x_segment[:-1])
        y_final.extend(y_segment[:-1])
    
    # Add the final point
    x_final.append(x_coords[-1])
    y_final.append(y_coords[-1])

    # Return as dictionary
    return {
        "x": list(x_final),
        "y": list(y_final)
    }

def generateZonecoveragePath(num_points_between=10, step_size=1, start_from=0):
    # Load the data
    df = pd.read_csv('planningStack/csv_data/zonecoverage_ordered.csv')
    
    # Get points from start_from to start_from + step_size
    selected_points = df[(df['order'] >= start_from) & (df['order'] <= start_from + step_size)].sort_values('order')
    
    scale = 148
    x_coords = selected_points['x'].values / scale
    y_coords = selected_points['y'].values / scale

    # Generate interpolated points between each consecutive pair
    x_final = []
    y_final = []
    
    for i in range(len(x_coords) - 1):
        x0, x1 = x_coords[i], x_coords[i + 1]
        y0, y1 = y_coords[i], y_coords[i + 1]
        
        # Generate points for this segment
        x_segment = np.linspace(x0, x1, num=num_points_between+2)
        y_segment = np.linspace(y0, y1, num=num_points_between+2)
        
        # Add all points except the last one (to avoid duplicates)
        x_final.extend(x_segment[:-1])
        y_final.extend(y_segment[:-1])
    
    # Add the final point
    x_final.append(x_coords[-1])
    y_final.append(y_coords[-1])

    # Return as dictionary
    return {
        "x": list(x_final),
        "y": list(y_final)
    }

def generateMicrogradientPath(num_points_between=10, step_size=1, start_from=0):
    # Load the data
    df = pd.read_csv('planningStack/csv_data/microgradient_ordered.csv')
    
    # Get points from start_from to start_from + step_size
    selected_points = df[(df['order'] >= start_from) & (df['order'] <= start_from + step_size)].sort_values('order')
    
    scale = 150
    x_coords = selected_points['x'].values / scale
    y_coords = selected_points['y'].values / scale

    # Generate interpolated points between each consecutive pair
    x_final = []
    y_final = []
    
    for i in range(len(x_coords) - 1):
        x0, x1 = x_coords[i], x_coords[i + 1]
        y0, y1 = y_coords[i], y_coords[i + 1]
        
        # Generate points for this segment
        x_segment = np.linspace(x0, x1, num=num_points_between+2)
        y_segment = np.linspace(y0, y1, num=num_points_between+2)
        
        # Add all points except the last one (to avoid duplicates)
        x_final.extend(x_segment[:-1])
        y_final.extend(y_segment[:-1])
    
    # Add the final point
    x_final.append(x_coords[-1])
    y_final.append(y_coords[-1])

    # Return as dictionary
    return {
        "x": list(x_final),
        "y": list(y_final)
    }

# # Example usage:
# # First call (0-5)
# result1 = generateBaselinePath(num_points_between=50, step_size=5, start_from=0)
# # Second call (5-10)
# result2 = generateBaselinePath(num_points_between=50, step_size=5, start_from=5)
# # Third call (10-15)
# result3 = generateBaselinePath(num_points_between=50, step_size=5, start_from=10)
