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


def model(x, P1, P2, P3):
    result = [0] * len(x)
    for i in range(len(x)):
        result[i] = P1 - P2 * max(P3 - x[i], 0)
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

def hypofit(xx, yy, length):

    P0 = [8, 0.842, 9.5]
    lb = [0, 0, 0]
    ub = [20, 5, 20]

    Pfit, covs = curve_fit(model, xx, yy, P0, bounds=(lb, ub))
    xfit = np.linspace(1, length, length)
    unique_x = np.unique(xx)

    RMSE_average = [0] * len(unique_x)
    RMSE_spread = [0] * len(unique_x)

    for i in range(len(unique_x)):
        aa = np.nonzero(xx == unique_x[i])[0]
        xx_finded = xx[aa]
        yy_finded = yy[aa]
        RMSE_average[i] = (np.abs(
            np.mean(yy_finded) -
            np.mean(model(xx_finded, Pfit[0], Pfit[1], Pfit[2]))))
        RMSE_spread[i] = np.std(yy_finded, ddof=1)
    x_detail_fit = np.linspace(1, length, length)
    xx_model = model(xfit, Pfit[0], Pfit[1], Pfit[2])
    xx_detail_model = model(x_detail_fit, Pfit[0], Pfit[1], Pfit[2])


    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit,\
            x_detail_fit, xx_detail_model, model