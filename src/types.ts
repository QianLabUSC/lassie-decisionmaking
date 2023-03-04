/** Type of traces */
export enum TraceType {
  /** Set type of the visualization */
  SET_DATA_VIS_TYPE = 'Set data visualization type',
  /** Enter a different page */
  ENTER_PAGE = 'Enter page'
}

/** Trace interface */
export interface Trace {
  /** Type of the trace */
  type: TraceType,
  /** Optional information about this trace */
  info: string,
  /** UTC timestamp in millisecond */
  timestamp: number
}

export type ResultRow = Omit<IRow, 'isHovered'>;

export enum DialogType {
  SIMPLE
}

export interface DialogProps {
  type: DialogType,
  text: string | string[],
  onOk: () => void,
  onClose?: () => void,
  onCancel?: () => void,
  title?: string,
  okText?: string,
  cancelText?: string  
}

/** Saved json data record */
export interface Record {
  /** Initial hypothesis */
  initialHypos: string[],
  /** Questions asked in conclusion page */
  concludeQuestions: any,
  /** Should be deprecated */
  isAlternativeHypo: boolean,
  /** Traces in during the whole survey */
  traces: Trace[],
  /** Post survey */
  form: any,
}

/** Interface for local and global data versions */
export interface DataVersion {
  local: number,
}

/** Interface for objectives */
export interface Objective {
  objective: string, // stores objective(s) for each data collection step
  ranking: number, // stores priority ranking for each objective
  addressedRating: number // stores user's rating for how well the latest sample addresses the current objective
}

/** Interface for current user step */
export interface CurrUserStepData {
  step: number, 
  userFeedbackState: number, // controls which set of questions are being asked to the user during each step
  objectives: Objective[], 
  objectiveFreeResponse: string, // stores user's free response for the objective
  sampleType: 'robot' | 'user' | null,
  robotSuggestions : Sample[], // stores robot's suggested sample locations at each step
  spatialReward: number[],
  variableReward: number[],
  discrepancyReward: number[],
  acceptOrRejectOptions: string[],
  acceptOrReject: number, // stores which robot suggestion the user accepts (or if the user rejects) at each step
  acceptOrRejectFreeResponse: string, // Impressions about suggested locations
  rejectReasonOptions: string[],
  rejectReason: number,  // stores why the user rejected the robot's suggestion at each step
  rejectReasons: number[], // stores why the user rejected the robot's suggestions at each step
  rejectReasonsOptions: string[], // stores user reject options
  rejectReasonFreeResponse: string, // stores user's free response for the reason for rejecting the robot's suggestion
  userFreeSelection: boolean
  userSample: Sample | null,
  hypoConfidence : number // stores user's updated hypothesis confidence
  transition : number, // stores user's choice for the next data collection step
}

/** Interface for the finalized user step details */
export interface UserStepsData {
  step: number, 
  objectives: Objective[], 
  objectiveFreeResponse: string | null, 
  sampleType: 'robot' | 'user' | null,
  robotSuggestions: PreSample[] | null, 
  acceptOrReject: string | null, 
  acceptedRobotSuggestion: Sample | null,
  acceptOrRejectFreeResponse: string | null,
  rejectReason: string | null, 
  rejectReasons: number[],
  rejectReasonsOptions: string[],
  rejectReasonFreeResponse: string | null, 
  userFreeSample: Sample | null,
  hypoConfidence : string 
  samples: Sample[],
  transition : string,
  spatialReward: number[],
  variableReward: number[],
  discrepancyReward: number[]
}

/** Interface for the samples collected */
export interface Sample {
  index: number, // In range [0, 21]
  type: 'initial' | 'robot' | 'user',
  measurements: number,
  normOffsetX: number,
  normOffsetY: number,
  isHovered: boolean,
  moisture: number[],
  shear: number[],

}

/** Interface for the samples collected */
export interface PreSample {
  index: number, // In range [0, 21]
  type: 'initial' | 'robot' | 'user',
  measurements: number,
  normOffsetX: number,
  normOffsetY: number,
  isHovered: boolean,
}
