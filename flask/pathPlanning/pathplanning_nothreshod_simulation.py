import numpy as np
# import matplotlib.pyplot as plt
# from matplotlib.animation import FuncAnimation
# import matplotlib.animation as animation
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel as C
import numpy as np
# import matplotlib.pyplot as plt
import warnings
# Read the CSV file back into a NumPy array
shear_strength_map = np.loadtxt('shear_strength_map.csv', delimiter=',')
moisture_map = np.loadtxt('moisture_map.csv', delimiter=',')

print('here')
class Env:
    def __init__(self) -> None:
        pass

class ReactivePlanning:
    def __init__(self):
        # define paramters
        pass

class Estimation:
    def __init__(self) -> None:
        pass

class ManuallyEnv(Env):
    def __init__(self) -> None:
        super().__init__()

def normalize_matrix(matrix):
        """
        Normalize a numpy matrix so that the minimum value is mapped to 0 and the maximum value is mapped to 1.

        Parameters:
        matrix (np.array): A numpy array of any shape.

        Returns:
        np.array: A normalized numpy array of the same shape as the input.
        """
        # Find the minimum and maximum values in the matrix
        min_val = np.min(matrix)
        max_val = np.max(matrix)
        
        # Perform the normalization
        normalized_matrix = (matrix - min_val) / (max_val - min_val)

        return normalized_matrix


def get_matrix_value(matrix, x, y):
    ix = np.int32(y * (matrix.shape[0] - 1))  # row index
    iy = np.int32(x * (matrix.shape[1] - 1))  # column index
    return matrix[ix, iy]


# Configure warnings to always be triggered
warnings.simplefilter("always")

def Gaussian_Estimation(x, y, prediction_range,  optimizer, noise_level, length_scale, sigma_f):
# call Gaussian_Estimation(robot_measured_points,  measured_shear, vals, False, 0.2, 0.15, 4)


# x = robot measured paths

        # PRIOR_MEASUREMENTS_LOC_X = np.array([0.5, 0.1])
        # PRIOR_MEASUREMENTS_LOC_Y = np.array([0.1, 0.9])
        # ROBOT_START_POINT = [0.3,0.2]
        # robot_path_x = np.array([ROBOT_START_POINT[0]])
        # robot_path_y = np.array([ROBOT_START_POINT[1]])
        # fig, ax = plt.subplots(1, 2, figsize=(12, 6))


        # # create x, y robot path dependent variable
        # data_vector_x = np.append(PRIOR_MEASUREMENTS_LOC_X, robot_path_x)
        # data_vector_y = np.append(PRIOR_MEASUREMENTS_LOC_Y, robot_path_y) 
        # robot_measured_points = np.array([data_vector_x, data_vector_y]).T
        # robot_measured_points is this
        # [[0.5 0.1]
        # [0.1 0.9]
        # [0.3 0.2]] 


# y= measured _shear, 

        # # calculate information and discrepancy
        # shear_strength_map = np.loadtxt('shear_strength_map.csv', delimiter=',')
        # measured_shear = get_matrix_value(shear_strength_map, data_vector_x, data_vector_y)



# prediction range = vals,           & optimiser is bool, 

    # # create estimated denstiy
    # estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)
    # xx1, xx2 = np.linspace(0, 1, num=estimatedNum), np.linspace(0, 1, num=estimatedNum)
    # vals = np.array([[x1_, x2_] for x1_ in xx1 for x2_ in xx2])



    # Define the kernel
    noise_level = noise_level
    length_scale = length_scale
    sigma_f = sigma_f * sigma_f

    # kernel = C(sigma_f) * RBF(length_scale,(0.1, 0.3)) 
    kernel = C(sigma_f, (1e-3, 1e3)) * RBF(length_scale, (1e-2, 1e2)) + WhiteKernel(noise_level, (0, 0.2))

    # Instantiate the Gaussian Process Regressor
    if(not optimizer):
        print('manually length scale')
        gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=0, random_state=0, optimizer=None)
    else:
        gp = GaussianProcessRegressor(kernel=kernel)
    # x = np.array([x])
    # x = x.T
    # Fit the model to the data
    gp.fit(x, y)   # x cis robot_measured_path  y = measured shear

    # Make predictions on new data points
    X_new = prediction_range   # vals
    
    y_pred, y_std = gp.predict(X_new, return_std=True) #y_pred is predicted shear strength i, DOUBT:  what is y_std??  uncertainity?
    
    #calculate discrepancy
    
    information = np.exp(-np.square(y_std)) # we can just use shear stress
    # noise_level_optimized = gp.kernel_.get_params()["k2__noise_level"]
   


    print('measured shear strength:', y, 'predicted shear strendth' , y_pred)

    return y_pred, information, y_std, gp #noise_level_optimized
    # Y_pred = shear_prediction, information = information_shear, y_std = shear_std, gp


