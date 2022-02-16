import { getMeasurements, getNOMTaken, mean, randomInt } from '../util';
import { NORMALIZED_WIDTH, shearChartOption, moistChartOption, shearMoistChartOption, SampleState, NORMALIZED_CREST_RANGE } from '../constants';
import { IState, Action, Charts, ChartDisplayMode } from '../state';
import * as Chart from 'chart.js';
import { TransectType } from '../types';

export enum ChartLocation { Field, Transect }

export const updateCharts = (globalState: IState, dispatch: any) => {
  const { sampleState, chartSettings, fullData, moistureData, strategy } = globalState;
  const { curRowIdx, curTransectIdx, transectSamples, transectIndices } = strategy;
  const currentTransectID = curTransectIdx >= transectIndices.length ? -1 : transectIndices[curTransectIdx].number;
  let { chart } = globalState;

  if (!chart) return;
  
  clearCharts(chart);
  chart = initializeCharts(globalState, dispatch);

  if (chart === null) {
    return;
  }

  const shearDataPoints = [] as any[];
  const moistureDataPoints = [] as any[];
  const shearMoistureDataPoints = [] as any[];

  const maxTransectIndex = sampleState === SampleState.DEVIATED ? transectIndices.length - 1 : curTransectIdx;

  for (let transectIndex = 0; transectIndex <= maxTransectIndex; transectIndex++) {
    const maxRowIndex =
      sampleState === SampleState.FINISH_TRANSECT ? transectSamples[transectIndex].length - 1 :
      (sampleState !== SampleState.DEVIATED && transectIndex === curTransectIdx) ? (curRowIdx - 1) :
      transectSamples[transectIndex].length - 1;

    const id = transectIndices[transectIndex].number;
    if (sampleState < 3 && id !== currentTransectID && !chartSettings.includedTransects.includes(id)) continue;
    if (sampleState >= 3 && !chartSettings.includedTransects.includes(id)) continue;
    if (transectIndices[transectIndex].type === TransectType.DISCARDED) continue;
    const fromPreviousTransect = transectIndex !== curTransectIdx;
    const currentTransect = (sampleState < 2) && (transectIndex === curTransectIdx);
    
    for (let rowIndex = 0; rowIndex <= maxRowIndex; rowIndex++) {
      const row = transectSamples[transectIndex][rowIndex];
      if (row.type === 'Discarded') continue;

      const { index, measurements } = row;
      const rows = transectSamples[curTransectIdx] || [];
      // Map x value from just the section of the slope to [0, 1]
      const xVal = (row.normOffsetX - NORMALIZED_CREST_RANGE.min) / (NORMALIZED_CREST_RANGE.max - NORMALIZED_CREST_RANGE.min);
      const {shearValues, moistureValues, shearMoistureValues} = getMeasurements(globalState, transectIndices[transectIndex].number, index, measurements);
      const averageShearValue = mean(shearValues);
      const averageMoistureValue = mean(moistureValues);

      if (chartSettings.mode === ChartDisplayMode.RAW) {
        shearValues.forEach(value => pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), value, currentTransect, rowIndex, curRowIdx, id, index));
        moistureValues.forEach(value => pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), value, currentTransect, rowIndex, curRowIdx, id, index));
        shearMoistureValues.forEach(value => pushChartArrayValue(shearMoistureDataPoints, value.moistureValue, value.shearValue, currentTransect, rowIndex, curRowIdx, id, index));
      } else if (chartSettings.mode === ChartDisplayMode.AVERAGE) {
        pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), averageShearValue, currentTransect, rowIndex, curRowIdx, id, index);
        pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), averageMoistureValue, currentTransect, rowIndex, curRowIdx, id, index);
        pushChartArrayValue(shearMoistureDataPoints, averageMoistureValue, averageShearValue, currentTransect, rowIndex, curRowIdx, id, index);
      }
    }
  }

  if (chart.shearChart) {
    chart.shearChart.data.datasets[0].data = shearDataPoints;
    chart.moistChart.data.datasets[0].data = moistureDataPoints;
    chart.shearMoistChart.data.datasets[0].data = shearMoistureDataPoints;
  } else {
    //console.log("chart.shearChart undefined");
  }

  if (chart.shearChartMap) {
    chart.shearChartMap.data.datasets[0].data = shearDataPoints;
    chart.moistChartMap.data.datasets[0].data = moistureDataPoints;
    chart.shearMoistChartMap.data.datasets[0].data = shearMoistureDataPoints;
  } else {
    //console.log("chart.shearChartMap undefined");
  }

  Object.values(chart).forEach(c => c?.update());  
}

