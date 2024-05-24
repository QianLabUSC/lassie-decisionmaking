import numpy as np
# import matplotlib.pyplot as plt
# from matplotlib.animation import FuncAnimation
# import matplotlib.animation as animation
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel as C
import numpy as np
import warnings
# Configure warnings to always be triggered
warnings.simplefilter("always")

# ==============================
#      Utility Functions
# ==============================

def get_matrix_value(matrix, x, y):
    """
    Retrieve a value from the matrix at normalized coordinates x, y.

    Parameters:
    matrix (np.array): A numpy array.
    x (float): Normalized x coordinate (0 to 1).
    y (float): Normalized y coordinate (0 to 1).

    Returns:
    float: Value at the specified coordinates in the matrix.
    """
    ix = np.int32(y * (matrix.shape[0] - 1))  
    iy = np.int32(x * (matrix.shape[1] - 1))
    return matrix[ix, iy]

def normalize_matrix(matrix):
    """
    Normalize a numpy matrix so that the minimum value is mapped to 0 
    and the maximum value is mapped to 1.

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

# ==============================
#      classes definitions
# ==============================

class Env:
    def __init__(self, prior_x, prior_y) -> None:
        """
        Initialize the environment with empty maps for shear strength, moisture, and robot path. 
        These maps are to be populated in derived classes or with specific methods.
        """
        self.shear_strength_map = []
        self.moisture_map = []
        self.robot_path = []
        self.prior_x = prior_x
        self.prior_y = prior_y

    def gather_data(self, robot_x, robot_y):
        """
        Sample data from the shear strength and moisture maps at normalized coordinates (x, y).

        Parameters:
        x (float): Normalized x coordinate (from 0 to 1).
        y (float): Normalized y coordinate (from 0 to 1).

        Returns:
        tuple: A tuple containing the sampled shear strength and moisture values.
        """
        self.data_x_coordinate = np.append(self.prior_x, robot_x)
        self.data_y_coordinate = np.append(self.prior_y, robot_y)
        robot_measured_points = np.array([self.data_x_coordinate, 
                                          self.data_y_coordinate]).T
        sampled_shear = get_matrix_value(self.shear_strength_map, 
                                         self.data_x_coordinate, 
                                         self.data_y_coordinate)
        sample_mositure = get_matrix_value(self.moisture_map, 
                                           self.data_x_coordinate, 
                                           self.data_y_coordinate)
        return robot_measured_points, sampled_shear, sample_mositure
    

class ManuallyEnv(Env):
    def __init__(self, prior_x, prior_y) -> None:
        """
        Create an environment where the shear strength and moisture maps
        are loaded from CSV files. 
        Inherits from the Env class and populates the environmental maps with actual data.
        """
        super().__init__(prior_x, prior_y)
        self.shear_strength_map = np.loadtxt('shear_strength_map.csv', delimiter=',')
        self.moisture_map = np.loadtxt('moisture_map.csv', delimiter=',')

class ReactivePlanning3rdPath:
    def __init__(self, start_point, plan_step_interval_, step_per_horizon_):
        # define paramters
        self.plan_step_interval = plan_step_interval_
        self.step_per_horizon = step_per_horizon_
        self.robot_start_point = start_point
        self.robot_path_x = np.array([ROBOT_START_POINT[0]])
        self.robot_path_y = np.array([ROBOT_START_POINT[1]])

    def get_robot_path(self):
        return self.robot_path_x, self.robot_path_y
    
    def plan_for_next_horizon(self, reward):
        ## now generate field vector to guide with the path selection. 
        # directly apply the information reward as vector to guide with reactive path
        # F_x = np.gradient(shear_std.T, axis=1)
        # F_y = np.gradient(shear_std.T, axis=0)
        # applying some threshold for the information reward to better generate reactive path
        # hulls, F_x, F_y = calculate_gradient(shear_std)
        F_x, F_y = self.calculate_gradient_with_adding(reward)
        # Determine the direction of the highest gradient
        current_x, current_y = self.robot_path_x[-1], self.robot_path_y[-1]
        path_x, path_y = self.integrate_path(current_x, current_y, F_x, F_y,
                                                self.plan_step_interval, 
                                                self.step_per_horizon)
        self.robot_path_x = np.append(self.robot_path_x, path_x)
        self.robot_path_y = np.append(self.robot_path_y, path_y)
        return F_x, F_y, path_x, path_y

    def integrate_path(self, start_x, start_y, vector_field_x, vector_field_y, 
                       step_length, num_steps):
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
            downsampled = reward.reshape(downsamplesize, y_factor, 
                                         downsamplesize, x_factor).mean(axis=(1, 3))

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
        high_reward_points, low_rewards_points = \
                            extract_reward_points(downsamplingreward, 0.3, 0.7)
        
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
        k_attr = 21
      
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




    def calculate_gradient_with_adding(self, reward):
        k_attr = 3
        max_index = np.argmax(reward)
        row_index, col_index = np.unravel_index(max_index, reward.shape)
        max_x, max_y = col_index / reward.shape[0], row_index / reward.shape[1]
        x, y = np.meshgrid(np.linspace(0, 1, reward.shape[0]), np.linspace(0, 1, reward.shape[1]))
        max_length = np.linalg.norm([1, 1])
        U_attr = k_attr * (1 - np.sqrt((x - max_x)**2 + (y - max_y)**2) / max_length)
        F_x = np.gradient(U_attr + reward, axis=1)
        F_y = np.gradient(U_attr + reward, axis=0)
        return F_x, F_y

class Estimation:
    def __init__(self, if_optimize, noise_level, length_scale, sigma_f) -> None:
        """
        Initializes the Estimation object with specific settings for Gaussian Process Regression.

        Parameters:
        if_optimize (bool): Flag to determine if the hyperparameters of the 
                            kernel should be optimized.
        noise_level (float): Initial noise level for the WhiteKernel.
        length_scale (float): Initial length scale for the RBF kernel.
        sigma_f (float): Signal variance (multiplied by itself to get variance 
                         squared for the kernel).

        The kernel is defined as a product of a constant kernel and an RBF kernel, 
        added to a WhiteKernel for noise. Depending on the 'if_optimize' flag, the
        GaussianProcessRegressor may or may not optimize the kernel's hyperparameters.
        """
        self.noise_level = noise_level
        self.length_scale = length_scale
        self.sigma_f = sigma_f * sigma_f
        self.if_optimize = if_optimize
        self.kernel = C(self.sigma_f, (1e-3, 1e3)) * RBF(self.length_scale, (1e-2, 1e2)) \
                     + WhiteKernel(self.noise_level, (0, 0.2))
        # Instantiate the Gaussian Process Regressor
        if(not self.if_optimize):
            print('manually length scale')
            self.gp = GaussianProcessRegressor(kernel=self.kernel, 
                                               n_restarts_optimizer=0, 
                                               random_state=0, optimizer=None)
        else:
            self.gp = GaussianProcessRegressor(kernel=self.kernel)
 

    def estimate(self, x, y, prediction_range):
        """
        Fit the Gaussian Process model and predict over a new range.

        Parameters:
        x (np.array): Input features for training the Gaussian Process.
        y (np.array): Target values corresponding to 'x'.
        prediction_range (np.array): Input features for making predictions.

        Returns:
        tuple: A tuple containing predicted values, informational metric on predictions,
               standard deviations of the predictions, and the trained Gaussian Process model.
        """
        self.gp.fit(x, y)
        # Make predictions on new data points
        X_new = prediction_range
        y_pred, y_std = self.gp.predict(X_new, return_std=True)
        #calculate discrepancy
        information = np.exp(-np.square(y_std))
        # noise_level_optimized = gp.kernel_.get_params()["k2__noise_level"]
        return y_pred, information, y_std, self.gp#noise_level_optimized
    
# ==============================
#      Main simulation/upating
# ==============================

# choose a random path
# we assume x, y coordinates are limited to [0,1], [0,1]
# we are going to use gaussian process to estimate the data given the current robot path
# assume the robot start at coordinates [0, 1]
# assume the robot have a certain sampling density 
# the current dataset interval is 0.001, so the robot sampling interval should be larger than 0.001
# in real sceanrio, it can be an analog value



'''
Initialization
'''

ROBOT_SAMPLING_INTERVAL = 0.02       # this corresponds to the different gaits, e.g. walking/troting/running
ROBOT_ESTIMATION_INTERVAL = 0.02      # this corresonding the density of gaussian estimation.
STEPS_PER_ESTIMTATION_ITERATIONS = 5
ROBOT_SPEED = 1 
ROBOT_START_POINT = [0.0,0.0]
ITERATIONS = 3 # Number of simulation steps
# PRIOR_MEASUREMENTS_LOC_X = np.array([0.1, 0.1, 0.1, 0.5, 0.5, 0.5, 0.9, 0.9, 0.9])
# PRIOR_MEASUREMENTS_LOC_Y = np.array([0.1, 0.5, 0.9, 0.1, 0.5, 0.9, 0.1, 0.5, 0.9])
PRIOR_MEASUREMENTS_LOC_X = np.array([0.5, 0.1])
PRIOR_MEASUREMENTS_LOC_Y = np.array([0.1, 0.9])

# fig, ax = plt.subplots(1, 2, figsize=(12, 6))


env = ManuallyEnv(PRIOR_MEASUREMENTS_LOC_X, PRIOR_MEASUREMENTS_LOC_Y)
planner = ReactivePlanning3rdPath(ROBOT_START_POINT, ROBOT_SAMPLING_INTERVAL, 
                           STEPS_PER_ESTIMTATION_ITERATIONS)
estimator = Estimation(False, 0.2, 0.15, 4)


'''
Calculate all the first frame to make it
'''
# create x, y robot path dependent variable
robot_path_x, robot_path_y = planner.get_robot_path()
# calculate information and discrepancy
measured_robot_coordinates, measured_shear, measured_moisture = \
        env.gather_data(robot_path_x, robot_path_y)
# create estimated denstiy
estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)
xx1, xx2 = np.linspace(0, 1, num=estimatedNum), np.linspace(0, 1, num=estimatedNum)
vals = np.array([[x1_, x2_] for x1_ in xx1 for x2_ in xx2])
xv, yv = np.meshgrid(xx1, xx2)
shear_prediction, information_shear, shear_std, gp = \
            estimator.estimate(measured_robot_coordinates,  measured_shear, vals)
shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
information_shear = information_shear.reshape(estimatedNum, estimatedNum)
shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))
# Information_image = ax[0].imshow(shear_std, cmap='Blues', extent=[0, 1, 0, 1], origin='lower')
# ax[0].set_title('Uncertainty Map')
# cb_info = fig.colorbar(Information_image, ax=ax[0], label='Information')
# shear_strength_image = ax[1].imshow(shear_prediction, cmap='viridis', 
#                                     extent=[0, 1, 0, 1], origin='lower')
# ax[1].set_title('Shear Strength Predicted')
# cb_strength = fig.colorbar(shear_strength_image, ax=ax[1], label='Shear Strength')
# ax[0].set_xlim([-0.1, 1.1])
# ax[0].set_ylim([-0.1, 1.1])





def update(frame):
    # calculate information and discrepancy
    robot_path_x, robot_path_y = planner.get_robot_path()

    measured_robot_coordinates, measured_shear, measured_moisture = \
        env.gather_data(robot_path_x, robot_path_y)
    

    # create estimated denstiy
    estimatedNum = int(1/ROBOT_ESTIMATION_INTERVAL)
    xx1, xx2 = np.linspace(0, 1, num=estimatedNum), np.linspace(0, 1, num=estimatedNum)
    vals = np.array([[x1_, x2_] for x1_ in xx1 for x2_ in xx2])
    xv, yv = np.meshgrid(xx1, xx2)

    shear_prediction, information_shear, shear_std, gp = \
        estimator.estimate(measured_robot_coordinates,  measured_shear, vals)
    shear_prediction = shear_prediction.reshape(estimatedNum, estimatedNum)
    information_shear = information_shear.reshape(estimatedNum, estimatedNum)
    shear_std = normalize_matrix(shear_std.reshape(estimatedNum, estimatedNum))
    
    F_x, F_y, path_x, path_y = planner.plan_for_next_horizon(shear_std.T)
    

    '''
    Visualize and update the figure
    '''
    # # Clear previous content in axes
    # ax[0].cla()
    # ax[1].cla()
    # realpath = ax[0].plot(path_x, path_y, '-', color='r')
    # Information_image = ax[0].imshow(shear_std.T, cmap='Blues', 
    #                                  extent=[0, 1, 0, 1], origin='lower')
    # ax[0].set_title('Uncertainty Map')
    # shear_strength_image = ax[1].imshow(shear_prediction.T, cmap='viridis', 
    #                                     extent=[0, 1, 1, 0], origin='lower')
    # ax[1].set_title('Shear Strength Predicted')
    # ax[0].set_xlim([-0.1, 1.1])
    # ax[0].set_ylim([-0.1, 1.1])
    # fieldplot = ax[0].quiver(xv, yv, F_x, F_y, alpha=1, scale=3, scale_units='inches')
    # # ax[0].streamplot(xv, yv, F_x, F_y, color='r', start_points=[[current_x, current_y]], integration_direction='forward', linewidth=0.5, density=1, maxlength=0.5)
    
if __name__ == "__main__":
    '''
    Use animation to create video
    Call function update to debug
    '''
    # Create animation
    # ani = FuncAnimation(fig, update, frames=ITERATIONS, blit=False)
    for i in range(ITERATIONS):
        update(i)

    '''
    Use plt.show() to update the figure for each step. 
    '''
    # plt.show()

    '''
    Save to video file
    '''
    # FFMpegWriter = animation.writers['ffmpeg']
    # writer = FFMpegWriter(fps=2)
    # ani.save('robot_path_simulation.mp4', writer=writer)


    

