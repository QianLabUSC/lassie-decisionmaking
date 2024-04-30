import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import {
  DialogProps,
  DataVersion,
  CurrUserStepData,
  UserStepsData,
  Sample,
  PreSample,
} from './types';
import { objectiveOptions } from './constants';
import { getShearData, getMoistureData } from './util';

// Define the structure of a single sub-path as an array of numbers
type SubPath = number[];

// Define a path as an array containing two sub-paths
type Path = [SubPath, SubPath, SubPath, SubPath];

// Define the structure for testPath, which is an array of paths
type TestPath = Path[];

export type ChartSettings = {
  mode: number;
  updateRequired: boolean;
};

export const ChartDisplayMode = {
  RAW: 0,
  AVERAGE: 1,
};

export type Chart = any;

// The charts ending with "Map" are those used on the geo.tsx page.
export type Charts = {
  shearChart: Chart | null;
  moistChart: Chart | null;
  shearMoistChart: Chart | null;
  shearChartMap: Chart | null;
  moistChartMap: Chart | null;
  shearMoistChartMap: Chart | null;
  positionChart: Chart | null;
  positionChartMap: Chart | null;
} | null;

export type INITIAL_HUMAN_BELIEF = {
  human_belief_selected_option: number;
  human_belief_text_description: string;
};

export type PATH_DATA_TYPE= {
  lineData:{
    start_coordinate:[],
    end_coordinate:[]
  },
  scatter_plot_data:{
    x:number[],
    y:number[],
    moisture:number[],
    shear:number[]
  },
  selected_path_data:[[],[],[],[]]
}

export interface IState {
  // new states by me
  input_box_step_btn_click: number;
  initial_human_belief: INITIAL_HUMAN_BELIEF;
  threePaths:TestPath;
  path_full_data:PATH_DATA_TYPE;
  uncertanity_heat_map_data:number[][];
  

  // old states by me
  newpathvalues: TestPath;
  selectedpathsubmittime: [number, number]; // contains how many time user have selected the path & between 0 A, 1 B, 2C which part did user selectd

  // Data fields
  dataVersion: DataVersion; // will be in final output after survey is completed
  fullData: number[][];
  moistureData: number[][];
  userStrengthData: number[];
  userLocationData: number[];
  // Step fields
  currSampleIdx: number;
  samples: Sample[]; // will be in final output after survey is completed
  currUserStep: CurrUserStepData;
  userSteps: UserStepsData[]; // will be in final output after survey is completed
  // Hypothesis fields
  initialHypo: number; // will be in final output after survey is completed
  initialobjectivePattern: number;
  finalHypo: number; // will be in final output after survey is completed
  // Chart fields
  chart: Charts;
  chartSettings: ChartSettings;
  // Miscellaneous fields
  transectIdx: number; // single transect version (setting transect index to 0 by default)
  loadingRobotSuggestions: boolean;
  showRobotSuggestions: boolean;
  lastHoverIdx: number;
  dialogProps: DialogProps | null;
  disableSubmitButton: boolean;
  numSubmitClicks: number;
  imgClickEnabled: boolean;
  numImgClicks: number; // controls when the global state's "rows" get loaded into the actual strategy and populated in the charts
  showNOMInput: boolean;
  introCompleted: boolean;
  submitted: boolean;
}

