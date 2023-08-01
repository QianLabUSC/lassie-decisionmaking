'''
@author: Shipeng Liu/RoboLand
@feature: Suggest some proper locations to be measured base on current 
          measurements
'''

from scipy.optimize import curve_fit
from scipy import signal
import numpy as np
# from env_wrapper import *
import matplotlib.pyplot as plt
from scipy.interpolate import interp1d
from hypothesisRegulation.hypothesis import *
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C, WhiteKernel
from datetime import datetime

'''Generates a Gaussian estimation using Gaussian Process Regression.
Args:
x: Input variable.
y: Response variable.
prediction_range: Range on which to make predictions.
optimizer: Optimization method for kernel hyperparameters.
noise_level: Noise level in data.
length_scale: Length scale parameter for RBF kernel.
sigma_f: Signal variance parameter for RBF kernel.

Returns:
y_pred: Predicted responses.
information: Uncertainty measure (calculated using prediction standard deviation).
y_std: Standard deviation of the predictions.
'''
def Gaussian_Estimation(x, y, prediction_range,  optimizer, noise_level, length_scale, sigma_f):

    # Define the kernel
    noise_level = noise_level
    length_scale = length_scale
    sigma_f = sigma_f * sigma_f
    kernel = C(sigma_f) * RBF(length_scale,(0.1, 0.3)) + WhiteKernel(noise_level, (0, 0.2))
       
    # Instantiate the Gaussian Process Regressor
    if(not optimizer):
        gp = GaussianProcessRegressor(kernel=kernel, n_restarts_optimizer=0, random_state=0, optimizer=None)
    else:
        gp = GaussianProcessRegressor(kernel=kernel)
    x = np.array([x])
    x = x.T
    # Fit the model to the data
    gp.fit(x, y)
    # Extract the estimated noise level
    noise_level_optimized = gp.kernel_.get_params()["k2__noise_level"]
    # Make predictions on new data points
    X_new = np.array([prediction_range])
    X_new = X_new.T
    y_pred, y_std = gp.predict(X_new, return_std=True)
    information = np.exp(-np.square(y_std))
    return y_pred, information, y_std, noise_level_optimized



'''generate random gaussian variable
Args:
    mean: the mean of gaussian variable
    scale: the amptitude of gaussian variable
    x:size of gaussian variable
Returns:
    gaussian variable
'''
def gauss(mean, scale, x=np.linspace(1,22,22), sigma=1):
    return scale * np.exp(-np.square(x - mean) / (2 * sigma ** 2))




