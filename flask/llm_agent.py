from typing import List, Optional, Dict, Any
from subtask_graph import SubTask, SubTaskGraph
import numpy as np
import uuid

class LLMAgent:
    def __init__(self, openai_client):
        self.client = openai_client
        self.conversation_history = []
        self.graph = SubTaskGraph()
        self.current_robot_state = {
            'position': (0.0, 0.0),
            'paths': [],
            'visited_locations': [],
            'current_objective': None
        }
        self.belief_options = [
            "1. There are areas along the dune transect (between crest and interdune) where data is needed",
            "2. There is a discrepancy between the data and the hypothesis that needs additional evaluation",
            "3. The data seems to be supporting the hypothesis so far but additional evaluation is needed",
            "4. I hold a different belief that is not described here"
        ]
        
    def update_robot_state(self, state: Dict[str, Any]):
        """Update the robot's current state"""
        self.current_robot_state.update(state)
        
    def add_message(self, message: str, is_user: bool):
        self.conversation_history.append({
            "role": "user" if is_user else "assistant",
            "content": message
        })
        
    def get_suggestion(self, info_map: Optional[List[List[float]]] = None, 
                      disp_map: Optional[List[List[float]]] = None,
                      current_location: Optional[tuple[float, float]] = None) -> str:
        """Get LLM suggestion for next action"""
        
        # Construct the prompt with current state information
        state_description = self._construct_state_description(info_map, disp_map, current_location)
        
        messages = [
            {"role": "system", "content": """You are an AI assistant helping with robot path planning and data collection.
             Your role is to:
             1. Analyze the current robot position and environment state
             2. Identify high-value locations based on information gain and discrepancy maps
             3. Suggest optimal paths considering:
                - Distance from current position
                - Information gain potential
                - Discrepancy investigation needs
                - Previously visited locations
             4. Explain your reasoning clearly and concisely
             
             The environment is normalized to [0,1] x [0,1] coordinates."""},
            {"role": "user", "content": state_description}
        ] + self.conversation_history[-5:]  # Include last 5 messages for context
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                max_tokens=200
            )
            
            suggestion = response.choices[0].message.content
            self.add_message(suggestion, False)
            return suggestion
            
        except Exception as e:
            print(f"Error getting LLM suggestion: {str(e)}")
            return "I apologize, but I encountered an error generating a suggestion."
            
    def _construct_state_description(self, info_map, disp_map, current_location) -> str:
        description = "Current robot state and environment:\n"
        
        # Add robot position
        pos = self.current_robot_state['position']
        description += f"Robot current position: ({pos[0]:.2f}, {pos[1]:.2f})\n"
        
        # Add map information
        if info_map is not None and disp_map is not None:
            info_map = np.array(info_map)
            disp_map = np.array(disp_map)
            
            # Find high information gain areas
            high_info_locs = np.where(info_map > np.percentile(info_map, 75))
            if len(high_info_locs[0]) > 0:
                description += "\nHigh information gain areas:\n"
                for i, j in zip(high_info_locs[0][:3], high_info_locs[1][:3]):
                    x = j / (info_map.shape[1] - 1)  # Normalize to [0,1]
                    y = i / (info_map.shape[0] - 1)  # Normalize to [0,1]
                    description += f"- ({x:.2f}, {y:.2f}) with info gain: {info_map[i,j]:.2f}\n"
            
            # Find high discrepancy areas
            high_disp_locs = np.where(disp_map > np.percentile(disp_map, 75))
            if len(high_disp_locs[0]) > 0:
                description += "\nHigh discrepancy areas:\n"
                for i, j in zip(high_disp_locs[0][:3], high_disp_locs[1][:3]):
                    x = j / (disp_map.shape[1] - 1)
                    y = i / (disp_map.shape[0] - 1)
                    description += f"- ({x:.2f}, {y:.2f}) with discrepancy: {disp_map[i,j]:.2f}\n"
        
        # Add visited locations
        if self.current_robot_state['visited_locations']:
            description += "\nPreviously visited locations:\n"
            for loc in self.current_robot_state['visited_locations'][-3:]:  # Show last 3
                description += f"- ({loc[0]:.2f}, {loc[1]:.2f})\n"
        
        # Add current objective
        if self.current_robot_state['current_objective']:
            description += f"\nCurrent objective: {self.current_robot_state['current_objective']}\n"
            
        # Add belief options at the end
        description += "\nPlease consider the following beliefs based on the data:\n"
        for belief in self.belief_options:
            description += f"{belief}\n"
            
        description += "\nYou can select multiple options by listing their numbers (e.g., '1, 3')"
        return description 