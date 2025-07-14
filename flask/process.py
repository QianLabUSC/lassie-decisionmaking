import os
import sys
import csv
sys.path.insert(0, '/home1/f/foraging/public_html/cgi-bin/venv/lib/python3.6/site-packages')
from multiObjectiveDecisionMaking.decision_making import *
from multiObjectiveDecisionMaking.multi_objective_tools import *
import json
from pathplanning import ManuallyEnv, ReactivePlanning, Estimation
from pathplanning2ndPath import ReactivePlanning2ndPath
from pathplanning3rdPath import ReactivePlanning3rdPath

# new paths
from generatePaths import generateBaselinePath
from generatePaths import generateZonecoveragePath
from generatePaths import generateMicrogradientPath
from generatePaths import deletePointsWithinTraveledArea
from generatePaths import deletePointsWithinTraveledAreaMicrogradient
from generatePaths import get_last_point
from generatePaths import get_scale
from generatePaths import get_scale_microgradient

from planningStack.zonecoverage import generate_zonecoverage_path
from planningStack.baseline import generate_baseline_path
from planningStack.microgradient import generate_microgradient_path

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import numpy as np
# from ros2_node_webgui import *
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# node_web_gui = Ros2NodeWebGui()
# app.config['ros_node'] = node_web_gui


# path suggestion variables
first_time = True

baseline_step_number = 0
zonecoverage_step_number = 0
microgradient_step_number = 0

last_selected_path = None  # Will be 'A', 'B', or 'C' based on selection



# Load environment variables from .env file
load_dotenv()

def get_matrix_value(matrix, x, y):
    """
    Retrieve a value from the matrix at normalized coordinates x, y.

    Parameters:
    matrix (np.array): A numpy array.
    x (float): Normalized x coordinate (0 to 1).
    y (float): Normalized y coordinate (0 to 1).

    Returns:
    float: Value at the specified coordinates in the matrix.
    """
    ix = np.int32(y * (matrix.shape[0] - 1))  
    iy = np.int32(x * (matrix.shape[1] - 1))
    return matrix[ix, iy]

def normalize_matrix(matrix):
    """
    Normalize a numpy matrix so that the minimum value is mapped to 0 
    and the maximum value is mapped to 1.

    Parameters:
    matrix (np.array): A numpy array of any shape.

    Returns:
    np.array: A normalized numpy array of the same shape as the input.
    """
    # Find the minimum and maximum values in the matrix
    min_val = np.min(matrix)
    max_val = np.max(matrix)
    
    # Perform the normalization
    normalized_matrix = (matrix - min_val) / (max_val - min_val)

    return normalized_matrix

def get_traveled_points(path_data, starting_point, step_size):
    # get the points that the robot will travel through
    # path_data is a list of points
    # starting_point is a tuple (x, y)
    # step_size is an integer

    # get the points that the robot will travel through

    res = []

    with open(path_data, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            order_value = int(row['order'])
            if (starting_point <= order_value <= step_size):
                x = float(row['x'])
                y = float(row['y'])
                res.append((x, y))

    # print('res', res)
    
    return res

def append_traveled_points(traveled_points):
    with open('planningStack/csv_data/traveledPoints.csv', mode='a', newline='') as file:
        writer = csv.writer(file)
        for point in traveled_points:
            writer.writerow(point)


ROBOT_ESTIMATION_INTERVAL = 0.02 
estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)

@app.route('/pathsuggestion', methods=['POST'])
@cross_origin()

def pathsuggestion():

    global first_time # used to track if it is the first time the function is called
    global baseline_step_number # used to track the last step number
    global zonecoverage_step_number # used to track the last step number
    global microgradient_step_number # used to track the last step number
    global last_selected_path # used to track which path was last selected

    inputs = request.json
    selected_path_data = inputs['selected_path_data']

    # print(inputs, 'inputs')

    # Flatten the selectedXs_path_cordinates
    flattened_selectedXs = [item for sublist in \
                            selected_path_data['selectedPath']['selectedXs_path_cordinates'] \
                                  for item in sublist]

    # Concatenate initial_path_x with flattened_selectedXs and convert to NumPy array
    concatenated_path_x = np.array(selected_path_data['initial_path']['initial_path_x']\
                                    + flattened_selectedXs)

    # Flatten the selectedYs_path_cordinates
    flattened_selectedYs = [item for sublist in \
                            selected_path_data['selectedPath']['selectedYs_path_cordinates'] \
                                for item in sublist]

    # Concatenate initial_path_y with flattened_selectedYs and convert to NumPy array
    concatenated_path_y = np.array(selected_path_data['initial_path']['initial_path_y']\
                                    + flattened_selectedYs)

    robot_path_x = concatenated_path_x
    robot_path_y = concatenated_path_y
    ENV = ManuallyEnv()
    PLANNER = ReactivePlanning(0.02, 30)
    ESTIMATOR = Estimation(False, 0.2, 0.15, 4)

    measured_robot_coordinates, measured_shear, measured_moisture = ENV.gather_data(robot_path_x, robot_path_y)
    vals = np.array([[x1_, x2_] for x1_ in np.linspace(0, 1, num=int(1/0.02)) for x2_ in np.linspace(0, 1, num=int(1/0.02))])
    shear_prediction, information_shear, shear_std, gp = ESTIMATOR.estimate(measured_robot_coordinates, measured_shear, vals)
    
    shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
    information_shear = information_shear.reshape(estimatedNum, estimatedNum)
    shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))
    PLANNER.update_robot_path(robot_path_x, robot_path_y)
    path_x_1, path_y_1, \
    path_x_2, path_y_2,  \
    path_x_3, path_y_3, \
    path_x_4, path_y_4 = PLANNER.plan_for_next_horizon(shear_std.T) 


    #print('measured_robot_coordinates',measured_robot_coordinates, 'measured_moisture' , measured_moisture, 'measured_shear', measured_shear)

    # TODO: NEW PATHS

    step_size = 5 # step size for paths to take (ex: for each step, the robot will traverse 5 points)


    if (first_time):
        current_step = inputs.get('step_number', 0) - 1
        first_time = False
        # print('path suggestion: last selected path number', last_selected_path)
        with open('planningStack/csv_data/traveledPoints.csv', mode='w', newline='') as file:
            file.truncate(0)  # This ensures the file is empty
            writer = csv.writer(file)
            writer.writerow(['x', 'y'])  # write header

    else:
        if (last_selected_path == 'A'): # baseline path

            traveled_points = get_traveled_points('planningStack/csv_data/ordered_baseline.csv', (baseline_step_number - 1) * step_size, baseline_step_number * step_size)
            # minor issue? end point, starting point are both added (duplicate starting points)
            append_traveled_points(traveled_points)


            current_step = baseline_step_number
            zonecoverage_step_number = 0
            microgradient_step_number = 0
        elif (last_selected_path == 'B'): # zone coverage path

            traveled_points = get_traveled_points('planningStack/csv_data/zonecoverage_ordered.csv', (zonecoverage_step_number - 1) * step_size, zonecoverage_step_number * step_size)
            append_traveled_points(traveled_points)

            current_step = zonecoverage_step_number
            baseline_step_number = 0
            microgradient_step_number = 0
        elif (last_selected_path == 'C'): # microgradient path

            traveled_points = get_traveled_points('planningStack/csv_data/microgradient_ordered.csv', (microgradient_step_number - 1) * step_size, microgradient_step_number * step_size)
            append_traveled_points(traveled_points)

            current_step = microgradient_step_number
            baseline_step_number = 0
            zonecoverage_step_number = 0
        # print('path suggestion: last selected path number', last_selected_path)


    start_from = current_step * step_size  # Calculate where to start based on current step


    # new_step_number = current_step + 1

    if (last_selected_path == 'A'): # baseline path

        baseline_step_number = current_step + 1

        # zonecoverage
        orig_zonecoverage_scale = get_scale('planningStack/csv_data/zonecoverage.csv')
        deletePointsWithinTraveledArea('planningStack/csv_data/zonecoverage.csv')


        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_zonecoverage_scale)
        generate_zonecoverage_path(newStartingPoint)



        # microgradient
        orig_microgradient_scale = get_scale_microgradient('planningStack/csv_data/microgradient.csv')
        deletePointsWithinTraveledAreaMicrogradient('planningStack/csv_data/microgradient.csv')

        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_microgradient_scale)
        generate_microgradient_path(newStartingPoint)

    elif (last_selected_path == 'B'): # zone coverage path

        zonecoverage_step_number = current_step + 1

        # baseline
        orig_baseline_scale = get_scale('planningStack/csv_data/baseline.csv')
        deletePointsWithinTraveledArea('planningStack/csv_data/baseline.csv')

        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_baseline_scale)
        generate_baseline_path(newStartingPoint)

        # microgradient
        orig_microgradient_scale = get_scale_microgradient('planningStack/csv_data/microgradient.csv')
        deletePointsWithinTraveledAreaMicrogradient('planningStack/csv_data/microgradient.csv')

        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_microgradient_scale)
        generate_microgradient_path(newStartingPoint)

    elif (last_selected_path == 'C'): # microgradient path
        microgradient_step_number = current_step + 1

        # zonecoverage
        deletePointsWithinTraveledArea('planningStack/csv_data/baseline.csv')

        orig_zonecoverage_scale = get_scale('planningStack/csv_data/zonecoverage.csv')
        deletePointsWithinTraveledArea('planningStack/csv_data/zonecoverage.csv')


        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_zonecoverage_scale)
        generate_zonecoverage_path(newStartingPoint)

        # baseline
        orig_baseline_scale = get_scale('planningStack/csv_data/baseline.csv')
        deletePointsWithinTraveledArea('planningStack/csv_data/baseline.csv')

        newStartingPoint = get_last_point('planningStack/csv_data/traveledPoints.csv', scaling_factor=orig_baseline_scale)
        generate_baseline_path(newStartingPoint)

    else: # none (first time)
        baseline_step_number = current_step + 1
        zonecoverage_step_number = current_step + 1
        microgradient_step_number = current_step + 1


    # print('current_step', current_step, 'start_from', start_from)

    print('baseline_step_number', baseline_step_number, 'zonecoverage_step_number', zonecoverage_step_number, 'microgradient_step_number', microgradient_step_number)

    # baseline path (path A on website)
    if (baseline_step_number > 0):
        path_x_1, path_y_1 = generateBaselinePath(num_points_between=50, step_size=step_size, start_from=(baseline_step_number - 1) * step_size).values()
    elif (baseline_step_number == 0):
        path_x_1, path_y_1 = generateBaselinePath(num_points_between=50, step_size=step_size, start_from=(baseline_step_number) * step_size).values()

    # zone coverage path (path B on website)

    if (zonecoverage_step_number > 0):
        path_x_2, path_y_2 = generateZonecoveragePath(num_points_between=50, step_size=step_size, start_from=(zonecoverage_step_number - 1) * step_size).values()
    elif (zonecoverage_step_number == 0):
        path_x_2, path_y_2 = generateZonecoveragePath(num_points_between=50, step_size=step_size, start_from=(zonecoverage_step_number) * step_size).values()

    # microgradient path (path C on website)
    if (microgradient_step_number > 0):
        path_x_3, path_y_3 = generateMicrogradientPath(num_points_between=50, step_size=step_size, start_from=(microgradient_step_number - 1) * step_size).values()
    elif (microgradient_step_number == 0):
        path_x_3, path_y_3 = generateMicrogradientPath(num_points_between=50, step_size=step_size, start_from=(microgradient_step_number - 1) * step_size).values()



    res = jsonify(
    [
        [path_x_1, path_y_1, [], []],
        [path_x_2, path_y_2, [], []],
        [path_x_3, path_y_3, [], []]
    ]
    )

    # print('path_x_1', path_x_1, 'path_y_1' , path_y_1)

   
    return res




