import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32
from control_msgs.msg import DynamicJointState
from std_msgs.msg import Float64MultiArray
rclpy.init()

import time
import csv
import matplotlib.pyplot as plt
import numpy as np

class Ros2NodeWebGui(Node):
    def __init__(self):
        super().__init__('GUI_NODE')
        self.id = "YOGA1"
        self.publisher_ = self.create_publisher(Float64MultiArray, '/Web_Gui', 10)
        self.linear_subscription = self.create_subscription(
            DynamicJointState,
            '/dynamic_joint_states',
            self.handle_joint_state,
            10)

        self.force_results = self.create_subscription(
            Float64MultiArray,
            '/travelerstate',
            self.handle_travelerstate,
            10)
        self.web_gui_msg = Float64MultiArray()
        ## some parameters to specify here
        self.tab_control = ['Extrude','Traverse Workspace', 'Penetrate and Shear', 'Free Moving']
        self.temperature = 0.0
        self.controller_error = 0.0
        self.encoder_error = 0.0
        self.motor_error = 0.0
        self.position = 0.0
        self.torque = 0.0
        self.temperature1 = 0.0
        self.controller_error1 = 0.0
        self.encoder_error1 = 0.0
        self.motor_error1 = 0.0
        self.position1 = 0.0
        self.torque1 = 0.0
        self.toeforce_x = 0
        self.toeforce_y = 0
        self.toeposition_x = 0
        self.toeposition_y = 0
        self.toevelocity_x = 0
        self.toevelocity_y = 0
        self.theta_command = 0
        self.length_command = 0
        self.state_flag = 0
        self.velocity = 0
        self.velocity1 = 0
        self.running_curr = 0
        self.running_prev = 0

        self.start_time = time.time()
        self.time_list = []
        self.force_list_x = []
        self.force_list_y = []
        self.position1_list = []
        self.torque1_list = []
        self.position_list = []
        self.torque_list = []
        self.speed_list = []
        self.speed_list1 = []
        self.temperature_list = []
        self.temperature1_list = []
        self.toeposition_x_list = []
        self.toeposition_y_list = []
        self.toevelocity_x_list = []
        self.toevelocity_y_list = []
        self.theta_command_list = []
        self.length_command_list = []
        self.state_flag_list = []
        self.running_list = []
        self.force_list_loadcell_x = []
        self.force_list_loadcell_y = []
        

        self.run_time = 0

        
    
    def calibrate(self):
        self.start_time = time.time()
        self.run_time = 0
        self.time_list = []
        self.force_list_x = []
        self.force_list_y = []
        self.position1_list = []
        self.torque1_list = []
        self.position_list = []
        self.torque_list = []
        self.speed_list = []
        self.speed_list1 = []
        self.temperature_list = []
        self.temperature1_list = []
        self.toeposition_x_list = []
        self.toeposition_y_list = []
        self.toevelocity_x_list = []
        self.toevelocity_y_list = []
        self.theta_command_list = []
        self.length_command_list = []
        self.state_flag_list = []
        self.running_list = []
        self.force_list_loadcell_x = []
        self.force_list_loadcell_y = []

    def handle_joint_state(self, msg):
        self.temperature = msg.interface_values[0].values[4]
        self.controller_error = msg.interface_values[0].values[1]
        self.encoder_error = msg.interface_values[0].values[3]
        self.motor_error = msg.interface_values[0].values[5]
        self.position = msg.interface_values[0].values[7]
        self.torque = msg.interface_values[0].values[2]
        self.velocity = msg.interface_values[0].values[8]

        self.temperature1 = msg.interface_values[1].values[4]
        self.controller_error1 = msg.interface_values[1].values[1]
        self.encoder_error1 = msg.interface_values[1].values[3]
        self.motor_error1 = msg.interface_values[1].values[5]
        self.position1 = msg.interface_values[1].values[7]
        self.torque1 = msg.interface_values[1].values[2]
        self.velocity1 = msg.interface_values[1].values[8]
        # print(msg.interface_values[0].values[2])


    def handle_travelerstate(self, msg):
        self.toeforce_x = msg.data[0]
        self.toeforce_y = msg.data[1]
        self.toeposition_x = msg.data[2]
        self.toeposition_y = msg.data[3]
        self.toevelocity_x = msg.data[4]
        self.toevelocity_y = msg.data[5]
        self.theta_command = msg.data[6]
        self.length_command = msg.data[7]
        self.state_flag = msg.data[8]
        # self.running_prev = self.running_curr
        # self.running_curr = msg.data[9]
        # print(self.toeforce_x)



    def get_angular_error(self):
        return self.angular_error

    def publish_gui_information(self, data):
        self.web_gui_msg.data = data
        self.publisher_.publish(self.web_gui_msg)

    def save_data(self):
        pass

    def start_robot_leg(self):
        pass
