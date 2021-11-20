import { RowType, NUM_MEASUREMENTS } from './constants';
import { TransectType } from './types';

// Initial strategy for alternate version of website
export const initialStrategyAlt = {
    transectIndices: [
        {number: 0, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
    ],
    transectSamples: [
        [
            { index: 0, measurements: NUM_MEASUREMENTS, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
            { index: 10, measurements: NUM_MEASUREMENTS, type: RowType.NORMAL, normOffsetX: 629, normOffsetY: 160, isHovered: false },
            { index: 21, measurements: NUM_MEASUREMENTS, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
        ]
    ]
}

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, measurements: 5, type: RowType.ROBOT_SUGGESTION, normOffsetX: 429, normOffsetY: 95, isHovered: false };