@app.route('/gatherDataAndUpdate', methods=['POST'])
@cross_origin()

def gatherDataAndUpdate():
    global last_selected_path  # Add access to the global variable
    
    inputs = request.json
    selected_path_data = inputs['selected_path_data']

    # Flatten the selectedXs_path_cordinates
    flattened_selectedXs = [item for sublist in \
                            selected_path_data['selectedPath']['selectedXs_path_cordinates'] \
                                  for item in sublist]

    # Concatenate initial_path_x with flattened_selectedXs and convert to NumPy array
    concatenated_path_x = np.array(selected_path_data['initial_path']['initial_path_x']\
                                    + flattened_selectedXs)

    # Flatten the selectedYs_path_cordinates
    flattened_selectedYs = [item for sublist in \
                            selected_path_data['selectedPath']['selectedYs_path_cordinates'] \
                                for item in sublist]

    # Concatenate initial_path_y with flattened_selectedYs and convert to NumPy array
    concatenated_path_y = np.array(selected_path_data['initial_path']['initial_path_y']\
                                    + flattened_selectedYs)

    robot_path_x = concatenated_path_x
    robot_path_y = concatenated_path_y
    ENV = ManuallyEnv()
    PLANNER = ReactivePlanning(0.02, 50)
    ESTIMATOR = Estimation(False, 0.2, 0.15, 4)
    measured_robot_coordinates, measured_shear, measured_moisture = ENV.gather_data(robot_path_x, robot_path_y)
    vals = np.array([[x1_, x2_] for x1_ in np.linspace(0, 1, num=int(1/0.02)) for x2_ in np.linspace(0, 1, num=int(1/0.02))])
    shear_prediction, information_shear, shear_std, gp = ESTIMATOR.estimate(measured_robot_coordinates, measured_shear, vals)
    
    shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
    information_shear = information_shear.reshape(estimatedNum, estimatedNum)
    shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))

    return jsonify(
    {
        'path_x': robot_path_x.tolist(), 
        'path_y': robot_path_y.tolist(), 
        'uncertainity': shear_std.T[::-1, :].tolist(),
        'shear_prediction': shear_prediction.T[::-1, :].tolist(),
        'info_gain_shear':information_shear.T[::-1, :].tolist(), # Todo: CONFIRM ONCE THIS IS INFO GAIN
        'measured_data' : 
            { 
                "moisture": measured_moisture.T.tolist(),
                "shear":measured_shear.T.tolist()
            }
    }
    )


