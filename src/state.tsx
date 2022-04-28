import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { DialogProps, DataVersion, CurrUserStepData, UserStepsData, Sample, PreSample } from './types';
import { objectiveOptions } from './constants';
import { getShearData, getMoistureData } from './util';

export type ChartSettings = {
  mode: number,
  updateRequired: boolean
};

export const ChartDisplayMode = {
  RAW: 0,
  AVERAGE: 1
}

export type Chart = any;

// The charts ending with "Map" are those used on the geo.tsx page.
export type Charts = {
  shearChart : Chart | null,
  moistChart : Chart | null,
  shearMoistChart : Chart | null,
  shearChartMap : Chart | null,
  moistChartMap : Chart | null,
  shearMoistChartMap : Chart | null,
} | null;

export interface IState {
  // Data fields
  dataVersion: DataVersion, // will be in final output after survey is completed
  fullData: number[][],
  moistureData: number[][],
  // Step fields
  currSampleIdx: number,
  samples: Sample[] // will be in final output after survey is completed
  currUserStep: CurrUserStepData,
  userSteps: UserStepsData[], // will be in final output after survey is completed
  // Hypothesis fields
  initialHypo: number, // will be in final output after survey is completed
  finalHypo: number, // will be in final output after survey is completed
  // Chart fields
  chart: Charts,
  chartSettings: ChartSettings,
  // Miscellaneous fields
  transectIdx: number, // single transect version (setting transect index to 0 by default)
  loadingRobotSuggestions: boolean,
  showRobotSuggestions: boolean,
  lastHoverIdx: number,
  dialogProps: DialogProps | null,
  disableSubmitButton: boolean,
  numSubmitClicks: number,
  imgClickEnabled: boolean, 
  numImgClicks: number, // controls when the global state's "rows" get loaded into the actual strategy and populated in the charts
  showNOMInput: boolean,
  introCompleted: boolean,
  submitted: boolean
}

