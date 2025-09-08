from multiObjectiveDecisionMaking.pareto import *
from multiObjectiveDecisionMaking.weigted_objective import * 
k_info_signal = 0.4
def normalize_columns(vector):
    # Convert the 2D vector to a NumPy array for easier manipulation
    array = np.array(vector)
    
    # Find the maximum value in each column
    max_values = np.amax(array, axis=0)
    min_values = np.min(array, axis=0)
    # Divide each element in each column by its maximum value to normalize the column
    normalized_columns = (array-min_values) / (max_values-min_values)
    # normalized_columns = (array) / (max_values)
    return normalized_columns

def run_multi_objective(vector, methods, rank):
    normalized_vector = normalize_columns(vector)
    if(methods == "pareto"):
        best_index, rewards = find_best_location_pareto(normalized_vector)
    elif(methods == "roc"):
        best_index, rewards = findBestWeightedObjectives(normalized_vector, rank_centroid_from_rank, rank)
    elif(methods == "rs"):
        best_index, rewards = findBestWeightedObjectives(normalized_vector, rs_weights_from_rank, rank)
    elif(methods == "equal"):
        best_index, rewards = findBestWeightedObjectives(normalized_vector, equal_weights, rank)
    return np.array(best_index) + 1, rewards

def calculate_disp_signal_level(disp_signature, noise_level, k_noise):
    """
    softmax-
    Calculate the discrepancy signal level based on discrepancy signature and noise level using softmax function .

    Parameters:
    disp_signature (float): The maximum discrepancy we have seen in the reward.
    noise_level (float): The maximum uncertainty during the testing.

    Returns:
    float: The discrepancy signal level.
    """
    disp_level = np.maximum(0, disp_signature - k_noise)
    return disp_level

def calculate_info_signal_level(info_level, k_info_signal):
    """
    Calculate the information signal level based on the information level and a threshold.

    Parameters:
    info_level (float): The current information coverage.
    k_info_signal (float): The threshold for information level.

    Returns:
    int: The information signal level.
    """
    info_signal_level = np.maximum(0, info_level - k_info_signal)
    return info_signal_level


def sigmoid(x):
    """Applies the sigmoid function to x"""
    return 1 / (1 + np.exp(-x))

def shift_and_scale(x):
    """
    Applies sigmoid function to x and then maps it 
    to one of the specific levels between -1 and 1.
    """
    # Apply sigmoid and scale to (-1, 1)
    y = 2 * sigmoid(5*x) - 1

    # Define the levels
    levels = np.array([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1])

    # Map y to a level
    level = levels[np.argmin(np.abs(levels - y))]

    return level



