import * as React from "react";
import { useEffect, useState } from "react";
import ChartOptionsSummary from "../components/ChartOptionsSummary";
import { useStateValue, Action, ChartDisplayMode } from "../state";
import { initializeCharts, updateCharts } from "../handlers/ChartHandler";
import "../styles/chartPanel.scss";
import PositionIndicatorRhex from "./PositionIndicatorRhex";
type ChartPanelMode = "TransectView" | "ConclusionView";

const chartTabMap: { [key in ChartPanelMode]: string[] } = {
  TransectView: ["Strength vs. Location"],
  ConclusionView: ["Strength vs. Location"],
};
const chartClassMap: { [key in ChartPanelMode]: string[][] } = {
  TransectView: [
    ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
    ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
    ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
    ["chartHidden", "chartHidden", "chartHidden", "chartFull"],
  ],
  ConclusionView: [
    ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
    ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
    ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
    ["chartHidden", "chartHidden", "chartHidden", "chartFull"],
  ],
};

interface PositionChartProps {
  mode: ChartPanelMode;
  fullSize?: boolean;
}

export default function PositionChart() {
  // props: PositionChartProps
  const [globalState, dispatch] = useStateValue();
  const { chartSettings } = globalState;
  const [currentTab, setCurrentTab] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [displayOption, setDisplayOption] = useState(chartSettings.mode);

  if (chartSettings.updateRequired) {
    updateCharts(globalState, dispatch);
    dispatch({
      type: Action.SET_CHART_SETTINGS,
      value: { mode: displayOption, updateRequired: false },
    });
  }

  useEffect(() => {
    initializeCharts(globalState, dispatch);
    updateCharts(globalState, dispatch);
  }, [chartSettings]);

  const onSaveClick = () => {
    setShowOptions(false);
    dispatch({
      type: Action.SET_CHART_SETTINGS,
      value: { mode: displayOption, updateRequired: true },
    });
  };

  const optionsPanel = (
    <div className="optionsPanel">
      <div className="titleSection">
        <h1>Chart Display Settings</h1>
        <button onClick={onSaveClick}>Save</button>
      </div>
      <div className="row">
        <div className="col">
          <h3>Data Display Method</h3>
          <div
            className={`displayOption ${
              displayOption === ChartDisplayMode.RAW
                ? "displayOptionSelected"
                : ""
            }`}
            onClick={() => setDisplayOption(ChartDisplayMode.RAW)}
          >
            <h3>Raw</h3>
            <p>
              Show all of the data points for the given set of transects, each
              sample having a separate point on the chart.
            </p>
          </div>
          <div
            className={`displayOption ${
              displayOption === ChartDisplayMode.AVERAGE
                ? "displayOptionSelected"
                : ""
            }`}
            onClick={() => setDisplayOption(ChartDisplayMode.AVERAGE)}
          >
            <h3>Averaged</h3>
            <p>
              Show the average value of all measurements at a given position as
              a single point on the chart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const chartIDSuffix = "";

  const tab = currentTab;

  return (
    <div className={`chartPanelContainer`}>
      <div className={`chartPanel chartPanelMin`}>
        {showOptions && optionsPanel}
        <div
          style={{ height: "100%", display: showOptions ? "none" : "block" }}
        >
          <div className="chartTabs">
            <div
              className={`chartTab chartTabSelected`}
              //   onClick={() => setCurrentTab(i)}
            >
              Visualizer
            </div>
          </div>

          {/* <ChartOptionsSummary
            displayOption={displayOption}
            onOptionsClick={() => setShowOptions(true)}
          /> */}
          {/* create an inline flex box */}
          <div className="chartArea">
            <div className="chartFull" id="positionChartParent">
              <canvas id={`positionChart${chartIDSuffix}`} />
            </div>
            <div className="labels">
              <div className="flagA">outside 0</div>
              <div className="flagB">center of ice 1</div>
            </div>
            {
            // <PositionIndicatorRhex
            //   left={
            //     (samples[samples.length - 1].index / INDEX_LENGTH) * (imgWidth - 1)
            //     // (NORMALIZED_FLAGATOB *
            //     //   (samples[samples.length - 1].index / INDEX_LENGTH) +
            //     //   NORMALIZED_STRAT) *
            //     // (height / NORMALIZED_HEIGHT)
            //   }
            //   top={height - height / 2 - 30}
            // />
          }

            {/* <span>Flag B</span> */}
          </div>
        </div>
      </div>
    </div>
  );
}