# choose a random path
# we assume x, y coordinates are limited to [0,1], [0,1]
# we are going to use gaussian process to estimate the data given the current robot path
# assume the robot start at coordinates [0, 1]
# assume the robot have a certain sampling density 
# the current dataset interval is 0.001, so the robot sampling interval should be larger than 0.001
# in real sceanrio, it can be an analog value


ROBOT_SAMPLING_INTERVAL = 0.2      # this corresponds to the different gaits, e.g. walking/troting/running
ROBOT_ESTIMATION_INTERVAL = 0.02     # this corresonding the density of gaussian estimation.
STEPS_PER_ESTIMTATION_ITERATIONS = 10
ROBOT_SPEED = 1 
ROBOT_START_POINT = [1,2]
ITERATIONS = 200 # Number of simulation steps
# PRIOR_MEASUREMENTS_LOC_X = np.array([0.1, 0.1, 0.1, 0.5, 0.5, 0.5, 0.9, 0.9, 0.9])
# PRIOR_MEASUREMENTS_LOC_Y = np.array([0.1, 0.5, 0.9, 0.1, 0.5, 0.9, 0.1, 0.5, 0.9])
PRIOR_MEASUREMENTS_LOC_X = np.array([0.5, 0.1])
PRIOR_MEASUREMENTS_LOC_Y = np.array([0.1, 0.9])
robot_path_x = np.array([ROBOT_START_POINT[0]])
robot_path_y = np.array([ROBOT_START_POINT[1]])
# fig, ax = plt.subplots(1, 2, figsize=(12, 6))


# create x, y robot path dependent variable
data_vector_x = np.append(PRIOR_MEASUREMENTS_LOC_X, robot_path_x)
data_vector_y = np.append(PRIOR_MEASUREMENTS_LOC_Y, robot_path_y) 
robot_measured_points = np.array([data_vector_x, data_vector_y]).T

print(robot_measured_points, 'robot_measured_points')


# calculate information and discrepancy
measured_shear = get_matrix_value(shear_strength_map, data_vector_x, data_vector_y)
measured_moisture = get_matrix_value(moisture_map, data_vector_x, data_vector_y)

# print(measured_shear, 'measured_shear')
# print(measured_moisture, 'measured_moisture')

# [0.51836325 0.32380782 0.37792548] measured_shear 
# [0.51836325 0.32380782 0.37792548] measured_moisture



# create estimated denstiy
estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)
xx1, xx2 = np.linspace(0, 1, num=estimatedNum), np.linspace(0, 1, num=estimatedNum)
vals = np.array([[x1_, x2_] for x1_ in xx1 for x2_ in xx2])
xv, yv = np.meshgrid(xx1, xx2)

shear_prediction, information_shear, shear_std, gp = Gaussian_Estimation(robot_measured_points,  measured_shear, vals, False, 0.2, 15, 4)
shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
information_shear = information_shear.reshape(estimatedNum, estimatedNum)
shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))

# Information_image = ax[0].imshow(shear_std, cmap='Blues', extent=[0, 1, 0, 1], origin='lower')
# ax[0].set_title('Uncertainty Map')
# cb_info = fig.colorbar(Information_image, ax=ax[0], label='Information')

# shear_strength_image = ax[1].imshow(shear_prediction, cmap='viridis', extent=[0, 1, 0, 1], origin='lower')
# ax[1].set_title('Shear Strength Predicted')
# cb_strength = fig.colorbar(shear_strength_image, ax=ax[1], label='Shear Strength')
# ax[0].set_xlim([-0.1, 1.1])
# ax[0].set_ylim([-0.1, 1.1])

def integrate_path(start_x, start_y, vector_field_x, vector_field_y, step_length, num_steps):
    # Initialize arrays to store the x and y coordinates
    path_x = [start_x]
    path_y = [start_y]
    
    # Current position
    x, y = start_x, start_y
    x_len, y_len = vector_field_x.shape
    substep = 2
    # Perform the integration
    # *10 to give more smooth curve
    for _ in range(num_steps * substep):
        # Evaluate the vector field at the current position
        idx_x = min(int(x * x_len), x_len - 1)  # Prevent going out of bounds
        idx_y = min(int(y * y_len), y_len - 1)  # Prevent going out of bounds

        u = vector_field_x[idx_y, idx_x]  # Ensure correct order of indices
        v = vector_field_y[idx_y, idx_x]  # Ensure correct order of indices
        
        # Compute the norm of the vector to normalize it
        norm = np.sqrt(u**2 + v**2)
        
        # Update the position only if norm is non-zero to avoid division by zero
        if norm > 0:
            x += (u / norm) * step_length/substep
            y += (v / norm) * step_length/substep
        else:
            # Optionally handle zero vector case, e.g., stop moving
            break
        
        # Append the new position to the path
        x = np.clip(x, 0, 1)
        y = np.clip(y, 0, 1)
        path_x.append(x)
        path_y.append(y)
    
    return path_x, path_y