// Default initial state
export const initialState : IState = {
  dataVersion: {
    local: Math.round(Math.random()) + 1, // load alternative hypothesis 1 or 2 randomly for shear data
  },
  fullData: getShearData(),
  moistureData: getMoistureData(),
  currSampleIdx: 0,
  samples: [],
  currUserStep: {
    step: 1,
    userFeedbackState: 0,
    objectives: [],
    objectiveFreeResponse: "",
    sampleType: null,
    robotSuggestions: [],
    spatialReward: [],
    variableReward: [],
    discrepancyReward: [],
    acceptOrRejectOptions: [],
    acceptOrReject: -1,
    rejectReasonOptions: [],
    rejectReason: -1,
    rejectReasonFreeResponse: "",
    userFreeSelection: false,
    userSample: null,
    hypoConfidence: 0,
    transition: 0,
  },
  userSteps: [],
  initialHypo: 0,
  finalHypo: 0,
  chart: null,
  chartSettings: {
    mode: 0,
    updateRequired: false
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
  submitted: false
};

export type IAction = { type: any, value?: any }
export enum Action {
  SET_STATE, // For loading previous runs; sets the entire state object.  
  SET_DATA_VERSION,
  SET_FULL_DATA,
  SET_MOISTURE_DATA,
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
  SET_SUBMITTED_STATUS // Executed when user submits final responses
};

// For actions that simply replace the corresponding key in state,
// we register the action with the key here to simplify the code
type ActionKeyMap = {
  [key in keyof typeof Action]?: keyof IState
};
const actionKeyMap : ActionKeyMap = {
  [Action.SET_DATA_VERSION]: 'dataVersion',
  [Action.SET_FULL_DATA]: 'fullData',
  [Action.SET_MOISTURE_DATA]: 'moistureData',
  [Action.SET_CURR_SAMPLE_IDX]: 'currSampleIdx',
  [Action.SET_SAMPLES]: 'samples',
  [Action.SET_CURR_USER_STEP]: 'currUserStep',
  [Action.SET_INIT_HYPO_CONFIDENCE]: 'initialHypo',
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

type SubReducer<T> = (subState: T, state: Readonly<IState>, action: IAction) => T;

const sampleReducer : SubReducer<Sample[]> = (samples, state, action) => {
  switch(action.type) {
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
      if (lastHoverIdx >= 0 &&  lastHoverIdx < samples.length) {
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
  };
  return samples;
};

// For actions that simply replace the corresponding key in state.currUserStep,
// we register the action with the key here to simplify the code
type ActionKeyMapCurrUserStep = {
  [key in keyof typeof Action]?: keyof CurrUserStepData;
};
const actionKeyMapCurrUserStep : ActionKeyMapCurrUserStep = {
  [Action.SET_USER_STEP_IDX]: 'step',
  [Action.SET_USER_FEEDBACK_STATE]: 'userFeedbackState',
  [Action.SET_OBJECTIVES]: 'objectives',
  [Action.SET_OBJECTIVES_FREE_RESPONSE]: 'objectiveFreeResponse',
  [Action.SET_SAMPLE_TYPE]: 'sampleType',
  [Action.SET_ROBOT_SUGGESTIONS]: 'robotSuggestions',
  [Action.SET_SPATIAL_REWARD]:'spatialReward' ,
  [Action.SET_VARIABLE_REWARD]: 'variableReward',
  [Action.SET_DISCREPANCY_REWARD]: 'discrepancyReward',
  [Action.SET_ACCEPT_OR_REJECT_OPTIONS]: 'acceptOrRejectOptions',
  [Action.SET_ACCEPT_OR_REJECT]: 'acceptOrReject',
  [Action.SET_REJECT_REASON_OPTIONS]: 'rejectReasonOptions',
  [Action.SET_REJECT_REASON]: 'rejectReason',
  [Action.SET_REJECT_REASON_FREE_RESPONSE]: 'rejectReasonFreeResponse',
  [Action.SET_USER_FREE_SELECTION]: 'userFreeSelection',
  [Action.SET_USER_SAMPLE]: 'userSample',
  [Action.SET_HYPO_CONFIDENCE]: 'hypoConfidence',
  [Action.SET_TRANSITION]: 'transition',
};

const currUserStepReducer : SubReducer<CurrUserStepData> = (currUserStep, state, action) => {
  if (action.type in actionKeyMapCurrUserStep) {
    return { ...currUserStep, [actionKeyMapCurrUserStep[action.type] as string]: action.value };
  }
  return currUserStep;
};

const userStepReducer : SubReducer<UserStepsData[]> = (userSteps, state, action) => {
  switch (action.type) {
    case Action.ADD_USER_STEP: {
      userSteps.push(action.value);
      break;
    }
  }
  return userSteps;
};

const chartReducer : SubReducer<Charts> = (chart, state, action) => {
  switch (action.type) {
    case Action.SET_CHART: {
      return action.value;
    }
    case Action.CLEAR_CHART_CURRENT: {
      if (!chart) return chart;
      Object.values(chart).forEach(c => {
        c?.data.datasets.forEach(dataset => {
          dataset.data.forEach(data => data.current = false)
        });
        c?.update();
      })
      return chart;
    }
    case Action.SET_HOVER: {
      if (!chart) return chart;
      const { isHovered, index } = action.value;
      const { lastHoverIdx } = state;
      const traversalFunc = dataset => {
        dataset.data.forEach(data => {
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
      Object.values(chart).forEach(c => {
        c?.data.datasets.forEach(traversalFunc);
        c?.update();
      })
      return chart;
    }
  }
  return chart;
};

export const reducer = (state: IState, action: IAction) : IState => {
  if (action.type === Action.SET_STATE) {
    return action.value as IState;
  } else if (action.type in actionKeyMap) {
    return { ...state, [actionKeyMap[action.type] as string]: action.value };
  }
  return {
    ...state,
    currUserStep: currUserStepReducer(state.currUserStep, state, action),
    userSteps: userStepReducer(state.userSteps, state, action),
    samples: sampleReducer(state.samples, state, action),
    chart: chartReducer(state.chart, state, action),
  }
};

type DispatchType = ((v: IAction) => void);

type ReducerType = [IState, DispatchType];

const StateContext = createContext<ReducerType>({} as any);

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateValue = () => (useContext(StateContext) as ReducerType);
