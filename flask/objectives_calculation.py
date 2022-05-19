'''
@author: Shipeng Liu/RoboLand
@feature: Suggest some proper locations to be measured base on current 
          measurements
'''

from scipy.interpolate import interp1d
import numpy as np
import matplotlib.pyplot as plt
from hypothesis import *
'''generate random gaussian variable
Args:
    mean: the mean of gaussian variable
    scale: the amptitude of gaussian variable
    x:size of gaussian variable
Returns:
    gaussian variable
'''


def gauss(mean, scale, x=np.linspace(1, 22, 22), sigma=1):
    return scale * np.exp(-np.square(x - mean) / (2 * sigma**2))


'''
@This class is the decision making module which is reponsible for processing the
 current state and compute four different rewards to suggest proper locations.
'''

class ObjectiveComputing:

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
        self.location_length = 21
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
        unique_location, full_indices = np.unique(location,
                                                  return_inverse=True)
        integrated_sample = np.zeros(len(unique_location))
        integrated_moisture = []
        integrated_shearstrength = []
        for i in range(len(unique_location)):
            indexes = np.where(full_indices == i)
            integrated_sample[i] = np.sum(sample[indexes])
            integrated_moisture.append(moisture[indexes].flatten())
            integrated_shearstrength.append(shear_strengh[indexes].flatten())
        self.current_state_location = unique_location
        self.current_state_sample = integrated_sample
        # print(self.current_state_sample)
        self.current_state_moisture = integrated_moisture
        self.current_state_shear_strength = integrated_shearstrength
        print('curent', self.current_state_shear_strength)
    '''
    compute the spatial reward coverage 
    '''

    def handle_spatial_information_coverage(self):
        I_s = np.zeros(self.location_length)  #information matrix in location
        location = self.current_state_location
        sample = self.current_state_sample

        for jj in range(len(location)):
            I_s_s = np.exp(-1 / np.sqrt(sample[jj]))
            I_s += gauss(location[jj], I_s_s, np.linspace(1, 
                        self.location_length, self.location_length), 
                        0.8 * self.location_length/22)
            I_s[I_s > 1] = 1
        #add a punishment on the end and front
        I_s += gauss(0, 0.1, np.linspace(1, 
                        self.location_length, self.location_length), 
                        0.8 * self.location_length/22)
        I_s += gauss(self.location_length-1, 0.1, np.linspace(1, 
                        self.location_length, self.location_length), 
                        0.8 * self.location_length/22)
        self.spatial_information_coverage = I_s
        self.spatial_reward = 1 - I_s
        return self.spatial_reward


 
    def infer_variable(self, variable_, length):
        location = self.current_state_location
        variable_flatten = np.array([
            item for sublist in variable_
            for item in sublist
        ])

        mean_variable_each = np.zeros(length)
        std_variable_each = np.zeros(length)
        location_each = np.linspace(1, length, length)
        for jj in range(len(location_each)):
            if (location_each[jj] <= location[0]):
                variable = variable_[0]
                variable_mean = np.mean(variable)
                print(variable)
                if(len(variable) == 0):
                    variable_std = 0.5
                else:
                    variable_std = np.std(variable)
                ## find the next point b
                variable_next = variable_[1]
                variable_mean_next = np.mean(variable_next)
                if(len(variable_next) == 0):
                    variable_std_next = 0.5
                else:
                    variable_std_next = np.std(variable_next)
                ## compute the slope of ab
                slope = ((variable_mean_next - variable_mean) /
                         (location[1] - location[0]))
                slope_std = ((variable_std_next - variable_std) /
                             (location[1] - location[0]))
                variable_font = variable_mean - slope * (location[0] - 1)
                std_font = max(0, variable_std - slope_std * (location[0] - 1))
                m_font = interp1d([0.9, location[0]],
                                  [variable_font, variable_mean],
                                  kind='linear')
                std_m_font = interp1d([0.9, location[0]],
                                      [std_font, variable_std],
                                      kind='linear')
                std_variable_each[jj] = std_m_font(location_each[jj])
                mean_variable_each[jj] = m_font(location_each[jj])

            elif (location_each[jj] >= location[len(location) - 1]):
                variable = variable_[len(location) - 1]
                variable_mean = np.mean(variable)
                if(len(variable) == 0):
                    variable_std = 0.5
                else:
                    variable_std = np.std(variable)
                variable_prev = variable_[len(location) - 2]
                variable_mean_prev = np.mean(variable_prev)
                if(len(variable_prev) == 0):
                    variable_std_prev = 0.5
                else:
                    variable_std_prev = np.std(variable_prev)
                slope = (variable_mean - variable_mean_prev) / (
                    location[len(location) - 1] - location[len(location) - 2])
                slope_std = ((variable_std - variable_std_prev) /
                             (location[len(location) - 1] -
                              location[len(location) - 2]))
                variable_end = variable_mean + slope * (
                    22 - location[len(location) - 1])
                std_end = max(
                    0, variable_std + slope_std *
                    (22 - location[len(location) - 1]))
                m_end = interp1d([location[len(location) - 1], 22.1],
                                 [variable_mean, variable_end],
                                 kind='linear')
                std_m_end = interp1d([location[len(location) - 1], 22.1],
                                     [variable_std, std_end],
                                     kind='linear')
                std_variable_each[jj] = std_m_end(location_each[jj])
                mean_variable_each[jj] = m_end(location_each[jj])

            else:
                variable = variable_
                variable_mean = np.zeros(len(variable))
                variable_std = np.zeros(len(variable))
                for i in range(len(variable)):
                    variable_mean[i] = np.mean(variable[i])
                    if(len(variable[i]) == 0):
                        variable_std[i] = 0.5
                    else:
                        variable_std[i] = np.std(variable[i])
                m_inter = interp1d(location, variable_mean, kind='linear')
                std_m_inter = interp1d(location, variable_std, kind='linear')
                std_variable_each[jj] = std_m_inter(location_each[jj])
                mean_variable_each[jj] = m_inter(location_each[jj])
        R_v_set = np.zeros(22)
        std_variable_each[np.where(std_variable_each < 0)] = 0
        std_variable_each[np.where(std_variable_each > 1)] = 1
        self.std_variable_each = std_variable_each
        mean_variable_each[np.where(mean_variable_each < -1)] = -1
        mean_variable_each[np.where(mean_variable_each > 18)] = 18
        self.mean_variable_each = mean_variable_each
        return mean_variable_each, std_variable_each

    def calculate_discrepancy(self, variable_, length, mean_variable_each, std_variable_each):
        MinCoverage = 2
        location = self.current_state_location
        sample = self.current_state_sample
        yy = np.array([
            item for sublist in variable_
            for item in sublist
        ])
        print("yy", yy)
        zz_unflattend = []
        for jj in range(len(location)):
            zz_unflattend.append(location[jj] * np.ones(
                (1, int(sample[jj])))[0])
        xx = np.array([item for sublist in zz_unflattend for item in sublist])
        RMSE = []
        sort_index = np.argsort(xx)
        yy_sorted = yy[sort_index]
        xx_sorted = xx[sort_index]
        print(yy_sorted)
        coverage = len(location)
        if (coverage > MinCoverage):
            RMSE_average, RMSE_distribution, self.xfit, self.xx_model,\
                self.Pfit, self.x_detail_fit, self.xx_detail_model,\
                self.model = hypofit(xx_sorted, yy_sorted, self.location_length)
        else:
            self.xx_model = 0.5 * np.ones(self.location_length)
            self.xfit = np.linspace(1, self.location_length, self.location_length)
        location_each = np.linspace(1, self.location_length, self.location_length)
        R_d_set = np.zeros((length))
        for jj in range(len(location_each)):
            std = std_variable_each[jj]
            min_std = 0.01
            variable_possibility = np.linspace(
                mean_variable_each[jj] - 3 * min_std,
                mean_variable_each[jj] + 3 * min_std, 20)
            print(mean_variable_each)
            print(self.xx_model)
            probability = gauss(mean_variable_each[jj], 1,
                                variable_possibility, min_std)
            actual_probability = probability / np.sum(probability)
            R_m_l = 0
            for ii in range(len(variable_possibility)):
                R_m_l = R_m_l + abs(variable_possibility[ii] - self.xx_model[jj]) * actual_probability[ii]
            R_d_set[jj] = R_m_l
        return R_d_set

    def handle_discrepancy_reward(self):
        mean_variable_each, std_variable_each = \
                        self.infer_variable(self.current_state_shear_strength, 
                                self.location_length)
        print(self.current_state_shear_strength)
        self.discrepancy_reward = self.calculate_discrepancy(self.current_state_shear_strength, 
                    self.location_length, mean_variable_each, std_variable_each)
        return self.discrepancy_reward
