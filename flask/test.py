from env_wrapper import *
from traveler_decision_making import *
from high_path_planning import *
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

location_total = [0, 4,18, 17,  10, 9,  2, 5, 8, 7, 3, 11]
sample_total = [3,3,3,3,3,3,3,3,3,3,3,3]
mm_total = [[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10],[10,10,10]]
erodi_total = [[4.964,5.463,5.626],[4.85,4.776,4.65],[5.615,2.353,4.753],[4.8,2.68,3.39],[5.68,3.73,5.76],[5.056,4.87,3.66],[5.1994,4.9804,5.1983], [3.3948,6.3325,3.3652], [2.7601,4.8275,4.4389], [2.5502,3.3736,2.7325], [3.2078,4.4132,2.7552], [3.6136,2.3562,1.9615]]
suggestion_location = [[17,20],[2,10],[3,9,20],[2,5],[1,5],[3,8],[3,7],[3],[6,11],[6,9]]   
objective = [3,1,3,3,3,3,3,3,3,3]
hypoconfidence = [0, 1, 0, 0, 3, 3, 2, 1, 1, 1, 1]
mean_fitting_error = []
for i in range(2, len(location_total)):
    location = location_total[0:i+1]
    sample = sample_total[0:i+1]
    mm = mm_total[0:i+1]
    erodi = erodi_total[0:i+1]
    suggestion_locations = suggestion_location[i-2]
    PathPlanning = TravelerHighPathPlanning()
    output = PathPlanning.single_step_path_planning(location, sample, mm, erodi)
    deploy_plot(PathPlanning.ObjectiveComputing, location, location, sample, mm, erodi, output, suggestion_locations)
    spatial_selection = np.array(output['spatial_selection']) + 1
    index_min = min(location)
    index_max = max(location)
    error = np.mean(output['discrepancy_reward'][index_min:index_max])
    mean_fitting_error.append(error)
print(mean_fitting_error)
    

