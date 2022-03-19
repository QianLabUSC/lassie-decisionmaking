import { NUM_MEASUREMENTS } from './constants';
import { PreSample } from './types';

// Initial strategy for alternate version of website
export const initialSamples : PreSample[] = [
    { index: 1, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 269, normOffsetY: 72, isHovered: false },
    { index: 10, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 629, normOffsetY: 160, isHovered: false },
    { index: 14, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 789, normOffsetY: 247.5, isHovered: false },
    { index: 19, type: 'initial', measurements: NUM_MEASUREMENTS, normOffsetX: 989, normOffsetY: 289, isHovered: false },
]

// Sample robot suggestion for debugging alternate version of website
export const sampleRobotSuggestion : IRow = { index: 5, type: 'robot', measurements: 5, normOffsetX: 429, normOffsetY: 95, isHovered: false };