@app.route('/second_api/save_selected_path_json', methods=['POST'])
@cross_origin()
def getSecondApi():

    global last_selected_path
    inputs = request.json
    print(inputs, 'inputs')

    # print('last selected path number', inputs["selected_path_number"])
    last_selected_path = chr(ord('A') + inputs["selected_path_number"])
    # print('last selected path', last_selected_path)


    file_path = os.getenv('LOG_FILE_LOCATION')
    if not file_path:
        # Either return an error or use a default path
        return jsonify({
            "error": "LOG_FILE_LOCATION environment variable not set."
        }), 500

    # Now, file_path is guaranteed to be non-empty
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    existing_data.append(inputs)
    with open(file_path, 'w') as f:
        json.dump(existing_data, f)


    return jsonify(inputs["inputof_first_time_Path_Selected"])




@app.route('/submit', methods=['POST'])
@cross_origin()
def submit_ratings():
    inputs = request.json
    print('Received ratings:', inputs)

    # Extract the ratings from the JSON payload
    rating1 = inputs.get('first')
    rating2 = inputs.get('second')

    # Prepare the data to be saved
    result = {
        'first': rating1,
        'second': rating2
    }

    




    # TODO: CUSTOMISE THIS TO DETECT AUTOMATICALLY THE json_paths FOLDER to save the paths
    
    # Specify the file path to save the ratings
    file_path = './json_paths/hypothesis.json' #for Harshita
    #file_path = '/home/nikola_shrutika/Documents/QianLab/lassie-decisionmaking/flask/json_paths/path.json'  #for shrutika
    # Check if the file exists
    if os.path.exists(file_path):
        # Load existing JSON data from the file
        with open(file_path, 'r') as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    # Append the new data to the existing data
    existing_data.append(result)

    # Write the combined data back to the JSON file
    with open(file_path, 'w') as f:
        json.dump(existing_data, f)

    return jsonify({'status': 'success', 'message': 'Ratings saved successfully.'})



    




#update this
@app.route('/stop_data_collection_and_survey', methods=['POST'])
@cross_origin()
def fouthApi():
    inputs = request.json
    path_x = np.array(inputs['path_x'])
    path_y = np.array(inputs['path_y'])
    shear = np.linspace(0.5, 1, 500)
    moisture = np.linspace(0, 1, 500)
    output = {
    'shear': shear.tolist(),
    'moisture': moisture.tolist(),
    }
    return jsonify(output)






if __name__ == '__main__':
    
    app.run(debug=True, port=8090)


