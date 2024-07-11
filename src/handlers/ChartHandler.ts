import { getMeasurements, mean } from '../util';
import { shearChartOption, moistChartOption, shearMoistChartOption, NORMALIZED_CREST_RANGE, INDEX_LENGTH, SCALAR_X_VAL,positionChartOption } from '../constants';
import { IState, Action, Charts, ChartDisplayMode } from '../state';
import * as Chart from 'chart.js';

export enum ChartLocation { Field, Transect }

export const updateCharts = (globalState: IState, dispatch: any) => {
  const { chartSettings, currSampleIdx, samples, transectIdx } = globalState;
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
  const pos = [] as any[];

  for (let rowIndex = 0; rowIndex < samples.length; rowIndex++) {
    const row = samples[rowIndex];
    const { index, moisture, shear } = row;

    // Create data for shear to moisture chart
    const shearMoisture : any[] = [];
    for (let i = 0; i < moisture.length; i++) {
      shearMoisture.push({shear: shear[i], moisture: moisture[i]});
    }

    // Map x value from just the section of the slope to [0, 1]
    // const xVal = SCALAR_X_VAL * (row.index) / INDEX_LENGTH;
    const xVal = row.index/INDEX_LENGTH;
    // const xVal = (row.normOffsetX - NORMALIZED_CREST_RANGE.min) / (NORMALIZED_CREST_RANGE.max - NORMALIZED_CREST_RANGE.min);
    const xPos = row.index / 22; // 22 indexes per transect

    // const xVal = (row.normOffsetX - NORMALIZED_CREST_RANGE.min) / (NORMALIZED_CREST_RANGE.max - NORMALIZED_CREST_RANGE.min);
    //const { shearValues, moistureValues, shearMoistureValues } = getMeasurements(globalState, transectIdx, index, measurements);
    const averageShearValue = mean(shear);
    const averageMoistureValue = mean(moisture);

    if (chartSettings.mode === ChartDisplayMode.RAW) {
      shear.forEach(value => pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), value, rowIndex, currSampleIdx, index));
      moisture.forEach(value => pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), value, rowIndex, currSampleIdx, index));
      shearMoisture.forEach(value => pushChartArrayValue(shearMoistureDataPoints, value.moisture, value.shear, rowIndex, currSampleIdx, index));
    } else if (chartSettings.mode === ChartDisplayMode.AVERAGE) {
      pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), averageShearValue, rowIndex, currSampleIdx,index);
      pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), averageMoistureValue, rowIndex, currSampleIdx, index);
      pushChartArrayValue(shearMoistureDataPoints, averageMoistureValue, averageShearValue, rowIndex, currSampleIdx, index);
    }
    pos.push({x:xVal, y:0, curRowIdx: rowIndex, rowIndex: rowIndex, index: index, hover: false})
  }
// loop through the shearDataPoints and make an exact copy except with the y value being 0
const positionDataPoints = shearDataPoints.map((point) => {
    return {x: point.x, y:0, curRowIdx: point.curRowIdx, rowIndex: point.rowIndex, index: point.index, hover: point.hover}
})
  

  if (chart.shearChart) {
    chart.shearChart.data.datasets[0].data = shearDataPoints;
    chart.moistChart.data.datasets[0].data = moistureDataPoints;
    chart.shearMoistChart.data.datasets[0].data = shearMoistureDataPoints;
  } else {
    //console.log("chart.shearChart undefined");
  }
  if (chart.positionChart){
    chart.positionChart.data.datasets[0].data= pos;
  } else {
    console.log("chart.positionChart undefined");
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

  const { chart } = globalState;
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
  const maxMoisture = apply(Math.max, moistureData) + 0.5;
  positionChartOption.options.scales.xAxes[0].ticks = { min: 0, max: 1, stepSize: 0.1 }; // CHART IMAGE X AXIS TICKS FOR DISTANCE
  positionChartOption.options.scales.yAxes[0].ticks = { min: 0, max: 2 };

  shearChartOption.options.scales.xAxes[0].ticks = { min: -0.02, max: 1 };
  shearChartOption.options.scales.yAxes[0].ticks = { min: -0.5, max: 25.5 };
  moistChartOption.options.scales.xAxes[0].ticks = { min: -0.1, max: 1.1 };
  moistChartOption.options.scales.yAxes[0].ticks = { min: minMoisture, max: maxMoisture };
  shearMoistChartOption.options.scales.xAxes[0].ticks = { min: minMoisture, max: maxMoisture };
  shearMoistChartOption.options.scales.yAxes[0].ticks = { min: minShear, max: maxShear };
  positionChartOption.options.scales.xAxes[0].ticks = { min: 0, max: 1, stepSize: 0.1 }; // CHART IMAGE X AXIS TICKS FOR DISTANCE
  positionChartOption.options.scales.yAxes[0].ticks = { min: 0, max: 2 };
  const onHoverFunc = (ev, activeElements) => {
    if (activeElements.length === 0) {
      dispatch({
        type: Action.SET_HOVER,
        value: { isHovered: false }
      });
      return;
    }
    const {_datasetIndex, _index, _chart} = activeElements[0];
    if (_datasetIndex === undefined || _index === undefined ) { return; }
    const rowIndex = _chart.data.datasets[_datasetIndex].data[_index].rowIndex;
    dispatch({
      type: Action.SET_HOVER,
      value: { index: rowIndex, isHovered: true }
    });
  };
  // shearChartOption.options.onHover = onHoverFunc;
  // moistChartOption.options.onHover = onHoverFunc;

  let shearChart: any, moistChart: any, shearMoistChart: any, 
      shearChartMap: any, moistChartMap: any, shearMoistChartMap: any, positionChart: any, positionChartMap: any;

  // Assume that if one chart is in DOM, the others also are.

if (document.getElementById('positionChart')) {
    const positionCtx = (document.getElementById('positionChart') as HTMLCanvasElement).getContext('2d');
    if (positionCtx) {
        positionChart = new Chart(positionCtx, positionChartOption as any);
    }
    }
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
    shearChart, moistChart, shearMoistChart, shearChartMap, moistChartMap, shearMoistChartMap, positionChart, positionChartMap
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

const pushChartArrayValue = (array: any[], x, y, rowIndex, curRowIdx, index) => {
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
    index
  });
}

// This function resets the chart canvases by removing and then recreating & reappending them to their parent divs.
// This function was added to resolve a bug where old chart data would sometimes flash back up when the mouse hovers over it.
// It is called in the "clearCharts" function above.
var resetCanvas = function(){
  document.getElementById('positionChart')?.remove();
  document.getElementById('shearChart')?.remove();
  document.getElementById('moistChart')?.remove();
  document.getElementById('shearMoistChart')?.remove();

  const canvasShear = document.createElement('canvas');
  canvasShear.id = 'shearChart';
  document.getElementById('shearChartParent')?.appendChild(canvasShear);

  const canvasMoist = document.createElement('canvas');
  canvasMoist.id = 'moistChart';
  document.getElementById('moistChartParent')?.appendChild(canvasMoist);

  const canvasShearMoist = document.createElement('canvas');
  canvasShearMoist.id = 'shearMoistChart';
  document.getElementById('shearMoistChartParent')?.appendChild(canvasShearMoist);

  const canvasPosition = document.createElement('canvas');
  canvasPosition.id='positionChart';
  document.getElementById('positionChartParent')?.appendChild(canvasPosition);
};

