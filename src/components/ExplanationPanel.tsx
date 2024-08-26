import * as React from 'react';
import { useEffect, useState} from 'react';
import * as Chart from 'chart.js';
import { useStateValue, Action } from '../state';
import { initializeExplanationChart, updateExplanationChart } from '../handlers/ExplanationChartHandler';
import '../styles/explanationPanel.scss';
import { relative } from 'path';

//TODO: add in modes to switch between types of charts

export default function ExplanationChartPanel() {
  const [globalState, dispatch] = useStateValue();
  const { explanationChartSettings } = globalState;
  //const [currentTab, setCurrentTab] = useState(0);
  //const [showOptions, setShowOptions] = useState(false); //?????
  //const [displayOption, setDisplayOption] = useState(chartSettings.mode);

  if (explanationChartSettings.updateRequired) {
      console.log("updating chart");
      updateExplanationChart(globalState, dispatch);
      dispatch({ type: Action.SET_EXPLANATION_CHART_SETTINGS, value: {updateRequired: false} });
  }

  useEffect(() => {
      initializeExplanationChart(globalState, dispatch);
      updateExplanationChart(globalState, dispatch);
  }, [explanationChartSettings]);


  const onSaveClick = () => {
     // setShowOptions(false);
      dispatch({ type: Action.SET_EXPLANATION_CHART_SETTINGS, value: {updateRequired: true} });
  }


  const chartIDSuffix = "";

  // let tab = currentTab;
  // if (tab >= chartClassMap[props.mode].length || tab < 0) {
  //     setCurrentTab(0);
  //     tab = 0;
  // }
  //TODO: below, change display to "none" to see what that does

  return (
      <div className={`explanationPanelContainer`}>
          <div className={`explanationPanel`}>
              <div style={{height: "100%", display: "block"}}> 
                  {/* <div className="chartTabs">
                      {
                          chartTabMap[props.mode].map((text, i) => (
                              <div key={i} className={`chartTab ${tab === i && "chartTabSelected"}`} onClick={() => setCurrentTab(i)}>{ text }</div>
                          ))
                      }
                  </div> */}
                

                      <div className={"explanationParent"} id="explanationChartParent">
                          <canvas id={`explanationChart`} />
                      </div>

              </div>
          </div>
      </div>
  );

}
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