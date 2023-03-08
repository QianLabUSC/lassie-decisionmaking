import { NUM_MEASUREMENTS } from './constants';
import { Sample } from './types';
import { dataset } from './data/rhexDataset';

// Initial strategy for alternate version of website
export const initialSamplesSet : Sample[][] = [
    [
        { 
            index: 21, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [0.09, 0.09, 0.09],
        },
        { 
            index: 21, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [0, 0.0, 0.0],
        },
        { 
            index: 20, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [0.09, 0.09, 0.09],
        },
        { 
            index: 20, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [2.23, 2.23, 2.23],
        },
        { 
            index: 19, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [0, 0.0, 0.0],
        },
        {   
            index: 16, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [1.17,1.17,1.17],
        },
        {   
            index: 16, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [0.438,0.438,0.438],
        },
        {   
            index: 15, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [0.3,0.3,0.3],
        },
        {   
            index: 15, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [2.94,2.94,2.94],
        },
        {   
            index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [2.57, 2.57, 2.57],
        },
        {   
            index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [2.04, 2.04, 2.04],
        },
        {   
            index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [1.26, 1.26, 1.26],
        },
        {   
            index: 9, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [1.82, 1.82, 1.82],
        },
        {   
            index: 8, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [2.83, 2.83, 2.83],
        },
        {   
            index: 8, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [0.926, 0.926, 0.926],
        },
        {   
            index: 2, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [3.7, 3.7, 3.7],
        },
        {   
            index: 2, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [11.29, 11.29, 11.29],
        },
        {   
            index: 0, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [0.306, 0.306, 0.306],
        },
       
    ],
    [
        { 
            index: 1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0], dataset.moisture[1][1], dataset.moisture[1][2]],
            shear: [0.09, 0.09, 0.09],
        },
        {   
            index: 5, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [1.17,1.17,1.17],
        },
        {   
            index: 12, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [2.57, 2.57, 2.57],
        },
        {   
            index: 20, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [3.7, 3.7, 3.7],
        },
        {   
            index: 22, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0], dataset.moisture[10][1], dataset.moisture[10][2]],
            shear: [0.306, 0.306, 0.306],
        },
       
    ],

]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };