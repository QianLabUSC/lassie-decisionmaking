import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import HelpIcon from '@material-ui/icons/Help';
import { FormControl, Select, MenuItem, CircularProgress, Box, Slider } from '@material-ui/core';
import Popbox from '../components/Popbox';
import RowTable from '../components/RowTable';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import { getMeasurements, calculateRobotSuggestions } from '../util';
import {
  SampleState, RowType, PopboxTypeEnum, DISABLE_ROC, confidenceTexts, NUM_OF_HYPOS,
  UserFeedbackStep, objectiveOptions, acceptFollowUpOptions, transitionOptions,
} from '../constants';
import { useStateValue, Action } from '../state';
import HypothesisPanel from '../components/HypothesisPanel';
import ChartPanel from '../components/ChartPanel';
import "../styles/decision.scss";
import { ActualStrategySample, HypothesisResponse } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import Battery from '../components/Battery';
import RadioButtonGroup from '../components/RadioButtonGroup';
import RadioButtonGroupMultipleOptions from '../components/RadioButtonGroupMultipleOptions';
import { sampleRobotSuggestion } from '../strategyTemplates';
import Tooltip from '@material-ui/core/Tooltip';
import { ContactsOutlined } from '@material-ui/icons';

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
    batteryLevel, batteryWarning, chartSettings, moistureData
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


  // const [data, setData] = useState(3);
  // useEffect(() => {
  //   fetch('http://127.0.0.1:5000/regression', {
  //     method: 'POST',
  //     cache: 'no-cache',
  //     headers: {
  //       'content_type': "application/json",
  //     },
  //     body: JSON.stringify(data), 
  //   }).then(
  //     res => res.json()
  //   ).then(
  //     data => {
  //       //setData(data);
  //       console.log(data);
  //     }
  //   )
  // }, [data]);


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
    const { shearValues, moistureValues } = getMeasurements(globalState, transectIndices[transectIdx].number, index, measurements);
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

  // Automatically populate the charts with any remaining measurements from the transectSamples in the strategy (if the image hasn't been clicked)
  const [numImgClicks, setNumImgClicks] = useState(0); // controls when the global state's "rows" get loaded into the actual strategy and populated in the charts
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

  // Hooks for obtaining user feedback on what they think the objective should be at each data collection step
  const [userFeedbackStep, setUserFeedbackStep] = useState(0); // controls which set of questions are being asked to the user during each step
  const [objectives, setObjectives] = useState<number[]>([]); // stores objective(s) for each data collection step
  const [objectivesRankings, setObjectivesRankings] = useState<number[]>([]); // stores priority ranking for each objective
  const [objectiveFreeResponse, setObjectiveFreeResponse] = useState(""); // stores user's free response for the objective
  const [acceptOrReject, setAcceptOrReject] = useState(0); // stores whether the user accepts or rejects the robot's suggestion at each step
  const [acceptOrRejectOptions, setAcceptOrRejectOptions] = useState<string[]>([]);
  const [acceptFollowUp, setAcceptFollowUp] = useState(0); // stores how effective the user believes the robot's suggestion is at achieving the objective
  const [rejectReasonOptions, setRejectReasonOptions] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState(0); // stores why the user rejected the robot's suggestion at each step
  const [rejectReasonFreeResponse, setRejectReasonFreeResponse] = useState(""); // stores user's free response for the reason for rejecting the robot's suggestion
  const [transition, setTransition] = useState(0); // stores user's choice for the next data collection step
  const [robotSuggestions, setRobotSuggestions] = useState<IRow[]>([]); // stores robot's suggested sample locations at each step
  const [loading, setLoading] = useState(false); // tracks whether the robot suggestions are currently being calculated
  const [showRobotSuggestions, setShowRobotSuggestions] = useState(false); // determines whether the robot's suggestion should be displayed on the transect image
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [numSubmitClicks, setNumSubmitClicks] = useState(0);

  const [updatedHypoConfidence, setUpdatedHypoConfidence] = useState(0);
  const handleResponse = (value: any) => {
      setUpdatedHypoConfidence(value);
  }

  // Reset objectives rankings array and disable submit button if the user has selected no objectives during the OBJECTIVE step
  useEffect(() => {
    if (userFeedbackStep === UserFeedbackStep.OBJECTIVE) {
      setObjectivesRankings(new Array(objectives.length).fill(0));
      setDisableSubmitButton(objectives.length === 0);
    }
  }, [objectives]);

  // Disable the submit button during the RANK_OBJECTIVES step until the user fills out a valid set of rankings for each selected objective
  useEffect(() => {
    if (userFeedbackStep === UserFeedbackStep.RANK_OBJECTIVES) {
      setDisableSubmitButton(objectivesRankings.includes(0) || (new Set(objectivesRankings)).size !== objectivesRankings.length);
    }
  }, [objectivesRankings]);

  const objectiveQuestions = 
    <div className="objective-questions">
      <p><strong>Based on the data collected so far, select which of the following beliefs you currently hold (you may select multiple).</strong></p>
      <RadioButtonGroupMultipleOptions options={objectiveOptions} selectedIndices={objectives} onChange={i => {
        let objectivesTemp = [...objectives];
        if (objectivesTemp.includes(i)) {
          objectivesTemp = objectivesTemp.filter(obj => obj !== i);
        } else {
          objectivesTemp.push(i);
        }
        setObjectives(objectivesTemp);
      }}/>
    </div>

  const objectivesToRank = 
    <table className="dropDownMenuGroup" style={{marginBottom: '2vh'}}>
      <tbody>
          {
            objectives.map((obj, i) => (
                <tr key={objectiveOptions[obj]}>
                  <td>
                    <FormControl>
                      <Select
                        id="objectives-select"
                        value={objectivesRankings[i]}
                        onChange={(e) => {
                          let objectivesRankingsTemp = [...objectivesRankings];
                          if (typeof e.target.value === 'number') objectivesRankingsTemp[i] = e.target.value;
                          setObjectivesRankings(objectivesRankingsTemp);
                        }}
                      >
                        {Array.from({length: objectives.length}, (_, i) => i + 1).map((rank) => (
                          <MenuItem key={objectiveOptions[obj] + rank} value={rank}>{rank}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                      { objectiveOptions[obj] }
                  </td>
                </tr>
            ))
          }
      </tbody>
    </table>
    
  const objectiveRankings =
    <div className="objective-rankings">
      <p><strong>Now choose the order in which you agree with each of the selected beliefs, with 1 being the strongest agreement:</strong></p>
      {objectivesToRank}
    </div>

  const onObjectiveTextChange = e => {
    setObjectiveFreeResponse(e.target.value);
  }
  const objectiveFreeResponseQuestion = 
    <div className="objective-free-response-question" style={{marginBottom: '2vh'}}>
      <p><strong>Please describe your belief about the data collected so far:</strong></p>
      <textarea onChange={onObjectiveTextChange} rows={5} cols={85}/>
    </div>

  useEffect(() => {
    let acceptOrRejectTemp : string[] = robotSuggestions.map((suggestion, index) => "Accept suggested location " + (index + 1));
    acceptOrRejectTemp.push("Reject suggestions");
    setAcceptOrRejectOptions(acceptOrRejectTemp);
  }, [robotSuggestions]);
  
  const acceptOrRejectQuestions = 
    <div className="accept-or-reject-questions">
      <p><strong>Based on your belief rankings, RHex suggests sampling from one of the red locations marked on the dune cross-section above.</strong></p>
      <RadioButtonGroup options={acceptOrRejectOptions} selectedIndex={acceptOrReject} onChange={i => setAcceptOrReject(i)}/>
    </div>


  const [objectiveAddressedRating, setObjectiveAddressedRating] = useState<number[]>([]);
  const handleSliderChange = (event, newValue, index) => {
    if (typeof newValue === 'number') {
      let objectiveAddressedRatingTemp = [...objectiveAddressedRating];
      objectiveAddressedRatingTemp[index] = newValue;
      setObjectiveAddressedRating(objectiveAddressedRatingTemp);
    }
  }

  useEffect(() => {
    setObjectiveAddressedRating(new Array(objectives.length).fill(0));
  }, [objectives]);
  
  const marks = [
    {
      value: 0,
      label: '1',
    },
    {
      value: 20,
      label: '2',
    },
    {
      value: 40,
      label: '3',
    },
    {
      value: 60,
      label: '4',
    },
    {
      value: 80,
      label: '5',
    },
    {
      value: 100,
      label: '6',
    },
  ];

  function valueLabelFormat(value) {
    return marks.findIndex((mark) => mark.value === value) + 1;
  }

  const acceptFollowUpQuestions = 
    <div className="accept-follow-up-questions">
      <p><strong>Rate the extent to which going to this location addressed each of the following beliefs (1 - Definitely addressed, 
        2 - Moderately addressed, 3 - Somewhat addressed, 4 - Barely addressed, 5 - Did not address, 6 - Unsure):</strong></p>
      { objectives.map((obj, index) => (
        <div key={objectiveOptions[obj].slice(0, 10) + index}>
          <p>{objectiveOptions[obj]}</p>
          <div className="slider-box">
            <Box>
              <Slider
                aria-label="Restricted values"
                value={objectiveAddressedRating[index]}
                valueLabelFormat={valueLabelFormat}
                valueLabelDisplay="auto"
                step={20}
                marks={marks}
                onChange={(event, value) => handleSliderChange(event, value, index)}
              />
            </Box>
          </div>
        </div>
      ))}
      
      {/* <RadioButtonGroup options={acceptFollowUpOptions} selectedIndex={acceptFollowUp} onChange={i => setAcceptFollowUp(i)}/> */}

      <div className="hypothesisBlock">
          <div className="hypothesisTitle">Updated Hypothesis Confidence</div>
          <div className="hypothesisText">
            Provide a new ranking of your certainty that this hypothesis will be supported or refuted. If you have no preference, select "I am unsure":
          </div>
          <FormControl>
              <Select
                  style={{fontSize: '1.5vh'}}
                  value={updatedHypoConfidence + 3}
                  onChange={event => handleResponse(Number(event.target.value) - 3)}>
                  {
                      confidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                  }
              </Select>
          </FormControl>
      </div>
    </div>

  useEffect(() => {
    let rejectReasonOptionsTemp = [
      "The suggested location did not address the beliefs I selected: (", 
      "I rejected the suggested location for a different reason",
    ]
    for (let i = 0; i < objectives.length - 1; i++) {
      rejectReasonOptionsTemp[0] += objectiveOptions[objectives[i]] + ", ";
    }
    rejectReasonOptionsTemp[0] += (objectiveOptions[objectives[objectives.length - 1]] + ")");
    setRejectReasonOptions(rejectReasonOptionsTemp);
  }, [objectives]);

  const rejectReasonQuestions = 
    <div className="reject-reason-questions">
      <p><strong>Why did you reject RHex's suggested locations?</strong></p>
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
      <p><strong>Please select the next location you'd like to sample from by clicking anywhere along the transect surface in the dune cross-section above. When you have finalized your selection and are ready to collect data from that location, click "Submit."</strong></p>
    </div>

  const transitionQuestions = 
    <div className="reject-reason-questions">
      <p><strong>What would you like to do next?</strong></p>
      <RadioButtonGroup 
        options={transitionOptions.slice(objectiveFreeResponse === "" ? 0 : 1)} 
        selectedIndex={transition} 
        onChange={i => setTransition(i)}/>
    </div>

  // Match the order of UserFeedbackSteps in 'constants.ts'
  const userFeedbackStepMap = [
    objectiveQuestions,
    objectiveRankings,
    objectiveFreeResponseQuestion,
    acceptOrRejectQuestions,
    acceptFollowUpQuestions,
    rejectReasonQuestions,
    rejectReasonFreeResponseQuestion,
    userLocationSelectionQuestion,
    transitionQuestions, // to be changed
    transitionQuestions,
  ]

  useEffect(() => {
    console.log({robotSuggestions});
  }, [robotSuggestions]);

  const onSubmit = async () => {
    console.log({globalState});
    setNumSubmitClicks(numSubmitClicks + 1);
    switch (userFeedbackStep) {
      case UserFeedbackStep.OBJECTIVE: {
        if (objectives.includes(4)) { // need to adjust this so that you only go to free response if option is ranked highest
          setObjectiveFreeResponse("");
          setUserFeedbackStep(UserFeedbackStep.OBJECTIVE_FREE_RESPONSE);
        } else {
          if (objectives.length === 1) {
            setLoading(true);
            setRobotSuggestions(await calculateRobotSuggestions(actualStrategyData.transects[0].samples, globalState, objectives, objectivesRankings));
            setShowRobotSuggestions(true);
            setAcceptOrReject(0);
            setUserFeedbackStep(UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION);
            setLoading(false);
          } else {
            setDisableSubmitButton(true);
            setUserFeedbackStep(UserFeedbackStep.RANK_OBJECTIVES); // STILL NEED TO ADD THIS SECTION
          } 
        }
        return;
      }
      case UserFeedbackStep.OBJECTIVE_FREE_RESPONSE: {
        // add a line to save the response
        setDisableSubmitButton(true);
        setImgClickEnabled(true);
        setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
        setNumImgClicks(0);
        return;
      }
      case UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION: {
        if (acceptOrReject !== acceptOrRejectOptions.length - 1) {
          let newRow = {...robotSuggestions[acceptOrReject], type: RowType.NORMAL}; // edit row type from "ROBOT_SUGGESTION" to "NORMAL"
          dispatch({ type: Action.ADD_ROW, value: newRow }); // add the new row to the StateContext
          setUserFeedbackStep(UserFeedbackStep.ACCEPT_FOLLOW_UP);
        } else {
          setUserFeedbackStep(UserFeedbackStep.REJECT_REASON);
        }
        setShowRobotSuggestions(false);
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
        //addDataToPlot(curTransectIdx, rows[rows.length - 1]);
        setImgClickEnabled(false);
        setNumImgClicks(0);
        setUserFeedbackStep(UserFeedbackStep.TRANSITION);
        return;
      }
      case UserFeedbackStep.TRANSITION: {
        let transitionAdj = objectiveFreeResponse === "" ? transition : transition + 1;
        if (transitionAdj === 0) {
          setLoading(true);
          setRobotSuggestions(await calculateRobotSuggestions(actualStrategyData.transects[0].samples, globalState, objectives, objectivesRankings));
          setShowRobotSuggestions(true);
          setAcceptOrReject(0);
          setUserFeedbackStep(UserFeedbackStep.ACCEPT_OR_REJECT_SUGGESTION);
          setLoading(false);
        } else if (transitionAdj === 1) {
          setUserFeedbackStep(UserFeedbackStep.OBJECTIVE);
        } else if (transitionAdj === 2) {
          setDisableSubmitButton(true);
          setImgClickEnabled(true);
          setUserFeedbackStep(UserFeedbackStep.USER_LOCATION_SELECTION);
          setNumImgClicks(0);
        } else if (transitionAdj === 3) {
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
            <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={(row) => addDataToPlot(curTransectIdx, row)} setPopOver={setImgAlert} transectIdx={curTransectIdx} robotSuggestions={robotSuggestions} showRobotSuggestions={showRobotSuggestions} setDisableSubmitButton={setDisableSubmitButton} numImgClicks={numImgClicks} setNumImgClicks={setNumImgClicks}/>  
          </div>
      </Tooltip>
      {!loading && <div className={numSubmitClicks === 0 ? "user-feedback-flashing" : "user-feedback"}>
        {userFeedbackStepMap[userFeedbackStep]}
        <div className="submit-user-feedback-button">
          <Button disabled={disableSubmitButton} variant="contained" color="secondary" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>}
      {loading && <div className="loading-screen">
        <CircularProgress 
          color="secondary"
          size={100}
        />
      </div>}
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
      title={""}
      allowCancel={false}
      steps={[
        ["RHex will always take 3 measurements of moisture and strength at each location visited.",
        "The dune cross-section on the right displays the locations where RHex has already sampled and the charts on the left display the corresponding data. Select \"Update Chart Options\" to adjust the charts to display raw or averaged values (if there are multiple samples taken from the same location along the transect).",
        "You will be asked a few questions to determine where RHex should sample next.",
        "If at any point you feel you have collected enough data to make a judgment about the hypothesis, select \"End Collection at Transect.\""
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
