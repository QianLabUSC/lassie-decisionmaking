import * as React from 'react';
import { useEffect, useState } from 'react';
import { transectColors, SampleState } from '../constants';
import ChartOptionsSummary from '../components/ChartOptionsSummary';
import { Transect, TransectType } from '../types';
import { useStateValue, Action, ChartDisplayMode} from '../state';
import { initializeCharts, updateCharts } from '../handlers/ChartHandler';
import "../styles/chartPanel.scss";

type ChartPanelMode = "TransectView" | "GlobalHypothesisView" | "FieldView" | "ConclusionView";

const chartTabMap: {[key in ChartPanelMode]: string[]} = {
    "TransectView": ["Shear Strength", "Moisture", "Shear vs. Moisture", "Grain Size"],
    "GlobalHypothesisView": ["Grain Size"],
    "FieldView": ["Shear Strength", "Moisture", "Shear vs. Moisture", "Grain Size"],
    "ConclusionView": ["Shear Strength", "Moisture", "Shear vs. Moisture", "Grain Size"]
};
const chartClassMap: {[key in ChartPanelMode]: string[][]} = {
    "TransectView": [
        ["chartFull", "chartHidden", "chartHidden", "chartHidden"],
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ],
    "GlobalHypothesisView": [
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ],
    "FieldView": [
        ["chartFull", "chartHidden", "chartHidden", "chartHidden"],
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ],
    "ConclusionView": [
        ["chartFull", "chartHidden", "chartHidden", "chartHidden"],
        ["chartHidden", "chartFull", "chartHidden", "chartHidden"],
        ["chartHidden", "chartHidden", "chartFull", "chartHidden"],
        ["chartHidden", "chartHidden", "chartHidden", "chartFull"]
    ]
};

const getTransectIDList = (transects: Transect[]) : number[] => {
    let ids = [] as number[];
    transects.forEach(t => {
        if (t.type !== TransectType.DISCARDED) {
            ids.push(t.number);
        }
    });
    return ids;
}

interface ChartPanelProps {
    mode: ChartPanelMode,
    fullSize?: boolean
}

