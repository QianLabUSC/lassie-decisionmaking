# This FILE is part of multi-legged robot field exploration model
# dataset_making.py to make data collection process dataset from human interaction
#
# This programm is explained by roboLAND at university of southern california.
# Please notify the source if you use it
# 
# Copyright(c) 2021-2025 Ryoma Liu
# Email: 1196075299@qq.com


import json
import os
from re import T
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.pyplot import MultipleLocator
from env_wrapper import *
import csv
objectives = {}
objectives["There are areas along the dune transect (between crest and interdune) where data is needed"] = 1
objectives["There are portions of the dynamic range of the moisture variable (x axis of the data plot) where data is needed"] = 2
objectives["There is a discrepancy between the data and the hypothesis that needs additional evaluation"] = 3
objectives["The data seems to be supporting the hypothesis so far but additional evaluation is needed"] = 4
objectives["I hold a different belief that is not described here"] = 5
objectives["user free"] = 0
hypo_conf = {}
hypo_conf["I am highly certain this hypothesis is refuted"] = -3
hypo_conf["I am moderately certain this hypothesis is refuted"] = -2
hypo_conf["I am somewhat certain this hypothesis is refuted"] = -1
hypo_conf["I am unsure"] = 0
hypo_conf["I am somewhat certain this hypothesis is supported"] = 1
hypo_conf["I am moderately certain this hypothesis is supported"] = 2
hypo_conf["I am highly certain this hypothesis is supported"] = 3




def plot_objective_ranking(objectivesAddressedRating, user_name):
    plt.figure(figsize=(14, 6))
    plt.plot(objectivesAddressedRating, '-',marker='D', markersize=10, c="black")
    plt.yticks(np.arange(1, 7), ['Definitely addressed', 'Moderately addressed',
     'Somewhat addressed', 'Barely addressed', 'Did not address', 'Unsure'])
    plt.xlabel('usersteps')
    plt.xticks()
    plt.title('objectivesAddressedRating')
    ax=plt.gca()
    x_major_locator=MultipleLocator(1)
    ax.xaxis.set_major_locator(x_major_locator)
    plt.savefig('./figs_logging_file/'
                                 + user_name + "_objectivesAddressedRating")


def plot_objective_transition(objectivestep, user_name):
    plt.figure()
    plt.plot(objectives_steps, '-',marker='D', markersize=10, c="black")
    plt.yticks(np.arange(1, 5), ['spatial', 'variable', 'invalidate', 'validate'])
    plt.xlabel('usersteps')
    plt.xticks()
    plt.title('objective_transition')
    ax=plt.gca()
    x_major_locator=MultipleLocator(1)
    ax.xaxis.set_major_locator(x_major_locator)
    plt.savefig('./figs_logging_file/'
                                 + user_name + "_objtive_trasition")

def plot_belief_transition(hypoConfidence, user_name):
    plt.figure(figsize=(14, 6))
    plt.plot(hypoConfidence, '-',marker='D', markersize=10, c="black")
    plt.yticks(np.arange(-3, 4), ['highly refuted', 'moderately refuted', 
                            'somewhat refuted', 'unsure','somewhat supported',
                            'moderately supported', 'highly supported'])
    plt.xlabel('usersteps')
    plt.xticks()
    plt.title('hypoConfidence_transition')
    ax=plt.gca()
    x_major_locator=MultipleLocator(1)
    ax.xaxis.set_major_locator(x_major_locator)
    plt.savefig('./figs_logging_file/'
                                 + user_name + "_hypoConfidence")

def plot_reject_reasons(rejectReasons, user_name):
    plt.figure(figsize=(14, 6))
    plt.plot(rejectReasons, '-',marker='D', markersize=10, c="black")
    plt.yticks(np.arange(-3, 4), ['highly refuted', 'moderately refuted', 
                            'somewhat refuted', 'unsure','somewhat supported',
                            'moderately supported', 'highly supported'])
    plt.xlabel('usersteps')
    plt.xticks()
    plt.title('rejectReasons_transition')
    ax=plt.gca()
    x_major_locator=MultipleLocator(1)
    ax.xaxis.set_major_locator(x_major_locator)
    plt.savefig('./figs_logging_file/'
                                 + user_name + "_rejectReasons")

