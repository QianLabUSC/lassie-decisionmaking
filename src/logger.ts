import { Trace, TraceType } from './types';

export const traces : Trace[] = [];

export function logTrace(type: TraceType, info = '') {
  traces.push({ type, info, timestamp: Date.now() });
};