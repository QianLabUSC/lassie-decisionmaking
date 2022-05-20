import { NUM_MEASUREMENTS } from './constants';
import { Sample } from './types';
import { dataset } from './data/rhexDataset';

// Initial strategy for alternate version of website
export const initialSamplesSet : Sample[][] = [
    [
        { 
            index: 0, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [4.964, 5.463, 5.626],
        },
        {   
            index: 4, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [4.85,4.776,4.65],
        },
        { 
            index: 18, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
            moisture: [dataset.moisture[14][0], dataset.moisture[14][1], dataset.moisture[14][2]],
            shear: [5.615,2.353,4.753] 
        },
       
    ],
    [
        { 
            index: 0, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [4.964, 5.463, 5.626],
        },
        {   
            index: 4, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [4.85,4.776,4.65],
        },
        { 
            index: 18, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
            moisture: [dataset.moisture[14][0], dataset.moisture[14][1], dataset.moisture[14][2]],
            shear: [5.615,2.353,4.753] 
        },
       
    ],

]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };