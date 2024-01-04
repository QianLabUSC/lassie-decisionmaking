# This FILE is part of multi-legged robot field exploration model
# env_wrapper.py - to obtain user interaction data from website
#
# This programm is explained by roboLAND in university of southern california.
# Please notify the source if you use it
# 
# Copyright(c) 2021-2025 Ryoma Liu
# Email: 1196075299@qq.com

import scipy.io as scio
import numpy as np
import random

class ENV:
    def __init__(self):
        # load erodibility data from dataset      
        erodibility_data = scio.loadmat("erodibility_dataset.mat")
        tech_names = {'mm', 'y_H0', 'y_H1'}
        self.data_version = 0
        self.raw_data = ({key: value for key, value in erodibility_data.items()
                          if key in tech_names})            


    def get_dataversion(self):
        return self.data_version

    def get_data_state(self, state):
        # get the index of rows and cols

        mm = []
        y_H0 = []
        y_H1 = []
        for i in range(len(state[0])):
            row_index = []
            col_index = []
            for j in range(int(state[1][i])):
                row_random = random.randint(1, 29)
                if row_random < 30:
                    col_index.append(state[0][i] - 1)
                    row_index.append(row_random)
                else:
                    break
            mm.append(self.raw_data['mm'][row_index, col_index])
            y_H0.append(self.raw_data['y_H0'][row_index, col_index])
            y_H1.append(self.raw_data['y_H1'][row_index, col_index])
        if(self.data_version == 0):
            erodi = y_H0
        elif(self.data_version == 1):
            erodi = y_H1
        return np.array(mm), np.array(erodi)

    def set_data_version(self, data_version):
        self.data_version = data_version

        
if __name__ == "__main__":
    env = ENV()
    mm, erodi = env.get_data_state([[1,2,3,4],[3,3,3,3]])
    print(mm)
    print(erodi)