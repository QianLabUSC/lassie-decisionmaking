'''
@author: Shipeng Liu/RoboLand
@description: this file contains the implement of hypothesis
'''

from scipy.optimize import curve_fit
from scipy import signal
import numpy as np





'''the hypothesis model function(piese wise linear function)
Args:
    x: input
    P1,P2,P3: parameter
Returns:
    output
'''


def model(x, P1, P2):
    result = P1 + P2 * x
    return result


'''the hypothesis model function
Args:
    xx: 
    yy: 
    zz:
    moist: 
Returns:
    err:
    xfit:
    model:
'''

def linear_hypofit(xx, yy, detailed_xx):

    P0 = [1, 0.842]
    lb = [-20, -10]
    ub = [20, 10]
    print("test model", xx, yy)
    Pfit, covs = curve_fit(model, xx, yy, P0, bounds=(lb, ub))
    print(Pfit)

    xfit = detailed_xx
    unique_x = np.unique(xx)

    RMSE_average = [0] * len(unique_x)
    RMSE_spread = [0] * len(unique_x)

    for i in range(len(unique_x)):
        aa = np.nonzero(xx == unique_x[i])[0][0]
        xx_finded = xx[aa]
        yy_finded = yy[aa]
        RMSE_average[i] = (np.abs(
            np.mean(yy_finded) -
            np.mean(model(xx_finded, Pfit[0], Pfit[1]))))
    x_detail_fit = detailed_xx
    xx_model = model(xfit, Pfit[0], Pfit[1])
    xx_detail_model = model(x_detail_fit, Pfit[0], Pfit[1])


    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model