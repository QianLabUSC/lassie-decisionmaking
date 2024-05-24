import os
import sys
sys.path.insert(0, '/home1/f/foraging/public_html/cgi-bin/venv/lib/python3.6/site-packages')
from multiObjectiveDecisionMaking.decision_making import *
from multiObjectiveDecisionMaking.multi_objective_tools import *
import json
from pathplanning import ManuallyEnv, ReactivePlanning, Estimation
from pathplanning2ndPath import ReactivePlanning2ndPath
from pathplanning3rdPath import ReactivePlanning3rdPath

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import numpy as np
# from ros2_node_webgui import *
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
# node_web_gui = Ros2NodeWebGui()
# app.config['ros_node'] = node_web_gui

reported_objecitve_type = dict()
reported_objecitve_type[0] = 'increasing information coverage'
reported_objecitve_type[1] = 'investigating the discrepancy between hypothesis and measurements'

reported_balance_type = dict()
reported_balance_type[0] = 'selecting locations that optimizes the objective of increasing information coverage based on data from previously sampled locations'
reported_balance_type[0.25] = 'hierarchically weighting sampling locations that foremost satisfy the objective of increasing information coverage and, to a lesser extent, the objective of investigating the discrepancy'
reported_balance_type[0.5] = 'evenly weighting sampling locations that satisfy both objectives of increasing information coverage and investigating the discrepancy'
reported_balance_type[0.75] = 'hierarchically weighting sampling locations that foremost satisfy the objective of investigating the discrepancy and, to a lesser extent, the objective of increasing information coverage'
reported_balance_type[1] = 'selecting locations that optimizes the objective of investigating the discrepancy based on data from previously sampled locations'


exception_list = dict()
exception_list[0] = 'Because the robot notices the overall current information coverage is low and undertainty is high'
exception_list[1] = 'Because the robot notices that there are locations where the data is at high discrepancy with the hypothesis'
exception_list[2] = 'Because the robot notices that there are locations with low information coverage and the discrepancy between the hypothesis and incoming data is not that obvious'
exception_list[3] = 'Because the robot notices that overall information level is high and undertainty is low'

k_info_signal_ = 0.5
k_noise_ = 2
k_info_low_ = 0.27
k_info_high_ = 0.7

