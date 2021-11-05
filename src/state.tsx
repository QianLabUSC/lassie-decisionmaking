import * as React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { SampleState, TransectState, BATTERY_COST_PER_SAMPLE, defaultHypothesisResponse, RowType } from './constants';
import { Transect, DialogProps, InitialStrategyData, InitialStrategyTransect, InitialStrategySample, 
  ActualStrategyData, HypothesisResponse, DataVersion } from './types';
import { getShearData, getMoistureData, getGrainData } from './util';
import { debugInitialStrategy } from './strategyTemplates';

interface IStrategy {
  curTransectIdx: number,
  // In execution phase, the row that is going to be executed
  curRowIdx: number,
  lastHoverRowIdx: number,
  transectIndices: Transect[],
  // Each transect corresponds to an array of samples
  transectSamples: IRow[][],
}

export type ChartSettings = {
  mode: number,
  includedTransects: number[],
  excludedTransects: number[],
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
  grainChart : Chart | null,
  shearChartMap : Chart | null,
  moistChartMap : Chart | null,
  shearMoistChartMap : Chart | null,
  grainChartMap : Chart | null
} | null;

export interface IState {
  // Current state in sample level
  sampleState: SampleState,
  // Current state in trasect level
  transectState: TransectState,
  showNOMInput: boolean,
  roc: string[],
  concludeQuestions: any,
  chart: Charts,
  chartSettings: ChartSettings,
  imgClickEnabled: boolean, 
  mainEntered: boolean, // used for determining when the shear, moisture, and grain data gets loaded
  decisionEntered: boolean,
  showROC: boolean,
  isAlternativeHypo: boolean,
  fullData: number[][][],
  moistureData: number[][][],
  grainData: number[][][],
  dataVersion: DataVersion,
  showBattery: boolean,
  initialHypos: string[],
  initialGlobalHypos: string[],
  hypoConfidence: string[][],
  dialogProps: DialogProps | null,
  strategy: IStrategy,
  robotVersion: boolean, // if true, new version of website with robot suggested strategies will be used
  initialStrategyData: InitialStrategyData,
  actualStrategyData: ActualStrategyData,
  batteryLevel: number,
  lastActualBatteryLevel: number,
  batteryWarning: boolean,
  finalLocalHypothesis: HypothesisResponse,
  finalGlobalHypothesis: HypothesisResponse,
  introCompleted: boolean,
  submitted: boolean
}

// Default initial state
export const initialState : IState = {
  sampleState: SampleState.COLLECT_DATA,
  transectState: TransectState.INITIAL_STRATEGY,
  concludeQuestions: null,
  showNOMInput: false,
  isAlternativeHypo: false,
  imgClickEnabled: true,
  mainEntered: false,
  decisionEntered: false,
  showROC: false,
  showBattery: false,
  fullData: [],
  moistureData: [],
  grainData: [],
  dataVersion: {
    local: Math.round(Math.random()) + 1, // load alternative hypothesis 1 or 2 randomly for shear data
    global: 2 // load alternative hypothesis 2 for grain data
  },
  chart: null,
  chartSettings: {
    mode: 0,
    includedTransects: [],
    excludedTransects: [],
    updateRequired: false
  },
  initialHypos: [],
  initialGlobalHypos: [],
  hypoConfidence: [],
  roc: [],
  dialogProps: null,
  strategy: {
    curTransectIdx: 0,
    curRowIdx: 0,
    lastHoverRowIdx: -1,
    transectIndices: [], 
    transectSamples: [], // Same length as transectIndices
  },
  robotVersion: false,
  initialStrategyData: {
    transects: [],
    samples: [],
    localHypothesis: {...defaultHypothesisResponse},
    globalHypothesis: {...defaultHypothesisResponse},
  },
  actualStrategyData: {
    transects: []
  },
  batteryLevel: 0,
  lastActualBatteryLevel: 0,
  batteryWarning: false,
  finalLocalHypothesis: {...defaultHypothesisResponse},
  finalGlobalHypothesis: {...defaultHypothesisResponse},
  introCompleted: false,
  submitted: false
};