export const initializeCharts = (globalState: IState, dispatch: any) : Charts => {

  let { chart } = globalState;
  try {
    clearCharts(chart);
  } catch (e) {
    console.log(e);
  }

  // Recursively apply function to array
  const apply = (f, v) => Array.isArray(v) ? f(...v.map(vi => apply(f, vi))) : v;

  const { fullData, moistureData } = globalState;
  const minShear = apply(Math.min, fullData) - 0.5;
  const maxShear = apply(Math.max, fullData) + 0.5;
  const minMoisture = apply(Math.min, moistureData) - 0.5;
  const maxMoisture = apply(Math.max, moistureData) + 0.5

  shearChartOption.options.scales.xAxes[0].ticks = { min: -0.1, max: 1.1 };
  shearChartOption.options.scales.yAxes[0].ticks = { min: minShear, max: maxShear };
  moistChartOption.options.scales.xAxes[0].ticks = { min: -0.1, max: 1.1 };
  moistChartOption.options.scales.yAxes[0].ticks = { min: minMoisture, max: maxMoisture };
  shearMoistChartOption.options.scales.xAxes[0].ticks = { min: minMoisture, max: maxMoisture };
  shearMoistChartOption.options.scales.yAxes[0].ticks = { min: minShear, max: maxShear };

  const onHoverFunc = (ev, activeElements) => {
    if (activeElements.length === 0) {
      dispatch({
        type: Action.HOVER_DATA,
        value: { isHovered: false }
      });
      return;
    }
    const {_datasetIndex, _index, _chart} = activeElements[0];
    if (_datasetIndex === undefined || _index === undefined ) { return; }
    const rowIndex = _chart.data.datasets[_datasetIndex].data[_index].rowIndex;
    dispatch({
      type: Action.HOVER_DATA,
      value: { index: rowIndex, isHovered: true }
    });
  };
  // shearChartOption.options.onHover = onHoverFunc;
  // moistChartOption.options.onHover = onHoverFunc;

  let shearChart: any, moistChart: any, shearMoistChart: any, 
      shearChartMap: any, moistChartMap: any, shearMoistChartMap: any

  // Assume that if one chart is in DOM, the others also are.
  if (document.getElementById('shearChart')) {
    const shearCtx = (document.getElementById('shearChart') as HTMLCanvasElement).getContext('2d');
    const moistCtx = (document.getElementById('moistChart') as HTMLCanvasElement).getContext('2d');
    const shearMoistCtx = (document.getElementById('shearMoistChart') as HTMLCanvasElement).getContext('2d');

    if (shearCtx && moistCtx && shearMoistCtx) {
      shearChart = new Chart(shearCtx, shearChartOption as any);
      moistChart = new Chart(moistCtx, moistChartOption as any);
      shearMoistChart = new Chart(shearMoistCtx, shearMoistChartOption as any);
    }
  }

  if (document.getElementById('shearChartMap')) {
    const shearMapCtx = (document.getElementById('shearChartMap') as HTMLCanvasElement).getContext('2d');
    const moistMapCtx = (document.getElementById('moistChartMap') as HTMLCanvasElement).getContext('2d');
    const shearMoistMapCtx = (document.getElementById('shearMoistChartMap') as HTMLCanvasElement).getContext('2d');

    if (shearMapCtx && moistMapCtx && shearMoistMapCtx) {
      shearChartMap = new Chart(shearMapCtx, shearChartOption as any);
      moistChartMap = new Chart(moistMapCtx, moistChartOption as any);
      shearMoistChartMap = new Chart(shearMoistMapCtx, shearMoistChartOption as any);
    }
  }

  const charts : Charts = {
    shearChart, moistChart, shearMoistChart, shearChartMap, moistChartMap, shearMoistChartMap
  };
  dispatch({
    type: Action.SET_CHART,
    value: charts
  });
  return charts;
}

export const clearCharts = (chart) => {
  resetCanvas(); // reset the chart canvases
  if (!chart) return;
  Object.values(chart).forEach((c: any) => {
    if (!c) return; 
    c.destroy();
  });
}

const pushChartArrayValue = (array: any[], x, y, current, rowIndex, curRowIdx, id, index) => {
  if ((!x && isNaN(x)) || (!y && isNaN(y))) {
    console.log(`ChartHandler: not adding point (${x}, ${y})`);
    return;
  }
  array.push({
    x,
    y,
    rowIndex,
    curRowIdx,
    hover: false,
    current,
    fromPreviousTransect: false,
    id,
    index
  });
}

// This function resets the chart canvases by removing and then recreating & reappending them to their parent divs.
// This function was added to resolve a bug where old chart data would sometimes flash back up when the mouse hovers over it.
// It is called in the "clearCharts" function above.
var resetCanvas = function(){
  document.getElementById('shearChart')?.remove();
  document.getElementById('moistChart')?.remove();
  document.getElementById('shearMoistChart')?.remove();

  let canvasShear = document.createElement('canvas');
  canvasShear.id = 'shearChart';
  document.getElementById('shearChartParent')?.appendChild(canvasShear);

  let canvasMoist = document.createElement('canvas');
  canvasMoist.id = 'moistChart';
  document.getElementById('moistChartParent')?.appendChild(canvasMoist);

  let canvasShearMoist = document.createElement('canvas');
  canvasShearMoist.id = 'shearMoistChart';
  document.getElementById('shearMoistChartParent')?.appendChild(canvasShearMoist);
};