# backend decision making algorithm processing steps
# requires a json object which contains list <location>, list <sample>
# a matrix moist: a row is the sampled moists in one location, 
#                 different rows represents different locations
# a matrix erodi: a row is the sampled erodis in one location,
#                 different rows represents different locations
@app.route('/process', methods=['POST'])
@cross_origin()
def process():
   
    inputs = request.json
    location = np.array(inputs['locations'])
    sample = np.array(inputs['measurements'])
    mm = np.array(inputs['moistureValues'])
    erodi = np.array(inputs['shearValues'])
    multi_objective_pattern = np.array(inputs['objective_repre'])
    # print(multi_objective_pattern)
    # print('location', location)
    # print('sample', sample)
    # print('mm',mm)
    # print('erodi', erodi)
    DM = DecisionMaking()
    DM.update_current_state(location, sample, mm, erodi)
    info_gaussian, information_level, info_signal = DM.handle_spatial_information_gaussian()
    disp_gaussian, feature_gaussian, noise_esti, disp_signal, xx_model,\
          gasussian_prediction, gaussian_uncertainty \
            = DM.handle_discrepancy_direct_gaussian()
    reward_vector = np.vstack((info_gaussian, disp_gaussian)).T
    final_type, final_suggestion_index, suggestion_sets_index, except_index, pareto_sets, pareto_locs = run_multi_objective_odsf(
                    reward_vector, information_level, multi_objective_pattern, 
                    info_signal, disp_signal, noise_esti, k_info_signal=k_info_signal_, k_noise=k_noise_, k_info_low = k_info_low_, k_info_high = k_info_high_)
    final_suggestion = DM.detailed_loc_flattend[final_suggestion_index]
    suggestion_sets = DM.detailed_loc_flattend[suggestion_sets_index]
    final_path_x = np.linspace(0.5, 1, 500)
    final_path_y = np.linspace(0, 1, 500)
    final_path_x1 = np.linspace(0.5, 0.5, 500)
    final_path_y1 = np.linspace(0, 1, 500)
    final_path_x2 = np.linspace(0.5, 1, 500)
    final_path_y2 = np.linspace(0, 0.5, 500)
    final_path1 = np.array([final_path_x, final_path_y]).tolist()
    final_path2 = np.array([final_path_x1, final_path_y1]).tolist()
    final_path3 = np.array([final_path_x2, final_path_y2]).tolist()
    final_path_set = [final_path1, final_path2, final_path3]
    # plot_test(DM.location_flattend, DM.detailed_loc_flattend,  
    #           DM.shearstrength_flattend, info_gaussian, information_level,
    #           info_signal, disp_gaussian, feature_gaussian, noise_esti, 
    #           disp_signal, xx_model, gasussian_prediction, gaussian_uncertainty, pareto_sets, pareto_locs)
    # print("final_type: ", final_type)
    # print("final_suggestion: ", final_suggestion)
    # print("suggestion_sets: ", suggestion_sets)
    # print('-----------------------------------------------------------robot algorithm state-----------------------------------------------------------')
    # print('----------------balance type: 0: info focused, 0.25: info hierarchy, 0.5: trade off, 0.75: disp hierarchy, 1: disp focused-----------------')
    # print('user type', multi_objective_pattern)
    # print('current information level:           ', information_level, 'current information threshold: ', [k_info_low_,k_info_high_])
    # print('current information signal strength: ', info_signal, 'current information threshold: ', k_info_signal_)
    # print('current discrepancy signal strength: ', disp_signal, 'current disp signal threshold', k_noise_)
    # print('current balance type', final_type)
    # print('-------------------------------------------------------------------------------------------------------------------------------------------')
    
    print('-----------------------------------------------------------robot explanation-----------------------------------------------------------')
    print(exception_list[except_index])
    if(float(multi_objective_pattern) == final_type):
        print('Your objective looks good, the robot did follow the objectives.')
        print(reported_balance_type[final_type])
    else:
        print('Therefore, robot overrides your objective resolution preference:')
        print(reported_balance_type[float(multi_objective_pattern)])
        print('to:')
        print(reported_balance_type[final_type])
    
    # print('Therefore, the robot suggests sampling at location : ', final_suggestion)
    # print('---------------------------------------------------------------------------------------------------------------------------------------')
    # print(suggestion_sets)
    output = {
        'final_type': final_type,
        'final_suggestion': final_suggestion,
        'suggestion_sets': suggestion_sets.tolist(),
        'info_gaussian': info_gaussian.tolist(),
        'disp_gaussian': disp_gaussian.tolist(),
        'path': final_path_set,
        'information_level': information_level,
        'info_signal': info_signal,
        'noise_esti': noise_esti,
        'disp_signal': disp_signal

    }
    # output = findbestlocation(DM.location_flattend, info_gaussian, disp_gaussian, feature_gaussian)
    # app.config['ros_node'].publish_gui_information([0.2,0.1,0.1])
    # deploy_plot(PathPlanning.ObjectiveComputing, location, location, sample, mm, erodi, output)
    return jsonify(output)

  
@app.route('/dataCollection', methods=['POST'])
@cross_origin()
def getVariable():
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

# @app.route('/first_api/generate_initial_path', methods=['POST'])
# @cross_origin()
# def getFirstApi():


#     inputs = request.json
#     print(inputs,'inputs')