// Comprehensive debugging state
const useDebugInitialState = false; // Toggle this to set initial sample state for debugging
const debugInitialState : IState = {
  sampleState: SampleState.COLLECT_DATA,
  transectState: TransectState.INITIAL_STRATEGY,
  concludeQuestions: null,
  showNOMInput: false,
  isAlternativeHypo: false,
  imgClickEnabled: true,
  mainEntered: false,
  decisionEntered: false,
  showROC: false,
  showBattery: false,
  fullData: getShearData(1),
  moistureData: getMoistureData(),
  grainData: getGrainData(2),
  dataVersion: {
    local: 1,
    global: 2,
  },
  chart: null,
  chartSettings: {
    mode: 0,
    includedTransects: [],
    excludedTransects: [],
    updateRequired: true
  },
  initialHypos: [],
  initialGlobalHypos: [],
  hypoConfidence: [],
  roc: [],
  dialogProps: null,
  strategy: {
    curTransectIdx: debugInitialStrategy.transectIndices.length,
    curRowIdx: 0,
    lastHoverRowIdx: -1,
    transectIndices: debugInitialStrategy.transectIndices,
    transectSamples: debugInitialStrategy.transectSamples,
  },
  robotVersion: false,
  initialStrategyData: {
    transects: [],
    samples: [],
    localHypothesis: {...defaultHypothesisResponse},
    globalHypothesis: {...defaultHypothesisResponse},
  },
  actualStrategyData: {
    transects: []
  },
  batteryLevel: 0,
  lastActualBatteryLevel: 0,
  batteryWarning: false,
  finalLocalHypothesis: {...defaultHypothesisResponse},
  finalGlobalHypothesis: {...defaultHypothesisResponse},
  introCompleted: false,
  submitted: false
};

export enum Action {
  // For loading previous runs; sets the entire state object.
  SET_STATE,

  CHANGE_SAMPLE_STATE,
  CHANGE_TRANSECT_STATE,
  SHOW_NOM_INPUT, // NOM = "number of measurements"
  /** Row operations */
  ADD_ROW,
  DELETE_ROW, // Delete row from plan
  EDIT_ROW,
  DUPLICATE_ROW,
  UPDATE_ROW_TYPE,
  // To discard a specific row in a specific transect.
  // Value should be {transectIndex, rowIndex}.
  DISCARD_ROW,
  // When deviating and taking more measurements than the plan would allow,
  // remove samples from the end of the plan to make room.
  TRIM_SAMPLES_FROM_END, 

  SET_CUR_ROW_IDX,
  SET_CUR_TRANSECT_IDX,
  SET_LAST_HOVER_ROW_IDX,

  ADD_ROC,
  SET_CONCLUDE_QUESTIONS,
  SET_IS_ALTERNATIVE_HYPO,

  HOVER_DATA, // A table row/figure pos/plot data is hovered
  SET_CHART,
  SET_CHART_SETTINGS,
  CLEAR_CHART_CURRENT,
  IMG_CLICK_ENABLED,
  SET_MAIN_ENTERED,
  SET_DECISION_ENTERED,
  SET_SHOW_ROC,
  /** Transect opearations*/
  CHOOSE_TRANSECT,
  UPDATE_TRANSECT,
  DELETE_TRANSECT,

  SET_FULL_DATA,
  SET_MOISTURE_DATA,
  SET_GRAIN_DATA,
  SET_DATA_VERSION,
  SET_SHOW_BATTERY,
  SET_HYPO_CONFIDENCE, // Set confidence level for each hypothesis after each dune is visited
  SET_GLOBAL_HYPO_CONFIDENCE, // Set global confidence level for each hypothesis after each dune is visited
  SET_INITIAL_HYPOS, // Initial hypothesis local
  SET_INITIAL_GLOBAL_HYPOS, // Initial hypothesis global
  SET_DIALOG_PROPS, // Set content for global dialog

  // Actions for saving data
  SET_INITIAL_STRATEGY_TRANSECTS, // Expected value is the array transectIndices
  SET_INITIAL_STRATEGY_SAMPLES, // Expected value is the array transectSamples
  SET_ROBOT_VERSION,
  ADD_ACTUAL_STRATEGY_TRANSECT,
  ADD_ACTUAL_STRATEGY_SAMPLE, // Adds a sample object to the most recent transect
  SET_STRATEGY_TRANSECTS,
  SET_STRATEGY_SAMPLES,

  // Battery actions
  SET_BATTERY_LEVEL,
  SET_LAST_ACTUAL_BATTERY_LEVEL,
  SET_BATTERY_WARNING,

