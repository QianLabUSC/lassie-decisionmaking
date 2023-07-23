import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
'''
This is global user data processing storage box
'''

class user_objective_stats():
    def __init__(self):
        self.count = 0
        self.spatial_rewards = []
        self.moiture_rewards = []
        self.discrepancy_rewards = []
        self.satisfraction_level = []
        self.accept_array = [] #1 represents accepted
        self.reject_array = [] #0 represents rejected
        self.fitting_error_array = []
        self.hypo_confidence_array = []

    def save_data(self, spatial_reward, moisture_reward, discrepancy_reward, user_sample_type, satifraction_level, fitting_error, hypo_confidence):
        self.count += 1
        self.spatial_rewards.append(spatial_reward)
        self.moiture_rewards.append(moisture_reward)
        self.discrepancy_rewards.append(discrepancy_reward)
        self.satisfraction_level.append(satifraction_level)
        if(user_sample_type == "robot"):
            self.accept_array.append(1)
            self.reject_array.append(0)
        else:
            self.accept_array.append(0)
            self.reject_array.append(1)
        self.fitting_error_array.append(fitting_error)
        self.hypo_confidence_array.append(hypo_confidence)
    

        
        
    
        # plt.show()
        # plot_user_objective_fitting_error() #5.a in initial figure story
    def plot_user_objective_reward_boxplot(self, current_object_name):
        

        # select the location by accept array
        self.accept_array = np.array(self.accept_array)
        accept_index = np.where(self.accept_array==1)
        spatial_rewards, moisture_rewards, discrepancy_rewards = np.array(self.spatial_rewards)[accept_index], np.array(self.moiture_rewards)[accept_index], np.array(self.discrepancy_rewards)[accept_index]
        plt.figure()
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})

        data = pd.DataFrame({
            'spatial reward' : spatial_rewards, 
            'moisture reward' : moisture_rewards, 
            'discrepancy reward' : discrepancy_rewards
            })

        print("dict: ", dict)

        sns.set_style('white')
        sns.boxplot(data=data, palette='flare')
        sns.despine()

        plt.xlabel("frequency")
        plt.ylabel("rewards")
        
        plt.title(f"Aggregated {num_of_users} User {current_object_name} boxplot")
        plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        plt.tight_layout()
        # plt.grid(b = True, color ='grey',
        # linestyle ='-.', linewidth = 0.5,
        # alpha = 0.6)

        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path + f'\\{current_object_name}' + 'accept.png')
        
         # select the location by reject array

        self.reject_array = np.array(self.reject_array)
        reject_index = np.where(self.reject_array==1)
        spatial_rewards, moisture_rewards, discrepancy_rewards = np.array(self.spatial_rewards)[reject_index], np.array(self.moiture_rewards)[reject_index], np.array(self.discrepancy_rewards)[reject_index]
        plt.figure()
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})

        data = pd.DataFrame({
            'spatial reward' : spatial_rewards, 
            'moisture reward' : moisture_rewards, 
            'discrepancy reward' : discrepancy_rewards
            })

        print("dict: ", dict)

        sns.set_style('white')
        sns.boxplot(data=data, palette='flare')
        sns.despine()

        plt.xlabel("frequency")
        plt.ylabel("rewards")
        
        plt.title(f"Aggregated {num_of_users} User {current_object_name} boxplot")
        plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        plt.tight_layout()
        # plt.grid(b = True, color ='grey',
        # linestyle ='-.', linewidth = 0.5,
        # alpha = 0.6)

        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path + f'\\{current_object_name}' + 'reject.png')
        # plt.show()

    def generate_plots_for_this_objective(self, current_object_name):
        self.plot_user_objective_reward_boxplot(current_object_name)  




