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


'''the hypothesis model function
Args:
    x: input
    P1,P2,P3: parameter
Returns:
    output
'''


def model(x, P1, P2, P3):
    result = [0] * len(x)
    for i in range(len(x)):
        result[i] = P1 - P2 * max(P3 - x[i], 0)
    return result


'''the hypothesis model function
Args:
    xx: 
    yy: 
    zz:
    moist: 
Returns:
    err:
    xfit:
    model:
'''


def hypofit(xx, yy, zz):

    P0 = [8, 0.842, 9.5]
    lb = [0, 0, 0]
    ub = [20, 5, 20]

    Pfit, covs = curve_fit(model, xx, yy, P0, bounds=(lb, ub))
    xfit = np.linspace(-1, 17, 19)
    unique_x = np.unique(xx)
    loc = np.unique(zz)

    RMSE_average = [0] * len(unique_x)
    RMSE_spread = [0] * len(unique_x)

    for i in range(len(unique_x)):
        aa = np.nonzero(xx == unique_x[i])[0]
        xx_finded = xx[aa]
        yy_finded = yy[aa]
        RMSE_average[i] = (np.abs(
            np.mean(yy_finded) -
            np.mean(model(xx_finded, Pfit[0], Pfit[1], Pfit[2]))))
        RMSE_spread[i] = np.std(yy_finded, ddof=1)
    x_detail_fit = np.linspace(-1, 17, 190)
    xx_model = model(xfit, Pfit[0], Pfit[1], Pfit[2])
    xx_detail_model = model(x_detail_fit, Pfit[0], Pfit[1], Pfit[2])

    output = {
        'loc': loc.tolist(),
        'err': RMSE_average,
        'spread': RMSE_spread,
        'xfit': xfit.tolist(),
        'xx_model': xx_model,
        'Pfit': Pfit.tolist()
    }

    return loc, RMSE_average, RMSE_spread, xfit, xx_model, Pfit,\
            x_detail_fit, xx_detail_model, model


'''the hypothesis model function
Args:
    spatial_reward: reward matrix considering spatial factor 
    moisture_reward: reward matrix considering variable factor
    discrepancy_reward: reward matrix considering discrepancy factor
Returns:
    suggested location which has maximum 
    spatial reward/moisture reward/discrepancy reward.
'''


