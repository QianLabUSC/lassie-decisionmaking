'''
Weighted Objectives Method:

Given user inputs' data, this program is to suggest the best location based on selected objectives and their rankings.

1. Calculate weights for objectives: Spaital = 0.6, Moisture = 0.4, Discrepancy = 0.3
2. Calculate weighted reward array for three objectives
3. Aggregate three weighted reward array and find the most 3 optimal suggested locations.

'''

import random
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
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



def rs_weights_from_rank(rank):
    """
    Generate Rank-sum (RS) weights based on a given rank.

    Parameters:
    rank (numpy.ndarray): An array of shape (n,) containing the rank for each alternative, where n is the number of alternatives.

    Returns:
    numpy.ndarray: An array of shape (n, ) containing the RS weights for each alternative.
    """

    # Compute the number of alternatives
    n = len(rank)

    # Compute the RS weights for each alternative
    rs_weights = np.array([2 * (n + 1 - r) / (n * (n + 1)) for r in rank])

    return rs_weights



def rank_centroid_from_rank(rank):
    """
    Generate weights based on the given rank using the roc method.

    Parameters:
    rank (numpy.ndarray): An array of shape (n,) containing the rank for each alternative, where n is the number of alternatives.

    Returns:
    numpy.ndarray: An array of shape (n, ) containing the weights for each alternative.
    """
    # Compute the number of alternatives
    n = len(rank)

    # Compute the maximum rank
    max_rank = np.max(rank)

    # Compute the denominator of the weight formula
    denominator = np.sum([1 / k for k in range(1, n+1)])

    # Compute the numerator of the weight formula for each alternative
    numerator = np.array([np.sum([1 / k for k in range(i, n+1)]) for i in rank])

    # Compute the weights using the roc weighting method
    weights = np.array( [1/max_rank * np.sum(1/k for k in range(j, max_rank+1)) for j in rank])

    return weights

def equal_weights(rank):
    weights = 1/len(rank) * np.ones(len(rank))
    return weights


def weight_columns(vector, weights):
    # Convert the 2D vector to a NumPy array for easier manipulation
    array = np.array(vector)
    
    # Make sure the weights list has the same length as the number of columns in the array
    assert len(weights) == array.shape[1], "Number of weights must match number of columns"
    
    # Multiply each column by its corresponding weight
    weighted_columns = array * weights
    
    # Sum the weighted columns along the rows to get a single column vector
    weighted_vector = np.sum(weighted_columns, axis=1)
    
    return weighted_vector

def findBestWeightedObjectives(reward_sets, weight_methods, rank):
    # 1. Calculate three different weights for objectives that sum to 1
    # weights  = weight_methods(rank)
    if(len(rank) == 1):
        weights = [1]
    elif(len(rank) ==2):
        weights = [0.6, 0.4]
    elif(len(rank) == 3):
        weights = [0.5, 0.3, 0.2]
    elif(len(rank) == 4):
        weights = [0.4, 0.3, 0.2, 0.1]
    else:
        print("error", rank)
        
    # print(weights)

    # 3. Aggregate three weighted reward array and find the most 3 optimal suggested locations
    aggregated_reward = weight_columns(reward_sets, weights)

    final_locs = findNthLargestLocations(3, aggregated_reward)
    # plt.rcParams['figure.figsize'] = [10, 5]
    # plt.rcParams.update({'font.size': 22})

    # # Plot a scatter graph of all results
    # plt.plot(np.linspace(1,22,22), reward_sets[:,0], marker="o", color= "yellow", label="spatial")
    # plt.plot(np.linspace(1,22,22), reward_sets[:,1], 'o-', color="red", label="moisture")
    # plt.plot(np.linspace(1,22,22), reward_sets[:,2], 'o-', color="blue", label="discrepancy")
    # plt.plot(np.linspace(1,22,22), aggregated_reward, 'd-', color="green", label="aggregated reward")
    # _ = plt.title('The result data', fontsize=22)
    # plt.xlabel('location', fontsize=22)
    # plt.ylabel(' reward', fontsize=22)
    # plt.grid(True, linestyle='--')
    # plt.legend(loc="lower right", fontsize=15)
    # plt.show()

    return final_locs, aggregated_reward / np.max(aggregated_reward)

'''Find the most N optimal suggested locations from weighted reward array
Args:
    n: number of suggested locations
    arr: the given reward array
Returns:
    A list of first N optimal suggested locations
'''
def findNthLargestLocations(n, arr):
    normalized_vector = arr / np.max(arr)
    indexs, values = signal.find_peaks(normalized_vector, height=0.3, distance=2)
    if len(indexs) == 0:
        indexs = normalized_vector.argsort()[-3:][::-1]
        max_used_spatial = True
    elif len(indexs) == 1:
        indexs = np.append(indexs, normalized_vector.argsort()[-2:][::-1])
        max_used_spatial = True
    elif len(indexs) == 2:
        indexs = np.append(indexs, normalized_vector.argsort()[-1:][::-1])
        max_used_spatial = True
    elif len(indexs) >= 3:
        reward_list = normalized_vector[indexs]
        max_index = reward_list.argsort()[-3:][::-1]
        indexs = indexs[max_index]
    
    return indexs 

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
    inputs = np.array([spatial_reward, moisture_reward, discrepancy_reward]).T
    final_locs = findBestWeightedObjectives(inputs, rank_centroid_from_rank, [3,2,1])
    plt.rcParams['figure.figsize'] = [10, 5]
    plt.rcParams.update({'font.size': 22})

    # Plot a scatter graph of all results
    plt.plot(spatial_reward, marker="o", color= "yellow", label="spatial")
    plt.plot(moisture_reward, 'o-', color="red", label="moisture")
    plt.plot(discrepancy_reward, 'o-', color="blue", label="discrepancy")
    plt.plot(final_locs, np.ones(len(final_locs)), 'd', color="blue", label="suggestions")
    _ = plt.title('The result data', fontsize=22)
    plt.xlabel('location', fontsize=22)
    plt.ylabel(' reward', fontsize=22)

    plt.grid(True, linestyle='--')
    plt.legend(loc="lower right", fontsize=15)
    plt.show()
    # print(rank_centroid_from_rank([2, 1,3]))