export default function ChartPanel(props: ChartPanelProps) {
    const [globalState, dispatch] = useStateValue();
    const { strategy, chartSettings, sampleState } = globalState;
    const { curTransectIdx, transectIndices } = strategy;
    const [currentTab, setCurrentTab] = useState(0);
    const [showOptions, setShowOptions] = useState(false);
    const [displayOption, setDisplayOption] = useState(chartSettings.mode);

    const currentId = (transectIndices.length > 0 && curTransectIdx >= 0 && curTransectIdx < transectIndices.length) ?
        transectIndices[curTransectIdx].number : -1;
    const ids = getTransectIDList(transectIndices); // get the list of transect ids from the user's selected initial strategy
    const idsExcluded : number[] = [];
    // Initialize included and excluded transects for the charts. Since the includedTransects and excludedTransects chartSettings properties are empty 
    // lists at the beginning, initialize the default values to include all transects from the initial sampling strategy and exclude none of the transects
    const [includedTransects, setIncludedTransects] = 
        useState(chartSettings.includedTransects.length > 0 || chartSettings.excludedTransects.length > 0 ? [...chartSettings.includedTransects] : [...ids]);
    const [excludedTransects, setExcludedTransects] = 
        useState(chartSettings.includedTransects.length > 0 || chartSettings.excludedTransects.length > 0 ? [...chartSettings.excludedTransects] : [...idsExcluded]);

    if (chartSettings.updateRequired) {
        updateCharts(globalState, dispatch);
        dispatch({ type: Action.SET_CHART_SETTINGS, value: {mode: displayOption, includedTransects, excludedTransects, updateRequired: false} });
    }

    useEffect(() => {
        if ((ids.length > (includedTransects.length + excludedTransects.length) ||
                (!includedTransects.includes(currentId))
            ) && transectIndices.length > 0) {
            const currentID = transectIndices[curTransectIdx].number;
            let newSettings = {...chartSettings};
            newSettings.mode = 0;
            newSettings.includedTransects = [...chartSettings.includedTransects];
            if (sampleState < 3 && !newSettings.includedTransects.includes(currentID)) newSettings.includedTransects.push(currentID);
            newSettings.excludedTransects = [...ids.filter(id => !newSettings.includedTransects.includes(id))];
            // console.log('Ids length did not match settings. Updating to...');
            // console.log({newSettings});
            dispatch({ type: Action.SET_CHART_SETTINGS, value: {...newSettings} });
            setIncludedTransects(newSettings.includedTransects);
            setExcludedTransects(newSettings.excludedTransects);
        }
    }, []);

    useEffect(() => {
        initializeCharts(globalState, dispatch);
        updateCharts(globalState, dispatch);
    }, [chartSettings]);

    const legendItems = [] as any[];
    const maxTransectIdx = transectIndices.length === 0 ? -1 : curTransectIdx;

    for (let i = 0; i <= maxTransectIdx; i++) {
        const id = transectIndices[i].number;
        if (transectIndices[i].type !== TransectType.DISCARDED && chartSettings.includedTransects.includes(id)) {
            const label = (sampleState < 3 && i === curTransectIdx) ? 'Current' : id + 1;
            legendItems.push(
                <div className="chartLegendItem" key={i}>
                    <span className="legendLabel">{ label }</span>
                    <div className="legendCircle" style={{backgroundColor: transectColors[id]}}></div>
                </div>
            );
        }
    }

    const onSaveClick = () => {
        setShowOptions(false);
        dispatch({ type: Action.SET_CHART_SETTINGS, value: {mode: displayOption, includedTransects, excludedTransects, updateRequired: true} });
    }

    const onTransectEntryClick = (i, type) => {
        // If a transect is clicked in the "included" section, remove it from the included transects and add it to the excluded transects
        if (type === "included") {
            setIncludedTransects(includedTransects.filter(v => (v !== i)));
            setExcludedTransects(excludedTransects.concat(i).sort((a, b) => (a - b)));
        // If a transect is clicked in the "excluded" section, remove it from the excluded transects and add it to the included transects
        } else {
            setExcludedTransects(excludedTransects.filter(v => (v !== i)));
            setIncludedTransects(includedTransects.concat(i).sort((a, b) => (a - b)));
        }
    }

    // Only show valid IDs and non-discarded transects.
    const showTransectEntry = id => transectIndices.reduce((acc, t) => t.number === id ? t.type !== TransectType.DISCARDED : acc, false);

    const optionsPanel = (
        <div className="optionsPanel">
            <div className="titleSection">
                <h1>Chart Display Settings</h1>
                <button onClick={onSaveClick}>Save</button>
            </div>
            <div className="row">
                <div className="col">

                    <div className="subtitleSection">
                        <h3>Included Transects</h3>
                        <p>Measurements from these transects <b>will</b> be included in the charts.</p>
                    </div>

                    <div className="transectSelectSection">
                        {
                            /* 
                            - filter for only valid IDs and non-discarded transects
                            - sort the transect ID's (but list current ID first)
                            - map returns a clickable box for each transect. 
                            - The condition "sampleState < 3" means that collection at a transect has not yet been finalized 
                              or deviated (refer to the SampleState variable in constants.ts)
                            */
                            includedTransects
                                .filter(i => showTransectEntry(i))                                      
                                .sort((a, b) => (a === currentId ? -1 : b === currentId ? 1 : (a - b))) 
                                .map(i => {                                                             
                                const label = (sampleState < 3 && currentId === i) ? `Current Transect` : `Transect ${i + 1}`;
                                const onClick = () => { 
                                    if (sampleState < 3) {
                                        if (currentId !== i) onTransectEntryClick(i, "included");
                                    } else {
                                        onTransectEntryClick(i, "included");
                                    }
                                }
                                return (
                                    <div key={i} className="transectEntry transectEntryIncluded" onClick={onClick}>
                                        <div className="icon iconSelected"></div>
                                        <div className="label">{ label }</div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className="subtitleSection">
                        <h3>Excluded Transects</h3>
                        <p>Measurements from these transects <b>won't</b> be included in the charts.</p>
                    </div>

                    <div className="transectSelectSection">
                        {
                            excludedTransects.filter(i => showTransectEntry(i)).sort().map(i => (
                                <div key={i} className="transectEntry transectEntryExcluded" onClick={() => onTransectEntryClick(i, "excluded")}>
                                    <div className="icon iconUnselected"></div>
                                    <div className="label">Transect { i + 1 }</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
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

    const chartIDSuffix = props.mode === "FieldView" ? "" : "";

    let tab = currentTab;
    if (tab >= chartClassMap[props.mode].length || tab < 0) {
        setCurrentTab(0);
        tab = 0;
    }

    return (
        <div className={`chartPanelContainer ${props.mode === "FieldView" && "chartPanelContainerFullHeight"}`}>
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
                        includedTransects={includedTransects.filter(i => showTransectEntry(i))}
                        displayOption={displayOption}
                        onOptionsClick={() => setShowOptions(true)}/>
                    <div className="chartLegend">
                        { legendItems }
                    </div>
                    <div className="chartsArea">
                        <div className={chartClassMap[props.mode][tab][0]} id="shearChartParent">
                            <canvas id={`shearChart${chartIDSuffix}`} />
                        </div>
                        <div className={chartClassMap[props.mode][tab][1]} id="moistChartParent">
                            <canvas id={`moistChart${chartIDSuffix}`} />
                        </div>
                        <div className={chartClassMap[props.mode][tab][2]} id="shearMoistChartParent">
                            <canvas id={`shearMoistChart${chartIDSuffix}`} />
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