def findbestlocation(location, spatial_reward, moisture_reward,
                     discrepancy_reward):

    disrepancy_reward_negative = np.array(discrepancy_reward) * -1

    spatial_locs, spatial_properties = signal.find_peaks(spatial_reward,
                                                         height=0.3,
                                                         distance=2)
    variable_locs, variable_properties = signal.find_peaks(moisture_reward,
                                                           height=0.3,
                                                           distance=2)
    discrepancy_locs, discrepancy_properties = signal.find_peaks(
        discrepancy_reward, height=0.2, distance=2)
    discrepancy_lows_locs, discrepancy_lows_properties = signal.find_peaks(
        disrepancy_reward_negative, height=-0.5, distance=2)

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

    if len(variable_locs) == 0:
        variable_locs = moisture_reward.argsort()[-3:][::-1]
        max_used_variable = True
    elif len(variable_locs) == 1:
        variable_locs = np.append(variable_locs,
                                  moisture_reward.argsort()[-2:][::-1])
        max_used_variable = True
    elif len(variable_locs) == 2:
        variable_locs = np.append(variable_locs,
                                  moisture_reward.argsort()[-1:][::-1])
        max_used_variable = True
    elif len(variable_locs) >= 3:
        reward_list = moisture_reward[variable_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        variable_locs = variable_locs[max_index]

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
    spatial_locs = np.unique(spatial_locs)
    variable_locs = np.unique(variable_locs)
    discrepancy_locs = np.unique(discrepancy_locs)
    discrepancy_lows_locs = np.unique(discrepancy_lows_locs)
    spatial_locs = np.sort(spatial_locs)
    variable_locs = np.sort(variable_locs)
    discrepancy_locs = np.sort(discrepancy_locs)
    discrepancy_lows_locs = np.sort(discrepancy_lows_locs)

    output = {
        'spatial_locs': spatial_locs.tolist(),
        'variable_locs': variable_locs.tolist(),
        'discrepancy_locs': discrepancy_locs.tolist(),
        'discrepancy_lows_locs': discrepancy_lows_locs.tolist(),
        'max_used_spatial': max_used_spatial,
        'max_used_variable': max_used_variable,
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

    '''
    compute the spatial reward coverage 
    '''

    def handle_spatial_information_coverage(self):
        I_s = np.zeros(22)  #information matrix in location
        location = self.current_state_location
        sample = self.current_state_sample

        for jj in range(len(location)):
            I_s_s = np.exp(-1 / np.sqrt(sample[jj]))
            I_s += gauss(location[jj], I_s_s, np.linspace(1, 22, 22), 0.8)
            I_s[I_s > 1] = 1

        self.spatial_information_coverage = I_s
        self.spatial_reward = 1 - I_s
        return self.spatial_reward

    '''
    compute the variable reward coverage
    '''

    def handle_variable_information_coverage(self):
        location = self.current_state_location
        moisture_bins = np.linspace(-1, 17, 19)
        moisture_range = np.linspace(-1, 18, 20) - 0.5
        xx = np.array([
            item for sublist in self.current_state_moisture for item in sublist
        ])
        countMoist, bins = np.histogram(xx, moisture_range)
        countMoistCopy = np.zeros(len(countMoist))
        for i in range(len(countMoist)):
            if countMoist[i] == 0:
                countMoistCopy[i] = 0.01
            else:
                countMoistCopy[i] = countMoist[i]

        #print(countMoistCopy)
        I_v_s = np.exp(-1 / np.sqrt(2 * countMoistCopy))
        #print(I_v_s)
        I_v = np.zeros(len(I_v_s))
        for jj in range(len(I_v_s)):
            I_v += gauss(jj - 1, I_v_s[jj], moisture_bins, 0.8)
            # print(I_v)
            I_v[I_v > 1] = 1
        self.variable_information_coverage = I_v

        mean_moisture_each = np.zeros(22)
        min_moisture_each = np.zeros(22)
        max_moisture_each = np.zeros(22)
        std_moisture_each = np.zeros(22)
        location_each = np.linspace(1, 22, 22)
        for jj in range(len(location_each)):
            if (location_each[jj] <= location[0]):
                moisture = self.current_state_moisture[0]
                moisture_mean = np.mean(moisture)
                moisture_std = np.std(moisture)
                ## find the next point b
                moisture_next = self.current_state_moisture[1]
                moisture_mean_next = np.mean(moisture_next)
                moisture_std_next = np.std(moisture_next)
                ## compute the slope of ab
                slope = ((moisture_mean_next - moisture_mean) /
                         (location[1] - location[0]))
                slope_std = ((moisture_std_next - moisture_std) /
                             (location[1] - location[0]))
                moisture_font = moisture_mean - slope * (location[0] - 1)
                std_font = max(0, moisture_std - slope_std * (location[0] - 1))
                m_font = interp1d([0.9, location[0]],
                                  [moisture_font, moisture_mean],
                                  kind='linear')
                std_m_font = interp1d([0.9, location[0]],
                                      [std_font, moisture_std],
                                      kind='linear')
                std_moisture_each[jj] = std_m_font(location_each[jj])
                mean_moisture_each[jj] = m_font(location_each[jj])

            elif (location_each[jj] >= location[len(location) - 1]):
                moisture = self.current_state_moisture[len(location) - 1]
                moisture_mean = np.mean(moisture)
                moisture_std = np.std(moisture)
                moisture_prev = self.current_state_moisture[len(location) - 2]
                moisture_mean_prev = np.mean(moisture_prev)
                moisture_std_prev = np.std(moisture_prev)
                slope = (moisture_mean - moisture_mean_prev) / (
                    location[len(location) - 1] - location[len(location) - 2])
                slope_std = ((moisture_std - moisture_std_prev) /
                             (location[len(location) - 1] -
                              location[len(location) - 2]))
                moisture_end = moisture_mean + slope * (
                    22 - location[len(location) - 1])
                std_end = max(
                    0, moisture_std + slope_std *
                    (22 - location[len(location) - 1]))
                m_end = interp1d([location[len(location) - 1], 22.1],
                                 [moisture_mean, moisture_end],
                                 kind='linear')
                std_m_end = interp1d([location[len(location) - 1], 22.1],
                                     [moisture_std, std_end],
                                     kind='linear')
                std_moisture_each[jj] = std_m_end(location_each[jj])
                mean_moisture_each[jj] = m_end(location_each[jj])

            else:
                moisture = self.current_state_moisture
                moisture_mean = np.zeros(len(moisture))
                moisture_std = np.zeros(len(moisture))
                for i in range(len(moisture)):
                    moisture_mean[i] = np.mean(moisture[i])
                    moisture_std[i] = np.std(moisture[i])
                m_inter = interp1d(location, moisture_mean, kind='linear')
                std_m_inter = interp1d(location, moisture_std, kind='linear')
                std_moisture_each[jj] = std_m_inter(location_each[jj])
                mean_moisture_each[jj] = m_inter(location_each[jj])
        R_v_set = np.zeros(22)
        std_moisture_each[np.where(std_moisture_each < 0)] = 0
        std_moisture_each[np.where(std_moisture_each > 1)] = 1
        self.std_moisture_each = std_moisture_each
        mean_moisture_each[np.where(mean_moisture_each < -1)] = -1
        mean_moisture_each[np.where(mean_moisture_each > 18)] = 18
        self.mean_moisture_each = mean_moisture_each

        for jj in range(22):
            std = std_moisture_each[jj]
            min_std = 0.01
            moisture_possibility = np.linspace(
                mean_moisture_each[jj] - 3 * max(std, min_std),
                mean_moisture_each[jj] + 3 * max(std, min_std), 20)
            moisture_possibility[np.where(moisture_possibility < -1)] = -1
            moisture_possibility[np.where(moisture_possibility > 17)] = 17
            print(moisture_possibility)
            probability = gauss(mean_moisture_each[jj], 1,
                                moisture_possibility, max(std, min_std))
            actual_probability = probability / np.sum(probability)
            R_m_l = 0
            for ii in range(len(moisture_possibility)):
                moisture_index = 0
                if (round(moisture_possibility[ii]) + 1 < 1):
                    moisture_index = 0
                elif (round(moisture_possibility[ii]) + 1 > 17):
                    moisture_index = 18
                else:
                    moisture_index = int(round(moisture_possibility[ii]) + 1)
                R_m_l = R_m_l + I_v[moisture_index] * actual_probability[ii]
            R_v_set[jj] = R_m_l
        self.variable_reward = 1 - R_v_set
        return self.variable_reward

    '''
    compute discrepancy reward coverage
    '''

    def handle_discrepancy_coverage(self):
        MinCoverage = 0.06
        moisture_bins = np.linspace(-1, 17, 19)
        moisture_range = np.linspace(-1, 18, 20) - 0.5
        xx = np.array([
            item for sublist in self.current_state_moisture for item in sublist
        ])
        yy = np.array([
            item for sublist in self.current_state_shear_strength
            for item in sublist
        ])
        zz_unflattend = []
        for jj in range(len(self.current_state_location)):
            zz_unflattend.append(self.current_state_location[jj] * np.ones(
                (1, int(self.current_state_sample[jj])))[0])
        zz = np.array([item for sublist in zz_unflattend for item in sublist])
        RMSE = []
        location = self.current_state_location
        sort_index = np.argsort(xx)
        xx_sorted = xx[sort_index]
        yy_sorted = yy[sort_index]
        zz_sorted = zz[sort_index]
        countMoist, bins = np.histogram(xx, moisture_range)
        a = np.nonzero(countMoist)
        moistcoverage = len(np.nonzero(countMoist)[0]) / moisture_bins.size
        if (moistcoverage > MinCoverage):
            loc, RMSE_average, RMSE_distribution, self.xfit, self.xx_model,\
                self.Pfit, self.x_detail_fit, self.xx_detail_model,\
                self.model = hypofit(xx_sorted, yy_sorted, zz_sorted)
        else:
            xx_unique = np.unique(xx_sorted)
            self.xx_model = 0.5 * np.ones(len(moisture_bins))
            self.xfit = np.linspace((-1, 17, 19))

        ## compute the belief of shearstrenght vs moisture
        xx_unique = np.unique(xx_sorted)
        xx_mean = np.zeros(len(location))
        yy_mean = np.zeros(len(location))
        xx_std = np.zeros(len(location))
        yy_std = np.zeros(len(location))
        for i in range(len(location)):
            xx_finded = self.current_state_moisture[i]
            yy_finded = self.current_state_shear_strength[i]
            #print(yy_finded)
            xx_mean[i] = np.mean(xx_finded)
            yy_mean[i] = np.mean(yy_finded)
            xx_std[i] = np.std(xx_finded)
            yy_std[i] = np.std(yy_finded)
        #print("yy_std", yy_std)
        shearstrength_predict = np.zeros(190)
        shearstrength_min = np.zeros(190)
        shearstrength_max = np.zeros(190)
        shearstrength_std_each = np.zeros(190)

        for i in range(len(self.x_detail_fit)):
            if (self.x_detail_fit[i] <= xx_mean[0]):
                moisture_mean = xx_mean[0]
                shearstrength_mean = yy_mean[0]
                shearstrength_std = yy_std[0]
                moisture_mean_next = xx_mean[1]
                shearstrengh_mean_next = yy_mean[1]
                shearstrength_std_next = yy_std[1]
                slope = (shearstrengh_mean_next - shearstrength_mean) / (
                    moisture_mean_next - moisture_mean)
                shearstrengh_moisture_font = min(
                    0, shearstrength_mean - slope * (moisture_mean + 1))
                slope_std = (shearstrength_std_next - shearstrength_std) / (
                    moisture_mean_next - moisture_mean)
                std_moisture_font = max(
                    0, shearstrength_std - slope_std * (moisture_mean + 1))
                # interplote
                f_font = interp1d(
                    [-1, xx_mean[0]],
                    [shearstrengh_moisture_font, shearstrength_mean],
                    kind='linear')
                std_f_font = interp1d([-1, xx_mean[0]],
                                      [std_moisture_font, shearstrength_std],
                                      kind='linear')
                shearstrength_predict[i] = f_font(self.x_detail_fit[i])

                shearstrength_std_each[i] = std_f_font(self.x_detail_fit[i])
            elif (self.x_detail_fit[i] >= xx_mean[len(xx_mean) - 1]):
                moisture_mean = xx_mean[len(xx_mean) - 1]
                shearstrength_mean = yy_mean[len(xx_mean) - 1]
                shearstrength_std = yy_std[len(xx_mean) - 1]
                # print(shearstrength_mean)
                moisture_mean_prev = xx_mean[len(xx_mean) - 1 - 1]
                shearstrength_mean_prev = yy_mean[len(xx_mean) - 1 - 1]
                shearstrength_std_prev = yy_std[len(xx_mean) - 1 - 1]
                slope = (shearstrength_mean - shearstrength_mean_prev) / (
                    moisture_mean - moisture_mean_prev)
                shearstrengh_moisture_end = shearstrength_mean + slope * (
                    18 - moisture_mean)
                slope_std = (shearstrength_std - shearstrength_std_prev) / (
                    moisture_mean - moisture_mean_prev)
                std_moisture_end = max(
                    0, shearstrength_std + slope_std * (18 - moisture_mean))
                f_end = interp1d(
                    [xx_mean[len(xx_mean) - 1], 18],
                    [shearstrength_mean, shearstrengh_moisture_end],
                    kind='linear')
                std_f_end = interp1d([xx_mean[len(xx_mean) - 1], 18],
                                     [shearstrength_std, std_moisture_end],
                                     kind='linear')
                shearstrength_predict[i] = f_end(self.x_detail_fit[i])
                shearstrength_std_each[i] = std_f_end(self.x_detail_fit[i])
            else:
                f = interp1d(xx_mean, yy_mean, kind='linear')
                f_std = interp1d(xx_mean, yy_std, kind='linear')
                shearstrength_predict[i] = f(self.x_detail_fit[i])
                shearstrength_std_each[i] = f_std(self.x_detail_fit[i])
        #print("Dafdsafdasfas", shearstrength_std_each)
        shearstrength_std_each[np.where(shearstrength_std_each < 0)] = 0
        shearstrength_std_each[np.where(shearstrength_std_each > 1)] = 1
        self.shearstrength_std_each = shearstrength_std_each
        self.shearstrength_predict = shearstrength_predict
        #print(self.shearstrength_predict)
        # compute the potential discrepancy reward
        R_d_set = np.zeros((22))
        self.mean_shearstrength_each_loc = []
        for jj in range(22):
            std_moist = max(0.001, self.std_moisture_each[jj])
            #print("stdmoist", std_moist)
            moisture_possibility = np.linspace(
                self.mean_moisture_each[jj] - 3 * std_moist,
                self.mean_moisture_each[jj] + 3 * std_moist, 20)
            moisture_possibility[np.where(moisture_possibility < -1)] = -1
            moisture_possibility[np.where(moisture_possibility > 17)] = 17
            self.mean_moisture_each[np.where(
                self.mean_moisture_each < -1)] = -1
            self.mean_moisture_each[np.where(
                self.mean_moisture_each > 17)] = 17
            if (self.mean_moisture_each[jj] <= xx_mean[0]):
                mean_shear_strength = f_font(self.mean_moisture_each[jj])
            elif (self.mean_moisture_each[jj] >= xx_mean[len(xx_mean) - 1]):
                mean_shear_strength = f_end(self.mean_moisture_each[jj])
            else:
                mean_shear_strength = f(self.mean_moisture_each[jj])

            self.mean_shearstrength_each_loc.append(mean_shear_strength)
            probability = gauss(self.mean_moisture_each[jj], 1,
                                moisture_possibility, std_moist)
            moisture_actual_probability = probability / np.sum(probability)

            R_d_m = 0
            for kk in range(len(moisture_possibility)):
                if (moisture_possibility[kk] <= xx_mean[0]):
                    shearstrengh_mean_spec = f_font(moisture_possibility[kk])
                    shearstrength_std = std_f_font(moisture_possibility[kk])
                elif (moisture_possibility[kk] >= xx_mean[len(xx_mean) - 1]):
                    shearstrengh_mean_spec = f_end(moisture_possibility[kk])
                    shearstrength_std = std_f_end(moisture_possibility[kk])
                else:
                    shearstrengh_mean_spec = f(moisture_possibility[kk])
                    shearstrength_std = f_std(moisture_possibility[kk])

                shearstrength_std = max(0.001, shearstrength_std)
                # print(shearstrength_std)
                shearstrength_possibility = np.linspace(
                    shearstrengh_mean_spec - 3 * shearstrength_std,
                    shearstrengh_mean_spec + 3 * shearstrength_std, 20)
                shearstrength_probability = gauss(shearstrengh_mean_spec, 1,
                                                  shearstrength_possibility,
                                                  shearstrength_std)
                shearstrength_actual_prob = (shearstrength_probability /
                                             np.sum(shearstrength_probability))
                moisture_possibility_adapt = []
                moisture_possibility_adapt.append(moisture_possibility[kk])
                shearstrength_hypo_value = self.model(
                    moisture_possibility_adapt, self.Pfit[0], self.Pfit[1],
                    self.Pfit[2])
                R_d_l = 0
                for qq in range(len(shearstrength_possibility)):
                    R_d_l = (R_d_l + shearstrength_actual_prob[qq] *
                             np.abs(shearstrength_possibility[qq] -
                                    shearstrength_hypo_value))
                    average_shearstrength = shearstrength_actual_prob[
                        qq] * shearstrength_possibility[qq]
                R_d_m = R_d_m + R_d_l * moisture_actual_probability[kk]
            R_d_set[jj] = R_d_m
        self.discrepancy_coverage = R_d_set / 3
        self.discrepancy_reward = R_d_set / 3

    # give the final suggested location choice and then pass it to user
    # user interface
    def calculate_suggested_location(self):
        output = findbestlocation(self.current_state_location,
                                  self.spatial_reward, self.variable_reward,
                                  self.discrepancy_reward)
        return output


def plot(Traveler_DM, Traveler_ENV, sequence, location, sample, mm, erodi,
         results):
    ### plot the state transition graph
    fig, axs = plt.subplots(6, 1, sharex=True, figsize=(7, 10))
    x = np.linspace(1, 22, 22)
    axs[0].plot(x,
                Traveler_DM.variable_reward,
                marker="o",
                markersize="5",
                linewidth=1,
                label="variable_reward",
                c="red")
    axs[0].plot(x,
                Traveler_DM.spatial_reward,
                marker="d",
                markersize="5",
                linewidth=1,
                label="spatial_reward",
                c="lime")
    axs[0].plot(x,
                Traveler_DM.discrepancy_reward,
                marker="s",
                markersize="5",
                linewidth=1,
                label="discrepancy_reward",
                c="blue")
    axs[0].set_ylabel('reward')
    axs[0].set_xticks(range(0, 23, 1))
    axs[0].set_ylim((0, 1))
    axs[0].set_title("hypo" + str(Traveler_DM.current_belief) + str(location))
    axs[0].legend()
    for i in range(len(location)):
        if (i == 0):
            axs[1].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black",
                           label="current state")
            axs[2].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black",
                           label="current state")
            axs[3].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black",
                           label="current state")
            axs[4].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black",
                           label="current state")
            axs[5].scatter(mm[i],
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black",
                           label="current state")
        else:
            axs[1].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black")
            axs[2].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black")
            axs[3].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black")
            axs[4].scatter(location[i] * np.ones(int(sample[i])),
                           erodi[i],
                           marker='D',
                           s=30,
                           c="black")
            axs[5].scatter(mm[i], erodi[i], marker='D', s=30, c="black")
    spatial_selection = np.array(results['spatial_locs']) + 1
    variable_selection = np.array(results['variable_locs']) + 1
    discrepancy_selection = np.array(results['discrepancy_locs']) + 1
    discrepancy_low_selection = np.array(results['discrepancy_lows_locs']) + 1
    mm, erodi = Traveler_ENV.get_data_state(
        [spatial_selection, 3 * np.ones(len(spatial_selection))])
    # print(spatial_selection)
    # print(erodi)
    for i in range(len(spatial_selection)):
        if (i == 0):
            axs[1].scatter(spatial_selection[i] * np.ones(3),
                           erodi[i],
                           marker='D',
                           s=40,
                           c="lime",
                           label="spatial reward")
        else:
            axs[1].scatter(spatial_selection[i] * np.ones(3),
                           erodi[i],
                           marker='D',
                           s=40,
                           c="lime")
    axs[1].set_ylabel('shear strength')
    axs[1].set_ylim((0, 12))
    axs[1].legend()

    mm, erodi = Traveler_ENV.get_data_state(
        [variable_selection, 3 * np.ones(len(variable_selection))])
    # print(variable_selection)
    # print(erodi)
    for i in range(len(variable_selection)):
        if (i == 0):
            axs[2].scatter(variable_selection[i] * np.ones(3),
                           erodi[i],
                           marker='o',
                           s=40,
                           c="red",
                           label="variable reward")
        else:
            axs[2].scatter(variable_selection[i] * np.ones(3),
                           erodi[i],
                           marker='o',
                           s=40,
                           c="red")
    axs[2].set_ylabel('shear strength')
    axs[2].set_ylim((0, 12))
    axs[2].legend()

    mm, erodi = Traveler_ENV.get_data_state(
        [discrepancy_selection, 3 * np.ones(len(discrepancy_selection))])
    for i in range(len(discrepancy_selection)):
        if (i == 0):
            axs[3].scatter(discrepancy_selection[i] * np.ones(3),
                           erodi[i],
                           marker='s',
                           s=40,
                           c="blue",
                           label="discrepancy reward")
        else:
            axs[3].scatter(discrepancy_selection[i] * np.ones(3),
                           erodi[i],
                           marker='s',
                           s=40,
                           c="blue")
    axs[3].set_ylabel('shear strength')
    axs[3].set_xlabel('loc')
    axs[3].set_ylim((0, 12))
    axs[3].legend()

    mm, erodi = Traveler_ENV.get_data_state([
        discrepancy_low_selection, 3 * np.ones(len(discrepancy_low_selection))
    ])
    for i in range(len(discrepancy_low_selection)):
        if (i == 0):
            axs[4].scatter(discrepancy_low_selection[i] * np.ones(3),
                           erodi[i],
                           marker='s',
                           s=40,
                           c="blue",
                           label="discrepancy lower reward")
        else:
            axs[4].scatter(discrepancy_low_selection[i] * np.ones(3),
                           erodi[i],
                           marker='s',
                           s=40,
                           c="blue")
    axs[4].set_ylabel('shear strength')
    axs[4].set_xlabel('loc')
    axs[4].set_ylim((0, 12))
    axs[4].legend()

    axs[5].plot(Traveler_DM.xfit, Traveler_DM.xx_model, linewidth=2)
    axs[5].set_ylabel('shear strength')
    axs[5].set_xlabel('moisture')
    axs[5].set_ylim((0, 12))
    axs[5].legend()
    # plt.show()
    plt.savefig('./figs_test/' + "num" + str(len(sequence)) + str(sequence))


