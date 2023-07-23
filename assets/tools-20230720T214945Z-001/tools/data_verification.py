from ast import Break
import os, json
from unittest import result

import repackage
repackage.up()
from tools.traveler_decision_making import *

def main():
    for filename in os.scandir('./data'):
        if filename.is_file():
            file_name = os.path.basename(filename.path)
            with open(filename, 'r') as json_file:
                users_data = []

                data = json.load(json_file)
                users_data.append(data["userSteps"])

                for user_data in users_data:
                    getErrorData(user_data)
        break
                
def getErrorData(user_data):
    measurements = []
    locations = []
    shearValues = []
    moistureValues = []
    spatialReward = []
    moistureReward = []
    discrepancyReward = []
    traveler_dm_list = []
    numOfSteps = 0
    
    for step in user_data:
        numOfSteps += 1
        spatialReward.append(step["spatialReward"])
        moistureReward.append(step["variableReward"])
        discrepancyReward.append(step["discrepancyReward"])
        currLocations = []
        currMeasurements = []
        currShearValues = []
        currMoistureValues = []

        for i in range(0, len(step["samples"]) - 1):
            sample = step["samples"][i]
            currLocations.append(sample["index"])
            currMeasurements.append(sample["measurements"])
            currShearValues.append(sample["shear"])
            currMoistureValues.append(sample["moisture"])
        
        locations.append(np.array(currLocations) + 1)
        measurements.append(currMeasurements)
        shearValues.append(currShearValues)
        moistureValues.append(currMoistureValues)
    
    results = []
    calculatedLocations = []
    calculatedSpatialRewards = []
    calculatedVariableRewards = []
    calculatedDiscrepancyRewards = []
    calculatedinfogaussian = []
    calculateddispgaussian = []
    calculatedfeaturegaussian = []
    calculatednoiseesti = []
    calculatedDiscrepancyRewards

    for i in range(numOfSteps):
        Traveler_DM = DecisionMaking()
        Traveler_DM.update_current_state(locations[i], measurements[i], moistureValues[i], shearValues[i])
        Traveler_DM.handle_spatial_information_coverage()
        Traveler_DM.handle_variable_information_coverage()
        Traveler_DM.handle_discrepancy_coverage()

        info_gaussian = Traveler_DM.handle_spatial_information_gaussian()
        disp_gaussian, feature_gaussian, noise_esti = Traveler_DM.handle_discrepancy_gaussian()


        currResults = Traveler_DM.calculate_suggested_location()[0]
        calculatedLocations.append(Traveler_DM.calculate_suggested_location()[1])
        calculatedSpatialRewards.append(Traveler_DM.calculate_suggested_location()[2])
        calculatedVariableRewards.append(Traveler_DM.calculate_suggested_location()[3])
        calculatedDiscrepancyRewards.append(Traveler_DM.calculate_suggested_location()[4])
        calculatedinfogaussian.append(info_gaussian)
        calculateddispgaussian.append(disp_gaussian)
        calculatedfeaturegaussian.append(feature_gaussian)
        calculatednoiseesti.append(noise_esti)
        traveler_dm_list.append(Traveler_DM)
        results.append(list(currResults.items())[:4])
    
    # print("Current Result: ", results)
    # print("Calculated Locations: ", calculatedLocations)
    # print("Calculated Spatial Rewards: ", calculatedSpatialRewards)
    # print("Calculated Variable Rewards: ", calculatedVariableRewards)
    # print("Calculated Discrepancy Rewards: ", calculatedDiscrepancyRewards)

    return results, calculatedLocations, calculatedSpatialRewards, calculatedVariableRewards, calculatedDiscrepancyRewards, locations, measurements, shearValues, moistureValues, traveler_dm_list, calculatedinfogaussian, calculateddispgaussian, calculatedfeaturegaussian, calculatednoiseesti
if __name__ == '__main__':
    main()