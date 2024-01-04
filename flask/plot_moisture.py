from cProfile import label
import os
import matplotlib.pyplot as plt
from scipy.interpolate import make_interp_spline
import numpy as np

from weighted_objectives import *
from find_best_objective import *

spatial_reward = [0.74297972, 0.43861609, 0.74297972, 0.97533451, 0.99950383, 0.99999791, 
                  0.99999791, 0.99950383, 0.97533451, 0.74297971, 0.43861399, 
                  0.74248355, 0.95066902, 0.74248355, 0.43861399, 0.74297762, 
                  0.97483835, 0.97483835, 0.74297762, 0.43861608, 0.74297972, 0.97533451]

moisture_reward = [0.56349887, 0.34613042, 0.65770121, 0.79747314, 0.97030054, 0.9955728, 
                   0.98097963, 0.94359359, 0.70435853, 0.30699427, 0.17763862, 
                   0.35719056, 0.70823421, 0.48561455, 0.19007874, 0.48733299, 
                   0.84993315, 0.82400426, 0.36457368, 0.18344314, 0.56885874, 0.69979602]

discrepancy_reward = [0.43821028, 0.41339308, 0.40092623, 0.38858425, 0.37624228, 0.3639003,
                      0.35155833, 0.33921636, 0.32687438, 0.31453241, 0.29890192, 
                      0.25991197, 0.25591089, 0.20604803, 0.09112215, 0.11516934, 
                      0.15188025, 0.18859141, 0.22530257, 0.26201373, 0.29770886, 0.3081817]

# def plot_test():

plt.rcParams['figure.figsize'] = [30, 15]
plt.rcParams.update({'font.size': 22})

# output = findBestWeightedObjectives(location, spatial_reward, moisture_reward, discrepancy_reward)
output = findBestObjectives(location, spatial_reward, moisture_reward, discrepancy_reward)

x = np.arange(0, 22, 1) 
y2 = moisture_reward

best_locs = output.get('moisture_locs')
best_spatial = output.get('moisture_reward')

plt.scatter(best_locs, best_spatial, marker="o", s=500, label="best locations")
plt.legend(loc="lower right", fontsize=19)

# X_Y_Spline = make_interp_spline(x, y2)
# X_ = np.linspace(x.min(), x.max(), 500)
# Y_ = X_Y_Spline(X_)

plt.plot(x, y2, color="blue", label="moisture reward", linewidth=1.5)

plt.legend(loc="lower right", fontsize=19)

plt.title("Unweighted Objectives Algorithm", fontsize=30)
plt.xlabel("Locations (From 1 to 22)", fontsize=30) 
plt.ylabel("Calculated Rewards", fontsize=30) 

plt.grid(True, linestyle='--')

my_path = os.path.dirname(os.path.abspath(__file__))
plt.savefig(my_path + '\\figs_test\\Moisture.png')

plt.show()