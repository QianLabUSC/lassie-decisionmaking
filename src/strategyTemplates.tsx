import { RowType } from './constants';
import { TransectType } from './types';

// Comprehensive debugging state
export const debugInitialStrategy = {
    // Note that there are up to 24 transects
    transectIndices: [
        {number: 0, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 1, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 2, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 3, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 4, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 5, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 6, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 7, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 8, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 9, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 10, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 11, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 12, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 13, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 14, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 15, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 16, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 17, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 18, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 19, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 20, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 21, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 22, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
        {number: 23, windIndex: 0, templateNumber: -1, templateIdx: -1, type: TransectType.NORMAL, hypoConfidence: [], globalHypoConfidence: []},
      ],
      // Same length as transectIndices - in this example, there is only one index location sample taken from each transect
      // Note that there can be up to 22 index locations per transect
      transectSamples: [
        [{ index: 0, measurements: 1, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 1, measurements: 1, type: RowType.NORMAL, normOffsetX: 269, normOffsetY: 72, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 2, measurements: 1, type: RowType.NORMAL, normOffsetX: 309, normOffsetY: 75, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 3, measurements: 1, type: RowType.NORMAL, normOffsetX: 349, normOffsetY: 81, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 4, measurements: 1, type: RowType.NORMAL, normOffsetX: 389, normOffsetY: 87, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 5, measurements: 1, type: RowType.NORMAL, normOffsetX: 429, normOffsetY: 95, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 6, measurements: 1, type: RowType.NORMAL, normOffsetX: 469, normOffsetY: 105, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 7, measurements: 1, type: RowType.NORMAL, normOffsetX: 509, normOffsetY: 116, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 8, measurements: 1, type: RowType.NORMAL, normOffsetX: 549, normOffsetY: 129, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 9, measurements: 1, type: RowType.NORMAL, normOffsetX: 589, normOffsetY: 144, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 10, measurements: 1, type: RowType.NORMAL, normOffsetX: 629, normOffsetY: 160, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 11, measurements: 1, type: RowType.NORMAL, normOffsetX: 669, normOffsetY: 179, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 12, measurements: 1, type: RowType.NORMAL, normOffsetX: 709, normOffsetY: 199.5, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 13, measurements: 1, type: RowType.NORMAL, normOffsetX: 749, normOffsetY: 222.5, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 14, measurements: 1, type: RowType.NORMAL, normOffsetX: 789, normOffsetY: 247.5, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 15, measurements: 1, type: RowType.NORMAL, normOffsetX: 829, normOffsetY: 275, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 16, measurements: 1, type: RowType.NORMAL, normOffsetX: 869, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 17, measurements: 1, type: RowType.NORMAL, normOffsetX: 909, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 18, measurements: 1, type: RowType.NORMAL, normOffsetX: 949, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 19, measurements: 1, type: RowType.NORMAL, normOffsetX: 989, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 20, measurements: 1, type: RowType.NORMAL, normOffsetX: 1029, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 21, measurements: 1, type: RowType.NORMAL, normOffsetX: 1049, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 21, measurements: 1, type: RowType.NORMAL, normOffsetX: 1059, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
        [{ index: 21, measurements: 1, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false, moisture: [0.5], shear: [0.1], grain: [0.9] }],
      ],
};

// Strategies below are for when the initial strategy is based on templates rather than user free choice 
export const initialStrategyTemplates = [
    // Default empty strategy
    {
        transectIndices: [],
        transectSamples: []
    },
    // Sample initial state template #1:  5 relatively evenly spaced samples (5 measurements each) at transects 1, 11, 24
    {
        transectIndices: [
            {number: 0, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 10, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 23, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
        ],
        transectSamples: [
            [
                { index: 0, measurements: 5, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 5, measurements: 5, type: RowType.NORMAL, normOffsetX: 429, normOffsetY: 95, isHovered: false },
                { index: 11, measurements: 5, type: RowType.NORMAL, normOffsetX: 669, normOffsetY: 179, isHovered: false },
                { index: 17, measurements: 5, type: RowType.NORMAL, normOffsetX: 909, normOffsetY: 289, isHovered: false },
                { index: 21, measurements: 5, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 5, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 5, measurements: 5, type: RowType.NORMAL, normOffsetX: 429, normOffsetY: 95, isHovered: false },
                { index: 11, measurements: 5, type: RowType.NORMAL, normOffsetX: 669, normOffsetY: 179, isHovered: false },
                { index: 17, measurements: 5, type: RowType.NORMAL, normOffsetX: 909, normOffsetY: 289, isHovered: false },
                { index: 21, measurements: 5, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 5, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 5, measurements: 5, type: RowType.NORMAL, normOffsetX: 429, normOffsetY: 95, isHovered: false },
                { index: 11, measurements: 5, type: RowType.NORMAL, normOffsetX: 669, normOffsetY: 179, isHovered: false },
                { index: 17, measurements: 5, type: RowType.NORMAL, normOffsetX: 909, normOffsetY: 289, isHovered: false },
                { index: 21, measurements: 5, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ]
        ]
    },
    // Sample initial state template #2:  1 transect per group of 3 at the same relatively downwind position
    {
        transectIndices: [
            {number: 1, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 4, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 7, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 10, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 13, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 16, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 19, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 22, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
        ],
        transectSamples: [
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
            [
                { index: 0, measurements: 3, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
                { index: 21, measurements: 3, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
        ]
    },
    // Sample initial state template #3:  4 evenly spaced transects
    {
        transectIndices: [
            {number: 5, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 11, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 17, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
            {number: 23, windIndex: 0, type: TransectType.NORMAL, templateNumber: -1, templateIdx: -1},
        ],
        transectSamples: [
            [
                { index: 0, measurements: 1, type: RowType.NORMAL, normOffsetX: 229, normOffsetY: 70, isHovered: false },
            ],
            [
                { index: 7, measurements: 2, type: RowType.NORMAL, normOffsetX: 509, normOffsetY: 116, isHovered: false },
            ],
            [
                { index: 14, measurements: 3, type: RowType.NORMAL, normOffsetX: 789, normOffsetY: 247.5, isHovered: false },
            ],
            [
                { index: 21, measurements: 4, type: RowType.NORMAL, normOffsetX: 1069, normOffsetY: 289, isHovered: false },
            ],
        ]
    }
];