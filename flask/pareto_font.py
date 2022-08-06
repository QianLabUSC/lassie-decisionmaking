'''
Patero Font Method:

Given user inputs' data, this program is to suggest the best location based on selected objectives and their rankings.

1. Take two equally-sized lists and return just the elements which lie on the Pareto frontier, sorted into order.
2. Find the maximum for both X and Y.
3. Specify maxX = False or maxY = False to find the minimum for either or both of the parameters

'''

import numpy as np
import matplotlib.pyplot as plt

location = [2, 11, 15, 20]

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


def pareto_frontier(X, Y, maxX = True, maxY = True):

    sorted_datapoints = sorted([[X[i], Y[i]] for i in range(len(X))], reverse=maxX)
    pareto_front = [sorted_datapoints[0]]
    
    for datapoint in sorted_datapoints[1:]:
        if maxY: 
            # Search for values that are higher than Y
            if datapoint[1] >= pareto_front[-1][1]:
                pareto_front.append(datapoint)
        else:
            # Search for values that are lower than Y
            if datapoint[1] <= pareto_front[-1][1]:
                pareto_front.append(datapoint)

    p_frontX = [datapoint[0] for datapoint in pareto_front]
    p_frontY = [datapoint[1] for datapoint in pareto_front]

    return p_frontX, p_frontY


plt.rcParams['figure.figsize'] = [20, 10]
plt.rcParams.update({'font.size': 22})

# Find lowest values for spatial_reward and highest for moisture_reward
pareto_front = pareto_frontier(spatial_reward, moisture_reward, maxX = False, maxY = True) 

# Plot a scatter graph of all results
plt.scatter(spatial_reward, moisture_reward, marker="o", s=50, label="pareto optimals")

_ = plt.title('The result data', fontsize=22)
plt.xlabel('spatial reward', fontsize=22)
plt.ylabel('moisture reward', fontsize=22)

plt.grid(True, linestyle='--')
plt.legend(loc="lower right", fontsize=15)

# Then plot the Pareto frontier on top
plt.plot(pareto_front[0], pareto_front[1], color="black", label="pareto front")
plt.show()