### after consideration, this function should be used for avoiding high risk area
### while in searching for information, we don't need to avoid the low info value area
### we just need to go to high infomation area as fast as possible. 

def calculate_gradient(reward):
    downsamplingsize = 25
    from sklearn.cluster import DBSCAN
    from scipy.spatial import ConvexHull
    def downsampling(reward, downsamplesize=25):   
        """
        Downsample a 2D matrix to new_size by averaging.

        Parameters:
        reward (ndarray): The input 2D matrix.
        downsamplesize (tuple): The desired size (height, width) after downsampling.

        Returns:
        ndarray: The downsampled 2D matrix.
        """
        # Calculate the size of the blocks
        y_factor = reward.shape[0] // downsamplesize
        x_factor = reward.shape[1] // downsamplesize

        # Downsample by averaging each block
        downsampled = reward.reshape(downsamplesize, y_factor, downsamplesize, x_factor).mean(axis=(1, 3))

        return downsampled
    def extract_reward_points(reward_matrix, low_threshold, high_threshold):
        high_reward_points = np.argwhere(reward_matrix > high_threshold)
        low_rewards_points = np.argwhere(reward_matrix < low_threshold)
        return high_reward_points, low_rewards_points
    
    # Function to create convex hulls from points
    def create_convex_hulls(points):
        hulls = []
        if len(points) > 2:  # Need at least 3 points to create a convex hull
            hull = ConvexHull(points)
            hulls.append(points[hull.vertices])
        return hulls
    
    def distance_to_edge(point, hull):
        min_distance = np.inf
        inside = True
        for i in range(len(hull)):
            p1, p2 = hull[i], hull[(i + 1) % len(hull)]
            edge_vec = p2 - p1
            point_vec = point - p1
            proj = np.clip(np.dot(point_vec, edge_vec) / np.dot(edge_vec, edge_vec), 0, 1)
            closest = p1 + proj * edge_vec
            distance = np.linalg.norm(closest - point)
            min_distance = min(min_distance, distance)
            print(distance)
            if distance > 0:
                inside = False

        return min_distance, inside
    
    

    downsamplingreward = downsampling(reward, downsamplesize=downsamplingsize)
    high_reward_points, low_rewards_points = extract_reward_points(downsamplingreward, 0.3, 0.7)
    
    db_low = DBSCAN(eps=1, min_samples=5).fit(low_rewards_points)
    labels = db_high.labels_
    unique_labels = set(labels)
    

    # Create convex hull for each cluster
    hulls = []
    for k in unique_labels:
        # Ignore noise points, which are labeled as -1
        if k == -1:
            continue
        class_member_mask = (labels == k)
        cluster_points = high_reward_points[class_member_mask]
        if len(cluster_points) > 2:  # Need at least 3 points to create a convex hull
            hull = ConvexHull(cluster_points)
            hulls.append(cluster_points[hull.vertices]/(downsamplingsize-1))

    # Attractive potential/optional for goal
    # U_attr = k_attr * ((x - x_goal)**2 + (y - y_goal)**2)
    # Attractive potential for high uncertainty/infomation area
    k_attr = 10
    U_attr = np.zeros_like(reward)
    for hull in hulls:
        for i in range(reward.shape[0]):
            for j in range(reward.shape[1]):
                # check if it is inside the convex hull
                rho, inside = distance_to_edge([i, j], hull)
                if(inside):
                    U_attr[i, j] = reward[i, j]
                else: 
                    U_attr[i, j] += k_attr * rho
    U_total = U_attr 
    F_x = -np.gradient(U_total, axis=1)
    F_y = -np.gradient(U_total, axis=0)
  
    return hulls, F_x, F_y



