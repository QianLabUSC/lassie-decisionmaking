
export enum DataLayer {
  NONE = 'None',
  MOIST = 'Moisture',
  SHEAR = 'Shear',
  SAMPLE = 'Sample',
  GRAIN = "Grain"
};

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

export enum TransectType {
  NORMAL = 'Normal',
  DEVIATED = 'Deviated',
  DISCARDED = 'Discarded'
}

export interface Transect {
  /**
   * 'Index' of the transect,
   * The coordinates of the transects can be found in {@link startPoints} and {@link endPoints}
   */
  number: number,
  windIndex: number,
  templateNumber: number, // 'Index' of the template transect
  templateIdx: number, // Template index w.r.t other transects
  type: TransectType, // Type of the transect
  hypoConfidence?: string[] // Confidence levels for local hypotheses at the transects after the sampling
  globalHypoConfidence?: string[] // Confidence levels for global hypotheses at the transects after the sampling
}

export type ResultRow = Omit<IRow, 'isHovered'>;

export interface ResultTransect extends Transect {
  samples: ResultRow[]
}

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
  /** All the transects being sampled */
  transects: ResultTransect[]
}

// Types for saving the initial strategy
export interface InitialStrategyTransect {
  number: number,
  templateNumber: number,
  templateIdx: number
}
export interface InitialStrategySample {
    index: number, // In range [0, 21]
    measurements: number,
    type: string,
    normOffsetX: number,
    normOffsetY: number
}
export interface InitialStrategyData {
  transects: InitialStrategyTransect[],
  samples: InitialStrategySample[][],
  localHypothesis: HypothesisResponse,
  globalHypothesis: HypothesisResponse
}

// Types for saving the actual strategy
export interface ActualStrategySample {
  type: 'planned' | 'deviated',
  index: number, // In range [0, 21]
  measurements: number,
  normOffsetX: number,
  normOffsetY: number,
  moisture: number[],
  shear: number[],
  batteryLevelBefore: number,
  batteryWarningShown: boolean
}
export interface ActualStrategyTransect {
  type: 'planned' | 'deviated',
  number: number, // id of the transect being used
  samples: ActualStrategySample[],
  localHypotheses: HypothesisResponse,
  globalHypotheses: HypothesisResponse
}
export interface ActualStrategyData {
  transects: ActualStrategyTransect[]
}

// Types for saving hypothesis data
export interface HypothesisResponse {
  nullHypothesis: number,
  alternativeHypothesis1: number,
  alternativeHypothesis2: number
}

export interface InitialHypothesisData {
  localHypothesis: HypothesisResponse,
  globalHypothesis: HypothesisResponse
}

export interface DataVersion {
  local: number,
  global: number
}