  // Hypothesis actions
  SET_INITIAL_LOCAL_HYPOTHESIS,
  SET_INITIAL_GLOBAL_HYPOTHESIS,
  ADD_LOCAL_HYPOTHESIS,
  ADD_GLOBAL_HYPOTHESIS,
  SET_FINAL_LOCAL_HYPOTHESIS,
  SET_FINAL_GLOBAL_HYPOTHESIS,

  // Executed when user completes the introduction agreements
  SET_INTRO_STATUS,

  // Executed when user submits final responses
  SET_SUBMITTED_STATUS,
};

/**
 * For the actions not in TypedActions, type of IAction would be the first one in IAction
 * Otherwise the type will be explicitly defined.
 * This helps to secure the types in reducer functions as well as other parts of the code.
 */
type TypedActions =
  | Action.SET_HYPO_CONFIDENCE
  | Action.SET_GLOBAL_HYPO_CONFIDENCE;

export type IAction = 
  | { type: Exclude<Action, TypedActions>, value?: any } // Default action
  | { type: Action.SET_HYPO_CONFIDENCE, value: { index: number, hypoConfidence: string[] } }
  | { type: Action.SET_GLOBAL_HYPO_CONFIDENCE, value: { index: number, globalHypoConfidence: string[] } };

type ActionKeyMap = {
  [key in keyof typeof Action]?: keyof IState
};

// For actions that simply replace the corresponding key in state,
// we register the action with the key here to simplify the code
const actionKeyMap : ActionKeyMap = {
  [Action.CHANGE_SAMPLE_STATE]: 'sampleState',
  [Action.CHANGE_TRANSECT_STATE]: 'transectState',
  [Action.SHOW_NOM_INPUT]: 'showNOMInput',
  [Action.SET_SHOW_ROC]: 'showROC',
  [Action.SET_MAIN_ENTERED]: 'mainEntered',
  [Action.SET_DECISION_ENTERED]: 'decisionEntered',
  [Action.IMG_CLICK_ENABLED]: 'imgClickEnabled',
  [Action.SET_CONCLUDE_QUESTIONS]: 'concludeQuestions',
  [Action.SET_IS_ALTERNATIVE_HYPO]: 'isAlternativeHypo',
  [Action.SET_FULL_DATA]: 'fullData',
  [Action.SET_MOISTURE_DATA]: 'moistureData',
  [Action.SET_GRAIN_DATA]: 'grainData',
  [Action.SET_DATA_VERSION]: 'dataVersion',
  [Action.SET_SHOW_BATTERY]: 'showBattery',
  [Action.SET_INITIAL_HYPOS]: 'initialHypos',
  [Action.SET_INITIAL_GLOBAL_HYPOS]: 'initialGlobalHypos',
  [Action.SET_DIALOG_PROPS]: 'dialogProps',
  [Action.SET_BATTERY_LEVEL]: 'batteryLevel',
  [Action.SET_LAST_ACTUAL_BATTERY_LEVEL]: 'lastActualBatteryLevel',
  [Action.SET_BATTERY_WARNING]: 'batteryWarning',
  [Action.SET_FINAL_LOCAL_HYPOTHESIS]: 'finalLocalHypothesis',
  [Action.SET_FINAL_GLOBAL_HYPOTHESIS]: 'finalGlobalHypothesis',
  [Action.SET_CHART_SETTINGS]: 'chartSettings',
  [Action.SET_ROBOT_VERSION]: 'robotVersion',
  [Action.SET_INTRO_STATUS]: 'introCompleted',
  [Action.SET_SUBMITTED_STATUS]: 'submitted',
};

type SubReducer<T> = (subState: T, state: Readonly<IState>, action: IAction) => T;

