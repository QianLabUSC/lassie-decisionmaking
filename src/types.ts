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
  global: number
}

/** Interface for current user step */
export interface CurrUserStepData {
  step: number, 
  userFeedbackState: number, // controls which set of questions are being asked to the user during each step
  objectives: number[], // stores objective(s) for each data collection step
  objectivesRankings: number[], // stores priority ranking for each objective
  objectiveFreeResponse: string, // stores user's free response for the objective
  sampleType: 'robot' | 'user' | null,
  loadingRobotSuggestions: boolean,
  showRobotSuggestions: boolean,
  robotSuggestions : Sample[], // stores robot's suggested sample locations at each step
  acceptOrRejectOptions: string[],
  acceptOrReject: number, // stores which robot suggestion the user accepts (or if the user rejects) at each step
  rejectReasonOptions: string[],
  rejectReason: number,  // stores why the user rejected the robot's suggestion at each step
  rejectReasonFreeResponse: string, // stores user's free response for the reason for rejecting the robot's suggestion
  userFreeSelection: boolean
  userSample: Sample | null,
  objectiveAddressedRating: number, // stores user's rating for how well the latest sample addresses the current objective
  hypoConfidence : number // stores user's updated hypothesis confidence
  transition : number, // stores user's choice for the next data collection step
  disableSubmitButton: boolean,
}

/** Interface for the finalized user step details */
export interface UserStepsData {
  step: number, 
  objectives: string[], 
  objectivesRankings: number[], 
  objectiveFreeResponse: string | null, 
  sampleType: 'robot' | 'user' | null,
  robotSuggestions : PreSample[], 
  acceptOrReject: string | null, 
  rejectReason: string | null, 
  rejectReasonFreeResponse: string | null, 
  userFreeSample: Sample | null,
  hypoConfidence : string 
  transition : string
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
