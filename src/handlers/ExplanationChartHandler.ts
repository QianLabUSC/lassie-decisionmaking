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
