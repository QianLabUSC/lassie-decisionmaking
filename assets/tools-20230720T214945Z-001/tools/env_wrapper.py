# This FILE is part of multi-legged robot field exploration model
# env_wrapper.py - to obtain user interaction data from website
#
# This programm is explained by roboLAND in university of southern california.
# Please notify the source if you use it
# 
# Copyright(c) 2021-2025 Ryoma Liu
# Email: 1196075299@qq.com

import json
import os
import argparse
import scipy.io as scio
import numpy as np

class ENV:
    def __init__(self):
        # load erodibility data from dataset      
        erodibility_data = scio.loadmat("erodibility_dataset.mat")
        tech_names = {'mm', 'y_H0', 'y_H1'}
        self.data_version = 0
        self.raw_data = ({key: value for key, value in erodibility_data.items()
                          if key in tech_names})
        # action/state includes [location index, samples in each index] 
        # here is the initial templates
        self.action = [[1,5,9,13,17,21], [3,3,3,3,3,3]]    
        self.state = [[1,5,9,13,17,21], [3,3,3,3,3,3]]
        

    def initiate_template(self, action):
        self.action = action
        self.state = action
        
    def get_state(self):
        return self.state

    def get_action(self):
        return self.action
    def get_dataversion(self):
        return self.data_version
    def get_data_state(self):
        # get the index of rows and cols
        row_index = []
        col_index = []
        for i in range(len(self.state[0])):
            for j in range(self.state[1][i]):
                row_random = j
                if row_random < 30:
                    col_index.append(self.state[0][i])
                    row_index.append(row_random)
                else:
                    break
        mm = np.zeros((30,22))
        mm[row_index, col_index] = self.raw_data['mm'][row_index, col_index]
        y_H0 = np.zeros((30,22))
        y_H0[row_index, col_index] = self.raw_data['y_H0'][row_index, col_index]
        y_H1 = np.zeros((30,22))
        y_H1[row_index, col_index] = self.raw_data['y_H1'][row_index, col_index]
        if(self.data_version == 0):
            erodi = y_H0
        elif(self.data_version == 1):
            erodi = y_H1
        return mm, erodi

    def set_action(self, action):
        self.action = action

    def set_data_version(self, data_version):
        self.data_version = data_version
    def update_state(self):
        self.state[0].append(self.action[0])
        self.state[1].append(self.action[1])
    def set_state(self, state):
        state_0 = np.array(state[0])
        state_1 = np.array(state[1])
        sort = np.argsort(state_0)
        state_0 = state_0[sort]
        state_1 = state_1[sort]
        
        self.state = [state_0, state_1]

# class user_data:
#     def __init__():

        
if __name__ == "__main__":
    env = ENV()
    env.get_data_state()