# # export const objectiveOptions = [
# #   "Gather more data on unsampled area", // Option 0 - spatial coverage algorithm
# #   "Gather more data where the data has discrepancy with the hypothesis", // Option 1 - hypo invalidating algorithm
# #   "The risk of robot entrapment",
# #   "The time cost"
# # ]
#     # input
#     {
#     "input1_human_belief": {
#         "human_belief_selected_option": 1,
#         "human_belief_text_description":""
#     },
#     "input2_human_rank_order": [1,2,3,4],
#     "x_origin": 0,
#     "y_origin": 0,
#     "selected_outside": {  #intaill these will be empty only for thirs option this 
#         "start_x_cordinate_of_selected_path": 3,
#         "start_y_cordinated_of_selected_path":2,
#         "clicked_x_cordinate": 5,
#         "clicked_y_ordinate": 6
#       }
#     }


#     # generate 3 intail ordinates
#     firstPath=[
#       [
#         [0, 0.012699544, 0.01377393, 0.0148343254, 0.148540198, 0.1889489748],
#         [0, 0.01330707, 0.13732145, 0.14574513, 0.14924912, 0.1554568],
#         [], # prior values
#         [], #prior values
#       ],
#       [
#         [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
#         [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
#         [],
#         [],
#       ],
#       [
#         [0, 0.012699544, 0.1339001, 0.14742749, 0.16707451, 0.1682743],
#         [0, 0.01330707, 0.01474205, 0.1509101, 0.1752565, 0.1793485],
#         [],
#         [],
#       ],
#     ]

#     return jsonify(firstPath)



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

    file_path = '/home/bolt1299/Desktop/Roboland/lassie-decisionmaking/flask/json_paths/path.json'

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

@app.route('/third_api/gather_data', methods=['POST'])
@cross_origin()
def getThirdApi():
    
    inputs = request.json
    print(inputs,'inputs')


