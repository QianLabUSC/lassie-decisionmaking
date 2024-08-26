import * as Chart from 'chart.js';
import { Action, IState, ExplanationChart } from '../state';
import { explanationChartOption } from '../constants';


export const updateExplanationChart = (globalState: IState, dispatch: any) => {
    const { explanationChartSettings, currUserStep } = globalState;
    const { variableReward, discrepancyReward, robotSuggestions} = currUserStep;

    let { explanationChart } = globalState;
  
    if (!explanationChart) return;
    
    clearExplanationChart(explanationChart);
    explanationChart = initializeExplanationChart(globalState, dispatch);
  
    if (explanationChart === null) {
      return;
    }
  
    // const shearDataPoints = [] as any[];
    // const moistureDataPoints = [] as any[];
    // const shearMoistureDataPoints = [] as any[];
  
    // for (let rowIndex = 0; rowIndex < samples.length; rowIndex++) {
    //   const row = samples[rowIndex];
    //   const { index, moisture, shear } = row;
  
    //   // Create data for shear to moisture chart
    //   let shearMoisture : any[] = [];
    //   for (let i = 0; i < moisture.length; i++) {
    //     shearMoisture.push({shear: shear[i], moisture: moisture[i]});
    //   }
  
    //   // Map x value from just the section of the slope to [0, 1]
    //   const xVal = (row.normOffsetX - NORMALIZED_CREST_RANGE.min) / (NORMALIZED_CREST_RANGE.max - NORMALIZED_CREST_RANGE.min);
    //   //const { shearValues, moistureValues, shearMoistureValues } = getMeasurements(globalState, transectIdx, index, measurements);
    //   const averageShearValue = mean(shear);
    //   const averageMoistureValue = mean(moisture);
  
    //   if (chartSettings.mode === ChartDisplayMode.RAW) {
    //     shear.forEach(value => pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), value, rowIndex, currSampleIdx, index));
    //     moisture.forEach(value => pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), value, rowIndex, currSampleIdx, index));
    //     shearMoisture.forEach(value => pushChartArrayValue(shearMoistureDataPoints, value.moisture, value.shear, rowIndex, currSampleIdx, index));
    //   } else if (chartSettings.mode === ChartDisplayMode.AVERAGE) {
    //     pushChartArrayValue(shearDataPoints, Math.min(xVal, 1), averageShearValue, rowIndex, currSampleIdx,index);
    //     pushChartArrayValue(moistureDataPoints, Math.min(xVal, 1), averageMoistureValue, rowIndex, currSampleIdx, index);
    //     pushChartArrayValue(shearMoistureDataPoints, averageMoistureValue, averageShearValue, rowIndex, currSampleIdx, index);
    //   }
    // }
    
  
    if (explanationChart) {
      explanationChart.data.datasets[0].data = variableReward;
     
    } else {
      //console.log("chart.shearChart undefined");
    }
  
    // if (chart.shearChartMap) {
    //   chart.shearChartMap.data.datasets[0].data = shearDataPoints;
    //   chart.moistChartMap.data.datasets[0].data = moistureDataPoints;
    //   chart.shearMoistChartMap.data.datasets[0].data = shearMoistureDataPoints;
    // } else {
    //   //console.log("chart.shearChartMap undefined");
    // }
  
    explanationChart.update();
  }