def findbestlocation(self,location, spatial_reward,
                    discrepancy_reward):

    disrepancy_reward_negative = np.array(discrepancy_reward) * -1

    spatial_locs, spatial_properties = signal.find_peaks(spatial_reward,
                                                        height=0.3,
                                                        distance=2)
    # get the peak values
    peak_values = spatial_reward[spatial_locs]

    # sort the peak values and their indices in descending order
    sorted_indices = np.argsort(peak_values)[::-1]

    # return the sorted peak indices
    spatial_locs = spatial_locs[sorted_indices]
    discrepancy_locs, discrepancy_properties = signal.find_peaks(
        discrepancy_reward, height=0.2, distance=2)
    # get the peak values
    peak_values = discrepancy_reward[discrepancy_locs]

    # sort the peak values and their indices in descending order
    sorted_indices = np.argsort(peak_values)[::-1]

    # return the sorted peak indices
    discrepancy_locs = discrepancy_locs[sorted_indices]
    discrepancy_lows_locs, discrepancy_lows_properties = signal.find_peaks(
        disrepancy_reward_negative, height=-0.5, distance=2)
    
    # get the peak values
    peak_values = disrepancy_reward_negative[discrepancy_lows_locs]

    # sort the peak values and their indices in descending order
    sorted_indices = np.argsort(peak_values)[::-1]

    # return the sorted peak indices
    discrepancy_lows_locs = discrepancy_lows_locs[sorted_indices]

    max_used_spatial = False
    max_used_variable = False
    max_used_discrepancy = False
    max_used_discrepancy_lows = False

    if len(spatial_locs) == 0:
        spatial_locs = spatial_reward.argsort()[-3:][::-1]
        max_used_spatial = True
    elif len(spatial_locs) == 1:
        spatial_locs = np.append(spatial_locs,
                                spatial_reward.argsort()[-2:][::-1])
        max_used_spatial = True
    elif len(spatial_locs) == 2:
        spatial_locs = np.append(spatial_locs,
                                spatial_reward.argsort()[-1:][::-1])
        max_used_spatial = True
    elif len(spatial_locs) >= 3:
        reward_list = spatial_reward[spatial_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        spatial_locs = spatial_locs[max_index]


    if len(discrepancy_locs) == 0:
        discrepancy_locs = discrepancy_reward.argsort()[-3:][::-1]
        max_used_discrepancy = True
    elif len(discrepancy_locs) == 1:
        discrepancy_locs = np.append(discrepancy_locs,
                                    discrepancy_reward.argsort()[-2:][::-1])
        max_used_discrepancy = True
    elif len(discrepancy_locs) == 2:
        discrepancy_locs = np.append(discrepancy_locs,
                                    discrepancy_reward.argsort()[-1:][::-1])
        max_used_discrepancy = True
    elif len(discrepancy_locs) >= 3:
        reward_list = discrepancy_reward[discrepancy_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        discrepancy_locs = discrepancy_locs[max_index]

    if len(discrepancy_lows_locs) == 0:
        discrepancy_lows_locs = disrepancy_reward_negative.argsort()[-3:][::-1]
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) == 1:
        discrepancy_lows_locs = np.append(
            discrepancy_lows_locs,
            disrepancy_reward_negative.argsort()[-2:][::-1])
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) == 2:
        discrepancy_lows_locs = np.append(
            discrepancy_lows_locs,
            disrepancy_reward_negative.argsort()[-1:][::-1])
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) >= 3:
        reward_list = disrepancy_reward_negative[discrepancy_lows_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        discrepancy_lows_locs = discrepancy_lows_locs[max_index]

    # select discrepancy location

    if (len(location) < 22):
        a = location - 1
        unselected_location = np.rint(np.delete(np.linspace(1, 22, 22), a - 1))
        for i in range(len(discrepancy_locs)):
            idx = ((np.abs(unselected_location -
                        discrepancy_locs[i])).argmin())
            if (np.abs(unselected_location[idx] - discrepancy_locs[i]) < 3):
                discrepancy_locs[i] = unselected_location[idx]
        for i in range(len(discrepancy_lows_locs)):
            idx = (np.abs(unselected_location -
                        discrepancy_lows_locs[i])).argmin()
            if (np.abs(unselected_location[idx] - discrepancy_lows_locs[i]) <
                    3):
                discrepancy_lows_locs[i] = unselected_location[idx]

    ## reorder the selected locations
    # spatial_locs = np.unique(spatial_locs)
    # discrepancy_locs = np.unique(discrepancy_locs)
    # discrepancy_lows_locs = np.unique(discrepancy_lows_locs)
    # spatial_locs = np.sort(spatial_locs)
    # discrepancy_locs = np.sort(discrepancy_locs)
    # discrepancy_lows_locs = np.sort(discrepancy_lows_locs)

    output = {
        'spatial_locs': spatial_locs.tolist(),
        'discrepancy_locs': discrepancy_locs.tolist(),
        'discrepancy_lows_locs': discrepancy_lows_locs.tolist(),
        'max_used_spatial': max_used_spatial,
        'max_used_discrepancy': max_used_discrepancy,
        'max_used_discrepancy_lows': max_used_discrepancy_lows
    }

    return output





'''
@This class is the decision making module which is reponsible for processing the
 current state and compute four different rewards to suggest proper locations.
'''
class DecisionMaking:
    def __init__(self):
        '''Initial env info and parameters for decision making
        '''
        self.stage = ['Initial', 'Exploration', 'Verification']
        self.current_stage = 0
        self.spatial_information_coverage = []
        self.variable_information_coverage = []
        self.discrepancy_coverage = []
        self.current_confidence = 0
        self.beliefmatrix = []
        self.current_belief = 0
        self.current_state_location = []
        self.current_state_sample = []
        self.current_state_moisture = []
        self.current_state_shear_strength = []
        self.strategy = 0
        self.density = 100





    '''
    update the user's belief toward the hypothesis
    '''
    def update_belief(self, belief, confidence):
        self.current_belief = belief
        self.current_confidence = confidence

    '''
    update the data state and sync the measured data
    @location: an numpy array of location choice
    @sample: an numpy array of sample number in each location
    @moisture: an numpy array of moisture. if the len(location) = 4
               len(sample) = 3, then the size of moisture should be 4 * 3
    @shearstrength: an numpy array of shear strength, similar as moisture
    '''
    def update_current_state(self, location, sample, moisture, shear_strenth):
        location = np.array(location)
        sample = np.array(sample)
        moisture = np.array(moisture)
        shear_strengh = np.array(shear_strenth)
        unique_location, full_indices  = np.unique(location, return_inverse=True)
        integrated_sample = np.zeros(len(unique_location))
        integrated_moisture = []
        integrated_shearstrength = []
        for i in range(len(unique_location)):
            indexes = np.where(full_indices==i)
            integrated_sample[i] = np.sum(sample[indexes])
            integrated_moisture.append(moisture[indexes].flatten())
            integrated_shearstrength.append(shear_strengh[indexes].flatten())
        self.current_state_location = unique_location
        self.current_state_sample = integrated_sample
        # print(self.current_state_sample)
        self.current_state_moisture = integrated_moisture
        self.current_state_shear_strength = integrated_shearstrength
        # variables for gaussian methods
        self.location_flattend = []
        for loc, measurement in zip(location, sample):
            self.location_flattend.extend([loc] * measurement)
        self.moisture_flattend = moisture.flatten()
        self.shearstrength_flattend = shear_strengh.flatten()
        self.detailed_loc_flattend = np.linspace(0, 1, self.density)

        print('loc flatten', self.location_flattend)
        print('moisture flatten', self.moisture_flattend)
        print('shear flatten', self.shearstrength_flattend)


    def handle_spatial_information_gaussian(self):
        y_pred, information, y_std, y_noise = Gaussian_Estimation(self.location_flattend,
                         self.shearstrength_flattend, self.detailed_loc_flattend, 
                         False, 0.2, 0.15, 4)
        window_size = int(0.15 * self.density)
        half_window = window_size // 2  # integer division to get half window size
        information = 1 - information
        # create an empty array to store the result
        self.information_gaussian = np.empty_like(information)

        # iterate over the array
        for i in range(len(information)):
            # calculate start and end of window
            start = max(0, i - half_window)
            end = min(len(information), i + half_window + 1)
            
            # calculate sum and divide by actual window size
            self.information_gaussian[i] = information[start:end].sum() / window_size
        # self.information_gaussian =information
        self.info_level = 1-np.mean(self.information_gaussian)
        self.info_signal = np.max(self.information_gaussian)
        return self.information_gaussian, self.info_level, self.info_signal
    
    def handle_discrepancy_direct_gaussian(self):
        shear_pred, information_loc, shear_std, shear_noise = Gaussian_Estimation(self.location_flattend,
                         self.shearstrength_flattend, self.detailed_loc_flattend, 
                         True, 1, 5, 10)

       
        # try:
        RMSE_average, RMSE_distribution, xfit, xx_model, Pfit, model \
            = doulg_fit(self.location_flattend, self.shearstrength_flattend, self.detailed_loc_flattend)
        # except:
        #     xx_model = np.mean(self.shearstrength_flattend) * np.ones(self.density)
        #     xfit = shear_pred
        #     Pfit = [-1,-1,-1]
        self.noise_estimation = shear_noise
        self.discrepancy_gaussian = np.abs(shear_pred - xx_model)


        # handle the discrepancy outside the data range:
        
        # index = np.abs(shear_pred - Pfit[2]).argmin()
        # location_list = self.detailed_loc_flattend
        # location = location_list[index]
        # if(Pfit[2] == -1):
        #     self.feature_gaussian = gauss(location, 0, self.detailed_loc_flattend, 2)
        # else:
        #     self.feature_gaussian = gauss(location, 1, self.detailed_loc_flattend, 2)
        self.feature_gaussian = np.zeros_like(self.discrepancy_gaussian)
        self.disp_signal = np.max(self.discrepancy_gaussian)
        return self.discrepancy_gaussian, self.feature_gaussian,\
              self.noise_estimation, self.disp_signal, xx_model,\
              shear_pred, shear_std


    # def handle_discrepancy_gaussian(self):
    #     mositure_pred, information_mois, mois_std, mois_noise = Gaussian_Estimation(self.location_flattend,
    #                      self.moisture_flattend, self.detailed_loc_flattend, 
    #                      True, 1, 5, 10)
    #     y_pred, information, y_std, y_noise = Gaussian_Estimation(self.moisture_flattend,
    #                      self.shearstrength_flattend, mositure_pred, 
    #                      True, 1, 5, 10)

       
    #     try:
    #         RMSE_average, RMSE_distribution, xfit, xx_model, Pfit, model \
    #             = hypofit2variable(self.moisture_flattend, self.shearstrength_flattend, mositure_pred)
    #     except:
    #         xx_model = np.mean(self.shearstrength_flattend) * np.ones(220)
    #         xfit = mositure_pred
    #         Pfit = [-1,-1,-1]
    #     self.noise_estimation = y_noise
    #     self.discrepancy_gaussian = np.abs(y_pred - xx_model)
    #     index = np.abs(mositure_pred - Pfit[2]).argmin()
    #     location_list = np.linspace(1, 22, 220)
    #     location = location_list[index]
    #     if(Pfit[2] == -1):
    #         self.feature_gaussian = gauss(location, 0, np.linspace(1, 22, 220), 2)
    #     else:
    #         self.feature_gaussian = gauss(location, 1, np.linspace(1, 22, 220), 2)

    #     self.disp_signal = np.max(self.discrepancy_gaussian)
    #     return self.discrepancy_gaussian, self.feature_gaussian, self.noise_estimation, self.disp_signal
    

    # give the final suggested location choice and then pass it to user
    # user interface 
    def calculate_suggested_location(self):
        output = findbestlocation(self.current_state_location, self.spatial_reward, self.variable_reward, 
                                            self.discrepancy_reward)

        return output, self.current_state_location, self.spatial_reward, self.variable_reward, self.discrepancy_reward
    
    def get_gaussian_rewards(self):
        return self.information_gaussian, self.discrepancy_gaussian, self.feature_gaussian



def plot_test(location, detail_location, erodi, info_gaussian, information_level, info_signal,
              disp_gaussian, feature_gaussian, noise_esti, disp_signal, xx_model, gasussian_prediction, gaussian_uncertainty):
    fig, axs = plt.subplots(3,1, sharex=True, figsize=(7,10))
    axs[0].plot(detail_location, info_gaussian,  
                                linewidth=1, label="info_reward", c="red")

    axs[0].plot(detail_location, feature_gaussian, 
                             linewidth=1, label="feature_reward", c="blue")
    axs[0].set_ylabel('reward')
    
    axs[0].set_title("information_level: " + str(information_level) + 
                     " info signal: " + str(info_signal) + "\n"
                     " noise_esti" + str(noise_esti) + 
                     " disp_signal: " + str(disp_signal))
    axs[0].legend()
    axs[1].plot(detail_location, disp_gaussian, 
                                linewidth=1, label="disp_reward", c="lime")
    axs[1].set_ylabel('disp reward')
    axs[2].scatter(location, erodi, 60)
    axs[2].plot(detail_location, xx_model)
    plt.plot(detail_location, gasussian_prediction, label='Prediction')
    plt.fill_between(detail_location.ravel(), gasussian_prediction - 1.96*gaussian_uncertainty, gasussian_prediction + 1.96*gaussian_uncertainty, alpha=0.5, color='k', label='Uncertainty')
    axs[2].set_ylabel('stiffness')
    axs[2].set_xlabel('normalize location') 
    axs[2].legend()
    plt.savefig('./figs_test/'+ 'num' + str(len(location)) + str(location) + str(datetime.now().strftime("%Y%m%d_%H%M%S")) + '.png')


def plot(Traveler_DM, Traveler_ENV,sequence, location, sample, mm, erodi, results):
    ### plot the state transition graph 
    fig, axs = plt.subplots(6,1, sharex=True, figsize=(7,10))
    x = np.linspace(1,22,22)
    axs[0].plot(x, Traveler_DM.variable_reward, marker="o", markersize="5", 
                                linewidth=1, label="variable_reward", c="red")
    axs[0].plot(x, Traveler_DM.spatial_reward, marker="d", markersize="5",
                                linewidth=1, label="spatial_reward", c="lime")
    axs[0].plot(x, Traveler_DM.discrepancy_reward, marker="s", markersize="5",
                             linewidth=1, label="discrepancy_reward", c="blue")
    axs[0].set_ylabel('reward')
    axs[0].set_xticks(range(0,23,1))
    axs[0].set_ylim((0,1))  
    axs[0].set_title("hypo" + str(Traveler_DM.current_belief) +  str(location))
    axs[0].legend()
    for i in range(len(location)):
        if(i==0):
            axs[1].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black", label="current state")
            axs[2].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black", label="current state")
            axs[3].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black", label="current state")
            axs[4].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black", label="current state")
            axs[5].scatter(mm[i], erodi[i], 
                            marker='D',s=30,c="black", label="current state")
        else:
            axs[1].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black")
            axs[2].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black")
            axs[3].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black")
            axs[4].scatter(location[i] * np.ones(int(sample[i])), 
                erodi[i], marker='D',s=30,c="black")
            axs[5].scatter(mm[i], erodi[i], 
                            marker='D',s=30,c="black")
    spatial_selection = np.array(results['spatial_locs']) + 1
    variable_selection = np.array(results['variable_locs']) + 1
    discrepancy_selection = np.array(results['discrepancy_locs']) + 1
    discrepancy_low_selection = np.array(results['discrepancy_lows_locs']) + 1 
    mm, erodi = Traveler_ENV.get_data_state([spatial_selection, 
                                        3 * np.ones(len(spatial_selection))])

    for i in range(len(spatial_selection)):
        if(i==0):
            axs[1].scatter(spatial_selection[i] * np.ones(3), 
                erodi[i], marker='D',s=40,c="lime", label="spatial reward")
        else:
            axs[1].scatter(spatial_selection[i] * np.ones(3), 
                erodi[i], marker='D',s=40,c="lime")
    axs[1].set_ylabel('shear strength')
    axs[1].set_ylim((0,12))
    axs[1].legend()

    mm, erodi = Traveler_ENV.get_data_state([variable_selection,
                                         3 * np.ones(len(variable_selection))])

    for i in range(len(variable_selection)):
        if(i==0):
            axs[2].scatter(variable_selection[i] * np.ones(3), 
                erodi[i], marker='o',s=40,c="red", label="variable reward")
        else:
            axs[2].scatter(variable_selection[i] * np.ones(3), 
                erodi[i], marker='o',s=40,c="red")
    axs[2].set_ylabel('shear strength')
    axs[2].set_ylim((0,12))
    axs[2].legend()

    mm, erodi = Traveler_ENV.get_data_state([discrepancy_selection,
                                     3 * np.ones(len(discrepancy_selection))])
    for i in range(len(discrepancy_selection)):
        if(i==0):
            axs[3].scatter(discrepancy_selection[i] * np.ones(3), 
                erodi[i], marker='s',s=40,c="blue", label="discrepancy reward")
        else:
            axs[3].scatter(discrepancy_selection[i] * np.ones(3), 
                erodi[i], marker='s',s=40,c="blue")
    axs[3].set_ylabel('shear strength')
    axs[3].set_xlabel('loc')
    axs[3].set_ylim((0,12))
    axs[3].legend()

    mm, erodi = Traveler_ENV.get_data_state([discrepancy_low_selection,
                                 3 * np.ones(len(discrepancy_low_selection))])
    for i in range(len(discrepancy_low_selection)):
        if(i==0):
            axs[4].scatter(discrepancy_low_selection[i] * np.ones(3), 
                erodi[i], marker='s',s=40,c="blue", 
                                            label="discrepancy lower reward")
        else:
            axs[4].scatter(discrepancy_low_selection[i] * np.ones(3), 
                erodi[i], marker='s',s=40,c="blue")
    axs[4].set_ylabel('shear strength')
    axs[4].set_xlabel('loc')
    axs[4].set_ylim((0,12))
    axs[4].legend()

    axs[5].plot(Traveler_DM.xfit, Traveler_DM.xx_model, linewidth=2)
    axs[5].set_ylabel('shear strength')
    axs[5].set_xlabel('moisture')
    axs[5].set_ylim((0,12))
    axs[5].legend()
    # plt.show()
    plt.savefig('./figs_test/'
                                 + "num" + str(len(sequence)) + str(sequence))

def deploy_plot(Traveler_DM ,sequence, location, sample, mm, erodi, results):
    ### plot the state transition graph 
    plt.rcParams['font.sans-serif'] = ['Times New Roman']
    plt.rcParams.update({'font.size':36 })
    fig, axs = plt.subplots(3,1, figsize=(22,25))
    x = np.linspace(1,22,22)
    axs[0].plot(x, Traveler_DM.mean_moisture_each, linewidth=3, label="variable_reward", c="black")
    for i in range(len(Traveler_DM.current_state_location)):
        axs[0].plot(Traveler_DM.current_state_location[i] * np.ones(len(Traveler_DM.current_state_moisture[i])), Traveler_DM.current_state_moisture[i], 'o', c="red",markersize=10)
    axs[0].fill_between(np.linspace(1,22,22), Traveler_DM.mean_moisture_each +  0.5, Traveler_DM.mean_moisture_each -  0.5, alpha=0.2, color="green")
    axs[0].set_ylabel('Moisture')
    axs[0].set_xlabel('Location')
    axs[1].plot(Traveler_DM.x_detail_fit, Traveler_DM.xx_detail_model, linewidth=3,  c="black")
    for i in range(len(Traveler_DM.current_state_location)):
        axs[1].plot(Traveler_DM.current_state_moisture[i], Traveler_DM.current_state_shear_strength[i], 'o', c="red",markersize=10)
    axs[1].plot(Traveler_DM.x_detail_fit, Traveler_DM.shearstrength_predict, c="green", linewidth=3)
    axs[1].fill_between(Traveler_DM.x_detail_fit, Traveler_DM.shearstrength_predict +  3*Traveler_DM.shearstrength_std_each, Traveler_DM.shearstrength_predict - 3*Traveler_DM.shearstrength_std_each, alpha=0.2, color="green")
    axs[1].set_ylabel('Shear Strength')
    axs[1].set_xlabel('Moisture')
    
    for i in range(len(Traveler_DM.current_state_location)):
        axs[2].plot(Traveler_DM.current_state_location[i] * np.ones(len(Traveler_DM.current_state_shear_strength[i])), Traveler_DM.current_state_shear_strength[i],'o',markersize=10, linewidth=3,  c="red")
    axs[2].plot(np.linspace(1,22,22), Traveler_DM.mean_shearstrength_each_loc,'o',markersize=10, linewidth=3,  c="black")
    # moisture_index = np.round(Traveler_DM.current_state_moisture)
    # axs[2].plot(moisture_index, Traveler_DM.current_state_shear_strength, 'o', c="red",markersize=10)
    # axs[2].plot(Traveler_DM.xfit, Traveler_DM.shearstrength_predict, 'o', c="green", markersize=10)
    # axs[2].fill_between(Traveler_DM.xfit, Traveler_DM.shearstrength_predict +  3*Traveler_DM.shearstrength_std_each, Traveler_DM.shearstrength_predict - 3*Traveler_DM.shearstrength_std_each, alpha=0.2, color="green")
    axs[2].set_ylabel('Shear Strength')
    axs[2].set_xlabel('Location')
    # for i in range(len(location)):
    #     if(i==0):
    #         axs[1].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black", label="current state")
    #         axs[2].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black", label="current state")
    #         axs[3].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black", label="current state")
    #         axs[4].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black", label="current state")
    #         axs[5].scatter(mm[i], erodi[i], 
    #                         marker='D',s=30,c="black", label="current state")
    #     else:
    #         axs[1].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black")
    #         axs[2].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black")
    #         axs[3].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black")
    #         axs[4].scatter(location[i] * np.ones(int(sample[i])), 
    #             erodi[i], marker='D',s=30,c="black")
    #         axs[5].scatter(mm[i], erodi[i], 
    #                         marker='D',s=30,c="black")
    # spatial_selection = np.array(results['spatial_locs']) + 1
    # variable_selection = np.array(results['variable_locs']) + 1
    # discrepancy_selection = np.array(results['discrepancy_locs']) + 1
    # discrepancy_low_selection = np.array(results['discrepancy_lows_locs']) + 1 
    # mm, erodi = Traveler_ENV.get_data_state([spatial_selection, 
    #                                     3 * np.ones(len(spatial_selection))])
    # # print(spatial_selection)
    # # print(erodi)
    # for i in range(len(spatial_selection)):
    #     if(i==0):
    #         axs[1].scatter(spatial_selection[i] * np.ones(3), 
    #             erodi[i], marker='D',s=40,c="lime", label="spatial reward")
    #     else:
    #         axs[1].scatter(spatial_selection[i] * np.ones(3), 
    #             erodi[i], marker='D',s=40,c="lime")
    # axs[1].set_ylabel('shear strength')
    # axs[1].set_ylim((0,12))
    # axs[1].legend()

    # mm, erodi = Traveler_ENV.get_data_state([variable_selection,
    #                                      3 * np.ones(len(variable_selection))])
    # # print(variable_selection)
    # # print(erodi)
    # for i in range(len(variable_selection)):
    #     if(i==0):
    #         axs[2].scatter(variable_selection[i] * np.ones(3), 
    #             erodi[i], marker='o',s=40,c="red", label="variable reward")
    #     else:
    #         axs[2].scatter(variable_selection[i] * np.ones(3), 
    #             erodi[i], marker='o',s=40,c="red")
    # axs[2].set_ylabel('shear strength')
    # axs[2].set_ylim((0,12))
    # axs[2].legend()

    # mm, erodi = Traveler_ENV.get_data_state([discrepancy_selection,
    #                                  3 * np.ones(len(discrepancy_selection))])
    # for i in range(len(discrepancy_selection)):
    #     if(i==0):
    #         axs[3].scatter(discrepancy_selection[i] * np.ones(3), 
    #             erodi[i], marker='s',s=40,c="blue", label="discrepancy reward")
    #     else:
    #         axs[3].scatter(discrepancy_selection[i] * np.ones(3), 
    #             erodi[i], marker='s',s=40,c="blue")
    # axs[3].set_ylabel('shear strength')
    # axs[3].set_xlabel('loc')
    # axs[3].set_ylim((0,12))
    # axs[3].legend()

    # mm, erodi = Traveler_ENV.get_data_state([discrepancy_low_selection,
    #                              3 * np.ones(len(discrepancy_low_selection))])
    # for i in range(len(discrepancy_low_selection)):
    #     if(i==0):
    #         axs[4].scatter(discrepancy_low_selection[i] * np.ones(3), 
    #             erodi[i], marker='s',s=40,c="blue", 
    #                                         label="discrepancy lower reward")
    #     else:
    #         axs[4].scatter(discrepancy_low_selection[i] * np.ones(3), 
    #             erodi[i], marker='s',s=40,c="blue")
    # axs[4].set_ylabel('shear strength')
    # axs[4].set_xlabel('loc')
    # axs[4].set_ylim((0,12))
    # axs[4].legend()

    # axs[5].plot(Traveler_DM.xfit, Traveler_DM.xx_model, linewidth=2)
    # axs[5].set_ylabel('shear strength')
    # axs[5].set_xlabel('moisture')
    # axs[5].set_ylim((0,12))
    # axs[5].legend()
    # # plt.show()
    plt.savefig('./figs_test/'
                                 + "num" + str(len(sequence)) + str(sequence))

if __name__ == '__main__':
    pass
    # Traveler_DM = DecisionMaking()
    # Traveler_ENV = ENV()
    # location_list = list(np.linspace(1,22,22, dtype=int))
    # sample_list = list(3 * np.ones(22, dtype=int))


    # # for num in range(3,19):
    # #     print(num,"-----------------------------------------")
    # #     for i in range(10):
    # #         location = random.sample(location_list, num)
    # #         sample = random.sample(sample_list, num)
    # #         mm, erodi = Traveler_ENV.get_data_state([location,sample])
    # #         Traveler_DM.update_current_state(location, sample, mm, erodi)
    # #         Traveler_DM.handle_spatial_information_coverage()
    # #         Traveler_DM.handle_variable_information_coverage()
    # #         Traveler_DM.handle_discrepancy_coverage()
    # #         results = Traveler_DM.calculate_suggested_location()
    # #         plot(Traveler_DM, location, sample, erodi, results)

    # location = [2,10,14,18]
    # sample = [3,3,3,3]
    # for i in range(10):
    #     mm, erodi = Traveler_ENV.get_data_state([location,sample])
    #     Traveler_DM.update_current_state(location, sample, mm, erodi)
    #     Traveler_DM.handle_spatial_information_coverage()
    #     Traveler_DM.handle_variable_information_coverage()
    #     Traveler_DM.handle_discrepancy_coverage()
    #     results = Traveler_DM.calculate_suggested_location()
    #     plot(Traveler_DM, location, sample, erodi, results)
    #     spatial_selection = np.array(results['discrepancy_locs']) + 1
    #     location.append(spatial_selection[0])
    #     sample.append(3)

        

    
    
