'''
@author: Shipeng Liu/RoboLand
@feature: Suggest some proper locations to be measured base on current 
          measurements
'''

from scipy import signal
import numpy as np
# from env_wrapper import *
import matplotlib.pyplot as plt
from objectives_calculation import *

class TravelerHighPathPlanning:
    def __init__(self):
        self.ObjectiveComputing = ObjectiveComputing()



    '''the hypothesis model function
    Args:
        spatial_reward: reward matrix considering spatial factor 
        moisture_reward: reward matrix considering variable factor
        discrepancy_reward: reward matrix considering discrepancy factor
    Returns:
        suggested location which has maximum 
        spatial reward/moisture reward/discrepancy reward.
    '''


    def findbestlocation(self,location, spatial_reward,
                        discrepancy_reward):

        disrepancy_reward_negative = np.array(discrepancy_reward) * -1

        spatial_locs, spatial_properties = signal.find_peaks(spatial_reward,
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
        discrepancy_locs = np.unique(discrepancy_locs)
        discrepancy_lows_locs = np.unique(discrepancy_lows_locs)
        spatial_locs = np.sort(spatial_locs)
        discrepancy_locs = np.sort(discrepancy_locs)
        discrepancy_lows_locs = np.sort(discrepancy_lows_locs)

        output = {
            'spatial_locs': spatial_locs.tolist(),
            'discrepancy_locs': discrepancy_locs.tolist(),
            'discrepancy_lows_locs': discrepancy_lows_locs.tolist(),
            'max_used_spatial': max_used_spatial,
            'max_used_discrepancy': max_used_discrepancy,
            'max_used_discrepancy_lows': max_used_discrepancy_lows
        }

        return output


    def single_step_path_planning(self, location, sample, variable1, variable2):
        self.ObjectiveComputing.update_current_state(location, sample, variable1, variable2)
        information_reward = self.ObjectiveComputing.handle_spatial_information_coverage()
        discrepancy_reward = self.ObjectiveComputing.handle_discrepancy_reward()
        results = self.findbestlocation(self.ObjectiveComputing.current_state_location,
                              information_reward, 
                              discrepancy_reward)
        spatial_selection = np.array(results['spatial_locs'])
        discrepancy_selection = np.array(results['discrepancy_locs'])
        discrepancy_low_selection = np.array(results['discrepancy_lows_locs'])
        print('discrepancy_low_selection', discrepancy_low_selection)
        print('spatial_reward', self.ObjectiveComputing.spatial_reward)
        print('discrepancy_reward', self.ObjectiveComputing.discrepancy_reward)
        output = {
            'spatial_selection': spatial_selection.tolist(), 
            'discrepancy_selection': discrepancy_selection.tolist(), 
            'discrepancy_low_selection': discrepancy_low_selection.tolist(), 
            'spatial_reward': self.ObjectiveComputing.spatial_reward.tolist(),
            'discrepancy_reward': self.ObjectiveComputing.discrepancy_reward.tolist()
        }
        return output