// Default initial state
export const initialState: IState = {
  // new state by be

  input_box_step_btn_click: 0,
  initial_human_belief: {
    human_belief_selected_option: 0,
    human_belief_text_description: '',
  },
  threePaths:[],
  path_full_data:{
    lineData:{
      start_coordinate:[],
      end_coordinate:[]
    },
    scatter_plot_data:{
      x:[],
      y:[],
      moisture:[],
      shear:[]
    },
    selected_path_data:[[],[],[],[]]
  },
  uncertanity_heat_map_data:[],


  // old state by me
  newpathvalues: [],
  selectedpathsubmittime: [0, 999],

  dataVersion: {
    local: 0, // load alternative hypothesis 0 or 1 randomly for shear data
  },
  fullData: [],
  moistureData: [],
  userLocationData: [],
  userStrengthData: [],
  currSampleIdx: 0,
  samples: [],
  currUserStep: {
    step: 1,
    userFeedbackState: 0,
    objectives: [],
    objectiveFreeResponse: '',
    sampleType: null,
    robotSuggestions: [],
    spatialReward: [],
    variableReward: [],
    discrepancyReward: [],
    acceptOrRejectOptions: [],
    acceptOrReject: -1,
    acceptOrRejectFreeResponse: '',
    rejectReasonOptions: [],
    rejectReason: -1,
    rejectReasonFreeResponse: '',
    userFreeSelection: false,
    userSample: null,
    hypoConfidence: 0,
    transition: 0,
  },
  userSteps: [],
  initialHypo: 0,
  initialobjectivePattern: 0,
  finalHypo: 0,
  chart: null,
  chartSettings: {
    mode: 0,
    updateRequired: false,
  },
  transectIdx: 0,
  loadingRobotSuggestions: false,
  showRobotSuggestions: false,
  lastHoverIdx: -1,
  dialogProps: null,
  disableSubmitButton: true,
  numSubmitClicks: 0,
  imgClickEnabled: true,
  numImgClicks: 0,
  showNOMInput: false,
  introCompleted: false,
  submitted: false,
};

export type IAction = { type: any; value?: any };
export enum Action {
  // NEW ACTIONS BY ME
  UPDATE_INPUT_BOX_BTN_CLICK,
  UPDATE_INITIAL_HUMAN_BELIEF,
  GENERATE_THREE_PATHS,
  GENERATE_PATH_FULL_DATA,
  GATHER_UNCERTANITY,


  INCREMENT_STEP_IDX,
  SET_STATE, // For loading previous runs; sets the entire state object.
  SET_DATA_VERSION,
  SET_FULL_DATA,
  SET_MOISTURE_DATA,
  SET_USER_STRENGTH_DATA,
  SET_USER_LOCATION_DATA,
  SET_CURR_SAMPLE_IDX,
  SET_SAMPLES,
  ADD_SAMPLE,
  DELETE_SAMPLE,
  SET_CURR_USER_STEP,
  SET_USER_STEPS,
  ADD_USER_STEP,
  /** START - Actions to update the current user step data */
  SET_USER_STEP_IDX,
  SET_USER_FEEDBACK_STATE,
  SET_OBJECTIVES,
  SET_OBJECTIVES_FREE_RESPONSE,
  SET_SAMPLE_TYPE,
  SET_LOADING_ROBOT_SUGGESTIONS,
  SET_SHOW_ROBOT_SUGGESTIONS,
  SET_ROBOT_SUGGESTIONS,
  SET_SPATIAL_REWARD,
  SET_VARIABLE_REWARD,
  SET_DISCREPANCY_REWARD,
  SET_ACCEPT_OR_REJECT_OPTIONS,
  SET_ACCEPT_OR_REJECT,
  SET_ACCEPT_OR_REJECT_FREE_RESPONSE,
  SET_REJECT_REASON_OPTIONS,
  SET_REJECT_REASON,
  SET_REJECT_REASON_FREE_RESPONSE,
  SET_USER_FREE_SELECTION,
  SET_USER_SAMPLE,
  SET_HYPO_CONFIDENCE,
  SET_TRANSITION,
  SET_DISABLE_SUBMIT_BUTTON,
  SET_NUM_SUBMIT_CLICKS,
  /** FINISH */
  SET_INIT_HYPO_CONFIDENCE,
  SET_OBJECTIVE_PATTERN,
  SET_FINAL_HYPO_CONFIDENCE,
  SET_CHART,
  SET_CHART_SETTINGS,
  CLEAR_CHART_CURRENT,
  SET_DIALOG_PROPS, // Set content for global dialog
  SET_IMG_CLICK_ENABLED,
  SET_NUM_IMG_CLICKS,
  SET_HOVER, // A table row/figure pos/plot data is hovered
  SET_SHOW_NOM_INPUT,
  SET_INTRO_STATUS, // Executed when user completes the introduction agreements
  SET_SUBMITTED_STATUS, // Executed when user submits final responses
}

