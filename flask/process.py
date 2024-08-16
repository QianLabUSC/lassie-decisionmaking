import os
import sys
sys.path.insert(0, '/home1/f/foraging/public_html/cgi-bin/venv/lib/python3.6/site-packages')
from multiObjectiveDecisionMaking.decision_making import *
from multiObjectiveDecisionMaking.multi_objective_tools import *
import json
from pathplanning import ManuallyEnv, ReactivePlanning, Estimation
from pathplanning2ndPath import ReactivePlanning2ndPath
from pathplanning3rdPath import ReactivePlanning3rdPath

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

ROBOT_ESTIMATION_INTERVAL = 0.02 
estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)

@app.route('/pathsuggestion', methods=['POST'])
@cross_origin()

def pathsuggestion():
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
    PLANNER.update_robot_path(robot_path_x, robot_path_y)
    F_x, F_y, path_x_new, path_y_new = PLANNER.plan_for_next_horizon(shear_std.T) 

    #print('measured_robot_coordinates',measured_robot_coordinates, 'measured_moisture' , measured_moisture, 'measured_shear', measured_shear)
    print(path_x_new)
    return jsonify(
    [
        [path_x_new, path_y_new, [], []],
        [path_x_new, path_y_new, [], []],
        [path_x_new, path_y_new, [], []]
    ]
    )




@app.route('/gatherDataAndUpdate', methods=['POST'])
@cross_origin()

def gatherDataAndUpdate():
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
    import matplotlib.pyplot as plt
    plt.figure()
    plt.imshow(shear_prediction.T, extent=[0,1,0,1], origin='lower')
    plt.plot(robot_path_x, robot_path_y)
    plt.savefig("./json_paths/test.png", format="png")
    return jsonify(
    {
        'path_x': robot_path_x.tolist(), 
        'path_y': robot_path_y.tolist(), 
        'uncertainity': shear_std.T[::-1, :].tolist(),
        'shear_prediction': shear_prediction.T[::-1, :].tolist(),
        'info_gain_shear':information_shear.T[::-1, :].tolist(), # Todo: CONFIRM ONCE THIS IS INFO GAIN
        'measured_data' : 
            { 
                "moisture": measured_moisture.T[::-1, :].tolist(),
                "shear":measured_shear.T[::-1, :].tolist()
            }
    }
    )


@app.route('/second_api/save_selected_path_json', methods=['POST'])
@cross_origin()
def getSecondApi():
    inputs = request.json
    print(inputs,'inputs')
    # inputs1= {
    #   "step_number":1,
    #   "selected_path_number":2,
    #   "inputof_first_time_Path_Selected":  [
    #     [[], [], [], []],
    #     [
    #     [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
    #     [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
        #   [1, 1, 1, 1, 1],
        #   [1, 1, 1, 1, 1]
    #     ],
    #     [[], [], [], []]
    # ]
    # }

    # TODO: CUSTOMISE THIS TO DETECT AUTOMATICALLY THE json_paths FOLDER to save the paths
    #file_path = '/home/bolt1299/Desktop/Roboland/lassie-decisionmaking/flask/json_paths/path.json' #for Harshita
    #file_path = '/home/nikola_shrutika/Documents/QianLab/lassie-decisionmaking/flask/json_paths/path.json'

    # file_path='/Users/shrut/Desktop/roboland/lassie-decisionmaking/flask/json_paths/path.json'
    file_path = os.getenv('LOG_FILE_LOCATION')
    # Check if the file exists
    if os.path.exists(file_path):
        # Load existing JSON data from the file
        with open(file_path, 'r') as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    # Append the new data to the existing data
    existing_data.append(inputs)

    # Write the combined data back to the JSON file
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
    file_path = '/home/bolt1299/Desktop/Roboland/lassie-decisionmaking/flask/json_paths/hypothesis.json' #for Harshita
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


