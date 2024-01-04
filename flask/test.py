from env_wrapper import *
from traveler_decision_making import *

Traveler_DM = DecisionMaking()
Traveler_ENV = ENV()
Traveler_ENV.set_data_version(1)
location_list = list(np.linspace(1,22,22, dtype=int))
sample_list = list(3 * np.ones(22, dtype=int))


    # for num in range(3,19):
    #     print(num,"-----------------------------------------")
    #     for i in range(10):
    #         location = random.sample(location_list, num)
    #         sample = random.sample(sample_list, num)
    #         mm, erodi = Traveler_ENV.get_data_state([location,sample])
    #         Traveler_DM.update_current_state(location, sample, mm, erodi)
    #         Traveler_DM.handle_spatial_information_coverage()
    #         Traveler_DM.handle_variable_information_coverage()
    #         Traveler_DM.handle_discrepancy_coverage()
    #         results = Traveler_DM.calculate_suggested_location()
    #         plot(Traveler_DM, location, sample, erodi, results)

location = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
sample = [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
for i in range(1):
    mm, erodi = Traveler_ENV.get_data_state([location,sample])
    
    Traveler_DM.update_current_state(location, sample, mm, erodi)
    Traveler_DM.handle_spatial_information_coverage()
    Traveler_DM.handle_variable_information_coverage()
    Traveler_DM.handle_discrepancy_coverage()
    results = Traveler_DM.calculate_suggested_location()
    print("tst" , Traveler_DM.current_state_shear_strength)
    deploy_plot(Traveler_DM, location, Traveler_DM.current_state_location, Traveler_DM.current_state_sample, Traveler_DM.current_state_moisture, Traveler_DM.current_state_shear_strength, results)
    spatial_selection = np.array(results['discrepancy_locs']) + 1
    location.append(spatial_selection[0])
    sample.append(3)