// For actions that simply replace the corresponding key in state,
// we register the action with the key here to simplify the code
type ActionKeyMap = {
  [key in keyof typeof Action]?: keyof IState;
};
const actionKeyMap: ActionKeyMap = {
  [Action.UPDATE_INITIAL_HUMAN_BELIEF]: 'initial_human_belief',
  [Action.UPDATE_INPUT_BOX_BTN_CLICK]: 'input_box_step_btn_click',
  [Action.GENERATE_THREE_PATHS]:'threePaths',
  [Action.GENERATE_PATH_FULL_DATA]:'path_full_data',
  [Action.GATHER_UNCERTANITY]:'uncertanity_heat_map_data',

  [Action.SET_DATA_VERSION]: 'dataVersion',
  [Action.SET_FULL_DATA]: 'fullData',
  [Action.SET_MOISTURE_DATA]: 'moistureData',
  [Action.SET_USER_LOCATION_DATA]: 'userLocationData',
  [Action.SET_USER_STRENGTH_DATA]: 'userStrengthData',
  [Action.SET_CURR_SAMPLE_IDX]: 'currSampleIdx',
  [Action.SET_SAMPLES]: 'samples',
  [Action.SET_CURR_USER_STEP]: 'currUserStep',
  [Action.SET_INIT_HYPO_CONFIDENCE]: 'initialHypo',
  [Action.SET_OBJECTIVE_PATTERN]: 'initialobjectivePattern',
  [Action.SET_FINAL_HYPO_CONFIDENCE]: 'finalHypo',
  [Action.SET_CHART]: 'chart',
  [Action.SET_CHART_SETTINGS]: 'chartSettings',
  [Action.SET_LOADING_ROBOT_SUGGESTIONS]: 'loadingRobotSuggestions',
  [Action.SET_SHOW_ROBOT_SUGGESTIONS]: 'showRobotSuggestions',
  [Action.SET_DIALOG_PROPS]: 'dialogProps',
  [Action.SET_DISABLE_SUBMIT_BUTTON]: 'disableSubmitButton',
  [Action.SET_NUM_SUBMIT_CLICKS]: 'numSubmitClicks',
  [Action.SET_IMG_CLICK_ENABLED]: 'imgClickEnabled',
  [Action.SET_NUM_IMG_CLICKS]: 'numImgClicks',
  [Action.SET_SHOW_NOM_INPUT]: 'showNOMInput',
  [Action.SET_INTRO_STATUS]: 'introCompleted',
  [Action.SET_SUBMITTED_STATUS]: 'submitted',
};

type SubReducer<T> = (
  subState: T,
  state: Readonly<IState>,
  action: IAction
) => T;

const sampleReducer: SubReducer<Sample[]> = (samples, state, action) => {
  switch (action.type) {
    case Action.ADD_SAMPLE: {
      samples.push(action.value);
      break;
    }
    case Action.DELETE_SAMPLE: {
      samples.splice(action.value, 1);
      break;
    }
    case Action.SET_HOVER: {
      const { lastHoverIdx } = state;
      const { isHovered } = action.value;
      if (lastHoverIdx >= 0 && lastHoverIdx < samples.length) {
        samples[lastHoverIdx].isHovered = false;
      }
      const index = action.value.index;
      if (isHovered && index < samples.length) {
        samples[index].isHovered = true;
      }
      break;
    }
    default: {
      break;
    }
  }
  return samples;
};

// For actions that simply replace the corresponding key in state.currUserStep,
// we register the action with the key here to simplify the code
type ActionKeyMapCurrUserStep = {
  [key in keyof typeof Action]?: keyof CurrUserStepData;
};
const actionKeyMapCurrUserStep: ActionKeyMapCurrUserStep = {
  [Action.SET_USER_STEP_IDX]: 'step',
  [Action.SET_USER_FEEDBACK_STATE]: 'userFeedbackState',
  [Action.SET_OBJECTIVES]: 'objectives',
  [Action.SET_OBJECTIVES_FREE_RESPONSE]: 'objectiveFreeResponse',

  [Action.SET_SAMPLE_TYPE]: 'sampleType',
  [Action.SET_ROBOT_SUGGESTIONS]: 'robotSuggestions',
  [Action.SET_SPATIAL_REWARD]: 'spatialReward',
  [Action.SET_VARIABLE_REWARD]: 'variableReward',
  [Action.SET_DISCREPANCY_REWARD]: 'discrepancyReward',
  [Action.SET_ACCEPT_OR_REJECT_OPTIONS]: 'acceptOrRejectOptions',
  [Action.SET_ACCEPT_OR_REJECT]: 'acceptOrReject',
  [Action.SET_ACCEPT_OR_REJECT_FREE_RESPONSE]: 'acceptOrRejectFreeResponse',
  [Action.SET_REJECT_REASON_OPTIONS]: 'rejectReasonOptions',
  [Action.SET_REJECT_REASON]: 'rejectReason',
  [Action.SET_REJECT_REASON_FREE_RESPONSE]: 'rejectReasonFreeResponse',
  [Action.SET_USER_FREE_SELECTION]: 'userFreeSelection',
  [Action.SET_USER_SAMPLE]: 'userSample',
  [Action.SET_HYPO_CONFIDENCE]: 'hypoConfidence',
  [Action.SET_TRANSITION]: 'transition',
};

