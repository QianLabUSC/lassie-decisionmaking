import os
import sys
from traveler_decision_making import *
sys.path.insert(0, '/home1/f/foraging/public_html/cgi-bin/venv/lib/python3.6/site-packages')

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import numpy as np

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# #Sample GET API Route
# @app.route('/sample', methods=['GET'])
# @cross_origin()
# def sample():
#     return {"outputs": ["Output1", "Output2", "Output3"]}

def model(x, P1, P2, P3):
    result = [0] * len(x)
    for i in range(len(x)):
        result[i] = P1 - P2 * max(P3 - x[i], 0)
    return result

@app.route("/abc")
def hello_world():
    return "<p>Hello, World!</p>"

# backend decision making algorithm processing steps
# requires a json object which contains list <location>, list <sample>
# a matrix moist: a row is the sampled moists in one location, 
#                 different rows represents different locations
# a matrix erodi: a row is the sampled erodis in one location,
#                 different rows represents different locations
@app.route('/process', methods=['POST'])
@cross_origin()
def process():
    print('A new test: ')
    inputs = request.json
    location = np.array(inputs['locations'])+1
    sample = np.array(inputs['measurements'])
    mm = np.array(inputs['moistureValues'])
    erodi = np.array(inputs['shearValues'])
    print('This is the inputs data from front-end: ', inputs)
    print('This is the location data from front-end: ', location)
    print('This is the sample data from front-end: ', sample)
    Traveler_DM = DecisionMaking()
    Traveler_DM.update_current_state(location, sample, mm, erodi)
    Traveler_DM.handle_spatial_information_coverage()
    Traveler_DM.handle_variable_information_coverage()
    Traveler_DM.handle_discrepancy_coverage()
    results = Traveler_DM.calculate_suggested_location()
    print('calculated suggested location: ', results)
    # Plot function
    deploy_plot(Traveler_DM, location, Traveler_DM.current_state_location, Traveler_DM.current_state_sample, Traveler_DM.current_state_moisture, Traveler_DM.current_state_shear_strength, results)
    spatial_selection = np.array(results['spatial_locs'])
    print('spatial_selection: ', spatial_selection)
    variable_selection = np.array(results['variable_locs'])
    print('variable_selection: ', variable_selection)
    discrepancy_selection = np.array(results['discrepancy_locs'])
    print('discrepancy_selection: ', discrepancy_selection)
    discrepancy_low_selection = np.array(results['discrepancy_lows_locs'])
    print('discrepancy_low_selection: ', discrepancy_low_selection)
    print('spatial_reward: ', Traveler_DM.spatial_reward)
    print('variable_reward: ', Traveler_DM.variable_reward)
    print('discrepancy_reward: ', Traveler_DM.discrepancy_reward)
    output = {
        'spatial_selection': spatial_selection.tolist(), 
        'variable_selection': variable_selection.tolist(), 
        'discrepancy_selection': discrepancy_selection.tolist(), 
        'discrepancy_low_selection': discrepancy_low_selection.tolist(), 
        'spatial_reward': Traveler_DM.spatial_reward.tolist(),
        'variable_reward': Traveler_DM.variable_reward.tolist(),
        'discrepancy_reward': Traveler_DM.discrepancy_reward.tolist()
    }

    return jsonify(output)
    
    
if __name__ == '__main__':
    app.run(debug=True)