from distutils.spawn import spawn
import numpy as np
from scipy.optimize import curve_fit
from scipy import signal
from scipy.interpolate import interp1d

location = [13, 15]
spatial_reward = [
                0.7429797155009306,
                0.43861608620107184,
                0.7429797155009306,
                0.9753345122421678,
                0.9995038341283518,
                0.9999979060678188,
                0.9999979060678188,
                0.9995038341283518,
                0.9753345122418252,
                0.7429797136518924,
                0.4386139941179287,
                0.7424835496296249,
                0.9506690244843357,
                0.7424835496292823,
                0.43861399226889053,
                0.7429776215687494,
                0.9748383463705196,
                0.9748383463708622,
                0.7429776234177874,
                0.4386160843520337,
                0.742979715500588,
                0.9753345122421678
            ]
moisture_reward = [
                0.5634988707664912,
                0.34613042139005057,
                0.6577012056020559,
                0.797473135775844,
                0.9703005381657401,
                0.9955728024743549,
                0.9809796344963359,
                0.9435935854596733,
                0.7043585283668097,
                0.30699426537690755,
                0.17763862255240304,
                0.35719055595469495,
                0.7082342093718106,
                0.48561454839932217,
                0.19007873672647668,
                0.4873329926492349,
                0.8499331457820097,
                0.8240042581489433,
                0.3645736768174537,
                0.18344313874240425,
                0.5688587439562761,
                0.699796023151236
            ]
discrepancy_reward = [
                0.4382102804771421,
                0.41339308022778015,
                0.40092622662538396,
                0.38858425260984725,
                0.37624227859431053,
                0.3639003045787738,
                0.3515583305632372,
                0.33921635654770044,
                0.32687438253216383,
                0.31453240851662706,
                0.29890191612258404,
                0.25991197242023495,
                0.2559108902660569,
                0.20604803424969645,
                0.09112215293536895,
                0.11516934021538128,
                0.15188024886573545,
                0.1885914084939674,
                0.2253025681221996,
                0.2620137277504316,
                0.29770885712220474,
                0.30818170256719946
            ]

def findbestlocation(location, spatial_reward, moisture_reward, discrepancy_reward):

    disrepancy_reward_negative = np.array(discrepancy_reward) * - 1

    spatial_locs, spatial_properties = signal.find_peaks(spatial_reward, 
                                                        height=0.3, distance=2)
    variable_locs, variable_properties = signal.find_peaks(moisture_reward,
                                                         height=0.3, distance=2)
    discrepancy_locs, discrepancy_properties = signal.find_peaks(
                                    discrepancy_reward, height=0.2, distance=2)
    discrepancy_lows_locs, discrepancy_lows_properties = signal.find_peaks(
                            disrepancy_reward_negative, height=-0.5, distance=2)

    max_used_spatial = False
    max_used_variable = False
    max_used_discrepancy = False
    max_used_discrepancy_lows = False

    print('spatial_locs: ', spatial_locs)
    print('varaible_locs: ', variable_locs)
    print('discrepancy_locs: ', discrepancy_locs)
    print('discrepancy_lows_locs: ', discrepancy_lows_locs)

    if len(spatial_locs) == 0:
        spatial_locs = spatial_reward.argsort()[-3:][::-1]
        max_used_spatial = True
    elif len(spatial_locs) == 1:
        spatial_locs = np.append(spatial_locs, spatial_reward.argsort()[-2:][::-1])
        max_used_spatial = True
    elif len(spatial_locs) == 2:
        spatial_locs = np.append(spatial_locs, spatial_reward.argsort()[-1:][::-1])
        max_used_spatial = True
    elif len(spatial_locs) >= 3:
        reward_list = spatial_reward[spatial_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        spatial_locs = spatial_locs[max_index]

    if len(variable_locs) == 0:
        variable_locs = moisture_reward.argsort()[-3:][::-1]
        max_used_variable = True
    elif len(variable_locs) == 1:
        variable_locs = np.append(variable_locs, moisture_reward.argsort()[-2:][::-1])
        max_used_variable = True
    elif len(variable_locs) == 2:
        variable_locs = np.append(variable_locs, moisture_reward.argsort()[-1:][::-1])
        max_used_variable = True
    elif len(variable_locs) >= 3:
        reward_list = moisture_reward[variable_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        variable_locs = variable_locs[max_index]

    if len(discrepancy_locs) == 0:
        discrepancy_locs = discrepancy_reward.argsort()[-3:][::-1]
        max_used_discrepancy = True
    elif len(discrepancy_locs) == 1:
        discrepancy_locs = np.append(discrepancy_locs, discrepancy_reward.argsort()[-2:][::-1])
        max_used_discrepancy = True
    elif len(discrepancy_locs) == 2:
        discrepancy_locs = np.append(discrepancy_locs, discrepancy_reward.argsort()[-1:][::-1])
        max_used_discrepancy = True
    elif len(discrepancy_locs) >= 3:
        reward_list = discrepancy_reward[discrepancy_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        discrepancy_locs = discrepancy_locs[max_index]

    if len(discrepancy_lows_locs) == 0:
        discrepancy_lows_locs = disrepancy_reward_negative.argsort()[-3:][::-1]
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) == 1:
        discrepancy_lows_locs = np.append(discrepancy_lows_locs, disrepancy_reward_negative.argsort()[-2:][::-1])
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) == 2:
        discrepancy_lows_locs = np.append(discrepancy_lows_locs, disrepancy_reward_negative.argsort()[-1:][::-1])
        max_used_discrepancy_lows = True
    elif len(discrepancy_lows_locs) >= 3:
        reward_list = disrepancy_reward_negative[discrepancy_lows_locs]
        max_index = reward_list.argsort()[-3:][::-1]
        discrepancy_lows_locs = discrepancy_lows_locs[max_index]

    # select discrepancy location
    print('location: ', location)
    if(len(location) < 22):
        a = location - 1
        print('a', a) 
        unselected_location = np.rint(np.delete(np.linspace(1,22,22), a-1))
        for i in range(len(discrepancy_locs)):
            idx = ((np.abs(unselected_location - discrepancy_locs[i])).argmin()) 
            if(np.abs(unselected_location[idx] - discrepancy_locs[i]) < 3):
                discrepancy_locs[i] = unselected_location[idx]
        for i in range(len(discrepancy_lows_locs)):
            idx = (np.abs(unselected_location - discrepancy_lows_locs[i])).argmin()
            if(np.abs(unselected_location[idx] - discrepancy_lows_locs[i]) < 3):
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
    print("output: ", output)

    return output

findbestlocation(location, spatial_reward, moisture_reward, discrepancy_reward)