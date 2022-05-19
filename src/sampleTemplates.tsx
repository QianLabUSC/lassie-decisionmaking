import { NUM_MEASUREMENTS } from './constants';
import { Sample } from './types';
import { dataset } from './data/rhexDataset';

// Initial strategy for alternate version of website
export const initialSamplesSet : Sample[][] = [
    [
        // { 
        //     index: 1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
        //     moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
        //     shear: [10, 10, 10],
        // },
        {   
            index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [5,5,5]
        },
        { 
            index: 14, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
            moisture: [dataset.moisture[14][0], dataset.moisture[14][1], dataset.moisture[14][2]],
            shear: [3,3,3] 
        },
       
    ],
    [
        // { 
        //     index: 1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
        //     moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
        //     shear: [10, 10, 10],
        // },
        {   
            index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [5,5,5]
        },
        { 
            index: 14, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
            moisture: [dataset.moisture[14][0], dataset.moisture[14][1], dataset.moisture[14][2]],
            shear: [3,3,3] 
        },
       
    ],

]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };