import numpy as np
import matplotlib.pyplot as plt
import oapackage

# Spatial vs Discrepancy
data_points = [[0.74297972, 0.43861609, 0.74297972, 0.97533451, 0.99950383, 0.99999791, 
                0.99999791, 0.99950383, 0.97533451, 0.74297971, 0.43861399, 
                0.74248355, 0.95066902, 0.74248355, 0.43861399, 0.74297762, 
                0.97483835, 0.97483835, 0.74297762, 0.43861608, 0.74297972, 0.97533451],
               [0.43821028, 0.41339308, 0.40092623, 0.38858425, 0.37624228, 0.3639003,
                0.35155833, 0.33921636, 0.32687438, 0.31453241, 0.29890192, 
                0.25991197, 0.25591089, 0.20604803, 0.09112215, 0.11516934, 
                0.15188025, 0.18859141, 0.22530257, 0.26201373, 0.29770886, 0.3081817]
               ]
# Convert 2d list into 2d array
spatial_discrepancy_reward = np.array(data_points)

# Iterate through every values for each objetives. In our case, 22 values.
for ii in range(0, spatial_discrepancy_reward.shape[1]):
    w = spatial_discrepancy_reward[:,ii]
    fac = 0.6 + 0.4 * np.linalg.norm(w)
    spatial_discrepancy_reward[:,ii] = (1 / fac) * w

plt.rcParams['figure.figsize'] = [20, 10]
plt.rcParams.update({'font.size': 22})

h = plt.plot(spatial_discrepancy_reward[0,:], spatial_discrepancy_reward[1,:], '.b',  marker="o", markersize=20, label='22 data points')
_ = plt.title('The input data', fontsize=25)

plt.xlabel('spatial reward', fontsize=25)
plt.ylabel('discrepancy reward', fontsize=25)

plt.grid(True, linestyle='--')
_=plt.legend(loc="lower left", numpoints=1)
plt.show()

pareto = oapackage.ParetoDoubleLong()

for ii in range(0, spatial_discrepancy_reward.shape[1]):
    w = oapackage.doubleVector((spatial_discrepancy_reward[0,ii], spatial_discrepancy_reward[1,ii]))
    pareto.addvalue(w, ii)
# sorted_pareto = sorted(pareto, reverse=True)

pareto.show(verbose=1)

lst = pareto.allindices() # the indices of the Pareto optimal designs
for i in lst:
    print(i)
    
optimal_datapoints = spatial_discrepancy_reward[:,lst]
print(optimal_datapoints)

h = plt.plot(spatial_discrepancy_reward[0,:], spatial_discrepancy_reward[1,:], '.b', marker="o", markersize=20, label='Non Pareto-optimal')
hp = plt.plot(optimal_datapoints[0,:], optimal_datapoints[1,:], '.r', marker="*", markersize=20, label='Pareto optimal')

_ = plt.title('The output data', fontsize=25)
plt.xlabel('spatial reward', fontsize=25)
plt.ylabel('discrepancy reward', fontsize=25)
plt.grid(True, linestyle='--')

_=plt.legend(loc="lower left", numpoints=1)
plt.show()