const currUserStepReducer: SubReducer<CurrUserStepData> = (
  currUserStep,
  state,
  action
) => {
  if (action.type in actionKeyMapCurrUserStep) {
    return {
      ...currUserStep,
      [actionKeyMapCurrUserStep[action.type] as string]: action.value,
    };
  }
  return currUserStep;
};

const userStepReducer: SubReducer<UserStepsData[]> = (
  userSteps,
  state,
  action
) => {
  switch (action.type) {
    case Action.ADD_USER_STEP: {
      userSteps.push(action.value);
      break;
    }
  }
  return userSteps;
};

const chartReducer: SubReducer<Charts> = (chart, state, action) => {
  switch (action.type) {
    case Action.SET_CHART: {
      return action.value;
    }
    case Action.CLEAR_CHART_CURRENT: {
      if (!chart) return chart;
      Object.values(chart).forEach((c) => {
        c?.data.datasets.forEach((dataset) => {
          dataset.data.forEach((data) => (data.current = false));
        });
        c?.update();
      });
      return chart;
    }
    case Action.SET_HOVER: {
      if (!chart) return chart;
      const { isHovered, index } = action.value;
      const { lastHoverIdx } = state;
      const traversalFunc = (dataset) => {
        dataset.data.forEach((data) => {
          if (data.rowIndex === lastHoverIdx) {
            data.hover = false;
          }
          if (isHovered) {
            if (data.rowIndex === index) {
              data.hover = true;
            }
          }
        });
      };
      Object.values(chart).forEach((c) => {
        c?.data.datasets.forEach(traversalFunc);
        c?.update();
      });
      return chart;
    }
  }
  return chart;
};

