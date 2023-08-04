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


def linear_model(x, P1, P2):
    result = P1 + P2 * x
    return result


def three_piesewise_model(x, P1, P2, P3, P4, P5):
    result = np.where(x <= P3, P1 + P2 * x, 
              np.where(np.logical_and(P3 < x, x <= P4), P1 + P2 * P3, 
              P5 * (x - P4) + (P1 + P2 * P3)))  # Ensuring continuity at x = P4
    return result

def two_piecewise_model(x, P1, P2, P3, P4):
    result = np.where(x <= P3, P1 + P2 * x, 
              P1 + P2 * P3 + P4 * (x - P3))  # Ensuring continuity at x = P3
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

def hypofit(xx, yy, detailed_xx, model, P0, lb, ub):
    # print("test model", xx, yy)
    Pfit, covs = curve_fit(model, xx, yy, P0, bounds=(lb, ub))
    # print(Pfit)

    xfit = detailed_xx
    unique_x = np.unique(xx)

    RMSE_average = [0] * len(unique_x)
    RMSE_spread = [0] * len(unique_x)

    for i in range(len(unique_x)):
        aa = np.nonzero(xx == unique_x[i])[0][0]
        xx_finded = xx[aa]
        yy_finded = yy[aa]
        RMSE_average[i] = (np.abs(np.mean(yy_finded) - np.mean(model(xx_finded, *Pfit))))

    x_detail_fit = detailed_xx
    xx_model = model(xfit, *Pfit)
    xx_detail_model = model(x_detail_fit, *Pfit)

    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model



'''
kent hypothesis
test on 8/8) Kent's hypothesis: regolith strength will 
increase with ice content before 15-20%, then decrease 
as ice content continues to increase.
'''
def kent_fit(xx, yy, detail_xx):
    P0 = [1, 0.842, 0.5, -0.8]
    lb = [-20, 0, 0.05, -20]
    ub = [20, 20, 0.95, 0]
    RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model = \
        hypofit(xx,yy, detail_xx, two_piecewise_model, P0, lb, ub)
    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model

'''
dougl hypothesis
test on 8/9) Doug's hypothesis: regolith strength will increase with ice content
(before saturation), then plateau (around saturation), 
then further increase (after saturation)
'''
def doulg_fit(xx, yy, detail_xx):
    P0 = [1, 0.842,0.3, 0.6, 0.8]
    lb = [-20, 0, 0.15, 0.31, 0]
    ub = [20, 10, 0.3, 1, 20]
    RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model = \
        hypofit(xx,yy, detail_xx, three_piesewise_model, P0, lb, ub)
    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model


'''
test on 8/10) Ben's hypothesis: measured temperature (from thermal camera) will
decrease as ice-to-regolith ratio (estimated from visual image) increases, 
likely linearly
'''

def ben_fit(xx, yy, detail_xx):
    P0 = [1, 0.842]
    lb = [-20, -10]
    ub = [20, 10]
    RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model = \
        hypofit(xx,yy, detail_xx, linear_model, P0, lb, ub)
    return RMSE_average, RMSE_spread, xfit, xx_model, Pfit, model