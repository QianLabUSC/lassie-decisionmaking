'''
Weighted Objectives Method:

Given user inputs' data, this program is to suggest the best location based on selected objectives and their rankings.

1. Calculate weights for objectives: Spaital = 0.6, Moisture = 0.4, Discrepancy = 0.3
2. Calculate weighted reward array for three objectives
3. Aggregate three weighted reward array and find the most 3 optimal suggested locations.

'''

import random
import numpy as np

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

def findBestWeightedObjectives(location, spatial_reward, moisture_reward, discrepancy_reward):
    # 1. Calculate three different weights for objectives that sum to 1
    spatial_weight = calculateRandomWeights()[0]
    moisture_weight = calculateRandomWeights()[1]
    discrepancy_weight = calculateRandomWeights()[2]

    # 2. Calculate weighted reward array for three objectives
    weighted_spatial_reward = list(map(lambda x: x*spatial_weight, spatial_reward))
    weighted_moisture_reward = list(map(lambda x: x*moisture_weight, moisture_reward))
    weighted_discrepancy_reward = list(map(lambda x: x*discrepancy_weight, discrepancy_reward))

    # 3. Aggregate three weighted reward array and find the most 3 optimal suggested locations
    aggregated_reward = np.sum(np.array([weighted_spatial_reward, weighted_moisture_reward, weighted_discrepancy_reward]), axis=0)

    final_locs = findNthLargestLocations(3, aggregated_reward)

    best_spatial_reward = list(map(lambda x: spatial_reward[x], final_locs))
    best_moisture_reward = list(map(lambda x: moisture_reward[x], final_locs))
    best_discrepancy_reward = list(map(lambda x: discrepancy_reward[x], final_locs))

    output = {
        'final_locs': final_locs,
        'best_spatial_reward': best_spatial_reward,
        'best_moisture_reward': best_moisture_reward,
        'best_discrepancy_reward': best_discrepancy_reward,
        'spatial_weight': spatial_weight,
        'moisture_weight': moisture_weight,
        'discrepancy_weight': discrepancy_weight
    }

    return output

'''Find the most N optimal suggested locations from weighted reward array
Args:
    n: number of suggested locations
    arr: the given reward array
Returns:
    A list of first N optimal suggested locations
'''
def findNthLargestLocations(n, arr):
    my_dict = dict()
    for key,value in enumerate(arr):
        my_dict[key] = value
    sorted_dict = sorted(my_dict, key=my_dict.get, reverse=True)

    output = []
    for i in range(0, n):
        output.append(sorted_dict[i])
    
    return output

'''Calculate three different weights for objectives that sum to 1
Args:
Returns:
    A list of three different weights for objectives that sum to 1
'''
def calculateRandomWeights():
    r = [random.random() for i in range(0,3)]
    s = sum([random.random() for i in range(0,3)])
    r = [ i / s for i in r ]

    return r


if __name__ == "__main__":
    print(findBestWeightedObjectives(location, spatial_reward, moisture_reward, discrepancy_reward))