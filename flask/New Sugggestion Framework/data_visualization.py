from ast import Break
import os, json
from turtle import color
import numpy as np
import matplotlib.pyplot as plt

def main():
    print("Current Directory Path: ", os.getcwd())
    for filename in os.scandir('./data'):
        if filename.is_file():
            file_name = os.path.basename(filename.path)
            with open(filename, 'r') as json_file:
                users_data = []
                user_steps = []
                robot_suggestions = []
                human_decisions = []

                data = json.load(json_file)
                users_data.append(data["userSteps"])

                for user_data in users_data:
                    user_steps_calculations(file_name, user_data, user_steps, robot_suggestions, human_decisions)

def user_steps_calculations(file_name, user_data, user_steps, robot_suggestions, human_decisions):
    
    for step in user_data:
        user_steps.append(step["step"])
        robot_suggested_locations = []
        human_accepted_locations = []

        for robot_suggestion in step["robotSuggestions"]:
            if (robot_suggestion is not None):
                robot_suggested_locations.append(robot_suggestion.get('index'))
            else:
                robot_suggested_locations.append(-1)
        robot_suggestions.append(robot_suggested_locations)

        human_decision = step["acceptedRobotSuggestion"]
        if human_decision is not None:
            human_accepted_locations.append(human_decision.get('index'))
        else:
            user_free_selection = step["userFreeSample"]
            human_accepted_locations.append(user_free_selection.get('index'))
        human_decisions.append(human_accepted_locations)

    print("robot_suggestions for User " + file_name.replace('.json', ': '), robot_suggestions)
    print("human_decisions for User " + file_name.replace('.json', ': '), human_decisions)
    plot_user_step(file_name, user_steps, robot_suggestions, human_decisions)

def plot_user_step(file_name, current_user_step, current_robot_suggestions, current_human_decisions):
    # suggestions vs decisions
    plt.rcParams['figure.figsize'] = [30, 15]
    plt.rcParams.update({'font.size': 15})

    user_steps = range(len(current_user_step))

    assert len(user_steps) == len(current_robot_suggestions) == len(current_human_decisions)

    for i, label in enumerate(user_steps):
        y_list = current_robot_suggestions[i]
        x_list = (user_steps[i],) * len(y_list)

        plt.plot(x_list, y_list, 'o', color='b', ms=12)

    for i, label in enumerate(user_steps):
        y_list = current_human_decisions[i]
        x_list = (user_steps[i],) * len(y_list)

        plt.plot(x_list, y_list, '*', color='r', ms=12, label='Accepted by Human')

    plt.xticks(user_steps, current_robot_suggestions)
    plt.xlim(np.min(user_steps) - 0.5, np.max(user_steps) + 0.5)
    plt.xlabel('Total Robot Suggested Locations')

    plt.ylabel('Total Avaliable Locations')

    plt.title('Robot Suggestions vs Human Decisions')
    plt.grid(True, linestyle='--', linewidth=0.5)
    plt.subplots_adjust(bottom=0.15)

    # plt.legend(loc="lower left", fontsize=8)

    current_path = os.path.dirname(os.path.abspath(__file__))
    my_path = os.path.join(current_path, 'figs_test', str(file_name).replace('.json', ''))

    try:
        os.mkdir(my_path)
    except:
        pass

    file_pointer = 1
    plt.savefig(my_path + '\\imge' + str(file_pointer) + '.png')
    file_pointer += 1

    plt.show()

main()