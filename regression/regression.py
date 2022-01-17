from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from scipy.optimize import curve_fit
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

#Regression API Route
@app.route('/regression', methods=['POST'])
@cross_origin()
def hypofit():
    inputs = request.json
    xx = np.array(inputs['xx'])
    yy = np.array(inputs['yy'])
    zz = np.array(inputs['zz'])
    moist = np.array(inputs['moist'])
    
    P0 = [8, 0.842, 9.5]
    lb = [0, 0, 0]
    ub = [20, 5, 20]

    Pfit, covs = curve_fit(model, xx, yy, P0, bounds=(lb, ub))
    xfit = np.linspace(0, 16, 17)
    unique_x = np.unique(xx)
    loc = np.unique(zz)

    RMSE_average = [0] * len(unique_x)
    RMSE_spread = [0] * len(unique_x)

    for i in range(len(unique_x)):
        aa = np.nonzero(xx == unique_x[i])[0]
        xx_finded = xx[aa]
        yy_finded = yy[aa]
        RMSE_average[i] = np.abs(np.mean(yy_finded) - np.mean(model(xx_finded, Pfit[0], Pfit[1], Pfit[2])))
        RMSE_spread[i] = np.std(yy_finded, ddof=1)

    xx_model = model(xfit, Pfit[0], Pfit[1], Pfit[2])

    output = {
        'loc': loc.tolist(), 
        'err': RMSE_average, 
        'spread': RMSE_spread, 
        'xfit': xfit.tolist(), 
        'xx_model': xx_model,
        'Pfit': Pfit.tolist()
    }

    return jsonify(output)

if __name__ == '__main__':
    app.run(debug=True)