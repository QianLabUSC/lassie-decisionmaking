import os
import sys
sys.path.insert(0, '/home1/f/foraging/public_html/cgi-bin/venv/lib/python3.6/site-packages')
from multiObjectiveDecisionMaking.decision_making import *
from multiObjectiveDecisionMaking.multi_objective_tools import *

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
    plot_test(DM.location_flattend, DM.detailed_loc_flattend,  
              DM.shearstrength_flattend, info_gaussian, information_level,
              info_signal, disp_gaussian, feature_gaussian, noise_esti, 
              disp_signal, xx_model, gasussian_prediction, gaussian_uncertainty, pareto_sets, pareto_locs)
    # print("final_type: ", final_type)
    # print("final_suggestion: ", final_suggestion)
    # print("suggestion_sets: ", suggestion_sets)
    print('-----------------------------------------------------------robot algorithm state-----------------------------------------------------------')
    print('----------------balance type: 0: info focused, 0.25: info hierarchy, 0.5: trade off, 0.75: disp hierarchy, 1: disp focused-----------------')
    print('user type', multi_objective_pattern)
    print('current information level:           ', information_level, 'current information threshold: ', [k_info_low_,k_info_high_])
    print('current information signal strength: ', info_signal, 'current information threshold: ', k_info_signal_)
    print('current discrepancy signal strength: ', disp_signal, 'current disp signal threshold', k_noise_)
    print('current balance type', final_type)
    print('-------------------------------------------------------------------------------------------------------------------------------------------')
    
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
    
    print('Therefore, the robot suggests sampling at location : ', final_suggestion)
    print('---------------------------------------------------------------------------------------------------------------------------------------')
    print(suggestion_sets)
    output = {
        'final_type': final_type,
        'final_suggestion': final_suggestion,
        'suggestion_sets': suggestion_sets.tolist(),
        'info_gaussian': info_gaussian.tolist(),
        'disp_gaussian': disp_gaussian.tolist(),
        'information_level': information_level,
        'info_signal': info_signal,
        'noise_esti': noise_esti,
        'disp_signal': disp_signal,

    }
    # output = findbestlocation(DM.location_flattend, info_gaussian, disp_gaussian, feature_gaussian)
    # app.config['ros_node'].publish_gui_information([0.2,0.1,0.1])
    # deploy_plot(PathPlanning.ObjectiveComputing, location, location, sample, mm, erodi, output)
    return jsonify(output)
    
    
if __name__ == '__main__':
    
    app.run(debug=True)