export const initializeExplanationChart = (globalState: IState, dispatch: any) : ExplanationChart => {

    let { explanationChart } = globalState;
    try {
      clearExplanationChart(explanationChart);
    } catch (e) {
      console.log(e);
    }
  
  
    const { currUserStep } = globalState;
    const { variableReward, discrepancyReward, robotSuggestions } = currUserStep;
    // const minReward = 0;
    // const maxReward = 1;
  
    // explanationChartOption.options.scales.xAxes[0].ticks = { min: 0, max: 21};
    // explanationChartOption.options.scales.yAxes[0].ticks = { min:0, max: 1 };

    // const onHoverFunc = (ev, activeElements) => {
    //   if (activeElements.length === 0) {
    //     dispatch({
    //       type: Action.SET_HOVER,
    //       value: { isHovered: false }
    //     });
    //     return;
    //   }
    //   const {_datasetIndex, _index, _chart} = activeElements[0];
    //   if (_datasetIndex === undefined || _index === undefined ) { return; }
    //   const rowIndex = _chart.data.datasets[_datasetIndex].data[_index].rowIndex;
    //   dispatch({
    //     type: Action.SET_HOVER,
    //     value: { index: rowIndex, isHovered: true }
    //   });
    // };

    // shearChartOption.options.onHover = onHoverFunc;
    // moistChartOption.options.onHover = onHoverFunc;
  
  
    // Assume that if one chart is in DOM, the others also are.
    if (document.getElementById('explanationChart')) {
      const explanationCtx = (document.getElementById('explanationChart') as HTMLCanvasElement).getContext('2d');
      
  
      if (explanationCtx) {
        explanationChart = new Chart(explanationCtx, explanationChartOption as any);

      }
    }
  
    // if (document.getElementById('shearChartMap')) {
    //   const shearMapCtx = (document.getElementById('shearChartMap') as HTMLCanvasElement).getContext('2d');
    //   const moistMapCtx = (document.getElementById('moistChartMap') as HTMLCanvasElement).getContext('2d');
    //   const shearMoistMapCtx = (document.getElementById('shearMoistChartMap') as HTMLCanvasElement).getContext('2d');
  
    //   if (shearMapCtx && moistMapCtx && shearMoistMapCtx) {
    //     shearChartMap = new Chart(shearMapCtx, shearChartOption as any);
    //     moistChartMap = new Chart(moistMapCtx, moistChartOption as any);
    //     shearMoistChartMap = new Chart(shearMoistMapCtx, shearMoistChartOption as any);
    //   }
    // }
  
    // const charts : Charts = {
    //   shearChart, moistChart, shearMoistChart, shearChartMap, moistChartMap, shearMoistChartMap
    // };
    dispatch({
      type: Action.SET_EXPLANATION_CHART,
      value: explanationChart
    });
    return explanationChart;
  }


export const clearExplanationChart = (chart) => {
    resetCanvas(); // reset the chart canvases
    if (!chart) return;
    chart.destroy();
    // Object.values(chart).forEach((c: any) => {
    //   if (!c) return; 
    //   c.destroy();
    // });
  }
  

var resetCanvas = function(){
    document.getElementById('explanationChart')?.remove();
    
  
    let explanationCanvas = document.createElement('canvas');
    explanationCanvas.id = 'explanationChart';
    document.getElementById('explanationChartParent')?.appendChild(explanationCanvas);
    //TODO: make sure to add everything under a parent div in ExplanationChart file with the right title
  };


// import * as Chart from 'chart.js';
// import { IState, Action, Charts } from '../state';
// import {clearCharts} from './ChartHandler';


// export const initializeExplanationChart = (globalState: IState, dispatch: any) : Charts => {
//     let { chart } = globalState;
//     try {
//         clearCharts(chart);
//     } catch (e) {
//         console.log(e);
//     }

//     // Assuming your chart data and configurations
//     const explanationChartOptions = {
//         type: 'bar',
//         data: {
//             labels: ['Label1', 'Label2', 'Label3', 'Label4'],
//             datasets: [{
//                 label: 'Example Data',
//                 data: [12, 19, 3, 5],
//                 backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                 borderColor: 'rgba(75, 192, 192, 1)',
//                 borderWidth: 1,
//             }]
//         },
//         options: {
//             scales: {
//                 x: { beginAtZero: true },
//                 y: { beginAtZero: true },
//             }
//         }
//     };

//     let explanationChart: any;

//     if (document.getElementById('explanationChartCanvas')) {
//         const ctx = (document.getElementById('explanationChartCanvas') as HTMLCanvasElement).getContext('2d');
//         if (ctx) {
//             explanationChart = new Chart(ctx, explanationChartOptions as any);
//         }
//     }

//     const charts : any = {
//         explanationChart
//     };
//     dispatch({
//         type: Action.SET_EXPLANATION_CHART,
//         value: charts
//     });
//     return charts;
// }

// export const updateExplanationChart = (globalState: IState, dispatch: any) => {
//     let { explanationChart } = globalState;

//     if (!explanationChart) return;

//     explanationChart.update();  
// }

// export const clearExplanationCharts = (chart) => {
//     if (!chart) return;
//     Object.values(chart).forEach((c: any) => {
//         if (!c) return; 
//         c.destroy();
//     });
// }
