import { NUM_MEASUREMENTS } from './constants';
import { Sample } from './types';
import { dataset } from './data/rhexDataset';

// Initial strategy for alternate version of website
export const initialSamplesSet : Sample[][] = [
    [
        { 
            index: 0.1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
            moisture: [dataset.moisture[1][0]],
            shear: [10],
        },
        {   
            index: 0.51, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0]],
            shear: [17.09],
        },
        {   
            index: 0.9, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
            moisture: [dataset.moisture[10][0]],
            shear: [9.57],
        },

        // {   
        //     index: 0.5, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
        //     moisture: [dataset.moisture[10][0]],
        //     shear: [5.68],
        // },
        // { 
        //     index: 0.9, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
        //     moisture: [dataset.moisture[14][0]],
        //     shear: [4.915] 
        // },
       
    ],
    // [
    //     { 
    //         index: 0, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 230, normOffsetY: 18, isHovered: false,
    //         moisture: [dataset.moisture[1][0]],
    //         shear: [4.964],
    //     },
    //     {   
    //         index: 4, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
    //         moisture: [dataset.moisture[10][0]],
    //         shear: [4.85],
    //     },
    //     {   
    //         index: 9, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
    //         moisture: [dataset.moisture[10][0]],
    //         shear: [5.056],
    //     },
    //     {   
    //         index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
    //         moisture: [dataset.moisture[10][0]],
    //         shear: [5.68],
    //     },
    //     {   
    //         index: 17, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 550, normOffsetY: 80, isHovered: false,
    //         moisture: [dataset.moisture[10][0]],
    //         shear: [4.8],
    //     },
    //     { 
    //         index: 18, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 690, normOffsetY: 130, isHovered: false,
    //         moisture: [dataset.moisture[14][0]],
    //         shear: [5.615] 
    //     },
       
    // ],

]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };