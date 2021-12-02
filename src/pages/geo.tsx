import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Paper } from '@material-ui/core';

import { MultiStepDialog, ConfirmDialog } from '../components/Dialogs';
import TransectTable from '../components/TransectTable';
import GeoMap from '../components/GeoMap';
import ClickableImage from '../components/ClickableImage';
import RowTable from '../components/RowTable';

import { Action, useStateValue } from '../state';
import { SampleState, TransectState, defaultHypothesisResponse, windPositionIndices, 
  DOMINANT_WIND_DIRECTION, initialViewState } from '../constants';
import { TransectType, Transect, TraceType, DataLayer, ActualStrategyTransect, HypothesisResponse } from '../types';
import { getBatteryCost, getMoistureData, getShearData } from '../util';
import { logTrace } from '../logger';
import { Typography } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import ChartPanel from '../components/ChartPanel';
import { initializeCharts, updateCharts } from '../handlers/ChartHandler';
import Battery from '../components/Battery';
import "../styles/geo.scss";

const arrowImage = require('../../assets/arrow.png');

const useStyle = makeStyles(theme => ({
  label: {
    position: 'absolute',
    zIndex: 998,
    left: 40,
    top: 40,
    '& p': {
      fontWeight: 600,
      fontFamily: theme.typography.fontFamily
    }
  },
  arrow: {
    transform: 'rotate(160deg) scale(2) translate(-65px, -10px)',
    transformOrigin: 'center left',
  },
  line: {
    width: 50,
    height: 2,
    backgroundColor: 'rgb(0, 0, 0)',
  },
  arrowUp: {
    width: 8,
    marginBottom: 1,
    transform: 'rotate(135deg)'
  },
  arrowDown: {
    width: 8,
    marginTop: 1,
    transform: 'rotate(45deg)'
  },
  panel: {
    '& p': {
      textAlign: 'center'
    }
  },
  globalHypoContainer: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: "#f3f3f3",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    padding: 20
  },
  chartPanelPopup: {
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "50%",
    height: "calc(100vh - 60px)",
    zIndex: 999
  },
  batteryPanel: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 999,
  },
  chartOptionsPanel: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    position: "fixed",
    top: 170,
    right: 20,
    zIndex: 999,
    height: 40,
    padding: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: "5vh",
    overflow: "auto",
    overflowX: "hidden",
  },
  tablePanel: {
    position: "fixed",
    top: 260,
    right: 20,
    zIndex: 999,
    padding: 10,
  },
  windDirectionPanel: {
    position: "fixed",
    top: 20,
    left: 20,
    zIndex: 999,
    width: 100,
    textAlign: "center",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    padding: 10,
    fontSize: 14,
    borderRadius: 4
  },
  //Styling for map reset button at the bottom right corner of screen
  mapResetButton: {
    position: "fixed",
    bottom: 40,
    right: 20,
    zIndex: 999,
    width: 100,
    textAlign: "center",
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "bold",
    backgroundColor: "#f3f3f3",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
  },
}));