def run_multi_objective_odsf(vector, info_level, human_reported_type,
                            info_signature, disp_signature, noise_level,
                            k_info_signal=0.4, k_noise=1.5, k_info=1, k_disp=1.2,k_info_low=0.35, k_info_high=0.7):
    """
    This function uses multi-objective optimization to 
    evaluate the trade-offs between information gain and 
    discrepancy based on the reward vector and user preferences. 

    Parameters:
    vector (np.ndarray): A n by 2 array representing rewards. 
    vector[:, 0] is the information reward 
    and vector[:, 1] is the discrepancy reward.

    info_level (float): The current information coverage.

    human_reported_type (str): The decision-making type reported by the user. 
    It can be "info focused", "info hierarchy", "trade-off", "disp focused", 
    or "disp hierarchy" corresponding to [0, 0.25, 0.5, 0.75, 1.0]

    info_signature (float): Signature of the information. 

    disp_signature (float): The maximum discrepancy we have seen in the reward.

    noise_level (float): The maximum uncertainty during the testing.

    Returns:
    The function should return the optimized results based on the given 
    parameters, but the exact output 
    is dependent on the implementation of the multi-objective optimization.
    """
    # based on different level, use pareto to generate different type of solutions 
    normalized_vector = normalize_columns(vector)
    pareto_sets, utopia_point, dist_to_utopia, pareto_sets_loc = \
                                        pareto_optimal_sets(normalized_vector)
    # find focused sugggestions
    info_reward = pareto_sets[:, 0]
    disp_reward = pareto_sets[:, 1]
    # find the suggestion of different types
    info_focused_index = np.argmax(info_reward)
    info_focused_location = pareto_sets_loc[info_focused_index]

    info_high_index = np.where(info_reward > 0.85)
    info_hier_index = np.argmax(disp_reward[info_high_index])
    info_hier_location = pareto_sets_loc[info_high_index[0][info_hier_index]]

    disp_focused_index = np.argmax(disp_reward)
    disp_focused_suggestion = pareto_sets_loc[disp_focused_index]

    disp_high_index = np.where(disp_reward > 0.85)
    # print(disp_reward[disp_high_index])
    
    disp_hier_index = np.argmax(info_reward[disp_high_index])
    disp_hier_location = pareto_sets_loc[disp_high_index[0][disp_hier_index]]
    

    # for trade-off suggest the high pareto distance one:
    indices = np.isin(pareto_sets_loc, np.array([info_focused_location, 
                                                 info_hier_location, 
                                                 disp_focused_suggestion, 
                                                 disp_hier_location]), invert=True)  # Get indices of elements not equal to values
    trade_off_locations = np.array(pareto_sets_loc)[np.where(indices == 1)[0]]  # Filter out elements based on indices

    # select the trade-off suggestion based on minimum distance to utopia
    trade_off_utopia_distance = dist_to_utopia[np.where(indices == 1)[0]]
    if(len(trade_off_utopia_distance )) > 0:
        trade_off_index = np.argmin(trade_off_utopia_distance)
        trade_off_location = trade_off_locations[trade_off_index]
    else:
        trade_off_index = info_hier_index
        trade_off_location = info_hier_location

    suggestion_sets = np.array([info_focused_location, info_hier_location, trade_off_location, disp_hier_location, disp_focused_suggestion])
    # print(info_level)
    # applied final infor level decision
    if(info_level < k_info_low):
        final_type = 0
        except_list = 0
        final_suggestion = info_focused_location
    elif(info_level > k_info_high):
        except_list = 3
        final_type = 1
        final_suggestion = disp_focused_suggestion
    else:
        # Implementation goes here
        discrepancy_singal_level = calculate_disp_signal_level(disp_signature, noise_level, k_noise)
        info_signal_level = calculate_info_signal_level(info_signature, k_info_signal)
        # print('dssss', discrepancy_singal_level)
        if(discrepancy_singal_level > 0):
            except_list = 1
        elif(info_signal_level > 0):
            except_list = 2
        else:
            except_list = 2
            
        # shift_distance = k_disp * discrepancy_singal_level - k_info * info_signal_level

        # shift_level = shift_and_scale(shift_distance)
        if(discrepancy_singal_level > 2):
            shift_level = 1
        elif(discrepancy_singal_level > 1):
            shift_level = 0.75
        elif(discrepancy_singal_level > 0.5):
            shift_level = 0.5
        elif(discrepancy_singal_level > 0):
            shift_level = 0.25
        else:
            shift_level = 0
        final_level = shift_level + human_reported_type
        ref_level = np.array([0, 0.25, 0.5, 0.75, 1.0])
        final_type = ref_level[np.argmin(np.abs(np.array(ref_level) - final_level))]
        final_suggestion = suggestion_sets[int(final_type * 4)]
    return final_type, final_suggestion, suggestion_sets, except_list, pareto_sets, pareto_sets_loc
        
def run_multi_objective_preference(
    reward_vector,  # shape (n, 2): columns are [info_reward, disp_reward]
    info_level,     # s_t: information level, scalar in [0,1]
    disp_level,     # d_t: discrepancy/novelty level, scalar in [0,1]
    gamma=5.0,      # preference progression sharpness
    c=0.5,          # preference progression center
    alpha_s=0.0,    # short-term bias for info
    alpha_d=0.0,    # short-term bias for discrepancy
    return_all=False
):
    """
    Compute the trade-off between two objectives using a human-in-the-loop preference model.
    Also estimate the uncertainty (variance) of each random variable in the preference model.
    This function does NOT require multi_objective_pattern as input.

    Args:
        reward_vector (np.ndarray): shape (n, 2), columns are [info_reward, disp_reward]
        info_level (float): s_t, information level in [0,1]
        disp_level (float): d_t, discrepancy/novelty level in [0,1]
        gamma (float): preference progression sharpness (default 5.0)
        c (float): preference progression center (default 0.5)
        alpha_s (float): short-term bias for info (default 0.0)
        alpha_d (float): short-term bias for discrepancy (default 0.0)
        return_all (bool): if True, return full ranking, weights, and variances

    Returns:
        best_index (int): index of the best location
        best_location (int): index or identifier of the best location
        weights (np.ndarray): normalized preference weights [w_info, w_disp]
        (optionally) ranking (np.ndarray): indices of locations sorted by weighted reward
        (optionally) variances (dict): variances of tau_t, w_info, w_disp
    """
    # 1. Compute latent preference progression tau_t
    tau_t = 1.0 / (1.0 + np.exp(-gamma * (info_level - c)))

    # 2. Compute unnormalized weights for info and discrepancy
    w_info = 1 - tau_t + alpha_s * info_level
    w_disp = tau_t + alpha_d * disp_level
    w_vec = np.array([w_info, w_disp])
    # 3. Normalize weights to sum to 1
    w_vec = w_vec / np.sum(w_vec)

    # 4. Compute weighted reward for each candidate
    weighted_rewards = reward_vector @ w_vec
    # 5. Select the best location (max weighted reward)
    best_index = np.argmax(weighted_rewards)
    best_location = best_index  # or use external mapping if available

    # --- Uncertainty estimation (delta method) ---
    # Assume info_level and disp_level are Bernoulli, so Var[s_t] = s_t*(1-s_t), Var[d_t] = d_t*(1-d_t)
    var_s = info_level * (1 - info_level)
    var_d = disp_level * (1 - disp_level)

    # tau_t = 1/(1+exp(-gamma*(s_t-c)))
    # d tau_t/d s_t = gamma * exp(-gamma*(s_t-c)) / (1+exp(-gamma*(s_t-c)))^2 = gamma * tau_t * (1-tau_t)
    dtau_ds = gamma * tau_t * (1 - tau_t)
    var_tau = (dtau_ds ** 2) * var_s

    # w_info = 1 - tau_t + alpha_s * s_t
    # d w_info/d s_t = -dtau_ds + alpha_s
    dwinfo_ds = -dtau_ds + alpha_s
    var_winfo = (dwinfo_ds ** 2) * var_s

    # w_disp = tau_t + alpha_d * d_t
    # d w_disp/d s_t = dtau_ds
    # d w_disp/d d_t = alpha_d
    var_wdisp = (dtau_ds ** 2) * var_s + (alpha_d ** 2) * var_d

    variances = {
        'var_s': var_s,
        'var_d': var_d,
        'var_tau_t': var_tau,
        'var_w_info': var_winfo,
        'var_w_disp': var_wdisp
    }

    if return_all:
        ranking = np.argsort(-weighted_rewards)  # descending order
        return best_index, best_location, w_vec, ranking, weighted_rewards, variances
    else:
        return best_index, best_location, w_vec





    # for shift_distance in np.linspace(-10, 10, 1000):
    #     shift_level = shift_and_scale(shift_distance)
    #     final_level = shift_level + human_reported_type
    #     ref_level = np.array([[0, 0.25, 0.5, 0.75, 1.0]])
    #     final_type = ref_level[np.argmin(np.abs(np.array(ref_level) - final_level))]
    #     plt.plot(shift_distance, final_type)
    # plt.show()




    