# export const objectiveOptions = [
#   "Gather more data on unsampled area", // Option 0 - spatial coverage algorithm
#   "Gather more data where the data has discrepancy with the hypothesis", // Option 1 - hypo invalidating algorithm
#   "The risk of robot entrapment",
#   "The time cost"
# ]
    # input
    {
        "step_number":1,
        "selected_path_number":2,
        "end_x_cordinate": 0.17514517,
        "end_y_cordinate": 0.1737063,
        "selected_path_data": [
            [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
            [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ] 
    }

    result= {
        "line_data": {
            "start_cordinate":[2,10],
            "end_corindate":[3,9]
        },
        "scatter_plot_data":{
           "x": [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
           "y": [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
           "moisture": [2,3,4,5,6],
           "shear": [6,7,8,4,1]  
        },
        "selected_path_data":[
            [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
            [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
            [2,3,4,5,6],
            [6,7,8,4,1]
        ]
    }

    return jsonify(result)



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




@app.route('/first_api/generate_initial_path', methods=['POST'])
@cross_origin()
def getFirstApi():
    inputs = request.json
    print(inputs,'inputs')

    # input
    {
    "iterations":10,
    "input1_human_belief": {
        "human_belief_selected_option": 1,
        "human_belief_text_description":""
    },
    "input2_human_rank_order": [1,2,3,4],
    "x_origin": 0,
    "y_origin": 0,
    "selected_outside": {  #intaill these will be empty only for thirs option this 
        "start_x_cordinate_of_selected_path": 3,
        "start_y_cordinated_of_selected_path":2,
        "clicked_x_cordinate": 5,
        "clicked_y_ordinate": 6
      }
    }

    robot_start_point = [0.0, 0.0]
    path_x, path_y = [], []
    path_x_2nd, path_y_2nd = [], []
    path_x_3rd, path_y_3rd = [], []

    for i in range(inputs["iterations"]):
        planner = ReactivePlanning(robot_start_point, 0.02, 10)
        planner_2nd= ReactivePlanning2ndPath(robot_start_point, 0.02, 10)
        planner_3rd= ReactivePlanning3rdPath(robot_start_point, 0.02, 10)

        # 1st path is 3 suggested paths
        robot_path_x, robot_path_y = planner.get_robot_path()
        F_x, F_y, path_x_new, path_y_new = planner.plan_for_next_horizon(np.random.rand(10, 10))  # Placeholder reward

        path_x.extend(path_x_new)
        path_y.extend(path_y_new)
        print('1st path_x:',path_x)
        print('1st path_y:',path_y)

        # 2nd path is 3 suggested paths
        robot_path_x_2nd, robot_path_y_2nd= planner_2nd.get_robot_path()
        F_x, F_y, path_x_new_2nd, path_y_new_2nd = planner_2nd.plan_for_next_horizon(np.random.rand(10,10))

        path_x_2nd.extend(path_x_new_2nd)
        path_y_2nd.extend(path_y_new_2nd)
        print('2nd path_x:',path_x_2nd)
        print('2nd path_y:',path_y_2nd)

         # 3rd path is 3 suggested paths
        robot_path_x_3rd, robot_path_y_3rd= planner_3rd.get_robot_path()
        F_x, F_y, path_x_new_3rd, path_y_new_3rd = planner_3rd.plan_for_next_horizon(np.random.rand(10,10))

        path_x_3rd.extend(path_x_new_3rd)
        path_y_3rd.extend(path_y_new_3rd)
        print('3rd path_x:',path_x_3rd)
        print('3rd path_y:',path_y_3rd)


     

     

        

    # generate 3 intail ordinates
    firstPath=[
      [
        path_x,
        path_y,
        [], # prior values
        [], #prior values
      ],
      [
        path_x_2nd,
        path_y_2nd,
        [],
        [],
      ],
      [
        path_x_3rd,
        path_y_3rd,
        [],
        [],
      ],
    ]

    print('firstpath12',firstPath)
    return jsonify(firstPath)



@app.route('/fourth_api/simulate', methods=['POST'])
def simulate():
    inputs = request.json
    print('inputs',inputs)

    iterations = inputs['step']  # Default to 1 if not specified
    prior_x = np.array([0.15, 0.12])
    prior_y = np.array([0.11, 0.29])
    robot_start_point = [0.0, 0.0]

    env = ManuallyEnv(prior_x, prior_y)
    planner = ReactivePlanning(robot_start_point, 0.02, 5)
    estimator = Estimation(False, 0.2, 0.15, 4)

    path_x, path_y = [], []
    for i in range(iterations):
        # Simulation logic here
        robot_path_x, robot_path_y = planner.get_robot_path()
        measured_robot_coordinates, measured_shear, measured_moisture = env.gather_data(robot_path_x, robot_path_y)
        vals = np.array([[x1_, x2_] for x1_ in np.linspace(0, 1, num=int(1/0.02)) for x2_ in np.linspace(0, 1, num=int(1/0.02))])
        shear_prediction, information_shear, shear_std, gp = estimator.estimate(measured_robot_coordinates, measured_shear, vals)
       
        shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
        information_shear = information_shear.reshape(estimatedNum, estimatedNum)
        shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))
        # print('shear_prediction, information_shear, shear_std, gp',shear_prediction, information_shear, shear_std, gp )
        # print('test')
        F_x, F_y, path_x_new, path_y_new = planner.plan_for_next_horizon(np.random.rand(10, 10))  # Placeholder reward
        path_x.extend(path_x_new)
        path_y.extend(path_y_new)
        print('path_x:',path_x)
        print('path_y:',path_y)

        #print('measured_robot_coordinates',measured_robot_coordinates, 'measured_moisture' , measured_moisture, 'measured_shear', measured_shear)
    
    return jsonify(
        {
            'path_x': path_x, 
            'path_y': path_y, 
            'uncertainity': shear_std.tolist(),
            'shear_prediction': shear_prediction.tolist(),
            'info_gain_shear':information_shear.tolist(), # Todo: CONFIRM ONCE THIS IS INFO GAIN
            'measured_data' : 
                { 
                    "moisture": measured_moisture.tolist(),
                    "shear":measured_shear.tolist()
                }
        }
        )


if __name__ == '__main__':
    
    app.run(debug=True)