def deploy_plot(Traveler_DM, sequence, location, sample, mm, erodi, results):
    ### plot the state transition graph
    plt.rcParams['font.sans-serif'] = ['Times New Roman']
    plt.rcParams.update({'font.size': 36})
    fig, axs = plt.subplots(2, 1, figsize=(22, 25))
    x = np.linspace(1, 20, 20)
    axs[0].plot(Traveler_DM.xfit,
                Traveler_DM.discrepancy_reward,
                linewidth=3,
                c="black")
    axs[0].plot(Traveler_DM.xfit,
                Traveler_DM.discrepancy_reward,
                linewidth=3,
                c="blue")
    axs[1].set_ylabel('Discrepancy reward')
    axs[1].set_xlabel('location')
    axs[1].plot(Traveler_DM.xfit,
                Traveler_DM.xx_model,
                linewidth=3,
                c="black")
    for i in range(len(Traveler_DM.current_state_location)):
        axs[1].plot(Traveler_DM.current_state_location[i],
                    Traveler_DM.current_state_shear_strength[i][0],
                    'o',
                    c="red",
                    markersize=10)
    axs[1].plot(Traveler_DM.xfit,
                Traveler_DM.mean_variable_each,
                c="green",
                linewidth=3)
    axs[1].fill_between(Traveler_DM.xfit,
                        Traveler_DM.mean_variable_each +
                        3 * Traveler_DM.std_variable_each,
                        Traveler_DM.mean_variable_each -
                        3 * Traveler_DM.std_variable_each,
                        alpha=0.2,
                        color="green")
    axs[1].set_ylabel('Shear Strength')
    axs[1].set_xlabel('Location')


    # moisture_index = np.round(Traveler_DM.current_state_moisture)
    # axs[2].plot(moisture_index, Traveler_DM.current_state_shear_strength,\
    #    'o', c="red",markersize=10)
    # axs[2].plot(Traveler_DM.xfit, Traveler_DM.shearstrength_predict, 'o',\
    #  c="green", markersize=10)
    # axs[2].fill_between(Traveler_DM.xfit, Traveler_DM.shearstrength_predict \
    # +  3*Traveler_DM.shearstrength_std_each, Traveler_DM.shearstrength_predict\
    #  - 3*Traveler_DM.shearstrength_std_each, alpha=0.2, color="green")
    # axs[1].set_ylabel('Shear Strength')
    # axs[].set_xlabel('Location')
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
    plt.savefig('./figs_test/' + "num" + str(len(sequence)) + str(sequence))


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
