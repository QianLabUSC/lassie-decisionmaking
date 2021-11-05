import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import HelpIcon from '@material-ui/icons/Help';
import Popbox from '../components/Popbox';
import RowTable from '../components/RowTable';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import { getMeasurements, getNOMTaken } from '../util';
import {
  SampleState, RowType, PopboxTypeEnum,
  DISABLE_ROC, confidenceTexts,
  NUM_OF_HYPOS,
  NORMALIZED_WIDTH,
  countdownDuration
} from '../constants';
import { useStateValue, Action } from '../state';
import { Typography } from '@material-ui/core';
import HypothesisPanel from '../components/HypothesisPanel';
import ChartPanel from '../components/ChartPanel';
import "../styles/decision.scss";
import { ActualStrategySample, HypothesisResponse } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import Battery from '../components/Battery';
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const p2 = require('../../assets/instruction-hypo.png');
const mapConclusionImage = require('../../assets/map_conclusion.png');

function ImgAlert({ open }) {
  return (
    <Popbox
      open={open}
      type={PopboxTypeEnum.ERROR}
      anchorEl={() => document.getElementById("pos-picker")}
    >
      Please click near the surface of stoss slope!   
    </Popbox>
  );
}

export default function Main() {
  const [showImgAlert, setImgAlert] = useState(false);
  const [globalState, dispatch] = useStateValue();

  const {
    sampleState, transectState, chart, imgClickEnabled,
    showROC, fullData, moistureData, grainData,
    strategy, decisionEntered, initialStrategyData, actualStrategyData,
    batteryLevel, batteryWarning, chartSettings, robotVersion
  } = globalState;
  const { curRowIdx, curTransectIdx, transectSamples, transectIndices } = strategy;
  const rows = transectSamples[curTransectIdx] || [];

  const [initialSampleState, setInitialSampleState] = useState(sampleState);
  // Stores state to show local, then global hypothesis response before leaving page.

  const setShowROC = (value: boolean) => {
    dispatch({ type: Action.SET_SHOW_ROC, value });
  };

  const setImgClickEnabled = (value: boolean) => {
    dispatch({ type: Action.IMG_CLICK_ENABLED, value });
  };

  const history = useHistory();

  // Initial page set up
  useEffect(() => {
    setImgClickEnabled(false);

    // Make sure charts are ready for decision page
    initializeCharts(globalState, dispatch);

    // Make the charts update on first render
    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });

    return () => {
      dispatch({
        type: Action.SET_DECISION_ENTERED,
        value: true
      });
    };
  }, []);

  // Function to add next sample to the data plot
  const addDataToPlot = (transectIdx: number, row : IRow, doNotAddToRow?: boolean, saveToActualStrategy?: boolean) => {
    const { index, measurements } = row;

    const offset = rows.length === 0 ? 0 : getNOMTaken(rows, index, curRowIdx);
    if (row.type === "Discarded") return;
    const xVal = row.normOffsetX / NORMALIZED_WIDTH;

    const {shearValues, moistureValues, grainValues} = getMeasurements(globalState, transectIndices[transectIdx].number, index, measurements);

    const newRow = { ...row };
    newRow.moisture = moistureValues;
    newRow.shear = shearValues;
    newRow.grain = grainValues;

    if (!doNotAddToRow) {
      // Add measurement values to row
      dispatch({ type: Action.EDIT_ROW, value: { index: curRowIdx, row: newRow }});
      dispatch({ type: Action.SET_CUR_ROW_IDX, value: curRowIdx + 1 });
      addActualStrategySample(
        sampleState === SampleState.DEVIATED ? 'deviated' : 'planned',
        newRow
      );
    } else if (saveToActualStrategy) {
      addActualStrategySample(
        sampleState === SampleState.DEVIATED ? 'deviated' : 'planned',
        newRow
      );
    }
    if (!DISABLE_ROC) {
      // Show rate of confidence after adding data
      setShowROC(true);
    }
    // Disable Click Image
    if (sampleState === SampleState.DEVIATED) { 
      setImgClickEnabled(false);
    }

    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });

    // updateCharts(globalState, dispatch);
  }

  const onContinueClick = () => {
    addDataToPlot(curTransectIdx, rows[curRowIdx]);
  };

  const [deviateAlertOpen, setDeviateAlertOpen] = useState(false);
  const [feedbackAlertOpen, setFeedbackAlertOpen] = useState(true);

  const changeToDeviate = () => {
    dispatch({
      type: Action.CHANGE_SAMPLE_STATE,
      value: SampleState.DEVIATED
    });
    // Discard all rows after current index
    for (let i = curRowIdx; i < rows.length; i++) {
      dispatch({
        type: Action.UPDATE_ROW_TYPE,
        value: { index: i, type: RowType.DISCARDED }
      });
    }
    dispatch({
      type: Action.SET_CUR_ROW_IDX,
      value: rows.length
    });
  };

  const onDeviateClick = () => {
    if (curRowIdx === transectSamples[curTransectIdx].length) {
      changeToDeviate();
    } else {
      setDeviateAlertOpen(true);
    }
  };

  const [roc, setROC] = useState('');

  const onROCChange = ev => {
    const val = ev.target.value;
    setROC(val);
  };

  const onROCConfirm = () => {
    dispatch({ type: Action.ADD_ROC, value: roc });
    setShowROC(false);
    setROC('');
  };
  
  const [hypoHelpOpen, setHypoHelpOpen] = useState(false);

  const ROCOptions =
    <Grid item xs={12} className={"conclude"}>
      <h2>
        How confident are you that this data supports the hypothesis?
        <HelpOutlineIcon id="hypothesisHelp"
          style={{
            verticalAlign: "text-top",
            marginTop: 2,
            cursor: "pointer",
            marginLeft: 10
          }}
          onClick={() => {
            setHypoHelpOpen(true);
          }}
        />
      </h2>
      <div>
        <Select onChange={onROCChange} value={roc} style={{ width: 500, marginBottom: 10 }}>
          {
            confidenceTexts.map(t => (<MenuItem value={t} key={t}>{t}</MenuItem>))
          }
        </Select>
      </div>
      <Button disabled={roc === ''} variant="contained" color="primary" onClick={onROCConfirm}>Confirm</Button>
    </Grid>;

  const hypoHelpPopover = 
    <Popover
      open={hypoHelpOpen}
      anchorEl={() => document.getElementById("hypothesisHelp")!}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={() => setHypoHelpOpen(false)}
    >
      <ul className={"popoverList"}>
        <li>
          <Typography variant="h6" paragraph>
            Your hypothesis is that moisture and shear strength increase until
            sand is saturated, at which point shear strength is constant as
            moisture increases
          </Typography>
        </li>
        <li style={{ listStyle: 'none', textAlign: 'center' }}>
          <img src={p2} width="300px" />
        </li>
      </ul>
    </Popover>;


  const [continueHelpOpen, setContinueHelpOpen] = useState(false);
  const [deviateHelpOpen, setDeviateHelpOpen] = useState(false);
  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);
  const [concludeInstructionsOpen, setConcludeInstructionsOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(true);

  const onConcludeClick = () => {
    if (curTransectIdx === 0) {
      setConfirmConcludeOpen(true);
    } else {
      onFinish();
    }
  };

  const confidenceArr = new Array(NUM_OF_HYPOS);
  confidenceArr.fill(confidenceTexts[3]);
  const globalConfArr = confidenceArr.slice();
  const [hypoConfidence, setHypoConfidence] = useState<string[]>(confidenceArr);
  const [globalHypoConf, setGlobalHypoConf] = useState<string[]>(globalConfArr);

  const onQuit = () => {
    if (chart) {
      Object.values(chart).forEach(c => {
        if (!c) return;
        c.data.datasets.forEach(dataset => { dataset.data = []; });
        c.update();
        c.clear();
        // c.destroy();
      });
    }
    // Why was this here? Does it need to be null to add new data later?
    // dispatch({ type: Action.SET_CHART, value: null });

    // dispatch({
    //   type: Action.SET_HYPO_CONFIDENCE,
    //   value: {
    //     index: curTransectIdx,
    //     hypoConfidence: [...hypoConfidence]
    //   }
    // });
    // dispatch({
    //   type: Action.SET_GLOBAL_HYPO_CONFIDENCE, 
    //   value: {
    //     index: curTransectIdx,
    //     globalHypoConfidence: [...globalHypoConf]
    //   }
    // });
    dispatch({ type: Action.SET_CUR_ROW_IDX, value: 0 });
    history.push('/geo');
    //console.log({globalState});
  };

  const addActualStrategySample = (type: 'planned' | 'deviated', row: any) => {
    const actualStrategySample: ActualStrategySample = {
      type: type,
      index: row.index, // In range [0, 21]
      measurements: row.measurements,
      normOffsetX: row.normOffsetX,
      normOffsetY: row.normOffsetY,
      moisture: row.moisture,
      shear: row.shear,
      grain: row.grain,
      batteryLevelBefore: batteryLevel,
      batteryWarningShown: batteryWarning
    };
    dispatch({ type: Action.ADD_ACTUAL_STRATEGY_SAMPLE, value: actualStrategySample });
  }
  
  const finishOptionsOnQuit = () => {
    onQuit();
  }
  const finishOptions = 
    <>
      <div className="hypothesisContainer">
        <HypothesisPanel hypothesis={'soil'} default={actualStrategyData.transects.length > 1 ? actualStrategyData.transects[actualStrategyData.transects.length - 2].localHypotheses : undefined}
          updateHypotheses={((hypotheses: HypothesisResponse) => {
            dispatch({ type: Action.ADD_LOCAL_HYPOTHESIS, value: hypotheses });
          })}
        />
        <HypothesisPanel hypothesis={'grain'} default={actualStrategyData.transects.length > 1 ? actualStrategyData.transects[actualStrategyData.transects.length - 2].globalHypotheses : undefined}
          updateHypotheses={((hypotheses: HypothesisResponse) => {
            dispatch({ type: Action.ADD_GLOBAL_HYPOTHESIS, value: hypotheses });
          })}
        />
      </div>
    </>
  const onTakeMoreClick = () => {
    setImgClickEnabled(true);    
  }

  const continueHelpPopover = 
    <Popover
      open={continueHelpOpen}
      anchorEl={() => document.getElementById("continue-helper")!}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      onClose={() => setContinueHelpOpen(false)}
    >
      <ul className={"popoverList"}>
        <li>
          <Typography variant="h6" paragraph>
            Now your sampling strategy will be executed by RHex step-by-step. The data from the first location you selected has been plotted.
          </Typography>
        </li>
        <li>
          <Typography variant="h6" paragraph>
          Prior to seeing data from the next location you must provide a rating of how confident you are that your current data supports the hypothesis.
          </Typography>
        </li>
      </ul>
    </Popover>;

  const deviateHelpPopover = 
    <Popover
      open={deviateHelpOpen}
      anchorEl={() => document.getElementById("deviate-helper")!}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'left',
      }}
      onClose={() => setDeviateHelpOpen(false)}
    >
      <ul className={"popoverList"}>
        <li>
          <Typography variant="h6" paragraph>
            To collect additional data, use the diagram of the dune image to select a new location and number of measurements.
          </Typography>
         </li>
        <li>
          <Typography variant="h6" paragraph>
            The data from this location will be plotted immediately
          </Typography>
        </li>
      </ul>
    </Popover>;

  const deviateSteps = [
    "Once you deviate, all remaining steps in your initial strategy at this transect will disappear. Are you sure you want to deviate?",
    "To collect additional data, use the diagram of the dune image to select a new location and number of measurements. The data from this location will be plotted immediately"
  ];

  const [deviateIdx, setDeviateIdx] = useState(0);
  const closeDeviateAlert = () => {
    setDeviateIdx(0);
    setDeviateAlertOpen(false);
  };
  
  const deviateDialog = (
    <Dialog
      open={deviateAlertOpen}
      onClose={closeDeviateAlert}
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {deviateSteps[deviateIdx]}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {
          deviateIdx === 0 && 
          <Button
            onClick={closeDeviateAlert}
            color="primary">
              {"Return to Initial Strategy"}
          </Button>
        }
        <Button onClick={() => {
          if (deviateIdx === 0) {
            changeToDeviate();
            setDeviateIdx(deviateIdx + 1);
          } else {
            closeDeviateAlert();
          }
        }} color="primary">{deviateIdx === 0 ? "Deviate" : "OK"}</Button>
      </DialogActions>
    </Dialog>
  );

  const onFinish = () => {
    setConfirmConcludeOpen(false);
    setHelperOpen(false);
    if (curTransectIdx === 0) setConcludeInstructionsOpen(true);
    dispatch({ type: Action.CLEAR_CHART_CURRENT });
    dispatch({ type: Action.CHANGE_SAMPLE_STATE, value: SampleState.FINISH_TRANSECT });
    // Reset row idx
    // dispatch({ type: Action.SET_CUR_ROW_IDX, value: 0 });
    // if (sampleState === SampleState.DEVIATED) {
    //   dispatch({ type: Action.SET_CUR_TRANSECT_IDX, value: transectIndices.length - 1 });
    // }
  };

  // Right panel to display when sampleState === FINISH_TRANSECT
  const finishedRightPanel = (
    <div className="rightDecisionPanelHypothesis">
      { finishOptions }
      <div>
        <Grid container className="mapConclusionImageContainer">
          <Grid item xs={6}>
            <div className="confirmButtonContainer">
              <Button color="primary" variant="contained" onClick={finishOptionsOnQuit}>
                Confirm
              </Button>
            </div>
          </Grid>
          <Grid item xs={6}>
            <div>
              <img src={mapConclusionImage} className="mapConclusionImage"/>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );

  const themeExecuteButton = createMuiTheme({
    palette: {
      primary: { main: '#339966' },
    },
    overrides: {
      MuiButton: {
        label: {
          color: '#f1f1f1',
        }
      }
    }
  });

  //Hooks for countdown circle timer hooks
  const [pause, setPause] = useState(false); // for pausing and continuing the countdown timer
  const [cycle, setCycle] = useState(true); // for determining when to update the charts

  const RenderTime = ({ remainingTime }) => {
    
    if (remainingTime === 0 ) {
      // Update the charts when it's a new cycle and if not all rows in the strategy have been executed yet
      if (cycle && curRowIdx < rows.length) {
        addDataToPlot(curTransectIdx, rows[curRowIdx]);
        setCycle(false);
      }
      return <div className="timer">{curRowIdx < rows.length ? "Executing next step..." : "Done!"}</div>
    }
    
    // When the timer resets to 10, reset to a new cycle
    if (remainingTime === countdownDuration) {
      setCycle(true);
    }

    return (
      <div className="timer">
        <div className="text">Remaining</div>
        <div className="value">{remainingTime}</div>
        <div className="text">seconds</div>
      </div>
    )
  }

  //Set of action buttons on right-side panel
  const feedbackButtons = (
    <>
      <Grid container className="timer-button-wrapper">
        <Grid item xs={12} md={4}>
          {!robotVersion && 
            <MuiThemeProvider theme={themeExecuteButton}>
              <Button
                className="nextStepButton"
                variant="contained"
                disabled={ curRowIdx >= rows.length }
                color="primary" onClick={onContinueClick}>
                EXECUTE NEXT STEP IN STRATEGY
              </Button>
            </MuiThemeProvider> }
          {robotVersion &&
            <div>
              <div className="timer-wrapper">
                <CountdownCircleTimer 
                  key={robotVersion.toString()}
                  isPlaying={!pause}
                  duration={countdownDuration}
                  colors={[["#004777", 0.33], ["#F7B801", 0.33], ["#A30000", 0.34]]}
                  onComplete={() => [curRowIdx + 1 < rows.length, 1000]}
                  size={100}
                >
                  {({ remainingTime }) => (
                    <RenderTime remainingTime={remainingTime} />
                  )}
                </CountdownCircleTimer>
              </div>
              <div className="button-wrapper">
                {curRowIdx < rows.length && <Button 
                  variant="contained" 
                  style={pause ? {backgroundColor: '#009900', color: '#FFFFFF'} : {backgroundColor: '#cc0000', color: '#FFFFFF'}} 
                  onClick={() => setPause(!pause)}>{pause ? "Resume" : "Pause"}
                </Button>}
              </div>
            </div>
          }
        </Grid>
        <Grid item xs={12} md={8}>
          <div className="buttonStack">
            <Button className="deviateButton" variant="contained" color="secondary" onClick={onDeviateClick}>
              Deviate From Strategy
            </Button>
            <Button className="quitButton" variant="contained" color="primary" onClick={onConcludeClick}>
              End Collection At Transect
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  );

  const deviatedButtons = (
    <>
      <Grid container className="timer-button-wrapper">
        <Grid item xs={12} md={4}>
          { !robotVersion && <Button className="nextStepButton" variant="contained" disabled color="primary">EXECUTE NEXT STEP IN STRATEGY</Button> }
        </Grid>
        <Grid item xs={12} md={8}>
          <div className="buttonStack">
            <Button className="moreMeasurementsButton" variant="contained" color="secondary"
              disabled={imgClickEnabled}
              onClick={onTakeMoreClick}>
                TAKE MORE MEASUREMENTS
            </Button>
            <Button className="quitButton" variant="contained" color="secondary" onClick={onConcludeClick}>
                End Collection At Transect
            </Button>
          </div>
        </Grid>
      </Grid>
    </>
  );

  // Right panel to display when collecting data, sampleState != FINISH_TRANSECT
  const collectionRightPanel = (
    <div className="collectionRightPanel">
      <ImgAlert open={!!showImgAlert} />
      <div className="clickableImageContainer">
        <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={(row) => addDataToPlot(curTransectIdx, row)} setPopOver={setImgAlert} transectIdx={curTransectIdx}/>  
      </div>
      <div className="middleRow">
        <div className="batteryPanel"><Battery/></div>
        <div className="buttonPanel">
          { sampleState === SampleState.FEEDBACK && feedbackButtons }
          { sampleState === SampleState.DEVIATED && deviatedButtons }
        </div>
      </div>
      <div className="rowTableContainer">
        <RowTable rows={rows} />
      </div>
    </div>
  );

  // Popup for displaying instructions for data collection phase when the initial field day sampling strategy is complete
  const [decisionHelpOpen, setDecisionHelpOpen] = useState(curTransectIdx === 0);
  const decisionHelpDialog =
    <MultiStepDialog
      open={decisionHelpOpen}
      setOpen={setDecisionHelpOpen}
      title={"Instructions for Transect Strategy Execution"}
      allowCancel={false}
      steps={[
        ["List of available actions:",
        "\u2022 To collect the next sample in your initial field day sampling strategy, click 'Execute Next Step in Strategy.'",
        "\u2022 To deviate from your initial strategy at the current transect, click 'Deviate from Strategy.' This will discard samples that haven't yet been executed at the current transect and enable you to select new samples by clicking along the dune image.",
        "\u2022 To complete your sample collection at the current transect and return to the map, click 'End Collection at Transect.' Prior to exiting, you will be asked to provide a rating of how confident you are that your current data supports various hypotheses.",
        "\u2022 The charts on the left will display the results of already executed samples across the transects. You can adjust the charts to display different combinations of transects or display raw/averaged values by clicking 'Update Chart Options.'"
        ]
      ]}
    />;

  function Helper() {
    const onClick = () => {
      setDecisionHelpOpen(true);
    };
  
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 40
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

  return (
    <div id="app" className="decisionPage">
      { helperOpen && <Helper /> }
      { decisionHelpDialog }
      { deviateDialog }

      <ConfirmDialog
        open={confirmConcludeOpen}
        title={""}
        text={"Are you sure you are ready to quit data collection at this transect? Press GO BACK to collect more data. Press CONTINUE to return to the field map."}
        okText="CONTINUE"
        cancelText="GO BACK"
        allowCancel={true}
        onClose={() => setConfirmConcludeOpen(false)}
        onCancel={() => setConfirmConcludeOpen(false)}
        onOk={onFinish}
      />

      <ConfirmDialog
        open={concludeInstructionsOpen}
        title={""}
        text={"Before returning to the field map, we want to know how your certainty about your local and global hypotheses have changed as a result of data collection at this transect."}
        okText="CONTINUE"
        allowCancel={false}
        onClose={() => setConcludeInstructionsOpen(false)}
        onCancel={() => setConcludeInstructionsOpen(false)}
        onOk={() => setConcludeInstructionsOpen(false)}
      />

      <Grid container>
        <Grid container>
          <Grid item xs={12} md={6}>
            <ChartPanel fullSize={true} mode={"TransectView"}/>
          </Grid>
          <Grid item xs={12} md={6} className="rightDecisionPanel">
            {
              sampleState === SampleState.FINISH_TRANSECT ?
              finishedRightPanel :
              <div className="rightDecisionPanelContainer">
                { collectionRightPanel }
              </div>
            }
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
