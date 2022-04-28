import { NUM_MEASUREMENTS } from './constants';
import { Sample } from './types';
import { dataset } from './data/rhexDataset';

// Initial strategy for alternate version of website
export const initialSamples : Sample[] = [
    { 
        index: 1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 269, normOffsetY: 72, isHovered: false,
        moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
        shear: [dataset.shear[1][0], dataset.shear[1][1], dataset.shear[1][2]],
    },
    {   
        index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 629, normOffsetY: 160, isHovered: false,
        moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
        shear: [dataset.shear[10][1], dataset.shear[10][3], dataset.shear[10][6]]
    },
    { 
        index: 14, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 789, normOffsetY: 247.5, isHovered: false,
        moisture: [dataset.moisture[14][0], dataset.moisture[14][1], dataset.moisture[14][2]],
        shear: [dataset.shear[14][1], dataset.shear[14][2], dataset.shear[14][3]] 
    },
    { 
        index: 19, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 989, normOffsetY: 289, isHovered: false,
        moisture: [dataset.moisture[19][0], dataset.moisture[19][1], dataset.moisture[19][2]],
        shear: [dataset.shear[19][0], dataset.shear[19][1], dataset.shear[19][2]] 
    },
]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };