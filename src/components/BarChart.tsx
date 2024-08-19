// import * as React from 'react';
// import { useEffect } from 'react';
// import { useStateValue, Action } from '../state';
// import { initializeExplanationChart, updateExplanationChart } from '../handlers/ExplanationChartHandler';

// const BarChart = () => {
//     const [globalState, dispatch] = useStateValue();
//     const { chartSettings } = globalState;

//     useEffect(() => {
//         initializeExplanationChart(globalState, dispatch);
//         updateExplanationChart(globalState, dispatch);
//     }, [chartSettings]);

//     return (
//         <div className="explanationChartContainer">
//             <canvas id="explanationChartCanvas" />
//         </div>
//     );
// }

// export default BarChart;