const transectReducer : SubReducer<Transect[]> = (transectIndices, state, action) => {
  switch(action.type) {
    case Action.SET_HYPO_CONFIDENCE: {
      const { index, hypoConfidence } = action.value;
      const newTransect : Transect = { ...transectIndices[index], hypoConfidence }
      return transectIndices.map((t, idx) => (idx === index ? newTransect : t));
    }
    case Action.SET_GLOBAL_HYPO_CONFIDENCE:
    {
      const { index, globalHypoConfidence } = action.value;
      const newTransect : Transect = { ...transectIndices[index], globalHypoConfidence }
      return transectIndices.map((t, idx) => (idx === index ? newTransect : t));
    }
    case Action.CHOOSE_TRANSECT: {
      return transectIndices.concat(action.value);
    }
    case Action.DELETE_TRANSECT: {
      const transects = [...transectIndices];
      for (const t of transects) {
        if (t.templateIdx === action.value) {
          t.templateIdx = -1;
        }
      }
      transects.splice(action.value, 1);
      return transects;
    }
    case Action.UPDATE_TRANSECT: {
      const transects = [...transectIndices];
      const { index, transect } = action.value;
      transects[index] = transect;
      return transects; 
    }
    case Action.TRIM_SAMPLES_FROM_END: {
      const { newSamples } = action.value;
      return transectIndices.slice(0, newSamples.length);
    }
    default: {
      return transectIndices;
    }
  }
};

const transectSampleReducer : SubReducer<IRow[][]> = (transectSamples, state, action) => {
  // Special treatment
  if (action.type === Action.DUPLICATE_ROW) {
    const { source, dest } = action.value;
    return transectSamples.map((row, idx) => {
      if (idx === dest) {
        const res : IRow[] = [];
        // Shallow copy
        for (const row of transectSamples[source]) {
          res.push(row);
        }
        return res;
      }
      return row;
    });
  }
  if (action.type === Action.CHOOSE_TRANSECT) {
    // Be careful when using arr.concat([])!
    const allSamples = [...transectSamples];
    allSamples.push([]);
    return allSamples;
  }
  if (action.type === Action.DELETE_TRANSECT) {
    const allSamples = [...transectSamples];
    allSamples.splice(action.value, 1);
    return allSamples;
  }
  if (action.type === Action.TRIM_SAMPLES_FROM_END) {
    const { newSamples } = action.value;
    return newSamples;
  }
  if (action.type === Action.DISCARD_ROW) {
    const {transectIndex, rowIndex} = action.value;
    const samples = [...transectSamples];
    samples[transectIndex][rowIndex].type = RowType.DISCARDED;
    return samples;
  }
  const curTransectIdx = state.strategy.curTransectIdx;
  let currentTransectSamples = transectSamples.length === 0 ? [] : [...transectSamples[curTransectIdx]];
  switch(action.type) {
    case Action.ADD_ROW: {
      currentTransectSamples.push(action.value);
      break;
    }
    case Action.EDIT_ROW: {
      const { index, row } = action.value;
      currentTransectSamples[index] = row;
      break;
    }
    case Action.UPDATE_ROW_TYPE: {
      const { index, type } = action.value;
      currentTransectSamples[index].type = type;
      break;
    }
    case Action.DELETE_ROW: {
      currentTransectSamples.splice(action.value, 1);
      break;
    }
    case Action.HOVER_DATA: {
      const { isHovered } = action.value;
      const { lastHoverRowIdx } = state.strategy;
      if (lastHoverRowIdx >= 0 &&  lastHoverRowIdx < currentTransectSamples.length) {
        currentTransectSamples[lastHoverRowIdx].isHovered = false;
      }
      const index = action.value.index;
      if (isHovered && index < currentTransectSamples.length) {
        currentTransectSamples[index].isHovered = true;
      }
      break;
    }
    default: {
      break;
    }
  };
  return transectSamples.map((samples, idx) => {
    if (idx === curTransectIdx) {
      return currentTransectSamples;
    }
    return samples;
  });
};

const lastHoverRowIdxReducer : SubReducer<number> = (lastHoverRowIdx, state, action) => {
  if (action.type === Action.SET_LAST_HOVER_ROW_IDX) {
    return action.value;
  }
  if (action.type === Action.HOVER_DATA) {
    const { isHovered } = action.value;
    return isHovered ? action.value.index : -1;
  }
};  

