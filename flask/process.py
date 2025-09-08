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
multi_objective_pattern = 0
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
    
    # --- Extract human input parameters ---
    human_objectives = np.array(inputs.get('human_objectives', [1, 0]))  # default [1, 0] for info-focused
    human_weights = np.array(inputs.get('human_weights', [1.0, 0.0]))  # default weights
    human_confidence = inputs.get('human_confidence', 0)  # default neutral confidence
    human_selected_location = inputs.get('human_selected_location', None)  # human's choice
    
    # Validate human_confidence is one of the allowed values
    allowed_confidence = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]
    if human_confidence not in allowed_confidence:
        # Find the closest confidence level
        closest_idx = np.argmin(np.abs(np.array(allowed_confidence) - human_confidence))
        human_confidence = allowed_confidence[closest_idx]
    
    # Check if there are any samples
    if len(location) == 0 or len(sample) == 0 or np.sum(sample) == 0:
        # No samples available, suggest location 0.5
        final_suggestion = 0.5
        best_location = 0.5
        suggestion_sets = np.array([0.5])
        info_gaussian = np.zeros(100)  # Assuming density is 100
        disp_gaussian = np.zeros(100)
        information_level = 0.0
        disp_signal = 0.0
        weights = np.array([0.5, 0.5])
        variances = 0.0
        suggestion_sets = np.array([0.5])
    else:
        DM = DecisionMaking()
        DM.update_current_state(location, sample, mm, erodi)
        info_gaussian, information_level, info_signal = DM.handle_spatial_information_gaussian()
        disp_gaussian, feature_gaussian, noise_esti, disp_signal, xx_model,\
              gasussian_prediction, gaussian_uncertainty \
                = DM.handle_discrepancy_direct_gaussian()
        reward_vector = np.vstack((info_gaussian, disp_gaussian)).T

        # --- Use new preference model for multi-objective decision ---
        # info_gaussian: objective 1, disp_gaussian: objective 2
        # information_level: s_t, disp_signal: d_t
        from multiObjectiveDecisionMaking.multi_objective_tools import run_multi_objective_preference
        best_index, best_location, weights, ranking, weighted_rewards, variances = run_multi_objective_preference(
            reward_vector,
            info_level=information_level,
            disp_level=disp_signal,
            return_all=True
        )
        final_suggestion = DM.detailed_loc_flattend[best_location]
        suggestion_sets = DM.detailed_loc_flattend[np.array(ranking)]

    # --- Output and explanation ---
    print('-----------------------------------------------------------robot algorithm state (preference model)-----------------------------------------------------------')
    print('Human objectives:', human_objectives)
    print('Human weights:', human_weights)
    print('Human confidence:', human_confidence)
    print('Human selected location:', human_selected_location)
    print('Current information level:', information_level)
    print('Current discrepancy signal:', disp_signal)
    print('Preference weights [info, disp]:', weights)
    print('Variance of weights:', variances)
    print('Best suggestion index:', best_location)
    print('Best suggestion location:', final_suggestion)
    print('All suggestions (ranked):', suggestion_sets)
    print('-------------------------------------------------------------------------------------------------------------------------------------------')

    output = {
        'final_suggestion': final_suggestion,
        'suggestion_sets': suggestion_sets.tolist(),
        'info_gaussian': info_gaussian.tolist(),
        'disp_gaussian': disp_gaussian.tolist(),
        'information_level': information_level,
        'disp_signal': disp_signal,
        'weights': weights.tolist(),
        'variances': variances,
        'human_objectives': human_objectives.tolist(),
        'human_weights': human_weights.tolist(),
        'human_confidence': human_confidence,
        'human_selected_location': human_selected_location,
    }
    return jsonify(output)
    
    
if __name__ == '__main__':
    
    app.run(debug=True)