if __name__ == "__main__":
    run_multi_objective_odsf(1,1,2,2,3,3)
    # spatial_reward = [0.74297972, 0.43861609, 0.74297972, 0.97533451, 0.99950383, 0.99999791, 
    #                 0.99999791, 0.99950383, 0.97533451, 0.74297971, 0.43861399, 
    #                 0.74248355, 0.95066902, 0.74248355, 0.43861399, 0.74297762, 
    #                 0.97483835, 0.97483835, 0.74297762, 0.43861608, 0.74297972, 0.97533451]

    # moisture_reward = [0.56349887, 0.34613042, 0.65770121, 0.79747314, 0.97030054, 0.9955728, 
    #                 0.98097963, 0.94359359, 0.70435853, 0.30699427, 0.17763862, 
    #                 0.35719056, 0.70823421, 0.48561455, 0.19007874, 0.48733299, 
    #                 0.84993315, 0.82400426, 0.36457368, 0.18344314, 0.56885874, 0.69979602]

    # discrepancy_reward = [0.43821028, 0.41339308, 0.40092623, 0.38858425, 0.37624228, 0.3639003,
    #                     0.35155833, 0.33921636, 0.32687438, 0.31453241, 0.29890192, 
    #                     0.25991197, 0.25591089, 0.20604803, 0.09112215, 0.11516934, 
    #                     0.15188025, 0.18859141, 0.22530257, 0.26201373, 0.29770886, 0.3081817]
    # inputs = np.array([spatial_reward, moisture_reward, discrepancy_reward]).T
    # print(run_multi_objective(inputs, "pareto", [0, 0, 0]))
    # print(run_multi_objective(inputs, "roc", [1, 2, 3]))
    # print(run_multi_objective(inputs, "rs", [1, 2, 3]))
    # print(run_multi_objective(inputs, "equal", [1, 2, 3]))
    # plt.rcParams['figure.figsize'] = [10, 5]
    # plt.rcParams.update({'font.size': 22})
    # normalized_vector = normalize_columns(inputs)
    # # Plot a scatter graph of all results
    # plt.plot(np.linspace(1,22,22), normalized_vector[:,0], marker="o", color= "yellow", label="spatial")
    # plt.plot(np.linspace(1,22,22), normalized_vector[:,1], 'o-', color="red", label="moisture")
    # plt.plot(np.linspace(1,22,22), normalized_vector[:,2], 'o-', color="blue", label="discrepancy")
    
    # _ = plt.title('The result data', fontsize=22)
    # plt.xlabel('location', fontsize=22)
    # plt.ylabel(' reward', fontsize=22)

    # plt.grid(True, linestyle='--')
    # plt.legend(loc="lower right", fontsize=15)
    # plt.show()


