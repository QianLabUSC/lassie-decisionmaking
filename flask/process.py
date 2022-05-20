import os
import sys
from traveler_decision_making import deploy_plot
from high_path_planning import *
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
    inputs = request.json
    location = np.array(inputs['locations'])+1
    sample = np.array(inputs['measurements'])
    mm = np.array(inputs['moistureValues'])
    erodi = np.array(inputs['shearValues'])
    print('erodi:', erodi)
    PathPlanning = TravelerHighPathPlanning()
    output = PathPlanning.single_step_path_planning(location, sample, mm, erodi)
    # deploy_plot(PathPlanning.ObjectiveComputing, location, location, sample, mm, erodi, output)
    return jsonify(output)
    
    
if __name__ == '__main__':
    app.run(debug=True)