import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import HelpIcon from '@material-ui/icons/Help';
import Popbox from '../components/Popbox';
import RowTable from '../components/RowTable';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import { getMeasurements, calculateRobotSuggestions } from '../util';
import {
  SampleState, RowType, PopboxTypeEnum, DISABLE_ROC, confidenceTexts, NUM_OF_HYPOS,
  UserFeedbackStep, objectiveOptions, acceptOrRejectOptions, acceptFollowUpOptions, rejectReasonOptions, transitionOptions
} from '../constants';
import { useStateValue, Action } from '../state';
import HypothesisPanel from '../components/HypothesisPanel';
import ChartPanel from '../components/ChartPanel';
import "../styles/decision.scss";
import { ActualStrategySample, HypothesisResponse } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import Battery from '../components/Battery';
import RadioButtonGroup from '../components/RadioButtonGroup';
import { sampleRobotSuggestion } from '../strategyTemplates';
import Tooltip from '@material-ui/core/Tooltip';

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
    sampleState, chart, imgClickEnabled, strategy, actualStrategyData, 
    batteryLevel, batteryWarning, chartSettings,
  } = globalState;
  const { curRowIdx, curTransectIdx, transectSamples, transectIndices } = strategy;
  const rows = transectSamples[curTransectIdx] || [];

  const [numImgClicks, setNumImgClicks] = useState(0);

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
    console.log({globalState}); // for debugging
    
    setImgClickEnabled(false);

    // Make sure charts are ready for decision page
    initializeCharts(globalState, dispatch);

    // Make the charts update on first render
    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });

    // for (let i = 0; i < actualStrategyData.transects[0].samples.length; i++) {
    //   console.log(actualStrategyData.transects[0].samples[i].index);
    // }
    //console.log(actualStrategyData.transects[0]);
    //calculateRobotSuggestions(actualStrategyData.transects[0].samples);

    return () => {
      dispatch({
        type: Action.SET_DECISION_ENTERED,
        value: true
      });
    };
  }, []);
  

  const addActualStrategySample = (type: 'planned' | 'deviated', row: any) => {
    const actualStrategySample: ActualStrategySample = {
      type: type,
      index: row.index, // In range [0, 21]
      measurements: row.measurements,
      normOffsetX: row.normOffsetX,
      normOffsetY: row.normOffsetY,
      moisture: row.moisture,
      shear: row.shear,
      batteryLevelBefore: batteryLevel,
      batteryWarningShown: batteryWarning
    };
    dispatch({ type: Action.ADD_ACTUAL_STRATEGY_SAMPLE, value: actualStrategySample });
  }

  // Function to add next sample to the data plot
  const addDataToPlot = (transectIdx: number, row : IRow, doNotAddToRow?: boolean, saveToActualStrategy?: boolean) => {
    const { index, measurements } = row;
    const {shearValues, moistureValues } = getMeasurements(globalState, transectIndices[transectIdx].number, index, measurements);
    const newRow = { ...row };
    newRow.moisture = moistureValues;
    newRow.shear = shearValues;

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
  }

  // Add data from initial strategy to charts
  if (curRowIdx < rows.length && numImgClicks === 0) {
    addDataToPlot(curTransectIdx, rows[curRowIdx]);
  }

  const onContinueClick = () => {
    addDataToPlot(curTransectIdx, rows[curRowIdx]);
  };

  const [deviateAlertOpen, setDeviateAlertOpen] = useState(false);

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

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);
  const [concludeInstructionsOpen, setConcludeInstructionsOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(true);

  const onConcludeClick = () => {
      setConfirmConcludeOpen(true);
  };

  const confidenceArr = new Array(NUM_OF_HYPOS);
  confidenceArr.fill(confidenceTexts[3]);

  const onQuit = () => {
    if (chart) {
      Object.values(chart).forEach(c => {
        if (!c) return;
        c.data.datasets.forEach(dataset => { dataset.data = []; });
        c.update();
        c.clear();
      });
    }
    history.push('/conclusion');
    console.log({globalState});
  };
  
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

  // // Right panel to display when sampleState === FINISH_TRANSECT
  // const finishedRightPanel = (
  //   <div className="rightDecisionPanelHypothesis">
  //     { finishOptions }
  //     <div>
  //       <Grid container className="mapConclusionImageContainer">
  //         <Grid item xs={6}>
  //           <div className="confirmButtonContainer">
  //             <Button color="primary" variant="contained" onClick={finishOptionsOnQuit}>
  //               Confirm
  //             </Button>
  //           </div>
  //         </Grid>
  //         <Grid item xs={6}>
  //           <div>
  //             <img src={mapConclusionImage} className="mapConclusionImage"/>
  //           </div>
  //         </Grid>
  //       </Grid>
  //     </div>
  //   </div>
  // );

  // const themeExecuteButton = createMuiTheme({
  //   palette: {
  //     primary: { main: '#339966' },
  //   },
  //   overrides: {
  //     MuiButton: {
  //       label: {
  //         color: '#f1f1f1',
  //       }
  //     }
  //   }
  // });

  
  // //Set of action buttons on right-side panel
  // const feedbackButtons = (
  //   <>
  //     <Grid container className="timer-button-wrapper">
  //       <Grid item xs={12} md={4}>
  //         {!robotVersion && 
  //           <MuiThemeProvider theme={themeExecuteButton}>
  //             <Button
  //               className="nextStepButton"
  //               variant="contained"
  //               disabled={ curRowIdx >= rows.length }
  //               color="primary" onClick={onContinueClick}>
  //               EXECUTE NEXT STEP IN STRATEGY
  //             </Button>
  //           </MuiThemeProvider> }
  //         {robotVersion &&
  //           <div>
  //             <div className="timer-wrapper">
  //               <CountdownCircleTimer 
  //                 key={robotVersion.toString()}
  //                 isPlaying={!pause}
  //                 duration={countdownDuration}
  //                 colors={[["#004777", 0.33], ["#F7B801", 0.33], ["#A30000", 0.34]]}
  //                 onComplete={() => [curRowIdx + 1 < rows.length, 1000]}
  //                 size={100}
  //               >
  //                 {({ remainingTime }) => (
  //                   <RenderTime remainingTime={remainingTime} />
  //                 )}
  //               </CountdownCircleTimer>
  //             </div>
  //             <div className="button-wrapper">
  //               {curRowIdx < rows.length && <Button 
  //                 variant="contained" 
  //                 style={pause ? {backgroundColor: '#009900', color: '#FFFFFF'} : {backgroundColor: '#cc0000', color: '#FFFFFF'}} 
  //                 onClick={() => setPause(!pause)}>{pause ? "Resume" : "Pause"}
  //               </Button>}
  //             </div>
  //           </div>
  //         }
  //       </Grid>
  //       <Grid item xs={12} md={8}>
  //         <div className="buttonStack">
  //           <Button className="deviateButton" variant="contained" color="secondary" onClick={onDeviateClick}>
  //             Deviate From Strategy
  //           </Button>
  //           <Button className="quitButton" variant="contained" color="primary" onClick={onConcludeClick}>
  //             End Collection At Transect
  //           </Button>
  //         </div>
  //       </Grid>
  //     </Grid>
  //   </>
  // );

  // const deviatedButtons = (
  //   <>
  //     <Grid container className="timer-button-wrapper">
  //       <Grid item xs={12} md={4}>
  //         { !robotVersion && <Button className="nextStepButton" variant="contained" disabled color="primary">EXECUTE NEXT STEP IN STRATEGY</Button> }
  //       </Grid>
  //       <Grid item xs={12} md={8}>
  //         <div className="buttonStack">
  //           <Button className="moreMeasurementsButton" variant="contained" color="secondary"
  //             disabled={imgClickEnabled}
  //             onClick={onTakeMoreClick}>
  //               TAKE MORE MEASUREMENTS
  //           </Button>
  //           <Button className="quitButton" variant="contained" color="secondary" onClick={onConcludeClick}>
  //               End Collection At Transect
  //           </Button>
  //         </div>
  //       </Grid>
  //     </Grid>
  //   </>
  // );

  // // Right panel to display when collecting data, sampleState != FINISH_TRANSECT
  // const collectionRightPanel = (
  //   <div className="collectionRightPanel">
  //     <ImgAlert open={!!showImgAlert} />
  //     <div className="clickableImageContainer">
  //       <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={(row) => addDataToPlot(curTransectIdx, row)} setPopOver={setImgAlert} transectIdx={curTransectIdx}/>  
  //     </div>
  //     <div className="middleRow">
  //       <div className="batteryPanel"><Battery/></div>
  //       <div className="buttonPanel">
  //         { sampleState === SampleState.FEEDBACK && feedbackButtons }
  //         { sampleState === SampleState.DEVIATED && deviatedButtons }
  //       </div>
  //     </div>
  //     <div className="rowTableContainer">
  //       <RowTable rows={rows} />
  //     </div>
  //   </div>
  // );

  // Hooks for obtaining user feedback on what they think the objective should be at each data collection step
  const [userFeedbackStep, setUserFeedbackStep] = useState(0); // controls which set of questions are being asked to the user during each step
  const [objective, setObjective] = useState(0); // stores objective for each data collection step
  const [objectiveFreeResponse, setObjectiveFreeResponse] = useState(""); // stores user's free response for the objective
  const [acceptOrReject, setAcceptOrReject] = useState(0); // stores whether the user accepts or rejects the robot's suggestion at each step
  const [acceptFollowUp, setAcceptFollowUp] = useState(0); // stores how effective the user believes the robot's suggestion is at achieving the objective
  const [rejectReason, setRejectReason] = useState(0); // stores why the user rejected the robot's suggestion at each step
  const [rejectReasonFreeResponse, setRejectReasonFreeResponse] = useState(""); // stores user's free response for the reason for rejecting the robot's suggestion
  const [transition, setTransition] = useState(0); // stores user's choice for the next data collection step
  const [robotSuggestion, setRobotSuggestion] = useState<IRow>(); // stores robot's suggested sample location at each step
  const [showRobotSuggestion, setShowRobotSuggestion] = useState(false); // determines whether the robot's suggestion should be displayed on the transect image
  const [disableSubmitButton, setDisableSubmitButton] = useState(false);
  const [numSubmitClicks, setNumSubmitClicks] = useState(0);

  const objectiveQuestions = 
    <div className="objective-questions">
      <p><strong>Based on the data collected so far, what do you think RHex's next objective should be?</strong></p>
      <RadioButtonGroup options={objectiveOptions} selectedIndex={objective} onChange={i => setObjective(i)}/>
    </div>

  const onObjectiveTextChange = e => {
    setObjectiveFreeResponse(e.target.value);
  }
  const objectiveFreeResponseQuestion = 
    <div className="objective-free-response-question" style={{marginBottom: '2vh'}}>
      <p><strong>Please describe what you believe the objective should be:</strong></p>
      <textarea onChange={onObjectiveTextChange} rows={5} cols={85}/>
    </div>
  
  const acceptOrRejectQuestions = 
    <div className="accept-or-reject-questions">
      <p><strong>Based on the objective you've selected, RHex suggests sampling next from the red location on the transect above! Do you accept or reject this suggestion?</strong></p>
      <RadioButtonGroup options={acceptOrRejectOptions} selectedIndex={acceptOrReject} onChange={i => setAcceptOrReject(i)}/>
    </div>

  const acceptFollowUpQuestions = 
    <div className="accept-follow-up-questions">
      <p><strong>Did going to RHex's suggested location achieve your intended objective?</strong></p>
      <RadioButtonGroup options={acceptFollowUpOptions} selectedIndex={acceptFollowUp} onChange={i => setAcceptFollowUp(i)}/>
    </div>

  const rejectReasonQuestions = 
    <div className="reject-reason-questions">
      <p><strong>Why did you reject RHex's suggested location?</strong></p>
      <RadioButtonGroup options={rejectReasonOptions} selectedIndex={rejectReason} onChange={i => setRejectReason(i)}/>
    </div>
  
  const onRejectReasonTextChange = e => {
    setRejectReasonFreeResponse(e.target.value);
  }

  const rejectReasonFreeResponseQuestion = 
    <div className="reject-reason-free-response-question" style={{marginBottom: '2vh'}}>
      <p><strong>Please state your reason for rejecting the suggestion:</strong></p>
      <textarea onChange={onRejectReasonTextChange} rows={5} cols={85}/>
    </div>

  const userLocationSelectionQuestion = 
    <div className="user-location_selection-question">
      <p><strong>Please select the next location you'd like to sample from by clicking anywhere along the transect surface in the image above. When you have finalized your selection and are ready to collect data from that location, click "Submit."</strong></p>
    </div>

  const transitionQuestions = 
    <div className="reject-reason-questions">
      <p><strong>What would you like to do next?</strong></p>
      <RadioButtonGroup options={transitionOptions} selectedIndex={transition} onChange={i => setTransition(i)}/>
    </div>

  // Match the order of UserFeedbackSteps in 'constants.ts'
  const userFeedbackStepMap = [
    objectiveQuestions,
    objectiveFreeResponseQuestion,
    acceptOrRejectQuestions,
    acceptFollowUpQuestions,
    rejectReasonQuestions,
    rejectReasonFreeResponseQuestion,
    userLocationSelectionQuestion,
    transitionQuestions, // to be changed
    transitionQuestions,
  ]

  const onSubmit = () => {
    setNumSubmitClicks(numSubmitClicks + 1);
    switch (userFeedbackStep) {
      case UserFeedbackStep.OBJECTIVE: {
        if (objective !== 4) {
          setRobotSuggestion(sampleRobotSuggestion);
          
          console.log(actualStrategyData.transects[0]);
          calculateRobotSuggestions(actualStrategyData.transects[0].samples);

          setShowRobotSuggestion(true);
          setUserFeedbackStep(UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION);
        } else {
          setUserFeedbackStep(UserFeedbackStep.OBJECTIVE_FREE_RESPONSE);
        }
        return;
      }
      case UserFeedbackStep.OBJECTIVE_FREE_RESPONSE: {
        setDisableSubmitButton(true);
        setImgClickEnabled(true);
        setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
        setNumImgClicks(0);
        return;
      }
      case UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION: {
        if (acceptOrReject === 0) {
          if (robotSuggestion) {
            let newRow = {...robotSuggestion, type: RowType.NORMAL};
            addDataToPlot(curTransectIdx, newRow);
          }
          setUserFeedbackStep(UserFeedbackStep.ACCEPT_FOLLOW_UP);
        } else if (acceptOrReject === 1) {
          setUserFeedbackStep(UserFeedbackStep.REJECT_REASON);
        }
        setShowRobotSuggestion(false);
        return;
      }
      case UserFeedbackStep.ACCEPT_FOLLOW_UP: {
        setUserFeedbackStep(UserFeedbackStep.TRANSITION);
        return;
      }
      case UserFeedbackStep.REJECT_REASON: {
        if (rejectReason === 0) {
          setDisableSubmitButton(true);
          setImgClickEnabled(true);
          setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
          setNumImgClicks(0);
        } else if (rejectReason === 1) {
          setUserFeedbackStep(UserFeedbackStep.REJECT_REASON_FREE_RESPONSE);
        }
        return;
      }
      case UserFeedbackStep.REJECT_REASON_FREE_RESPONSE: {
        setDisableSubmitButton(true);
        setImgClickEnabled(true);
        setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
        setNumImgClicks(0);
        return;
      }
      case UserFeedbackStep.USER_LOCATION_SELECTION: {
        addDataToPlot(curTransectIdx, rows[rows.length - 1]);
        setImgClickEnabled(false);
        setUserFeedbackStep(UserFeedbackStep.TRANSITION);
        return;
      }
      case UserFeedbackStep.TRANSITION: {
        if (transition === 0) {
          setUserFeedbackStep(UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION);
        } else if (transition === 1) {
          setUserFeedbackStep(UserFeedbackStep.OBJECTIVE);
        } else if (transition === 2) {
          setDisableSubmitButton(true);
          setImgClickEnabled(true);
          setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
          setNumImgClicks(0);
        } else if (transition === 3) {
          onConcludeClick();
        }
        return;
      }
    }
  }

  const clickableImageTip = "Please select a location on the transect to sample from between the crest and interdune";
  const clickableImageTipStyle = {
      fontSize: '12px'
  }



  // Right panel to display when collecting data, sampleState != FINISH_TRANSECT
  const collectionRightPanel = (
    <div className="collectionRightPanel">
      <ImgAlert open={!!showImgAlert} />
      <Tooltip title={userFeedbackStep !== UserFeedbackStep.USER_LOCATION_SELECTION ? "" : <span style={clickableImageTipStyle}>{clickableImageTip}</span>} placement="bottom">
          <div className="clickableImageContainer">
            <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={(row) => addDataToPlot(curTransectIdx, row)} setPopOver={setImgAlert} transectIdx={curTransectIdx} robotSuggestion={robotSuggestion} showRobotSuggestion={showRobotSuggestion} setDisableSubmitButton={setDisableSubmitButton} numImgClicks={numImgClicks} setNumImgClicks={setNumImgClicks}/>  
          </div>
      </Tooltip>
      <div className={numSubmitClicks === 0 ? "user-feedback-flashing" : "user-feedback"}>
        {userFeedbackStepMap[userFeedbackStep]}
        <div className="submit-user-feedback-button">
          <Button disabled={disableSubmitButton} variant="contained" color="secondary" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>
      <div className="quit">
        <Button className="quitButton" variant="contained" color="primary" onClick={onConcludeClick}>
          End Collection At Transect
        </Button>
      </div>
    </div>
  );

  // Popup for displaying instructions on the decision page
  const [decisionHelpOpen, setDecisionHelpOpen] = useState(curTransectIdx === 0);
  const decisionHelpDialog =
    <MultiStepDialog
      open={decisionHelpOpen}
      setOpen={setDecisionHelpOpen}
      title={"Instructions"}
      allowCancel={false}
      steps={[
        ["A robot is testing a hypothesis about the relationship between soil strength and soil moisture. The robot has already collected some data, but needs your help to decide where to go next!",
        "\u2022 Between each data sample collection, you will be asked a few short questions to determine where to collect the next sample.",
        "\u2022 The charts on the left will display the shear strength and moisture results of the samples along the way. You can adjust the charts to display raw or averaged (if there are multiple samples taken at certain locations along the transect) values by clicking 'Update Chart Options.'",
        "\u2022 If at any point you feel like you have collected enough data, you may click the button to end the data collection."
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
        text={"Are you sure you are ready to quit data collection at this transect? Press GO BACK to collect more data. Press CONTINUE to move on to a few final survey questions."}
        okText="CONTINUE"
        cancelText="GO BACK"
        allowCancel={true}
        onClose={() => setConfirmConcludeOpen(false)}
        onCancel={() => setConfirmConcludeOpen(false)}
        onOk={onQuit}
      />

      <Grid container>
        <Grid container>
          <Grid item xs={12} md={6}>
            <ChartPanel fullSize={true} mode={"TransectView"}/>
          </Grid>
          <Grid item xs={12} md={6} className="rightDecisionPanel">
            <div className="rightDecisionPanelContainer">
              { collectionRightPanel }
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
