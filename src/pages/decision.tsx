import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';

import HelpIcon from '@material-ui/icons/Help';
import { FormControl, Select, MenuItem, CircularProgress, Box, Slider } from '@material-ui/core';
import Popbox from '../components/Popbox';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import { getMeasurements, calculateRobotSuggestions } from '../util';
import {
  PopboxTypeEnum, confidenceTexts, NUM_OF_HYPOS,
  UserFeedbackState, objectiveOptions, transitionOptions,
} from '../constants';
import { useStateValue, Action, currUserStepTemplate } from '../state';
import ChartPanel from '../components/ChartPanel';
import "../styles/decision.scss";
import { CurrUserStepData, UserStepsData, Sample, PreSample } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import RadioButtonGroup from '../components/RadioButtonGroup';
import RadioButtonGroupMultipleOptions from '../components/RadioButtonGroupMultipleOptions';
import { sampleRobotSuggestion } from '../sampleTemplates';
import Tooltip from '@material-ui/core/Tooltip';

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

  const { currSampleIdx, samples, currUserStep, userSteps, chart, chartSettings,
    numSubmitClicks, imgClickEnabled, numImgClicks, transectIdx } = globalState;

  const { step, userFeedbackState, objectives, objectivesRankings, objectiveFreeResponse, sampleType,
    loadingRobotSuggestions, showRobotSuggestions, robotSuggestions, acceptOrRejectOptions, acceptOrReject, 
    rejectReasonOptions, rejectReason, rejectReasonFreeResponse, userFreeSelection, userSample, 
    objectiveAddressedRating, hypoConfidence, transition, disableSubmitButton } = currUserStep;

  const history = useHistory();

  // Initial page set up
  useEffect(() => {
    console.log({globalState}); // for debugging
    dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
    // Make sure charts are ready for decision page
    initializeCharts(globalState, dispatch);
    // Make the charts update on first render
    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });
  }, []);

  // Function to add next sample to the data plot
  const addDataToPlot = (sample: Sample) => {
    dispatch({ type: Action.SET_CURR_SAMPLE_IDX, value: currSampleIdx + 1 });
    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });
  }

  // Automatically populate the charts with any remaining measurements from the transectSamples in the strategy (if the image hasn't been clicked)
  if (currSampleIdx < samples.length && numImgClicks === 0) {
    addDataToPlot(samples[currSampleIdx]);
  }

  // Function to add the latest user step data to the finalized set of userSteps 
  // and reset the currUserStep (with the current step incremented by 1, and the 
  // last userFeedbackState & hypothesis confidence saved) 
  const updateUserSteps = () => {
    let objectivesAsText : string[] = objectives.map((objective) => {
      return objectiveOptions[objective];
    })
    let newUserStep : UserStepsData = {
      step: step, 
      objectives: objectivesAsText, 
      objectivesRankings: objectivesRankings, 
      objectiveFreeResponse: objectiveFreeResponse, 
      sampleType: sampleType,
      robotSuggestions: robotSuggestions, 
      acceptOrReject: acceptOrRejectOptions[acceptOrReject], 
      rejectReason: rejectReasonOptions[rejectReason], 
      rejectReasonFreeResponse: rejectReasonFreeResponse, 
      userFreeSample: userSample,
      hypoConfidence: confidenceTexts[hypoConfidence + 3],
      transition: transitionOptions[transition]
    }

    console.log({userFeedbackState, hypoConfidence});

    let lastUserFeedbackState = userFeedbackState;
    let lastHypo = hypoConfidence;

    console.log({lastUserFeedbackState, lastHypo});

    let currUserStepUpdated : CurrUserStepData = currUserStepTemplate;
    currUserStepUpdated.step = step + 1;
    currUserStepUpdated.userFeedbackState = lastUserFeedbackState;
    currUserStepUpdated.hypoConfidence = lastHypo;

    dispatch({ type: Action.ADD_USER_STEP, value: newUserStep }); 
    //dispatch({ type: Action.SET_CURR_USER_STEP, value: currUserStepUpdated }); 
  }

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(true);

  const onConcludeClick = () => {
      setConfirmConcludeOpen(true);
  };

  const onQuit = () => {
    updateUserSteps(); // Update userSteps and reset the currUserStep    
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
  
  
  // // Hooks for obtaining user feedback on what they think the objective should be at each data collection step
  // const [userFeedbackStep, setUserFeedbackStep] = useState(0); // controls which set of questions are being asked to the user during each step
  // const [acceptOrRejectOptions, setAcceptOrRejectOptions] = useState<string[]>([]);
  // const [rejectReasonOptions, setRejectReasonOptions] = useState<string[]>([]);
  // const [loading, setLoading] = useState(false); // tracks whether the robot suggestions are currently being calculated
  // const [showRobotSuggestions, setShowRobotSuggestions] = useState(false); // determines whether the robot's suggestion should be displayed on the transect image
  // const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  // const [numSubmitClicks, setNumSubmitClicks] = useState(0);
  // const [userFreeSelection, setUserFreeSelection] = useState(false);

  // const [objectives, setObjectives] = useState<number[]>([]); // stores objective(s) for each data collection step
  // const [objectivesRankings, setObjectivesRankings] = useState<number[]>([]); // stores priority ranking for each objective
  // const [objectiveFreeResponse, setObjectiveFreeResponse] = useState(""); // stores user's free response for the objective
  // const [acceptOrReject, setAcceptOrReject] = useState(0); // stores whether the user accepts or rejects the robot's suggestion at each step
  // const [rejectReason, setRejectReason] = useState(0); // stores why the user rejected the robot's suggestion at each step
  // const [rejectReasonFreeResponse, setRejectReasonFreeResponse] = useState(""); // stores user's free response for the reason for rejecting the robot's suggestion
  // const [transition, setTransition] = useState(0); // stores user's choice for the next data collection step
  // const [robotSuggestions, setRobotSuggestions] = useState<IRow[]>([]); // stores robot's suggested sample locations at each step
  // const [updatedHypoConfidence, setUpdatedHypoConfidence] = useState(0);

  const handleHypoResponse = (value: any) => {
    dispatch({ type: Action.SET_HYPO_CONFIDENCE, value: value });
  }

  // Reset objectives rankings array and disable submit button if the user has selected no objectives during the OBJECTIVE step
  useEffect(() => {
    if (userFeedbackState === UserFeedbackState.OBJECTIVE) {
      dispatch({ type: Action.SET_OBJECTIVES_RANKINGS, value: new Array(objectives.length).fill(0) });
      dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: objectives.length === 0 });
    }
  }, [objectives]);

  // Disable the submit button during the RANK_OBJECTIVES step until the user fills out a valid set of rankings for each selected objective
  useEffect(() => {
    if (userFeedbackState === UserFeedbackState.RANK_OBJECTIVES) {
      dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: objectivesRankings.includes(0) || (new Set(objectivesRankings)).size !== objectivesRankings.length });
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
        dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
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
                          dispatch({ type: Action.SET_OBJECTIVES_RANKINGS, value: objectivesRankingsTemp });
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
      <p><strong>Now choose the order in which you agree with each of the selected beliefs, with 1 being the strongest agreement. You must assign a unique number to each belief:</strong></p>
      {objectivesToRank}
    </div>

  const onObjectiveTextChange = e => {
    dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: e.target.value });
  }
  const objectiveFreeResponseQuestion = 
    <div className="objective-free-response-question" style={{marginBottom: '2vh'}}>
      <p><strong>Please describe your belief about the data collected so far:</strong></p>
      <textarea onChange={onObjectiveTextChange} rows={5} cols={85}/>
    </div>

  useEffect(() => {
    let acceptOrRejectTemp : string[] = robotSuggestions.map((suggestion, index) => "Accept suggested location " + String.fromCharCode(index + 65));
    acceptOrRejectTemp.push("Reject suggestions");
    dispatch({ type: Action.SET_ACCEPT_OR_REJECT_OPTIONS, value: acceptOrRejectTemp });
  }, [robotSuggestions]);
  
  const acceptOrRejectQuestions = 
    <div className="accept-or-reject-questions">
      <p><strong>Based on your belief rankings, RHex suggests sampling from one of the lettered locations marked on the dune cross-section above.</strong></p>
      <RadioButtonGroup options={acceptOrRejectOptions} selectedIndex={acceptOrReject} onChange={i => dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: i })} />
    </div>

  // Handler for setting the user's rating for how well the latest sample addressed the current objective
  const handleSliderChange = (event, newValue, index) => {
    if (typeof newValue === 'number') {
      dispatch({ type: Action.SET_OBJECTIVE_ADDRESSED_RATING, value: (newValue / 20 + 1) });
    }
  }

  // Reset the objectiveAddressedRating back to 0 whenever the objectives are changed
  useEffect(() => {
    dispatch({ type: Action.SET_OBJECTIVE_ADDRESSED_RATING, value: 0 });
  }, [objectives]);
  
  const marks = [
    { value: 0, label: '1' },
    { value: 20, label: '2' },
    { value: 40, label: '3' },
    { value: 60, label: '4' },
    { value: 80, label: '5' },
    { value: 100, label: '6' },
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
    </div>  

  useEffect(() => {
    let rejectReasonOptionsTemp = [
      "The suggested location did not address the beliefs I selected (", 
      "I rejected the suggested location for a different reason",
    ]
    for (let i = 0; i < objectives.length - 1; i++) {
      rejectReasonOptionsTemp[0] += objectiveOptions[objectives[i]] + " / ";
    }
    rejectReasonOptionsTemp[0] += (objectiveOptions[objectives[objectives.length - 1]] + ")");
    dispatch({ type: Action.SET_REJECT_REASON_OPTIONS, value: rejectReasonOptionsTemp });
  }, [objectives]);

  const rejectReasonQuestions = 
    <div className="reject-reason-questions">
      <p><strong>Why did you reject RHex's suggested locations?</strong></p>
      <RadioButtonGroup options={rejectReasonOptions} selectedIndex={rejectReason} onChange={i => dispatch({ type: Action.SET_REJECT_REASON_OPTIONS, value: i })} />
    </div>
  
  const onRejectReasonTextChange = e => {
    dispatch({ type: Action.SET_REJECT_REASON_FREE_RESPONSE, value: e.target.value });
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

  const updateHypothesisConfidence = 
  <div className="update-hypothesis-confidence">
    <div className="hypothesisBlock">
        <div className="hypothesisTitle"><strong>Updated Hypothesis Confidence</strong></div>
        <div className="hypothesisText">
          <div>
            Provide a new ranking of your certainty that this hypothesis will be supported or refuted. 
            If you have no preference, select "I am unsure":
          </div>
          <div>
            <i className="hypothesisStatement">
              Sand will be weakest and most dry at the dune crest. Strength will increase as moisture increases 
              (moving towards the interdune) until sand is saturated (somewhere along the stoss slope), at which 
              point strength will be constant as moisture continues to increase.
            </i>
          </div>
        </div>
        <FormControl>
            <Select
                style={{fontSize: '1.5vh'}}
                value={hypoConfidence + 3}
                onChange={event => handleHypoResponse(Number(event.target.value) - 3)}>
                {
                    confidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                }
            </Select>
        </FormControl>
    </div>
  </div>

  const transitionQuestions = 
    <div className="reject-reason-questions">
      <p><strong>What would you like to do next?</strong></p>
      <RadioButtonGroup 
        options={transitionOptions.slice((!userFreeSelection) ? 0 : 1)} 
        selectedIndex={transition} 
        onChange={i => dispatch({ type: Action.SET_TRANSITION, value: i })}/>
    </div>

  // Match the order of UserFeedbackStates in 'constants.ts'
  const userFeedbackStateMap = [
    objectiveQuestions,
    objectiveRankings,
    objectiveFreeResponseQuestion,
    acceptOrRejectQuestions,
    acceptFollowUpQuestions,
    rejectReasonQuestions,
    rejectReasonFreeResponseQuestion,
    userLocationSelectionQuestion,
    updateHypothesisConfidence,
    transitionQuestions,
  ]

  // useEffect(() => {
  //   console.log({robotSuggestions});
  // }, [robotSuggestions]);

  const onSubmit = async () => {
    console.log({globalState}); // for debugging
    dispatch({ type: Action.SET_NUM_SUBMIT_CLICKS, value: numSubmitClicks + 1 });
    switch (userFeedbackState) {
      case UserFeedbackState.OBJECTIVE: {
        if (objectives.length === 1) {
          if (objectives[0] === 4) {
            dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: "" });
            dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE });
          } else {
            dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });
            dispatch({ 
              type: Action.SET_ROBOT_SUGGESTIONS, 
              value: await calculateRobotSuggestions(samples, globalState, objectives, objectivesRankings) 
            });
            dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
            dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
            dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
            dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
          }
        } else {
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.RANK_OBJECTIVES });
        } 
        return;
      }
      case UserFeedbackState.RANK_OBJECTIVES: {
        if (objectives.includes(4) && objectivesRankings[objectives.indexOf(4)] === 1) {
          dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: "" });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE });
        } else {
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });
          dispatch({ 
            type: Action.SET_ROBOT_SUGGESTIONS, 
            value: await calculateRobotSuggestions(samples, globalState, objectives, objectivesRankings) 
          });
          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
        }
        return;
      }
      case UserFeedbackState.OBJECTIVE_FREE_RESPONSE: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
        dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        return;
      }
      case UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION: {
        if (acceptOrReject !== acceptOrRejectOptions.length - 1) {
          let robotSample = robotSuggestions[acceptOrReject]; 
          const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, robotSample.index, robotSample.measurements);
          let newSample : Sample = {...robotSample, shear: shearValues, moisture: moistureValues};
          dispatch({ type: Action.ADD_SAMPLE, value: newSample }); // add the new sample to the StateContext
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_FOLLOW_UP });
        } else {
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.REJECT_REASON });
        }
        dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
        return;
      }
      case UserFeedbackState.ACCEPT_FOLLOW_UP: {
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.HYPOTHESIS_CONFIDENCE });
        return;
      }
      case UserFeedbackState.REJECT_REASON: {
        if (rejectReason === 0) {
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
          dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        } else if (rejectReason === 1) {
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.REJECT_REASON_FREE_RESPONSE });
        }
        return;
      }
      case UserFeedbackState.REJECT_REASON_FREE_RESPONSE: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
        dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        return;
      }
      case UserFeedbackState.USER_LOCATION_SELECTION: {
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 }); // load the next Sample into the charts and strategy 
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.HYPOTHESIS_CONFIDENCE });
        return;
      }
      case UserFeedbackState.HYPOTHESIS_CONFIDENCE: {
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TRANSITION });
        return;
      }
      // FIX UP THE TRANSITION AND RESETTING OF THE CURRENT USER STEP
      case UserFeedbackState.TRANSITION: {
        let transitionAdj = (!userFreeSelection) ? transition : transition + 1;
        let newUserFeedbackState;
        console.log({transitionAdj});
        if (transitionAdj === 0) {
          console.log("Reached 0");
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });
          dispatch({ 
            type: Action.SET_ROBOT_SUGGESTIONS, 
            value: await calculateRobotSuggestions(samples, globalState, objectives, objectivesRankings) 
          });
          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          //dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
          newUserFeedbackState = UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION;
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
        } else if (transitionAdj === 1) {
          console.log("Reached 1");
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          //dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE });
          newUserFeedbackState = UserFeedbackState.OBJECTIVE;
        } else if (transitionAdj === 2) {
          console.log("Reached 2");
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
          //dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
          newUserFeedbackState = UserFeedbackState.USER_LOCATION_SELECTION;
          dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        } else if (transitionAdj === 3) {
          console.log("Reached 3");
          onConcludeClick();
        }

        if (transitionAdj !== 3) {
          updateUserSteps(); // Update userSteps and reset the currUserStep
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
      <Tooltip title={userFeedbackState !== UserFeedbackState.USER_LOCATION_SELECTION ? "" : <span style={clickableImageTipStyle}>{clickableImageTip}</span>} placement="bottom">
          <div className="clickableImageContainer">
            <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={(sample) => addDataToPlot(sample)} setPopOver={setImgAlert} />  
          </div>
      </Tooltip>
      {!loadingRobotSuggestions && <div className={numSubmitClicks === 0 ? "user-feedback-flashing" : "user-feedback"}>
        {userFeedbackStateMap[userFeedbackState]}
        <div className="submit-user-feedback-button">
          <Button disabled={disableSubmitButton} variant="contained" color="secondary" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>}
      {loadingRobotSuggestions && <div className="loading-screen">
        <div className="loading-section">
          <i>
            RHex is determining where to sample from next. This should take at most 5-10 seconds...
          </i>
        </div>
        <div className="loading-section">
          <CircularProgress 
            color="secondary"
            size={100}
          />
        </div>
      </div>}
      <div className="quit">
        <Button className="quitButton" variant="contained" color="primary" onClick={onConcludeClick}>
          End Collection At Transect
        </Button>
      </div>
    </div>
  );

  // Popup for displaying instructions on the decision page
  const [decisionHelpOpen, setDecisionHelpOpen] = useState(true);
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
