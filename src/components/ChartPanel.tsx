import * as React from 'react';
import { useEffect, useState } from 'react';
import ChartOptionsSummary from '../components/ChartOptionsSummary';
import { useStateValue, Action, ChartDisplayMode} from '../state';
import { initializeCharts, updateCharts } from '../handlers/ChartHandler';
import "../styles/chartPanel.scss";

type ChartPanelMode = "TransectView" | "ConclusionView";

const chartTabMap: {[key in ChartPanelMode]: string[]} = {
    "TransectView": ["Shear vs. Location"],
    "ConclusionView": ["Shear vs. Location"]
};
const chartClassMap: {[key in ChartPanelMode]: string[][]} = {
    "TransectView": [
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ],
    "ConclusionView": [
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ]
};

interface ChartPanelProps {
    mode: ChartPanelMode,
    fullSize?: boolean
}

export default function ChartPanel(props: ChartPanelProps) {
    const [globalState, dispatch] = useStateValue();
    const { chartSettings } = globalState;
    const [currentTab, setCurrentTab] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [displayOption, setDisplayOption] = useState(chartSettings.mode);

    if (chartSettings.updateRequired) {
        updateCharts(globalState, dispatch);
        dispatch({ type: Action.SET_CHART_SETTINGS, value: {mode: displayOption, updateRequired: false} });
    }

    useEffect(() => {
        initializeCharts(globalState, dispatch);
        updateCharts(globalState, dispatch);
    }, [chartSettings]);


    const onSaveClick = () => {
        setShowOptions(false);
        dispatch({ type: Action.SET_CHART_SETTINGS, value: {mode: displayOption, updateRequired: true} });
    }

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
                        className={`displayOption ${displayOption === ChartDisplayMode.RAW ? "displayOptionSelected" : ""}`}
                        onClick={() => setDisplayOption(ChartDisplayMode.RAW)}>
                        <h3>Raw</h3>
                        <p>
                            Show all of the data points for the given set of transects,
                            each sample having a separate point on the chart.
                        </p>
                    </div>
                    <div
                        className={`displayOption ${displayOption === ChartDisplayMode.AVERAGE ? "displayOptionSelected" : ""}`}
                        onClick={() => setDisplayOption(ChartDisplayMode.AVERAGE)}>
                        <h3>Averaged</h3>
                        <p>
                            Show the average value of all measurements at a given position
                            as a single point on the chart.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const chartIDSuffix = "";

    let tab = currentTab;
    if (tab >= chartClassMap[props.mode].length || tab < 0) {
        setCurrentTab(0);
        tab = 0;
    }

    return (
        <div className={`chartPanelContainer`}>
            <div className={`chartPanel ${props.fullSize ? "chartPanelFullSize" : ""}`}>
                { showOptions && optionsPanel }
                <div style={{height: "100%", display: showOptions ? "none" : "block"}}>
                    <div className="chartTabs">
                        {
                            chartTabMap[props.mode].map((text, i) => (
                                <div key={i} className={`chartTab ${tab === i && "chartTabSelected"}`} onClick={() => setCurrentTab(i)}>{ text }</div>
                            ))
                        }
                    </div>
                    <ChartOptionsSummary 
                        displayOption={displayOption}
                        onOptionsClick={() => setShowOptions(true)}/>
                    <div className="chartsArea">
                        <div className={chartClassMap[props.mode][tab][0]} id="shearMoistChartParent">
                            <canvas id={`shearMoistChart${chartIDSuffix}`} />
                        </div>
                        <div className={chartClassMap[props.mode][tab][1]} id="shearChartParent">
                            <canvas id={`shearChart${chartIDSuffix}`} />
                        </div>
                        <div className={chartClassMap[props.mode][tab][2]} id="moistChartParent">
                            <canvas id={`moistChart${chartIDSuffix}`} />
                        </div>
                        <div className={chartClassMap[props.mode][tab][3]} id="grainChartParent">
                            <canvas id={`grainChart${chartIDSuffix}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    );
    
}