export function Geo() {
  const classes = useStyle();
  const history = useHistory();
  const [globalState, dispatch] = useStateValue();
  const [mapRotation, setMapRotation] = useState(0);
  const { sampleState, transectState, strategy,  actualStrategyData, mainEntered, dataVersion } = globalState;
  const { transectIndices, curTransectIdx, transectSamples } = strategy;

  // Lifecycle hooks
  useEffect(() => {
    if (sampleState !== SampleState.COLLECT_DATA) {
      // Re-initialize the charts since the same IDs are used on the canvas elements.
      // TODO this might be redundant
      initializeCharts(globalState, dispatch);
      updateCharts(globalState, dispatch);
    }
    dispatch({ type: Action.SET_SHOW_BATTERY, value: true });
  }, []);

  // This useEffect should fix a bug on certain screens where the scrollbar flickers in and out
  useEffect(() => {
    document.body.className = 'geoPage'; // temporarily change the body class name upon entering the "/geo" page to eliminate the scrollbar
    return () => { document.body.className = ''; } // cleanup - reset the body class name after leaving the "/geo" page
  }, []);

  // Global hooks  
  const [tempTransectIdx, setTempTransectIdx] = useState(-1);
  const [choosePreviousDialogOpen, setChoosePreviousDialogOpen] = useState(false);
  const [dataLayer, setDataLayer] = useState(DataLayer.NONE);
  const [enableSelectTransect, setEnableSelectTransect] = useState(transectState === TransectState.INITIAL_STRATEGY);
  const [showUnableToAddTransect, setShowUnableToAddTransect] = useState(false);
  // Template choosing
  const [templateOverviewIdx, setTemplateOverviewIdx] = useState(-1);
  const [isChoosingTemplate, setIsChoosingTemplate] = useState(false);
  // Chart panel control
  const [chartPanelOpen, setChartPanelOpen] = useState(false);
  // Map state management
  const [viewState, setViewState] = useState(initialViewState); // hook for managing map view state 
  const [mapResetOpen, setMapResetOpen] = useState(false); // hook for resetting map view 

  // Load the shear, moisture, and grain data when the map page is first shown
  if (!mainEntered) {
    const isAlternativeHypo = Math.random() < 0.5;
    dispatch({
      type: Action.SET_IS_ALTERNATIVE_HYPO,
      value: isAlternativeHypo
    });
    dispatch({
      type: Action.SET_MAIN_ENTERED,
      value: true
    });

    // The shear, moisture, and grain datasets are loaded when the map page is loaded. Depending on
    // the user input (samples at various transects), functions in util.ts will pull the data points  
    // to populate the share, moisture, and grain charts.
    const shearData = getShearData();
    const moistureData = getMoistureData();  

    // console.log({shearData}); // for debugging
    // console.log({moistureData}); // for debugging
    // console.log({grainData}); // for debugging

    dispatch({
      type: Action.SET_MOISTURE_DATA,
      value: moistureData
    });
    dispatch({
      type: Action.SET_FULL_DATA,
      value: shearData
    });
  }

  const setDataLayerWithLog = (layerType: DataLayer) => {
    // Reverse mapping
    logTrace(TraceType.SET_DATA_VIS_TYPE, layerType as string);
    setDataLayer(layerType);
  };

  const onTransectClick = (transectId) => {
    if (!enableSelectTransect || transectId === -1) return;
    const index: number = transectId;
    if (isChoosingTemplate) {
      // Here tempTransectIdx is the actual transect from last step
      // index is the "index" for the transect
      let templateIndex = -1;
      // Look for the real index in transectIndices
      for (let i = 0; i < transectIndices.length; i++) {
        const t = transectIndices[i];
        if (t.number == index) {
          templateIndex = i;
        }
      }
      if (templateIndex == -1) {
        return;
      }
      onConfirmTransectClick(tempTransectIdx, templateIndex);
      return;
    }
    setTempTransectIdx(index);

    const revisitedTransect = transectIndices.reduce((acc, t) => acc || (t.number === index && t.type !== TransectType.DISCARDED), false);

    if (transectIndices.length > 0 && !revisitedTransect) {
      setChoosePreviousDialogOpen(true);
      setIsChoosingTemplate(true);
    } else {
      // Here we must explicitly pass in the values of transectIndex
      // because there is no view updates yet and the useState hooks will not be updated
      onConfirmTransectClick(index);
    }
  };

  const onTransectHover = (transectId) => {
    if (isChoosingTemplate || (sampleState !== SampleState.COLLECT_DATA && dataLayer === DataLayer.SAMPLE)) {
      if (transectId === -1) {
        setTemplateOverviewIdx(-1);
      } else {
        let templateIndex = -1;
        // Look for the real index in transectIndices
        for (let i = 0; i < transectIndices.length; i++) {
          const t = transectIndices[i];
          if (t.number == transectId) {
            templateIndex = i;
          }
        }
        if (templateIndex == -1) {
          return;
        }
        setTemplateOverviewIdx(templateIndex);
      }
    }
  };

  const onConfirmTransectClick = (clickedTransectIdx, templateIdx = -1) => {
    // Evaluate whether the next step is within battery limit
    const templateNumber = templateIdx === -1 ? -1 : transectIndices[templateIdx].number;
    const newTransect: Transect = {
      number: clickedTransectIdx,
      windIndex: windPositionIndices[clickedTransectIdx],
      type: transectState === TransectState.DEVIATED ? TransectType.DEVIATED : TransectType.NORMAL,
      templateIdx,
      templateNumber
    };
    const newSamples: IRow[] = templateIdx > -1 ? transectSamples[templateIdx] : [];
    const nextTransects = [...transectIndices, newTransect];
    const nextSamples = [...transectSamples, newSamples];

    const revisitedIndex = transectIndices.reduce((acc, t, i) => t.number === clickedTransectIdx ? i : acc, -1);
    const revisitedTransect = revisitedIndex > -1 && transectIndices[revisitedIndex].type !== TransectType.DISCARDED;
    
    if (getBatteryCost(nextTransects, nextSamples) >= 1) {
      setShowUnableToAddTransect(true);
      return;
    }

    if (revisitedTransect) {
      dispatch({
        type: Action.SET_CUR_TRANSECT_IDX,
        value: revisitedIndex
      });
      dispatch({
        type: Action.SET_CUR_ROW_IDX,
        value: transectSamples[revisitedIndex].length
      });
    } else {
      dispatch({
        type: Action.CHOOSE_TRANSECT,
        value: newTransect
      });
    }
    
    // Set template after choosing transect
    if (templateIdx >= 0) {
      dispatch({
        type: Action.DUPLICATE_ROW,
        value: {
          source: templateIdx,
          dest: curTransectIdx + (transectState === TransectState.DEVIATED ? 1 : 0)
        }
      });
    }
    setTempTransectIdx(-1);
    // If we deviate in transect state, we also set deviate in sample state
    if (transectState === TransectState.DEVIATED) {
      dispatch({
        type: Action.CHANGE_SAMPLE_STATE,
        value: SampleState.DEVIATED
      });
      if (!revisitedTransect) {
        dispatch({
          type: Action.SET_CUR_TRANSECT_IDX,
          value: curTransectIdx + 1
        });
        // Reset row idx
        dispatch({
          type: Action.SET_CUR_ROW_IDX,
          value: 0
        });
      }
      addActualStrategyTransect('deviated', clickedTransectIdx);

      
      history.push("/decision");
    } else {
      history.push("/strategy");
    }
  };

  const onFinalizeClick = () => {
    dispatch({
      type: Action.SET_CUR_TRANSECT_IDX,
      value: 0
    });
    dispatch({
      type: Action.SET_INITIAL_STRATEGY_TRANSECTS,
      value: transectIndices
    });
    dispatch({
      type: Action.SET_INITIAL_STRATEGY_SAMPLES,
      value: transectSamples
    });
    dispatch({
      type: Action.CHANGE_TRANSECT_STATE,
      value: TransectState.FEEDBACK
    });
    dispatch({
      type: Action.CHANGE_SAMPLE_STATE,
      value: SampleState.FEEDBACK
    });
  };

  const onConcludeClick = () => {
    //console.log({initialStrategyData, actualStrategyData, transectIndices}); // for debugging
    history.push('/conclusion');
  };

  const onGoToNextTransect = () => {
    dispatch({ type: Action.SET_CUR_ROW_IDX, value: 0 });
    dispatch({
      type: Action.CHANGE_SAMPLE_STATE,
      value: SampleState.FEEDBACK
    });
    if (curTransectIdx === 0 && actualStrategyData.transects.length === 0) {
      addActualStrategyTransect('planned', transectIndices[curTransectIdx].number);
    } else {
      const nextTransectIndex = curTransectIdx + 1;
      addActualStrategyTransect('planned', transectIndices[nextTransectIndex].number);
      dispatch({ type: Action.SET_CUR_TRANSECT_IDX, value: nextTransectIndex });
    }
    history.replace('/decision');
  };

  const addActualStrategyTransect = (type: 'planned' | 'deviated', id: number) => {
    const actualStrategyTransect: ActualStrategyTransect = {
      type: type,
      number: id,
      samples: [],
      localHypotheses: {...defaultHypothesisResponse},
      globalHypotheses: {...defaultHypothesisResponse}
    };
    dispatch({ type: Action.ADD_ACTUAL_STRATEGY_TRANSECT, value: actualStrategyTransect });
  }

  const deviateTransect = () => {
    dispatch({
      type: Action.CHANGE_TRANSECT_STATE,
      value: TransectState.DEVIATED
    });

    // For the already visited transects, discard any samples that were not taken.
    for (let transectIndex = 0; transectIndex <= curTransectIdx; transectIndex++) {
      // Find the index of the last row that has measurement data.
      let lastRow = 0;
      for (let row = 0; row < transectSamples[transectIndex].length; row++) {
        if (transectSamples[transectIndex][row].moisture) lastRow = row;
      }

      // Discard all rows after the last row with measurement data.
      for (let row = lastRow + 1; row < transectSamples[transectIndex].length; row++) {
        dispatch({
          type: Action.DISCARD_ROW,
          value: { transectIndex, rowIndex: row }
        });
      }
    }

    var deviateStartIdx = curTransectIdx + 1;
    if (actualStrategyData.transects.length === 0) {
      deviateStartIdx = deviateStartIdx - 1;
    }

    for (let i = deviateStartIdx; i < transectIndices.length; i++) {
      const newTransect = transectIndices[i];
      newTransect.type = TransectType.DISCARDED;
      dispatch({
        type: Action.UPDATE_TRANSECT,
        value: { index: i, transect: newTransect }
      });
    }
    // Move curTransect to the last
    dispatch({
      type: Action.SET_CUR_TRANSECT_IDX,
      value: transectIndices.length - 1
    });
    setEnableSelectTransect(false);
  };

  function Helper() {
    const onClick = () => {
      if (sampleState === SampleState.COLLECT_DATA) {
        setGeoHelpOpen(true);
      } else {
        setDataCollectionHelpOpen(true);
      }
    };
  
    return (
      <div style={{
        position: 'fixed',
        bottom: 40,
        left: 20,
        zIndex: 999
      }}>
        <HelpIcon
          id="helper"
          onClick={onClick}
          color="primary"
          fontSize="large"
        />
      </div>
    );
  }

  // Popup for displaying instructions for initial field day sampling strategy phase when the map page first loads
  const [geoHelpOpen, setGeoHelpOpen] = useState(transectIndices.length === 0);
  const helpDialog =
    <MultiStepDialog
      open={geoHelpOpen}
      setOpen={setGeoHelpOpen}
      title={"Step 1: Initial Sampling Strategy"}
      allowCancel={false}
      steps={[
        ["To begin, you will decide on an initial field day sampling strategy. After you finalize your strategy, it will be automatically executed by RHex, however, you may stop the robot and abandon your strategy anytime you wish."],
        [
          "Select the first transect you would like to visit on the map. You will use a diagram of a dune cross-section to select the location and number of measurements you wish to take along the transect.",
          "Continue to select transects in the order you wish to visit them. Be careful to select a strategy that optimizes your available battery life."
        ],
        [
          "CONTROLS:",
          "Select a transect \u279C Left click",
          "Pan around map \u279C Left click & drag",
          "Rotate map \u279C Right click & drag",
          "Zoom in/out \u279C Scroll",
        ]
      ]}
    />;

  // Popup for displaying instructions for strategy execution phase when the initial field day sampling strategy is complete
  const [dataCollectionHelpOpen, setDataCollectionHelpOpen] 
    = useState(sampleState === SampleState.FEEDBACK && actualStrategyData.transects.length === 0);
  
  // Apply UseEffect to immediately display the data collection popup when the sampleState is updated 
  useEffect(() => {
    setEnableSelectTransect(transectState === TransectState.INITIAL_STRATEGY);
    setDataCollectionHelpOpen(sampleState === SampleState.FEEDBACK && actualStrategyData.transects.length === 0);
  }, [sampleState]);
  
  const dataCollectionDialog =
    <MultiStepDialog
      open={dataCollectionHelpOpen}
      setOpen={setDataCollectionHelpOpen}
      title={"Step 2: Strategy Execution"}
      allowCancel={false}
      steps={[
        ["Congratulations! You have completed your initial field day sampling strategy and have now entered the strategy execution step, where RHex will collect samples based on the initial strategy you selected (sample by sample along each transect)."],
        ["\u2022 To begin collecting samples, click 'Go to Next Transect' to proceed to the first transect you selected for the initial field day sampling strategy.",
        "\u2022 After you start to collect samples, you'll be able to view the charts of your results by clicking 'Open' next to 'Charts of Collected Data.'",
        "\u2022 At any point, you may stop the robot and deviate from your initial strategy by clicking 'Deviate From Field Day Strategy.' This will enable you to change the transects you visit next.",
        "\u2022 At any point, you may also end your field day and make a conclusion about the hypothesis by clicking 'End Field Day.'"
        ]
      ]}
    />;

  const [deviateDialogOpen, setDeviateDialogOpen] = useState(false);
  const [deviateDialogIdx, setDeviateDialogIdx] = useState(0);

  const deviateSteps = [
    'Once you deviate, all remaining steps in your field strategy will disappear. Are you sure you want to deviate?',
    'To collect additional data, use the map to select a transect.'
  ];
  const isFirstStep = deviateDialogIdx === 0;
  const deviateDialog =
    <ConfirmDialog
      open={deviateDialogOpen}
      text={deviateSteps[deviateDialogIdx]}
      okText={isFirstStep ? 'Yes, deviate' : 'OK'}
      cancelText={isFirstStep ? 'Return to field strategy' : 'Cancel'}
      allowCancel={true}
      onOk={() => {
        if (isFirstStep) {
          deviateTransect();
          setDeviateDialogIdx(deviateDialogIdx + 1);
        } else {
          setDeviateDialogOpen(false);
        }
      }}
      onCancel={() => {
        setDeviateDialogOpen(false);
      }}
    />;

  const unableToAddTransectDialog =
    <ConfirmDialog
      open={showUnableToAddTransect}
      onOk={() => setShowUnableToAddTransect(false)}
      onCancel={() => setShowUnableToAddTransect(false)}
      allowCancel={true}
      text="You do not have enough battery life remaining."
    />

  const chooseTemplateHelper =
    <Paper style={{
      zIndex: 999,
      position: 'fixed',
      width: 850,
      height: 100,
      padding: 10,
      left: 'calc(50% - 425px)',
      bottom: 50,
      textAlign: 'center'
    }}>
      <Typography variant="body1" style={{ marginBottom: '20px' }}>
        To use a former data collection strategy as a template, hover over previously selected transects to view strategies and select. Otherwise create a new data collection strategy by sampling without a template, or select a new transect.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        style={{ marginLeft: '15px' }}
        onClick={() => {
          onConfirmTransectClick(tempTransectIdx);
          setIsChoosingTemplate(false);
        }}
      >
        Sample without a template
      </Button>
      <Button
        variant="contained"
        color="primary"
        style={{ marginLeft: '15px' }}
        onClick={() => { setIsChoosingTemplate(false); }}
      >
        Return to transect selection
      </Button>
    </Paper>;

  const templateOverview =
    <Paper style={{
      zIndex: 999,
      position: 'fixed',
      width: 520,
      padding: 10,
      left: 50,
      top: 100
    }}>
      <RowTable editable={false} rows={transectSamples[templateOverviewIdx]} />
      {/* <ClickableImage
        enabled={false}
        addDataFunc={() => { }}
        setPopOver={() => { }}
        width={500}
        transectIdx={templateOverviewIdx}
      /> */}
    </Paper>;

  const chartPanelPopup = (
    <div className={classes.chartPanelPopup}>
      <ChartPanel mode="FieldView"/>
    </div>
  );

  const openChartOptionsPanel = (
    <Paper className={classes.chartOptionsPanel}>
      <span style={{marginRight: 10}}>Charts of Collected Data</span>
      <Button
        variant="contained"
        color="primary"
        disabled={sampleState === SampleState.COLLECT_DATA || actualStrategyData.transects.length === 0}
        onClick={() => {
            setChartPanelOpen(!chartPanelOpen);
          }
        }
        style={{width: 80}}>
          { chartPanelOpen ? "Close" : "Open" }
      </Button>
    </Paper>
  );

  const batteryPanel = (
    <div className={classes.batteryPanel}>
       <Battery/>
    </div>
  );

  const tablePanel = (
    <Paper className={classes.tablePanel}>
      {
        sampleState === SampleState.COLLECT_DATA
          ?
          <div>
            <TransectTable />
            <Button
              variant="contained" color="primary"
              disabled={curTransectIdx === 0}
              onClick={onFinalizeClick}
              style={{marginTop: 10, width: "100%", maxHeight: "5vh"}}
            >
              Finalize field day strategy
            </Button>
          </div>
          :
          <div>
            <TransectTable />
            <p>
              <Button
                disabled={(curTransectIdx === transectIndices.length - 1 && actualStrategyData.transects.length > 0) || 
                  (transectState === TransectState.DEVIATED && actualStrategyData.transects.length === 0)}
                variant="contained" color="primary"
                onClick={onGoToNextTransect}
                style={{width: "100%", maxHeight: "5vh"}}
              >
                Go to next transect
              </Button>
            </p>
            <p>
              {
                transectState === TransectState.DEVIATED
                  ?
                  <Button
                    variant="contained"
                    disabled={enableSelectTransect}
                    color="primary"
                    style={{width: "100%", maxHeight: "5vh"}}
                    onClick={() => setEnableSelectTransect(true)}>
                    Select new transect
                  </Button>
                  :
                  <Button
                    variant="contained"
                    style={{width: "100%", maxHeight: "5vh"}}
                    color="secondary"
                    onClick={() => {
                      if (curTransectIdx === transectIndices.length - 1 && actualStrategyData.transects.length > 0) {
                        deviateTransect();
                      } else {
                        setDeviateDialogOpen(true)}
                      }
                    }>
                    Deviate from field day strategy
                  </Button>
              }
            </p>
            <p>
              <Button
                variant="contained"
                color="primary"
                onClick={onConcludeClick}
                style={{width: "100%", maxHeight: "5vh"}}>
                End field day
              </Button>
            </p>
          </div>
      }
    </Paper>
  );
  
  // Map reset button function
  const onMapResetClick = () => {
    setViewState(initialViewState);
  };

  return (
    <div>
      { helpDialog }
      { dataCollectionDialog }
      { deviateDialog }
      { unableToAddTransectDialog}
      { <Helper /> }
      { isChoosingTemplate && chooseTemplateHelper}
      { templateOverviewIdx != -1 && templateOverview}
      { chartPanelOpen && chartPanelPopup }
      { batteryPanel }
      { openChartOptionsPanel }
      { tablePanel }
      {
        !chartPanelOpen && (
          <div className={classes.windDirectionPanel}>
            <img width="50px" style={{transform: `rotate(${mapRotation - DOMINANT_WIND_DIRECTION}deg)`}} src={arrowImage}/>
            <div>
              Wind Direction
            </div>
          </div>
        )
      }
      {
        // Display the map reset button when the user has zoomed out or panned too far from the initial view
        !chartPanelOpen && mapResetOpen && (
          <div>
            <Button className={classes.mapResetButton} onClick={onMapResetClick} style={{ textTransform: 'none' }}>
              Reset Map
            </Button>
          </div>
        )
      }
      <GeoMap
        onTransectClick={onTransectClick}
        onTransectHover={onTransectHover}
        onMapRotation={setMapRotation}
        viewState={viewState}
        setViewState={setViewState}
        setMapResetOpen={setMapResetOpen}
      />
    </div>
  );
};