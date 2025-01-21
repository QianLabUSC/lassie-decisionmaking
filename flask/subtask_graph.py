from typing import List, Dict, Optional
from dataclasses import dataclass
import numpy as np

@dataclass
class SubTask:
    id: str
    description: str
    status: str  # 'ready', 'executing', 'finished'
    location: tuple[float, float]  # (x, y) coordinates
    parent_id: Optional[str] = None
    info_value: float = 0.0
    disp_value: float = 0.0
    
class SubTaskGraph:
    def __init__(self):
        self.tasks: Dict[str, SubTask] = {}
        self.edges: Dict[str, List[Dict]] = {}  # task_id -> [{target_id, paths: List[List[float]]}]
        
    def add_task(self, task: SubTask):
        self.tasks[task.id] = task
        if task.id not in self.edges:
            self.edges[task.id] = []
            
    def add_edge(self, from_id: str, to_id: str, paths: List[List[float]]):
        """Add an edge with multiple possible paths between tasks"""
        if from_id not in self.edges:
            self.edges[from_id] = []
        self.edges[from_id].append({
            "target": to_id,
            "paths": paths
        })
        
    def get_high_reward_locations(self, info_map: np.ndarray, disp_map: np.ndarray, 
                                threshold: float = 0.7) -> List[tuple[float, float]]:
        """Find locations with high combined reward"""
        high_reward_points = []
        rows, cols = info_map.shape
        
        for i in range(rows):
            for j in range(cols):
                combined_reward = (info_map[i,j] + disp_map[i,j]) / 2
                if combined_reward > threshold:
                    # Convert grid coordinates to world coordinates
                    x = j / (cols - 1)  # Normalize to [0,1]
                    y = i / (rows - 1)  # Normalize to [0,1]
                    high_reward_points.append((x, y))
                    
        return high_reward_points
        
    def manhattan_distance(self, p1: tuple[float, float], p2: tuple[float, float]) -> float:
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1]) 