class statistics():
    def __init__(self):
        self.spatial_objective_single = user_objective_stats()
        self.moiture_objective_single = user_objective_stats()
        self.discrepancy_objective_single = user_objective_stats()
        self.discrepancy_low_objective_single = user_objective_stats()

        self.spatial_objective_multi_rank1 = user_objective_stats()
        self.moiture_objective_multi_rank1 = user_objective_stats()
        self.discrepancy_objective_multi_rank1 = user_objective_stats()
        self.discrepancy_low_objective_multi_rank1 = user_objective_stats()

        self.spatial_objective_multi_rank2 = user_objective_stats()
        self.moiture_objective_multi_rank2 = user_objective_stats()
        self.discrepancy_objective_multi_rank2 = user_objective_stats()
        self.discrepancy_low_objective_multi_rank2 = user_objective_stats()

        self.spatial_objective_multi_rank3 = user_objective_stats()
        self.moiture_objective_multi_rank3 = user_objective_stats()
        self.discrepancy_objective_multi_rank3 = user_objective_stats()
        self.discrepancy_low_objective_multi_rank3 = user_objective_stats()

        self.spatial_objective_multi_rank4 = user_objective_stats()
        self.moiture_objective_multi_rank4 = user_objective_stats()
        self.discrepancy_objective_multi_rank4 = user_objective_stats()
        self.discrepancy_low_objective_multi_rank4 = user_objective_stats()

        self.None_objective = user_objective_stats()

        self.hypothesis_array = []
        self.fitting_error_array = []

    def plot_user_objective_addressrating(self): #4.a in initial figure story

        fig = plt.figure(figsize =(10, 7))
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})
        d = {
            'None_objective' : self.None_objective.satisfraction_level, 
            'spatial_objective_single' : self.spatial_objective_single.satisfraction_level, 
            'moiture_objective_single' : self.moiture_objective_single.satisfraction_level,
            'discrepancy_objective_single' : self.discrepancy_objective_single.satisfraction_level,
            'discrepancy_low_objective_single' : self.discrepancy_low_objective_single.satisfraction_level,
            'spatial_objective_multi_rank1' : self.spatial_objective_multi_rank1.satisfraction_level, 
            'moiture_objective_multi_rank1' : self.moiture_objective_multi_rank1.satisfraction_level,
            'discrepancy_objective_multi_rank1' : self.discrepancy_objective_multi_rank1.satisfraction_level,
            'discrepancy_low_objective_multi_rank1' : self.discrepancy_low_objective_multi_rank1.satisfraction_level,
            'spatial_objective_multi_rank234' : self.spatial_objective_multi_rank2.satisfraction_level+self.spatial_objective_multi_rank3.satisfraction_level+self.spatial_objective_multi_rank4.satisfraction_level, 
            'moiture_objective_multi_rank234' : self.moiture_objective_multi_rank2.satisfraction_level+self.moiture_objective_multi_rank3.satisfraction_level+self.moiture_objective_multi_rank4.satisfraction_level,
            'discrepancy_objective_multi_rank234' : self.discrepancy_objective_multi_rank2.satisfraction_level+self.discrepancy_objective_multi_rank3.satisfraction_level+self.discrepancy_objective_multi_rank4.satisfraction_level,
            'discrepancy_low_objective_multi_rank234' : self.discrepancy_low_objective_multi_rank2.satisfraction_level+self.discrepancy_low_objective_multi_rank3.satisfraction_level+self.discrepancy_low_objective_multi_rank4.satisfraction_level
            }
        data = pd.DataFrame(dict([(k, pd.Series(v)) for k, v in d.items()]))
        
        sns.set_style('white')
        sns.boxplot(data=data, palette='flare',orient='h')
        sns.despine()
        plt.xlabel("satisfraction")
        plt.ylabel("type")
        
        plt.title(f"Aggregated {num_of_users} User satisfaction boxplot")
        plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        plt.tight_layout()
        # plt.grid(b = True, color ='grey',
        # linestyle ='-.', linewidth = 0.5,
        # alpha = 0.6)

        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path  + '/satisfaction v3.1.png')
        
        #1 in initial figure story/2 in initial figure story
    def plot_user_objective_statistics(self): 
        plt.figure()
        plt.rcParams['figure.figsize'] = [14, 8]
        plt.rcParams.update({'font.size': 10})

        index = np.arange(5) 
        multi_rank1 = np.array([self.spatial_objective_multi_rank1.count, self.moiture_objective_multi_rank1.count,
                         self.discrepancy_objective_multi_rank1.count, self.discrepancy_low_objective_multi_rank1.count, 0])
        multi_rank2 = np.array([self.spatial_objective_multi_rank2.count, self.moiture_objective_multi_rank2.count,
                         self.discrepancy_objective_multi_rank2.count, self.discrepancy_low_objective_multi_rank2.count, 0])
        multi_rank3 = np.array([self.spatial_objective_multi_rank3.count, self.moiture_objective_multi_rank3.count,
                         self.discrepancy_objective_multi_rank3.count, self.discrepancy_low_objective_multi_rank3.count, 0])
        multi_rank4 = np.array([self.spatial_objective_multi_rank4.count, self.moiture_objective_multi_rank4.count,
                         self.discrepancy_objective_multi_rank4.count, self.discrepancy_low_objective_multi_rank4.count, 0])
        single = np.array([self.spatial_objective_single.count, self.moiture_objective_single.count, self.discrepancy_objective_single.count,
                         self.discrepancy_low_objective_single.count, 0])
        special_none = np.array([0,0,0,0, self.None_objective.count])
        bar_width = 0.35 

        numbers = f' {num_of_total_trials} of trials across all participants \n {num_of_self_selected_trials} of trials ignored offered beliefs \n {num_of_total_trials - num_of_self_selected_trials} of trials selected offered beliefs \n {num_of_single_belief_selected_trials} of trials selected single belief \n {num_of_total_trials - num_of_self_selected_trials - num_of_single_belief_selected_trials} of trials selected multi beliefs'
        
        p1 = plt.bar(index, single, bar_width, color=color_list[0])
        p2 = plt.bar(index, multi_rank1, bar_width, bottom = single, color=color_list[1])
        p3 = plt.bar(index, multi_rank2, bar_width, bottom = single+multi_rank1, color=color_list[2])
        p4 = plt.bar(index, multi_rank3, bar_width, bottom = single+multi_rank1+multi_rank2, color=color_list[3])
        p5 = plt.bar(index, multi_rank4, bar_width, bottom = single+multi_rank1+multi_rank2+multi_rank3, color=color_list[4])
        p6 = plt.bar(index, special_none, bar_width, bottom = single+multi_rank1+multi_rank2+multi_rank3+multi_rank4, color=color_list[5])
        plt.ylabel('counts')
        plt.title('objective statistics')

        bbox_props = dict(boxstyle="square,pad=0.3", fc="white", ec="black", lw=1)
        plt.annotate(numbers, fontsize=9, linespacing=1.75, xy=(-0.005, 0.755), xytext=(12, -12), va='top',
             xycoords='axes fraction', textcoords='offset points', bbox=bbox_props)

        plt.xticks(index, ('spatial', 'moisture', 'invalidate', 'validate', 'none objective'))
        plt.legend((p1[0], p2[0], p3[0], p4[0], p5[0], p6[0]), ('single objective', 'multi objecitive rank 1', 'multi objecitive rank 2', 
                                                            'multi objecitive rank 3', 'multi objecitive rank 4', 'None objective'),loc="upper left")
        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path + '/objective statistics.png')
        # plt.show()

        plt.figure()
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})
        objective_vs_none = np.array([np.sum(multi_rank1) + np.sum(multi_rank2) +np.sum(multi_rank3)+np.sum(multi_rank4)+np.sum(single), self.None_objective.count])
        p1 = plt.bar([0,1], objective_vs_none, bar_width, color=color_list[0])
        plt.xticks([0,1], ('objective provided', 'None objective'))
        plt.ylabel('counts')
        plt.title('objective statistics')
        plt.savefig(my_path + '/objective statistics v1.1' + '.png')
        
        plt.figure()
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})
        objective_vs_multi = np.array([np.sum(multi_rank1) + np.sum(multi_rank2) +np.sum(multi_rank3)+np.sum(multi_rank4), np.sum(single)])
        p1 = plt.bar([0,1], objective_vs_multi, bar_width, color=color_list[0])
        plt.xticks([0,1], ('objective multi', 'objective single'))
        plt.ylabel('counts')
        plt.title('objective statistics')
        plt.savefig(my_path + '/objective statistics v1.2' + '.png')

        plt.figure(figsize=(20, 10))
        plt.rcParams['figure.figsize'] = [20, 10]
        plt.rcParams.update({'font.size': 18})
        spatial_single = np.sum(self.spatial_objective_single.accept_array)
        spatial_multi = np.sum(self.spatial_objective_multi_rank1.accept_array + self.spatial_objective_multi_rank2.accept_array + self.spatial_objective_multi_rank3.accept_array + self.spatial_objective_multi_rank4.accept_array)
        moisture_single = np.sum(self.moiture_objective_single.accept_array)
        moisture_multi = np.sum(self.moiture_objective_multi_rank1.accept_array + self.moiture_objective_multi_rank2.accept_array + self.moiture_objective_multi_rank3.accept_array + self.moiture_objective_multi_rank4.accept_array)
        discrepancy_single = np.sum(self.discrepancy_objective_single.accept_array)
        discrepancy_multi = np.sum(self.discrepancy_low_objective_multi_rank1.accept_array + self.discrepancy_low_objective_multi_rank2.accept_array + self.discrepancy_low_objective_multi_rank3.accept_array + self.discrepancy_low_objective_multi_rank4.accept_array)
        discrepancy_low_single = np.sum(self.discrepancy_low_objective_single.accept_array)
        discrepancy_low_multi = np.sum(self.discrepancy_low_objective_multi_rank1.accept_array+self.discrepancy_low_objective_multi_rank2.accept_array+self.discrepancy_low_objective_multi_rank3.accept_array+self.discrepancy_low_objective_multi_rank4.accept_array)
        
        spatial_single_refuse = np.sum(self.spatial_objective_single.reject_array)
        spatial_multi_refuse = np.sum(self.spatial_objective_multi_rank1.reject_array + self.spatial_objective_multi_rank2.reject_array + self.spatial_objective_multi_rank3.reject_array + self.spatial_objective_multi_rank4.reject_array)
        moisture_single_refuse = np.sum(self.moiture_objective_single.reject_array)
        moisture_multi_refuse = np.sum(self.moiture_objective_multi_rank1.reject_array + self.moiture_objective_multi_rank2.reject_array + self.moiture_objective_multi_rank3.reject_array + self.moiture_objective_multi_rank4.reject_array)
        discrepancy_single_refuse = np.sum(self.discrepancy_objective_single.reject_array)
        discrepancy_multi_refuse = np.sum(self.discrepancy_low_objective_multi_rank1.reject_array + self.discrepancy_low_objective_multi_rank2.reject_array + self.discrepancy_low_objective_multi_rank3.reject_array + self.discrepancy_low_objective_multi_rank4.reject_array)
        discrepancy_low_single_refuse = np.sum(self.discrepancy_low_objective_single.reject_array)
        discrepancy_low_multi_refuse = np.sum(self.discrepancy_low_objective_multi_rank1.reject_array+self.discrepancy_low_objective_multi_rank2.reject_array+self.discrepancy_low_objective_multi_rank3.reject_array+self.discrepancy_low_objective_multi_rank4.accept_array)
 
        
        # accepted = np.array([spatial_single, spatial_multi, moisture_single, moisture_multi, discrepancy_single, 
        #                     discrepancy_multi, discrepancy_low_single, discrepancy_low_multi])
        # refused = np.array([spatial_single_refuse, spatial_multi_refuse, moisture_single_refuse, moisture_multi_refuse,
        #                     discrepancy_single_refuse, discrepancy_multi_refuse, discrepancy_low_single_refuse, discrepancy_low_multi_refuse])
        # accepted = np.array([(spatial_single+moisture_single+discrepancy_low_single+discrepancy_single), spatial_multi+ moisture_multi+ discrepancy_low_multi+discrepancy_multi])
        refused = np.array([spatial_single_refuse+moisture_single_refuse+discrepancy_single_refuse+discrepancy_low_single_refuse, spatial_multi_refuse+ moisture_multi_refuse+discrepancy_multi_refuse+ discrepancy_low_multi_refuse])
        # accepted = np.array([moisture_single, moisture_multi])
        # refused = np.array([moisture_single_refuse, moisture_multi_refuse])
        # p1 = plt.bar([0,1], accepted, bar_width, color=color_list[0])
        # p2 = plt.bar([0,1], refused, bar_width, color=color_list[1])
        p1 = plt.bar([0], refused[0], bar_width, color=color_list[0])
        p2 = plt.bar([1], refused[1], bar_width, color=color_list[1])
        plt.xticks([0,1], ('single', 'multi'))
        plt.ylabel('counts')
        plt.title('objective statistics')
        plt.legend((p1[0], p2[0]), ('single refused', 'multi refused'), loc="upper left")
        plt.savefig(my_path + '/objective statistics v2.1' + '.png')

    def plot_user_fitting_error(self, hypothesis_array, fitting_error_array, name):
        
        highly_refute_index = np.where(np.array(hypothesis_array) == -3)
        fitting_error_array = np.array(fitting_error_array)
        highly_refute_fitting_error = fitting_error_array[highly_refute_index]

        certain_refute_index = np.where(np.array(hypothesis_array) == -2)
        certain_refute_fitting_error = fitting_error_array[certain_refute_index]

        somewhat_refute_index = np.where(np.array(hypothesis_array) == -1)
        somewhat_refute_fitting_error = fitting_error_array[somewhat_refute_index]

        unsure_index = np.where(np.array(hypothesis_array) == 0)
        unsure_fitting_error = fitting_error_array[unsure_index]

        somewhat_believe_index = np.where(np.array(hypothesis_array) == 1)
        somewhat_believe_fitting_error = fitting_error_array[somewhat_believe_index]

        certain_believe_index = np.where(np.array(hypothesis_array) == 2)
        certain_believe_fitting_error = fitting_error_array[certain_believe_index]

        highly_believe_index = np.where(np.array(hypothesis_array) == 3)
        highly_believe_fitting_error = fitting_error_array[highly_believe_index]
        
        fig = plt.figure(figsize =(10, 7))
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})
        d = {
            'highly_believe' : highly_believe_fitting_error,
            'certain_believe' : certain_believe_fitting_error, 
            'somewhat_believe' : somewhat_believe_fitting_error,
            'unsure' : unsure_fitting_error,
            'somewhat_refute' : somewhat_refute_fitting_error,
            'certain_refute' : certain_refute_fitting_error,
            'highly_refute' : highly_refute_fitting_error, 
         }
        data = pd.DataFrame(dict([(k, pd.Series(v)) for k, v in d.items()]))
        
        sns.set_style('white')
        sns.boxplot(data=data, palette='flare',orient='h')
        sns.despine()
        plt.xlabel("fitting error")
        plt.ylabel("hypo confidence")
        
        plt.title(f"Aggregated {num_of_users} User {name} fitting error boxplot")
        plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        plt.tight_layout()
        # plt.grid(b = True, color ='grey',
        # linestyle ='-.', linewidth = 0.5,
        # alpha = 0.6)

        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path  + '/fittingerror v4.1.png')

        # Validating / All fitting error v4.1 plots
        fig = plt.figure(figsize =(10, 7))
        plt.rcParams['figure.figsize'] = [12, 7]
        plt.rcParams.update({'font.size': 12})
        d = {
            'highly_believe' : highly_believe_fitting_error,
            'certain_believe' : certain_believe_fitting_error, 
            'somewhat_believe' : somewhat_believe_fitting_error,
            'unsure' : unsure_fitting_error,
            'somewhat_refute' : somewhat_refute_fitting_error,
            'certain_refute' : certain_refute_fitting_error,
            'highly_refute' : highly_refute_fitting_error, 
         }
        data = pd.DataFrame(dict([(k, pd.Series(v)) for k, v in d.items()]))
        
        sns.set_style('white')
        sns.boxplot(data=data, palette='flare',orient='h')
        sns.despine()
        plt.xlabel("fitting error")
        plt.ylabel("hypo confidence")
        
        plt.title(f"Aggregated {num_of_users} User satisfaction boxplot")
        plt.legend(loc='center left', bbox_to_anchor=(1, 0.5))
        plt.tight_layout()
        # plt.grid(b = True, color ='grey',
        # linestyle ='-.', linewidth = 0.5,
        # alpha = 0.6)

        current_path = os.path.dirname(os.path.abspath(__file__))
        my_path = os.path.join(current_path, 'figs_test', "aggregated_plots")
        
        try:
            os.mkdir(my_path)
        except:
            pass

        plt.savefig(my_path + f'\\{name} ' + 'fittingerror v4.1.png')


    '''
    This function is to plot aggregated user data based on all / invalidating / validating conditions
    '''        
    def plot_aggregated_data(self):

        self.plot_user_fitting_error(self.hypothesis_array, self.fitting_error_array, "all")
        hypothesis_array_discrepancy = (self.discrepancy_objective_single.hypo_confidence_array + self.discrepancy_objective_multi_rank1.hypo_confidence_array
                                        + self.discrepancy_objective_multi_rank2.hypo_confidence_array + self.discrepancy_objective_multi_rank3.hypo_confidence_array
                                        + self.discrepancy_objective_multi_rank4.hypo_confidence_array)
        fitting_error_array_discrepancy = (self.discrepancy_objective_single.fitting_error_array + self.discrepancy_objective_multi_rank1.fitting_error_array
                                        + self.discrepancy_objective_multi_rank2.fitting_error_array + self.discrepancy_objective_multi_rank3.fitting_error_array
                                        + self.discrepancy_objective_multi_rank4.fitting_error_array)  

        assert len(hypothesis_array_discrepancy) == len(fitting_error_array_discrepancy)      

        self.plot_user_fitting_error(hypothesis_array_discrepancy, fitting_error_array_discrepancy,"invalidating")
        hypothesis_array_discrepancy_low = (self.discrepancy_low_objective_single.hypo_confidence_array + self.discrepancy_low_objective_multi_rank1.hypo_confidence_array
                                        + self.discrepancy_low_objective_multi_rank2.hypo_confidence_array + self.discrepancy_low_objective_multi_rank3.hypo_confidence_array
                                        + self.discrepancy_low_objective_multi_rank4.hypo_confidence_array)
        fitting_error_array_discrepancy_low = (self.discrepancy_low_objective_single.fitting_error_array + self.discrepancy_low_objective_multi_rank1.fitting_error_array
                                        + self.discrepancy_low_objective_multi_rank2.fitting_error_array + self.discrepancy_low_objective_multi_rank3.fitting_error_array
                                        + self.discrepancy_low_objective_multi_rank4.fitting_error_array)   

        assert len(hypothesis_array_discrepancy_low) == len(fitting_error_array_discrepancy_low)       

        self.plot_user_fitting_error(hypothesis_array_discrepancy_low, fitting_error_array_discrepancy_low, "validating")                   
        
        # plot statistics / addressed ratings here
        self.plot_user_objective_statistics()
        self.plot_user_objective_addressrating()

        # plot aggregated plots for EACH objective here
        self.spatial_objective_single.generate_plots_for_this_objective("single spatial objective") #3.a/3.b in initial figure story 
        self.moiture_objective_single.generate_plots_for_this_objective("single moisture objective") #3.a/3.b in initial figure story 
        self.discrepancy_objective_single.generate_plots_for_this_objective("single discrepancy objective") #3.a/3.b in initial figure story 
        self.discrepancy_low_objective_single.generate_plots_for_this_objective("single low discrepancy objective") #3.a/3.b in initial figure story 
        
        self.spatial_objective_multi_rank1.generate_plots_for_this_objective("multi spatial objective rank1") #3.a/3.b in initial figure story 
        self.moiture_objective_multi_rank1.generate_plots_for_this_objective("multi moisture objective rank1") #3.a/3.b in initial figure story 
        self.discrepancy_objective_multi_rank1.generate_plots_for_this_objective("multi discrepancy objective rank1") #3.a/3.b in initial figure story 
        self.discrepancy_low_objective_multi_rank1.generate_plots_for_this_objective("multi low discrepancy objective rank1") #3.a/3.b in initial figure story 

        self.spatial_objective_multi_rank2.generate_plots_for_this_objective("multi spatial objective rank2") #3.a/3.b in initial figure story 
        self.moiture_objective_multi_rank2.generate_plots_for_this_objective("multi moisture objective rank2") #3.a/3.b in initial figure story 
        self.discrepancy_objective_multi_rank2.generate_plots_for_this_objective("multi discrepancy objective rank2") #3.a/3.b in initial figure story 
        self.discrepancy_low_objective_multi_rank2.generate_plots_for_this_objective("multi low discrepancy objective rank2") #3.a/3.b in initial figure story 

        self.spatial_objective_multi_rank3.generate_plots_for_this_objective("multi spatial objective rank3") #3.a/3.b in initial figure story 
        self.moiture_objective_multi_rank3.generate_plots_for_this_objective("multi moisture objective rank3") #3.a/3.b in initial figure story 
        self.discrepancy_objective_multi_rank3.generate_plots_for_this_objective("multi discrepancy objective rank3") #3.a/3.b in initial figure story 
        self.discrepancy_low_objective_multi_rank3.generate_plots_for_this_objective("multi low discrepancy objective rank3") #3.a/3.b in initial figure story 

        self.spatial_objective_multi_rank4.generate_plots_for_this_objective("multi spatial objective rank4") #3.a/3.b in initial figure story 
        self.moiture_objective_multi_rank4.generate_plots_for_this_objective("multi moisture objective rank4") #3.a/3.b in initial figure story 
        self.discrepancy_objective_multi_rank4.generate_plots_for_this_objective("multi discrepancy objective rank4") #3.a/3.b in initial figure story 
        self.discrepancy_low_objective_multi_rank4.generate_plots_for_this_objective("multi low discrepancy objective rank4") #3.a/3.b in initial figure story 

        self.None_objective.generate_plots_for_this_objective("None objective aggregated plots") #3.a/3.b in initial figure story 


    def NormalizeData(self, data):
        if (np.max(data) == np.min(data)):
            normalized_data = np.ones(22)
        else:
            normalized_data = (data - np.min(data)) / (np.max(data) - np.min(data))
        return normalized_data
    '''
    This function is to pre-process (normalized) single user data and update aggregated objective rewards data 
    '''
    def process_data(self, file_name, user_steps, user_objectives, user_objective_ratings, user_sampling_type, spatial_rewards, moisture_rewards, 
                                    discrepancy_rewards, locations, robot_suggestions, human_decisions, no_initial_end_hypo_confidence):

        assert len(user_steps) == len(user_objectives[0]) == len(spatial_rewards) == len(moisture_rewards) == len(discrepancy_rewards)

        normalized_spatial_rewards, normalized_moisture_rewards, normalized_discrepancy_rewards = [], [], []
        average_fitting_errors = []

        for i in range(0, len(spatial_rewards)):

            normalized_spatial_rewards.append(self.NormalizeData(spatial_rewards[i]))
            normalized_moisture_rewards.append(self.NormalizeData(moisture_rewards[i]))
            normalized_discrepancy_rewards.append(self.NormalizeData(discrepancy_rewards[i]))
            
            average_fitting_errors.append(np.mean(discrepancy_rewards[i]))

        assert len(average_fitting_errors) == len(spatial_rewards)
        assert len(average_fitting_errors) == len(no_initial_end_hypo_confidence)

        self.fitting_error_array += average_fitting_errors
        self.hypothesis_array += no_initial_end_hypo_confidence

        #statistic user data through 
        if(np.mean(user_objectives[1])!=0):
            # it should belongs to multi objectives
            self.updateUserObjectRewards(user_objectives[0], 
                                        user_objective_ratings[0],
                                        user_sampling_type,
                                        average_fitting_errors,
                                        no_initial_end_hypo_confidence,
                                        self.spatial_objective_multi_rank1,
                                        self.moiture_objective_multi_rank1,
                                        self.discrepancy_objective_multi_rank1, 
                                        self.discrepancy_low_objective_multi_rank1,
                                        self.None_objective,
                                        human_decisions, normalized_spatial_rewards,
                                        normalized_moisture_rewards, normalized_discrepancy_rewards)

            self.updateUserObjectRewards(user_objectives[1], 
                                        user_objective_ratings[1],
                                        user_sampling_type,
                                        average_fitting_errors,
                                        no_initial_end_hypo_confidence,
                                        self.spatial_objective_multi_rank2,
                                        self.moiture_objective_multi_rank2,
                                        self.discrepancy_objective_multi_rank2,
                                        self.discrepancy_low_objective_multi_rank2, 
                                        self.None_objective,
                                        human_decisions, normalized_spatial_rewards, 
                                        normalized_moisture_rewards, normalized_discrepancy_rewards)

            if(np.mean(user_objectives[2]) != 0):
                self.updateUserObjectRewards(user_objectives[2], 
                                            user_objective_ratings[2],
                                            user_sampling_type,
                                            average_fitting_errors,
                                            no_initial_end_hypo_confidence,
                                            self.spatial_objective_multi_rank3,
                                            self.moiture_objective_multi_rank3,
                                            self.discrepancy_objective_multi_rank3,
                                            self.discrepancy_low_objective_multi_rank3, 
                                            self.None_objective,
                                            human_decisions, normalized_spatial_rewards,
                                            normalized_moisture_rewards, normalized_discrepancy_rewards)

            if(np.mean(user_objectives[3]) != 0):
                self.updateUserObjectRewards(user_objectives[3], 
                                            user_objective_ratings[3],
                                            user_sampling_type,
                                            average_fitting_errors,
                                            no_initial_end_hypo_confidence,
                                            self.spatial_objective_multi_rank4,
                                            self.moiture_objective_multi_rank4,
                                            self.discrepancy_objective_multi_rank4,
                                            self.discrepancy_low_objective_multi_rank4, 
                                            self.None_objective,
                                            human_decisions, normalized_spatial_rewards, 
                                            normalized_moisture_rewards, 
                                            normalized_discrepancy_rewards)

        elif(np.mean(user_objectives[0])!=0):
            #it should belongs to the single objective
            self.updateUserObjectRewards(user_objectives[0], 
                                        user_objective_ratings[0],
                                        user_sampling_type,
                                        average_fitting_errors,
                                        no_initial_end_hypo_confidence,
                                        self.spatial_objective_single,
                                        self.moiture_objective_single,
                                        self.discrepancy_objective_single,
                                        self.discrepancy_low_objective_single, 
                                        self.None_objective,
                                        human_decisions, normalized_spatial_rewards, 
                                        normalized_moisture_rewards, normalized_discrepancy_rewards)
        


    '''
    Calculate each user's global object for each object's reward
    '''
    def updateUserObjectRewards(self, target_user_objective, target_user_objective_ratings, user_sample_type, average_fitting_errors, no_initial_end_hypo_confidence, spatial, moisture, discrepancy, discrepancy_low, none_objective, human_decisions, normalized_spatial_rewards, normalized_moisture_rewards, normalized_discrepancy_rewards):

        for user_objective_index in range(0, len(human_decisions)):
            spatial_reward = normalized_spatial_rewards[user_objective_index][human_decisions[user_objective_index][0]]
            moisture_reward = normalized_moisture_rewards[user_objective_index][human_decisions[user_objective_index][0]]
            discrepancy_reward = normalized_discrepancy_rewards[user_objective_index][human_decisions[user_objective_index][0]]
            user_sample_type_ = user_sample_type[user_objective_index]
            satisfaction_level = target_user_objective_ratings[user_objective_index]
            fitting_error = average_fitting_errors[user_objective_index]
            hypoconfidence = no_initial_end_hypo_confidence[user_objective_index]


            if target_user_objective[user_objective_index] == 0:
                none_objective.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)

            elif target_user_objective[user_objective_index] == 1:
                spatial.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)

            elif target_user_objective[user_objective_index] == 2:
                moisture.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)

            elif target_user_objective[user_objective_index] == 3:
                discrepancy.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)

            elif target_user_objective[user_objective_index] == 4:
                discrepancy_low.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)
            else:
                none_objective.save_data(spatial_reward, moisture_reward, discrepancy_reward, user_sample_type_, satisfaction_level, fitting_error, hypoconfidence)