def plot(step, suggested_location, location, sample, mm, erodi, user_name):
    ### plot the state transition graph 
    plt.figure()
    print(erodi[0])
    print(location[0] * np.ones(sample[0]))
    for i in range(len(location)):
            plt.scatter(location[i] * np.ones(sample[i]), 
                np.array(erodi[i][0:sample[i]]), marker='D',s=30,c="black")

    for i in range(len(suggested_location)):
            plt.axvline(suggested_location[i], 
               ymin=0, ymax=1)
    plt.ylabel('shear strength')
    plt.xlabel('location')
    plt.xticks()
    ax=plt.gca()
    x_major_locator=MultipleLocator(1)
    ax.xaxis.set_major_locator(x_major_locator)
    plt.title('state_transition' + str(step))
  
    # plt.show()
    plt.savefig('./figs_logging_file/'
                                 + user_name + "_state_trasition" +  str(step))

source_path = 'data/'
user_list = os.listdir(source_path)
data = []
for i in range(len(user_list)):
    with open(source_path + user_list[i], encoding="utf-8") as f:
        user_name = str(user_list[i]).replace('.json',"")
        json_obj = json.load(f)
        objectives_steps, objectivesAddressedRating, hypoConfidence, rejectReasons = [],[],[],[]
        for j in range(len(json_obj['userSteps'])): 
            current_step = json_obj['userSteps'][j]
            #get current state 
            location, sample, mm, erodi = [],[],[],[]
            for k in range(len(current_step['samples'])):
                current_sample = current_step['samples'][k]
                location.append(current_sample['index'])
                sample.append(current_sample['measurements'])
                mm.append(current_sample['moisture'])
                erodi.append(current_sample['shear'])
            suggested_location = []
            for l in range(len(current_step['robotSuggestions'])):
                current_suggestion = current_step['robotSuggestions'][l]
                suggested_location.append(current_suggestion['index']) 
            if(len(current_step['objectives']) == 0):
                objectives_steps.append(objectives['user free'])
                objectivesAddressedRating.append(-1)
                hypoConfidence.append(current_step['hypoConfidence'])
                rejectReasons = current_step['rejectReasonsOptions']
            else:
                objectives_steps.append(objectives[current_step['objectives'][0]['objective']])
                objectivesAddressedRating.append(current_step['objectives'][0]['addressedRating'])
                hypoConfidence.append(current_step['hypoConfidence'])
                rejectReasons = current_step['rejectReasonsOptions']
            #plot current state
            # plot(j, suggested_location, location, sample, mm, erodi, user_name)
        #plot objective transition
        plot_objective_transition(objectives_steps, user_name)
        plot_objective_ranking(objectivesAddressedRating, user_name)
        plot_belief_transition(hypoConfidence, user_name)
        plot_reject_reasons(rejectReasons, user_name)

        '''
        plot the post survey questions
        '''
        x_value_1, y_value_1, y_ticks_1 = [],[],[]
        x_value_2, y_value_2, y_ticks_2 = [],[],[]  
        # x_value_3, y_value_3, y_ticks_3 = [],[],[]
        x_value_0, y_value_0, y_ticks_0 = [],[],[] 
        group0_num, group1_num, group2_num = 0,0,0


       
        for q in range(len(json_obj['surveyResponses'])):
            question = json_obj['surveyResponses'][q]
            print("")
            print("This is the " + str(q) + "-th iteration for question #" + question['id'][0])

            if(int(question['id'][0]) == 0):
                print("1st page of survey questions shown below:")
                print("This is the sub-question #" +  str(group0_num + 1))

                group0_num += 1
                x_value_0.append(int(question['value']))
                y_value_0.append(int(group0_num))

                # if(len(question['text']) > 100):
                #     y_ticks_0.append(question['text'][0:100])
                # else:
                #     y_ticks_0.append(question['text'])
            
            if(int(question['id'][0]) == 1):
                print("2nd page of survey questions shown below:")
                print("This is the sub-question #" +  str(group1_num + 1))
               
                group1_num += 1
                # if(group1_num == 6):
                #     data.append([user_name, question['value']])                    
                # else:
                x_value_1.append(int(question['value']))
                y_value_1.append(int(group1_num))

                if(len(question['text']) > 100):
                    y_ticks_1.append(question['text'][0:100])
                else:
                    y_ticks_1.append(question['text'])
            
            if(int(question['id'][0]) == 2):
                print("3rd page of survey questions shown below:")
                print("This is the sub-question #" +  str(group2_num + 1))
                
                group2_num += 1

                if group2_num == 6:
                    data.append([user_name, question['value']])
                else:
                    x_value_2.append(int(question['value']))
                    y_value_2.append(int(group2_num))
                    if(len(question['text']) > 100):
                        y_ticks_2.append(question['text'][0:100])
                    else:
                        y_ticks_2.append(question['text'])

            # if(int(question['id'][0]) == 3):
            #     print("1st page of survey questions shown below:")
            #     print("This is the sub-question #" +  str(group3_num + 1))

            #     group3_num += 1
            #     x_value_3.append(int(question['value']))
            #     y_value_3.append(int(group3_num))

            #     if(len(question['text']) > 100):
            #         y_ticks_3.append(question['text'][0:100])
            #     else:
            #         y_ticks_3.append(question['text'])

        plt.figure(figsize=(24, 6))
        plt.plot(x_value_0, y_value_0,'bd')
        plt.xticks(range(-3, 10))
        plt.yticks(y_value_0, y_ticks_0)
        plt.subplots_adjust(left=0.5)
        plt.savefig('./figs_logging_file/'
                                + user_name + "_shear_vs_moisture")      

        plt.figure(figsize=(24, 6))
        plt.plot(x_value_1, y_value_1,'bd')
        plt.xticks(range(0, 10))
        plt.yticks(y_value_1, y_ticks_1)
        plt.subplots_adjust(left=0.5)
        plt.savefig('./figs_logging_file/'
                                + user_name + "_multiple_hypothesis")      
        
        # plt.show()
        plt.figure(figsize=(24, 6))
        xticks = ['Highly disagree', 'Moderately disagree', 'somewhat disagree',\
                'Unsure', 'Somewhat agree', 'Moderately agree', 'Highly agree']   
        plt.plot(x_value_2, y_value_2,'bd')
        plt.subplots_adjust(left=0.5)
        plt.xticks(range(0, 7), xticks)
        plt.yticks(y_value_2, y_ticks_2)
        plt.savefig('./figs_logging_file/'
                                + user_name + "_address rating")
                                
        # plt.figure(figsize=(24, 6))
        # xticks = ['Not at all', 'Low', 'Slightly','Neutral', 'Moderately',\
        #         'Very', 'Extremely', 'N/A to this robot', 'N/A to robots in general',\
        #         'Not enough information']    
        # plt.plot(x_value_3, y_value_3,'bd')
        # plt.subplots_adjust(left=0.2)
        # plt.xticks(range(0, 10), xticks)
        # plt.yticks(y_value_3, y_ticks_3)
        # plt.savefig('./figs_logging_file/'
        #                         + user_name + "_trust testing")

header = ['name', 'suggestion']
data.append(["conclusionFreeResponse", json_obj['conclusionFreeResponse']])
with open('suggestion.csv', 'w') as f:
    writer = csv.writer(f)
    writer.writerow(header)
    for i in data:
        writer.writerow(i)
            # if(str(question['id'][0]) == 3):
            #     group3_num += 1
            #     x_value_3.append(int(question['value']))
            #     y_value_3.append(int(group3_num))



