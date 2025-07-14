import numpy as np
import pandas as pd
import os

from scipy.spatial import ConvexHull
from shapely.geometry import Point, Polygon

def generateBaselinePath(num_points_between=10, step_size=1, start_from=0):

    scale_points_to_robot_coordinates('planningStack/csv_data/ordered_baseline.csv')
    # Load the data
    df = pd.read_csv('planningStack/csv_data/ordered_baseline.csv')
    
    # Get all points
    points = df.sort_values('order')
    
    # Get points from start_from to start_from + step_size
    selected_points = points[(points['order'] >= start_from) & (points['order'] <= start_from + step_size)]
    
    # scale= 150
    x_coords = selected_points['x'].values
    y_coords = selected_points['y'].values

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

    scale_points_to_robot_coordinates('planningStack/csv_data/zonecoverage_ordered.csv')

    # Load the data
    df = pd.read_csv('planningStack/csv_data/zonecoverage_ordered.csv')
    
    # Get points from start_from to start_from + step_size
    selected_points = df[(df['order'] >= start_from) & (df['order'] <= start_from + step_size)].sort_values('order')
    
    # scale = 148
    x_coords = selected_points['x'].values
    y_coords = selected_points['y'].values

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

    scale_points_to_robot_coordinates('planningStack/csv_data/microgradient_ordered.csv')

    # Load the data
    df = pd.read_csv('planningStack/csv_data/microgradient_ordered.csv')
    
    # Get points from start_from to start_from + step_size
    selected_points = df[(df['order'] >= start_from) & (df['order'] <= start_from + step_size)].sort_values('order')
    
    # scale = 150
    x_coords = selected_points['x'].values
    y_coords = selected_points['y'].values

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

def deletePointsWithinTraveledArea(path_file):
    # read traveled points coordinates csv file
    df = pd.read_csv('planningStack/csv_data/traveledPoints.csv')
    points = df[['x', 'y']].values

    # create convex hull
    hull = ConvexHull(points)

    # create polygon from hull
    polygon = Polygon(hull.points[hull.vertices])

    # read path file, delete rows in the csv file that are within the polygon
    df = pd.read_csv(path_file)
    df = df[~df.apply(lambda row: Point(row['x'] / get_scale(path_file)[0], row['y'] / get_scale(path_file)[1]).within(polygon), axis=1)]
    df.to_csv(path_file, index=False)

    return df

def get_scale_microgradient(path_file):
    df = pd.read_csv(path_file)
    scale_x = df['end_c'].max()
    scale_y = df['end_r'].max()
    return [scale_x, scale_y]

def deletePointsWithinTraveledAreaMicrogradient(path_file):
    # Read traveled points coordinates csv file
    df_traveled = pd.read_csv('planningStack/csv_data/traveledPoints.csv')
    traveledPoints = df_traveled[['x', 'y']].values

    # Create convex hull
    hull = ConvexHull(traveledPoints)

    # Create polygon from hull
    polygon = Polygon(hull.points[hull.vertices])

    # Read microgradient path file
    df = pd.read_csv(path_file)
    
    # Get scale factors for the microgradient file
    # For microgradient, we need to get scale from end_c/end_r columns
    scale_x = df['end_c'].max()
    scale_y = df['end_r'].max()
    
    # Function to check if either point in a row is within the polygon
    def is_any_point_within_polygon(row):
        # Check end point (end_c, end_r) - scale the coordinates
        end_point = Point(row['end_c'] / scale_x, row['end_r'] / scale_y)
        if end_point.within(polygon):
            return True
        
        # Check flipped head point (flipped_head_c, flipped_head_r) - scale the coordinates
        flipped_head_point = Point(row['flipped_head_c'] / scale_x, row['flipped_head_r'] / scale_y)
        if flipped_head_point.within(polygon):
            return True
        
        # If neither point is within the polygon, keep the row
        return False
    
    # Filter out rows where either point is within the polygon
    df_filtered = df[~df.apply(is_any_point_within_polygon, axis=1)]
    
    # Save the filtered data back to the file
    df_filtered.to_csv(path_file, index=False)
    
    print(f"Deleted {len(df) - len(df_filtered)} rows from {path_file}")
    
    return df_filtered

# # TESTING: run the function
# deletePointsWithinTraveledAreaMicrogradient('planningStack/csv_data/microgradient.csv')


def get_scale(input_csv, x_col='x', y_col='y'):
    # Read the CSV
    df = pd.read_csv(input_csv)
    
    # Detect max values for scaling
    max_x = df[x_col].max()
    max_y = df[y_col].max()

    return [max_x, max_y]

def scale_points_to_robot_coordinates(input_csv, output_csv=None, x_col='x', y_col='y'):
    # Read the CSV
    df = pd.read_csv(input_csv)
    
    # Detect max values for scaling
    max_x = df[x_col].max()
    max_y = df[y_col].max()
    
    # Scale x and y to [0, 1]
    df[x_col] = df[x_col] / max_x
    df[y_col] = df[y_col] / max_y
    
    # Write to output (overwrite or new file)
    if output_csv is None:
        output_csv = input_csv  # Overwrite original
    df.to_csv(output_csv, index=False)
    print(f"Scaled {input_csv} and saved to {output_csv}")


# # Example usage for your files:
# scale_points_to_robot_coordinates('flask/planningStack/csv_data/ordered_baseline.csv')
# scale_points_to_robot_coordinates('flask/planningStack/csv_data/zonecoverage_ordered.csv')
# scale_points_to_robot_coordinates('flask/planningStack/csv_data/microgradient_ordered.csv')

def get_last_point(input_csv, x_col='x', y_col='y', scaling_factor=[]): # used for traveled points csv file
    df = pd.read_csv(input_csv)
    last_row = df.iloc[-1][[x_col, y_col]]

    res = [(last_row[x_col] * scaling_factor[0], last_row[y_col] * scaling_factor[1])]
    print('res', res)
    return res