def calculate_gradient_with_adding(reward):
    k_attr = 3 #
    max_index = np.argmax(reward)
    row_index, col_index = np.unravel_index(max_index, reward.shape)
    max_x, max_y = col_index / reward.shape[0], row_index / reward.shape[1]
    x, y = np.meshgrid(np.linspace(0, 1, reward.shape[0]), np.linspace(0, 1, reward.shape[1]))
    max_length = np.linalg.norm([1, 1])
    U_attr = k_attr * (1 - np.sqrt((x - max_x)**2 + (y - max_y)**2) / max_length)
    F_x = np.gradient(U_attr + reward, axis=1)
    F_y = np.gradient(U_attr + reward, axis=0)
    return F_x, F_y

def update(frame):
    global robot_path_x, robot_path_y
    # calculate information and discrepancy
    data_vector_x = np.append(PRIOR_MEASUREMENTS_LOC_X, robot_path_x)
    data_vector_y = np.append(PRIOR_MEASUREMENTS_LOC_Y, robot_path_y)
    measured_shear = get_matrix_value(shear_strength_map, data_vector_x, data_vector_y)
    measured_moisture = get_matrix_value(moisture_map, data_vector_x, data_vector_y)

    # create x, y robot path dependent variable 
    robot_measured_points = np.array([data_vector_x, data_vector_y]).T


    # create estimated denstiy
    estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)
    xx1, xx2 = np.linspace(0, 1, num=estimatedNum), np.linspace(0, 1, num=estimatedNum)
    vals = np.array([[x1_, x2_] for x1_ in xx1 for x2_ in xx2])
    xv, yv = np.meshgrid(xx1, xx2)

    shear_prediction, information_shear, shear_std, gp = Gaussian_Estimation(robot_measured_points,  measured_shear, vals, False, 0.2, 0.15, 4)
    shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
    information_shear = information_shear.reshape(estimatedNum, estimatedNum)
    shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))
    
    ## now generate field vector to guide with the path selection. 
    # directly apply the information reward as vector to guide with reactive path
    # F_x = np.gradient(shear_std.T, axis=1)
    # F_y = np.gradient(shear_std.T, axis=0)
    # applying some threshold for the information reward to better generate reactive path
    # hulls, F_x, F_y = calculate_gradient(shear_std)
    F_x, F_y = calculate_gradient_with_adding(shear_std.T)
    # Determine the direction of the highest gradient
    current_x, current_y = robot_path_x[-1], robot_path_y[-1]

    # Clear previous content in axes
    # ax[0].cla()
    # ax[1].cla()
    # Information_image = ax[0].imshow(shear_std.T, cmap='Blues',extent=[0, 1, 0, 1], origin='lower')
    # ax[0].set_title('Uncertainty Map')
    # for hull_vertices in hulls:
    #     hull_vertices = np.append(hull_vertices, [hull_vertices[0]], axis=0)
    #     # Extract x and y coordinates
    #     x_coords, y_coords =  hull_vertices[:, 0], hull_vertices[:, 1]
    #     # Plot the hull
    #     ax[0].plot(x_coords, y_coords, 'r-', linewidth=2)
    # shear_strength_image = ax[1].imshow(shear_prediction.T, cmap='viridis', extent=[0, 1, 1, 0], origin='lower')
    # ax[1].set_title('Shear Strength Predicted')
    # ax[0].set_xlim([-0.1, 1.1])
    # ax[0].set_ylim([-0.1, 1.1])
    # fieldplot = ax[0].quiver(xv, yv, F_x, F_y, alpha=1, scale=3, scale_units='inches')
    path_x, path_y = integrate_path(current_x, current_y, F_x, F_y, ROBOT_SAMPLING_INTERVAL, STEPS_PER_ESTIMTATION_ITERATIONS)
    pre_path_x, pre_path_y = integrate_path(current_x, current_y, F_x, F_y, ROBOT_SAMPLING_INTERVAL, STEPS_PER_ESTIMTATION_ITERATIONS)
    # realpath = ax[0].plot(pre_path_x, pre_path_y, '-', color='r')
    # ax[0].streamplot(xv, yv, F_x, F_y, color='r', start_points=[[current_x, current_y]], integration_direction='forward', linewidth=0.5, density=1, maxlength=0.5)
    
    robot_path_x = np.append(robot_path_x, path_x)
    robot_path_y = np.append(robot_path_y, path_y)
    print(robot_path_x, robot_path_y, 'robot_paths')
# # Create animation
# ani = FuncAnimation(fig, update, frames=ITERATIONS, blit=False)
update(5)
# plt.show()
# anim = animation.FuncAnimation(fig, update, frames=ITERATIONS, interval=100)
# plt.show()

# # Save to video file
# FFMpegWriter = animation.writers['ffmpeg']
# writer = FFMpegWriter(fps=2)
# ani.save('robot_path_simulation.mp4', writer=writer)


    

