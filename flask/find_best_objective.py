from typing import Set

'''
Brute Force Method:

Given user inputs' data, this program is to suggest the best location based on selected objectives and their rankings.

1. Calculate the first 6 locations that have maximal spatial reward
2. Calculate the first 4 locations that have maximal moisture reward from previous calculated 6 locations
3. Calculate the first 3 locations that have maximal discrepancy reward from previous calculated 4 locations
4. Output the calculated 3 locations as the most 3 optimal suggested locations.

'''

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

def findBestObjectives(location, spatial_reward, moisture_reward, discrepancy_reward):
    # 1. Calculate the first 6 locations that have maximal spatial reward
    bestSpatialReward = findNLargestElements(6, spatial_reward)[1]
    bestSpatialLocations = findNLargestElements(6, spatial_reward)[0]

    bestMoistureReward = []
    for i in bestSpatialLocations:
        bestMoistureReward.append(moisture_reward[i])

    # 2. Calculate the first 4 locations that have maximal moisture reward from previous calculated 6 locations
    bestMoistureReward = findNLargestElements(4, bestMoistureReward)[1]
    bestMoistureLocations = findLocations(bestMoistureReward, moisture_reward)

    bestDiscrepancyReward = []
    for i in bestMoistureLocations:
        bestDiscrepancyReward.append(discrepancy_reward[i])

    # 3. Calculate the first 3 locations that have maximal discrepancy reward from previous calculated 4 locations
    bestDiscrepancyReward = findNLargestElements(3, bestDiscrepancyReward)[1]
    bestFinalLocations = findLocations(bestDiscrepancyReward, discrepancy_reward)

    # 4. Output the calculated 3 locations as the most optimal suggested locations to the user
    output = {
        'spatial_locs': bestSpatialLocations,
        'spatial_reward': bestSpatialReward,
        'moisture_locs': bestMoistureLocations,
        'moisture_reward': bestMoistureReward,
        'discrepancy_locs': bestFinalLocations,
        'discrepancy_reward': bestDiscrepancyReward
    }

    return output

'''find first n largest values from the array
Args:
    n: number of largest values
    arr: the given reward array
Returns:
    A list of first n largest values from the array
'''
def findNLargestElements(n, arr):
    my_dict = dict()
    
    for key, value in enumerate(arr):
        my_dict[key] = value

    sorted_dict = sorted(my_dict, key=my_dict.get, reverse=True)
    print("sorted: ", sorted_dict)

    index = []
    for i in range(0, n):
        index.append(sorted_dict[i])

    output = []
    for i in index:
        output.append(my_dict[i])

    return index, output

'''find locations from the reward array
Args:
    curr_reward: previous calculated best reward array
    reward: original reward array
Returns:
    A list of best locations from the orginal reward array
'''
def findLocations(curr_reward, reward):
    output = []

    for i in curr_reward:
        output.append(reward.index(i))

    return output

print(findBestObjectives(location, spatial_reward, moisture_reward, discrepancy_reward))