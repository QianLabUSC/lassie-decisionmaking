'''
Patero Font Method:

Given user inputs' data, this program is to suggest the best location based on selected objectives and their rankings.

1. Take two equally-sized lists and return just the elements which lie on the Pareto frontier, sorted into order.
2. Find the maximum for both X and Y.
3. Specify maxX = False or maxY = False to find the minimum for either or both of the parameters

'''

import numpy as np
import matplotlib.pyplot as plt
from scipy import signal


'''Find the most N optimal suggested locations from weighted reward array
Args:
    n: number of suggested locations
    arr: the given reward array
Returns:
    A list of first N optimal suggested locations
'''
def findNthLargestLocations(arr):
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


def pareto_optimal_sets(vec_set):
    """Compute the Pareto optimal sets and utopia points from a set of vectors.
    
    Args:
        vec_set (list): A list of numpy arrays representing vectors.
    
    Returns:
        tuple: A tuple containing:
            - A list of lists of numpy arrays, representing the Pareto optimal sets.
            - A numpy array representing the utopia point.
            - A list of tuples, where each tuple contains a Pareto optimal set and its distance to the utopia point.
    """
    
    # Convert the list of vectors to a numpy array
    vec_array = np.array(vec_set)
    
    # Compute the minimum and maximum values for each dimension
    min_vals = np.min(vec_array, axis=0)
    max_vals = np.max(vec_array, axis=0)
    
    # Compute the utopia point
    utopia_point = max_vals
    
    # Compute the normalized vectors
    norm_vecs = (vec_array - min_vals) / (max_vals - min_vals)
    
    # Compute the Pareto optimal sets
    pareto_sets = []
    pareto_sets_loc = []
    for i in range(norm_vecs.shape[0]):
        is_pareto = True
        for j in range(norm_vecs.shape[0]):
            if i != j and np.all(norm_vecs[j] >= norm_vecs[i]):
                is_pareto = False
                break
        if is_pareto:
            pareto_sets.append(vec_array[i])
            pareto_sets_loc.append(i)
    
    # Compute the distances from the Pareto optimal sets to the utopia point
    dist_to_utopia = []
    for pareto_set in vec_array:
        dist = np.linalg.norm(pareto_set - utopia_point)
        dist_to_utopia.append(dist)

    if(len(pareto_sets) != 0):
        pareto_sets = np.vstack(pareto_sets)

    return pareto_sets, utopia_point, np.array(dist_to_utopia), pareto_sets_loc

def find_best_location_pareto(vectors):
    pareto_sets, utopia_point, dist_to_utopia, pareto_set_locs = pareto_optimal_sets(vectors)
    normlized_dist = dist_to_utopia/np.max(dist_to_utopia)
    distance_reward = 1 - normlized_dist
    locations = findNthLargestLocations(distance_reward)
    # plt.rcParams['figure.figsize'] = [10, 5]
    # plt.rcParams.update({'font.size': 16})
    # fig = plt.figure()
    # ax = fig.add_subplot(111, projection='3d')
    # # Plot a scatter graph of all results
    # ax.scatter(vectors[:, 0], vectors[:, 1], vectors[:,2], marker="o", s=50)
    # ax.scatter(utopia_point[0],utopia_point[1], utopia_point[2], '*', color="y", label="utopia point")
    # _ = plt.title('The result data', fontsize=22)
    # ax.set_xlabel('spatial Label')
    # ax.set_ylabel('moisture Label')
    # ax.set_zlabel('discrepancy Label')
    # plt.grid(True, linestyle='--')


    # # Then plot the Pareto frontier on top
    # ax.scatter(pareto_sets[:, 0],pareto_sets[:, 1], pareto_sets[:, 2], 'o', s=100, color="r", label="pareto front")
    # plt.legend(loc="lower right", fontsize=15)
    # plt.show()
    return locations, distance_reward

if __name__ == "__main__":
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

    pareto_inputs = np.array([spatial_reward, moisture_reward, discrepancy_reward]).T
    # pareto_sets, utopia_point, dist_to_utopia = pareto_optimal_sets(pareto_inputs)
    # plt.rcParams['figure.figsize'] = [10, 5]
    # plt.rcParams.update({'font.size': 22})

    # # Plot a scatter graph of all results
    # plt.scatter(pareto_inputs[:, 0], pareto_inputs[:, 2], marker="o", s=50)
    # plt.plot(utopia_point[0], utopia_point[2], '*', color="red", label="utopia point")
    # _ = plt.title('The result data', fontsize=22)
    # plt.xlabel('spatial reward', fontsize=22)
    # plt.ylabel('moisture reward', fontsize=22)

    # plt.grid(True, linestyle='--')


    # # Then plot the Pareto frontier on top
    # plt.plot(pareto_sets[:, 0], pareto_sets[:, 2], 'o', color="black", label="pareto front")
    # plt.legend(loc="lower right", fontsize=15)
    # plt.show()
    best_loc = find_best_location_pareto(pareto_inputs)
    # print(best_loc)