const strategyReducer : SubReducer<IStrategy> = (strategy, state, action) => {
  switch(action.type) {
    case Action.SET_CUR_ROW_IDX: {
      return { ...strategy, curRowIdx: action.value };
    }
    case Action.SET_CUR_TRANSECT_IDX: {
      return { ...strategy, curTransectIdx: action.value };
    }
  }
  return {
    ...strategy,
    lastHoverRowIdx: lastHoverRowIdxReducer(strategy.lastHoverRowIdx, state, action),
    transectIndices: transectReducer(strategy.transectIndices, state, action), 
    transectSamples: transectSampleReducer(strategy.transectSamples, state, action)
  };
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
    case Action.HOVER_DATA: {
      if (!chart) return chart;
      const { isHovered, index } = action.value;
      const { lastHoverRowIdx } = state.strategy;
      const traversalFunc = dataset => {
        dataset.data.forEach(data => {
          if (data.rowIndex === lastHoverRowIdx) {
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

const initialStrategyReducer: SubReducer<InitialStrategyData> = (data, state, action) => {
  switch (action.type) {
    case Action.SET_INITIAL_STRATEGY_TRANSECTS:
      const transects = action.value.map((t: Transect) => {
        return {
          number: t.number,
          templateNumber: t.templateNumber,
          templateIdx: t.templateIdx
        } as InitialStrategyTransect;
      });
      return {
        samples: data.samples,
        transects,
        localHypothesis: data.localHypothesis,
        globalHypothesis: data.globalHypothesis
      };
    case Action.SET_INITIAL_STRATEGY_SAMPLES:
      const samples = action.value.map((t: IRow[]) => {
        const rowSamples = t.map((s: IRow) => {
          return {
            index: s.index,
            measurements: s.measurements,
            type: s.type,
            normOffsetX: s.normOffsetX,
            normOffsetY: s.normOffsetY
          } as InitialStrategySample;
        });
        return rowSamples;
      });
      return {
        samples,
        transects: data.transects,
        localHypothesis: data.localHypothesis,
        globalHypothesis: data.globalHypothesis
      };
    case Action.SET_INITIAL_LOCAL_HYPOTHESIS:
      return {...data, localHypothesis: action.value};
    case Action.SET_INITIAL_GLOBAL_HYPOTHESIS:
      return {...data, globalHypothesis: action.value};
    default:
      return data;
  }
}

const actualStrategyReducer: SubReducer<ActualStrategyData> = (data, state, action) => {
  switch(action.type) {
    case Action.ADD_ACTUAL_STRATEGY_TRANSECT:
      return {transects: [...data.transects, action.value]};
    case Action.ADD_ACTUAL_STRATEGY_SAMPLE: {
      const t = data.transects;
      if (t.length === 0) {
        console.error(`ADD_ACTUAL_STRATEGY_SAMPLE data.transects was empty.`);
      } else {
        t[t.length - 1].samples = t[t.length - 1].samples.concat(action.value);
      }
      return {transects: t};
    }
    case Action.ADD_LOCAL_HYPOTHESIS: {
      const t = data.transects;
      t[t.length - 1].localHypotheses = action.value;
      return {transects: t};
    }
    case Action.ADD_GLOBAL_HYPOTHESIS: {
      const t = data.transects;
      t[t.length - 1].globalHypotheses = action.value;
      return {transects: t};
    }
    default: return data;
  }
}

export const reducer = (state: IState, action: IAction) : IState => {
  if (action.type === Action.SET_STATE) {
    return action.value as IState;
  } else if (action.type === Action.SET_STRATEGY_TRANSECTS) {
    return { ...state, strategy: { ...state.strategy, transectIndices: action.value } }
  } else if (action.type === Action.SET_STRATEGY_SAMPLES) {
    return { ...state, strategy: { ...state.strategy, transectSamples: action.value } }
  } else if (action.type in actionKeyMap) {
    return { ...state, [actionKeyMap[action.type] as string]: action.value };
  }
  switch (action.type) {
    case Action.ADD_ROC: {
      return {
        ...state,
        roc: state.roc.concat(action.value)
      };
    }
  }
  return {
    ...state,
    chart: chartReducer(state.chart, state, action),
    strategy: strategyReducer(state.strategy, state, action),
    initialStrategyData: initialStrategyReducer(state.initialStrategyData, state, action),
    actualStrategyData: actualStrategyReducer(state.actualStrategyData, state, action)
  }
};

type DispatchType = ((v: IAction) => void);

type ReducerType = [IState, DispatchType];

const StateContext = createContext<ReducerType>({} as any);

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, useDebugInitialState ? debugInitialState : initialState)}>
    {children}
  </StateContext.Provider>
);

export const useStateValue = () => (useContext(StateContext) as ReducerType);