const newpathreducer = (state: IState, action: IAction): IState => {
  // first array is x corrdinate
  // second is y cordinate
  // 3rd is information gain
  // 4th is discrepancy reward

  const firstPath: TestPath = [
    [
      [0, 0.012699544, 0.01377393, 0.0148343254, 0.148540198, 0.1889489748],
      [0, 0.01330707, 0.13732145, 0.14574513, 0.14924912, 0.1554568],
      [],
      [],
    ],
    [
      [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
      [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
      [],
      [],
    ],
    [
      [0, 0.012699544, 0.1339001, 0.14742749, 0.16707451, 0.1682743],
      [0, 0.01330707, 0.01474205, 0.1509101, 0.1752565, 0.1793485],
      [],
      [],
    ],
  ];

  const secondPath: TestPath = [
    [
      [0.17514517, 0.2377393, 0.348343254, 0.448540198, 0.4889489748],
      [0.1737063, 0.23732145, 0.34574513, 0.44924912, 0.5554568],
      [],
      [],
    ],
    [
      [0.17514517, 0.2142308, 0.21901995, 0.31727556, 0.517514517],
      [0.1737063, 0.31417771, 0.4161951, 0.516915733, 0.51737063],
      [],
      [],
    ],
    [
      [0.17514517, 0.31339001, 0.414742749, 0.516707451, 0.561682743],
      [0.1737063, 0.31474205, 0.41509101, 0.451752565, 0.51793485],
      [],
      [],
    ],
  ];

  const thirdPath: TestPath = [
    [
      [0.517514517, 0.59377393, 0.648343254, 0.748540198, 0.8889489748],
      [0.51737063, 0.63732145, 0.74574513, 0.84924912, 0.9554568],
      [],
      [],
    ],
    [
      [0.517514517, 0.6142308, 0.71501995, 0.81727556, 0.917514517],
      [0.51737063, 0.61417771, 0.7161951, 0.816915733, 0.91737063],
      [],
      [],
    ],
    [
      [0.517514517, 0.5671339001, 0.66714742749, 0.67716707451, 0.68871682743],
      [0.51737063, 0.5531474205, 0.5841509101, 0.68771752565, 0.69981793485],
      [],
      [],
    ],
  ];

  const fouthPath: TestPath = [
    [
      [0.68871682743, 0.6959377393, 0.6998343254, 0.7148540198, 0.72889489748],
      [
        0.69981793485, 0.716713732145, 0.7269514574513, 0.738314924912,
        0.7391554568,
      ],
      [],
      [],
    ],
    [
      [
        0.68871682743, 0.68896142308, 0.71671501995, 0.7281727556,
        0.73917514517,
      ],
      [
        0.69981793485, 0.713561417771, 0.7247161951, 0.735816915733,
        0.73691737063,
      ],
      [],
      [],
    ],
    [
      [
        0.68871682743, 0.71656713, 0.716714742, 0.72877716707451,
        0.73678871682743,
      ],
      [
        0.69981793485, 0.7146531474205, 0.717841509101, 0.728771752565,
        0.73639981793485,
      ],
      [],
      [],
    ],
  ];

  const fifthPath: TestPath = [
    [
      [
        0.72889489748, 0.8959377393, 0.8998343254, 0.97148540198,
        0.972889489748,
      ],
      [
        0.7391554568, 0.67916713732145, 0.587269514574513, 0.48738314924912,
        0.297391554568,
      ],
      [],
      [],
    ],
    [
      [
        0.72889489748, 0.76959377393, 0.86998343254, 0.97148540198,
        0.9972889489748,
      ],
      [
        0.7391554568, 0.67716713732145, 0.587269514574513, 0.290738314924912,
        0.29127391554568,
      ],
      [],
      [],
    ],
    [
      [
        0.72889489748, 0.816959377393, 0.936998343254, 0.967148540198,
        0.9872889489748,
      ],
      [
        0.7391554568, 0.892716713732145, 0.6937269514574513, 0.594738314924912,
        0.4957391554568,
      ],
      [],
      [],
    ],
  ];

  const firstPathSelected: TestPath = [
    [[], [], [], []],
    [
      [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
      [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
      [2, 3, 4, 5, 6],
      [6, 7, 8, 4, 1],
    ],
    [[], [], [], []],
  ];

  const secondPathSelected: TestPath = [
    [[], [], [], []],
    [
      [0.17514517, 0.2142308, 0.21901995, 0.31727556, 0.517514517],
      [0.1737063, 0.31417771, 0.4161951, 0.516915733, 0.51737063],
      [9, 8, 5, 4, 6],
      [6, 5, 6, 7, 1],
    ],
    [[], [], [], []],
  ];

  const thirdPathSelected: TestPath = [
    [[], [], [], []],
    [[], [], [], []],
    [
      [0.517514517, 0.5671339001, 0.66714742749, 0.67716707451, 0.68871682743],
      [0.51737063, 0.5531474205, 0.5841509101, 0.68771752565, 0.69981793485],
      [8, 6, 7, 2, 1],
      [7, 5, 8, 9, 2],
    ],
  ];

  const fourthPathSelected: TestPath = [
    [
      [0.68871682743, 0.6959377393, 0.6998343254, 0.7148540198, 0.72889489748],
      [
        0.69981793485, 0.716713732145, 0.7269514574513, 0.738314924912,
        0.7391554568,
      ],
      [3, 5, 7, 2, 1],
      [9, 8, 1, 2, 3],
    ],
    [[], [], [], []],
    [[], [], [], []],
  ];

  const fifthPathSelected: TestPath = [
    [[], [], [], []],
    [
      [
        0.72889489748, 0.76959377393, 0.86998343254, 0.97148540198,
        0.9972889489748,
      ],
      [
        0.7391554568, 0.67716713732145, 0.587269514574513, 0.290738314924912,
        0.29127391554568,
      ],
      [2, 3, 1, 2, 5],
      [1, 3, 4, 6, 8],
    ],
    [[], [], [], []],
  ];

  const { newpathvalues } = state;

  const a1 = firstPathSelected;
  const a1new = firstPathSelected.concat(secondPath);

  const a2 = a1.concat(secondPathSelected);
  const a2new = a2.concat(thirdPath);

  const a3 = a2.concat(thirdPathSelected);
  const a3new = a3.concat(fouthPath);

  const a4 = a3.concat(fourthPathSelected);
  const a4new = a4.concat(fifthPath);

  const a5 = a4.concat(fifthPathSelected);

  // const a5new=a5.concat()

  function generateRandomTestPath(cuurentpathindex, currentselectepath) {
    if (cuurentpathindex[0] === 0 && cuurentpathindex[1] === 0) {
      return a1new;
    } else if (cuurentpathindex[0] === 1) {
      return a2new;
    } else if (cuurentpathindex[0] === 2) {
      return a3new;
    } else if (cuurentpathindex[0] === 3) {
      return a4new;
    }
    return a5;
  }

  // function generateRandomTestPath(cuurentpathindex, currentselectepath) {
  //   let updatedPath = newpathvalues; // Clone the existing path

  //   if (newpathstep === 0) {
  //     updatedPath = updatedPath.concat(firstPath);
  //   }
  //   if (newpathstep === 1) {
  //     updatedPath[0][0] = [];
  //     updatedPath[0][1] = [];
  //     updatedPath[2][0] = [];
  //     updatedPath[2][1] = [];

  //     updatedPath = updatedPath.concat(secondPath);
  //   } else if (newpathstep === 2) {
  //     updatedPath[3][0] = [];
  //     updatedPath[3][1] = [];
  //     updatedPath[5][0] = [];
  //     updatedPath[5][1] = [];

  //     updatedPath = updatedPath.concat(thirdPath);
  //   } else if (newpathstep === 3) {
  //     updatedPath[6][0] = [];
  //     updatedPath[6][1] = [];
  //     updatedPath[7][0] = [];
  //     updatedPath[7][1] = [];

  //     updatedPath = updatedPath.concat(fouthPath);
  //   }

  //   return updatedPath;
  // }

  // you can send te index of path & keeping all the other paths zeros, send the path

  // this is for reference currently the params are not used, but static values are created but this is how the data should come from frontend/ or api to pass into this func
  const testPath = generateRandomTestPath(1, [
    [[], []],
    [[], []],
    [
      [0.561682743, 0.5671339001, 0.66714742749, 0.77716707451, 0.8871682743],
      [0.51793485, 0.6531474205, 0.7841509101, 0.8771752565, 0.9981793485],
      [6, 2, 3, 5, 6],
      [3, 4, 5, 6, 7],
    ],
  ]);

  const testdata = [
    [[], []],
    [[], []],
    [
      [0.561682743, 0.5671339001, 0.66714742749, 0.77716707451, 0.8871682743],
      [0.51793485, 0.6531474205, 0.7841509101, 0.8771752565, 0.9981793485],
      [6, 2, 3, 5, 6],
      [3, 6, 7, 3, 4],
    ],
  ];

  switch (action.type) {
    case Action.INCREMENT_STEP_IDX:
      const updatedPathValues = generateRandomTestPath(action?.value, testdata);
      return {
        ...state,
        newpathvalues: updatedPathValues,
      };
    // Handle other actions as before...
    default:
      return state;
    // Your existing logic to handle other actions...
  }
};

export const reducer = (state: IState, action: IAction): IState => {
  if (action.type === Action.SET_STATE) {
    return action.value as IState;
  } else if (action.type in actionKeyMap) {
    return { ...state, [actionKeyMap[action.type] as string]: action.value };
  }
  const updatedState = {
    ...state,
    currUserStep: currUserStepReducer(state.currUserStep, state, action),
    userSteps: userStepReducer(state.userSteps, state, action),
    samples: sampleReducer(state.samples, state, action),
    chart: chartReducer(state.chart, state, action),
    // Assuming newpathstep needs to be updated by newpathreducer; it's handled in the next line
  };

  return newpathreducer(updatedState, action);
};

type DispatchType = (v: IAction) => void;

type ReducerType = [IState, DispatchType];

const StateContext = createContext<ReducerType>({} as any);

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext) as ReducerType;
