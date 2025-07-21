import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import PositionChart from "../components/PositionChart";
import {INDEX_LENGTH } from '../constants';

import HelpIcon from '@material-ui/icons/Help';
import { 
  FormControl, 
  Select, 
  MenuItem, 
  CircularProgress, 
  Box, 
  Slider, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Divider,
  Paper,
  Typography,
  Fab,
  Zoom,
  Tooltip
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import AssessmentIcon from '@material-ui/icons/Assessment';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import TimelineIcon from '@material-ui/icons/Timeline';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Popbox from '../components/Popbox';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import { getMeasurements, calculateRobotSuggestions} from '../util';
import {
  PopboxTypeEnum, confidenceTexts, NUM_OF_HYPOS,
  UserFeedbackState, objectiveOptions, transitionOptions,
} from '../constants';
import { useStateValue, Action } from '../state';
import ChartPanel from '../components/ChartPanel';
import "../styles/autonomous-decision.scss";
import { CurrUserStepData, UserStepsData, Sample, PreSample } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import RadioButtonGroup from '../components/RadioButtonGroup';
import RadioButtonGroupMultipleOptions from '../components/RadioButtonGroupMultipleOptions';
import { sampleRobotSuggestion } from '../sampleTemplates';

// Add new imports for icons
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import CommentIcon from '@material-ui/icons/Comment';
import ThumbsUpDownIcon from '@material-ui/icons/ThumbsUpDown';
import RoomIcon from '@material-ui/icons/Room';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';

// Extend PanelType enum
export enum PanelType {
  OBJECTIVE_QUESTIONS = 'objective_questions',
  OBJECTIVE_RANKINGS = 'objective_rankings',
  OBJECTIVE_FREE_RESPONSE = 'objective_free_response',
  ACCEPT_REJECT = 'accept_reject',
  USER_LOCATION = 'user_location',
  HYPOTHESIS_CONFIDENCE = 'hypothesis_confidence',
  SETTINGS = 'settings'
}

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

export default function AutonomousDecision() {
  const [showImgAlert, setImgAlert] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<PanelType>(PanelType.SETTINGS);
  const [globalState, dispatch] = useStateValue();
  const [draftStrength, setDraftStrength] = useState("");
  const [draftLocation, setDraftLocation] = useState("");

  const { currSampleIdx, samples, currUserStep, userSteps, chart, chartSettings, 
    loadingRobotSuggestions, showRobotSuggestions, disableSubmitButton, numSubmitClicks, 
    imgClickEnabled, numImgClicks, transectIdx, } = globalState;

  const { step, userFeedbackState, objectives, objectiveFreeResponse, sampleType,
    robotSuggestions, spatialReward, variableReward, discrepancyReward, acceptOrRejectOptions, acceptOrReject, 
    acceptOrRejectFreeResponse, rejectReasonOptions, rejectReason, rejectReasonFreeResponse, userFreeSelection, 
    userSample, hypoConfidence, transition } = currUserStep;

  const history = useHistory();

  // Autonomous state
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [autonomousData, setAutonomousData] = useState<Array<{location: number, strength: number, timestamp: number}>>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [waitingForHumanInput, setWaitingForHumanInput] = useState(true);

  // Add local state for input values
  const [inputStrength, setInputStrength] = useState("");
  const [inputLocation, setInputLocation] = useState("");

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
  const addDataToPlot = () => {
    dispatch({ type: Action.SET_CURR_SAMPLE_IDX, value: currSampleIdx + 1 });
    dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} });
  }

  // Automatically populate the charts with any remaining measurements from the transectSamples in the strategy (if the image hasn't been clicked)
  if (currSampleIdx < samples.length && numImgClicks === 0) {
    addDataToPlot();
  }

  // Function to add the latest user step data to the finalized set of userSteps 
  const updateUserSteps = () => {
    let acceptedRobotSuggestion;
    if (acceptOrReject !== -1 && acceptOrReject !== acceptOrRejectOptions.length - 1) {
      let robotSuggestionFinal = robotSuggestions[acceptOrReject]; 
      let shearValues = -1
      let moistureValues = -1
      acceptedRobotSuggestion = {...robotSuggestionFinal, shear: shearValues, moisture: moistureValues};
    }
    let transitionAdj = (!userFreeSelection) ? transition : transition + 1;
    let newUserStep : UserStepsData = {
      step: step, 
      objectives: JSON.parse(JSON.stringify(objectives)),  
      objectiveFreeResponse: objectiveFreeResponse, 
      sampleType: sampleType,
      robotSuggestions: robotSuggestions,
      acceptOrReject: acceptOrReject === -1 ? null : acceptOrRejectOptions[acceptOrReject], 
      acceptedRobotSuggestion: (acceptOrReject !== -1 && acceptOrReject !== acceptOrRejectOptions.length - 1) ? acceptedRobotSuggestion : null,
      acceptOrRejectFreeResponse: acceptOrRejectFreeResponse,
      rejectReason: rejectReason === -1 ? null : rejectReasonOptions[rejectReason], 
      rejectReasonFreeResponse: rejectReasonFreeResponse, 
      userFreeSample: userSample,
      hypoConfidence: confidenceTexts[hypoConfidence + 3],
      samples: JSON.parse(JSON.stringify(samples)),
      transition: transitionOptions[transitionAdj],
      spatialReward: spatialReward, 
      variableReward: variableReward, 
      discrepancyReward: discrepancyReward,
    }
    dispatch({ type: Action.ADD_USER_STEP, value: newUserStep }); 
  }

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(true);

  const onConcludeClick = () => {
      setConfirmConcludeOpen(true);
  };

  const onQuit = () => {
    updateUserSteps(); // Update userSteps 
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

  const handleHypoResponse = (value: any) => {
    dispatch({ type: Action.SET_HYPO_CONFIDENCE, value: value });
  }
  //Disable submit button if the user has selected no objectives during the OBJECTIVE step
  useEffect(() => {
    if (userFeedbackState === UserFeedbackState.OBJECTIVE) {
      dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: objectives.length === 0 });
    }
  }, [objectives]);

  // In the RANK_OBJECTIVES step, automatically disable the submit button until the user fills out a valid set of rankings for each selected objective
  useEffect(() => {
    if (userFeedbackState === UserFeedbackState.RANK_OBJECTIVES) {

      let objectivesRankings : number[] = [];
      let disable = false;
      for (let i = 0; i < objectives.length; i++) {
        if (objectives[i].ranking === -1 || objectivesRankings.includes(objectives[i].ranking)) {
          disable = true;
          break;
        } else {
          objectivesRankings.push(objectives[i].ranking);
        }
      }
      dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: disable });
    }
  }, [objectives]);


  const searchObjective = (target : string) => {
    for (let obj = 0; obj < objectives.length; obj++) {
      if (objectives[obj].objective === target) {
        return true;
      }
    }
    return false;
  }

  let objectiveOptionsLinked = objectiveOptions.map((obj, i) => {
    if (i === 1) {
      return (
        <span>
            There is a discrepancy between the strength data and the <span style={{color: 'blue', textDecorationLine: 'underline', cursor: 'pointer'}}><strong><a onClick={() => setHypothesisOpen(true)}>strength hypothesis</a></strong></span> that needs additional evaluation
        </span>
      );
    } else if (i === 2) {
      return (
        <span>
          The strength data seems to be supporting the <span style={{color: 'blue', textDecorationLine: 'underline', cursor: 'pointer'}}><strong><a onClick={() => setHypothesisOpen(true)}>strength hypothesis</a></strong></span> so far but additional evaluation is needed
        </span>
      );
    } else {
      return <span>{obj}</span>;
    }
  });
  
  const objectiveQuestions = 
    <div className="objective-questions">
      <p><strong>Based on the data collected so far, select which of the following beliefs you currently hold (you may select multiple).</strong></p>
      <RadioButtonGroupMultipleOptions options={objectiveOptionsLinked} searchObjective={(target) => searchObjective(target)} onChange={i => {
        let objectivesTemp = [...objectives];
        if (searchObjective(objectiveOptions[i])) {
          objectivesTemp = objectivesTemp.filter(obj => obj.objective !== objectiveOptions[i]);
        } else {
          let newObjective = {
            objective: objectiveOptions[i],
            ranking: -1,
            addressedRating: 1
          };
          objectivesTemp.push(newObjective);
        }
        dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
      }}/>
    </div>

  const objectivesToRank = 
    <table className="dropDownMenuGroup" style={{marginBottom: '2vh'}}>
      <tbody>
          {
            objectives.map((obj, i) => (
                <tr key={obj.objective}>
                  <td>
                    <FormControl>
                      <Select
                        id="objectives-select"
                        value={obj.ranking}
                        onChange={(e) => {
                          let objectivesTemp = [...objectives];
                          if (typeof e.target.value === 'number') objectivesTemp[i].ranking = e.target.value;
                          dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
                        }}
                      >
                        {Array.from({length: objectives.length}, (_, i) => i + 1).map((rank) => (
                          <MenuItem key={obj.objective + rank} value={rank}>{rank}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                      { obj.objective }
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
  
  const onAcceptOrRejectTextChange = e => {
    console.log("acceptOrRejectFreeResponse: ", e.target.value)
    dispatch({ type: Action.SET_ACCEPT_OR_REJECT_FREE_RESPONSE, value: e.target.value });
  }

  const acceptOrRejectQuestions = 
    <div className="accept-or-reject-questions">
      <p><strong>Based on your belief rankings, RHex suggests sampling from one of the lettered locations marked on the dune cross-section above.</strong></p>
      <RadioButtonGroup options={acceptOrRejectOptions} selectedIndex={acceptOrReject} onChange={i => {
        dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: i });
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
      }}/>
      <div className="accept-or-reject-free-response-question" style={{ marginTop: '-15px'}}>
        <p style={{ marginBottom: '-12px' }}><strong>Impressions about suggested locations (optional):</strong></p>
        <p>
          <i><small>
          Ranking system
          <br />
          +2 (what I would do or should have thought of)
          <br />
          +1 (similar to what I would do)
          <br />
          0 (neither good nor bad suggestion)
          <br />
          -1 (if a human did this, I would question them)
          <br />
          -2 (no human would do this)
          </small></i>
        </p>
        <textarea style={{ marginTop: '-3px', marginBottom: '5px' }} onChange={onAcceptOrRejectTextChange} rows={5} cols={75}/>
      </div>
    </div>

  // Update input handlers to use local state
  const onStrengthDataChange = e1 => {
    setInputStrength(e1.target.value);
    dispatch({ type: Action.SET_USER_STRENGTH_DATA, value: e1.target.value });
  };
  const onLocationDataChange = e2 => {
    setInputLocation(e2.target.value);
    dispatch({ type: Action.SET_USER_LOCATION_DATA, value: e2.target.value });
  };

  // Submit data collection (for when running)
  const onSubmitDataCollection = async () => {
    const { userStrengthData, userLocationData } = globalState;
    const stringStrengthData = String(userStrengthData);
    var splittedStrength = stringStrengthData.split(" ");
    const strengthNumArr = splittedStrength.map(Number);
    const newLocationData = Number(userLocationData);

    // 1. Add the sample at the user-typed location (adds a circle to the chart)
    const newSample: Sample = {
      index: newLocationData,
      type: 'user',
      measurements: 1,
      normOffsetX: 800,
      normOffsetY: 200,
      isHovered: false,
      moisture: [13],
      shear: strengthNumArr
    };
    dispatch({ type: Action.ADD_SAMPLE, value: newSample });
    dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user' });
    dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });

    // 2. Generate a new robot suggestion (triangle for next round)
    // Wait for the sample to be added before generating new suggestion
    setTimeout(async () => {
      let robotResults = await calculateRobotSuggestions(
        [...samples, newSample], // use the updated samples array
        { ...globalState, samples: [...samples, newSample] },
        objectives
      );
      const { results, spatialReward, variableReward, discrepancyReward } = robotResults;
      dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
      dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
      dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
      dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: discrepancyReward });
    }, 0);

    // 3. Move to next step and reset panel for next round
    dispatch({ type: Action.SET_USER_STEP_IDX, value: step + 1 });
    updateUserSteps();
    dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: "" });
    dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: -1 });
    dispatch({ type: Action.SET_REJECT_REASON, value: -1 });
    dispatch({ type: Action.SET_REJECT_REASON_FREE_RESPONSE, value: "" });
    dispatch({ type: Action.SET_USER_SAMPLE, value: null });
    setCurrentStep(prev => prev + 1);
    // Optionally clear input fields if using local state
    setInputStrength("");
    setInputLocation("");
    console.log({ globalState });
  };

  const objectivesPanel = (
    <div className="objectives-panel">
      <Typography variant="h6" gutterBottom>
        Objectives & Beliefs
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Current objectives: {objectives.length}
      </Typography>
      {objectives.map((obj, index) => (
        <Typography key={index} variant="body2">
          {index + 1}. {obj.objective}
        </Typography>
      ))}
    </div>
  );

  const suggestionsPanel = (
    <div className="suggestions-panel">
      <Typography variant="h6" gutterBottom>
        AI Suggestions
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Robot suggestions: {robotSuggestions.length}
      </Typography>
      {robotSuggestions.map((suggestion, index) => (
        <Typography key={index} variant="body2">
          Suggestion {index + 1}: Location {suggestion.index.toFixed(2)}
        </Typography>
      ))}
    </div>
  );

  const analysisPanel = (
    <div className="analysis-panel">
      <Typography variant="h6" gutterBottom>
        Data Analysis
      </Typography>
      <Typography variant="body2">
        Samples collected: {samples.length}
      </Typography>
      <Typography variant="body2">
        Current step: {step}
      </Typography>
      <Typography variant="body2">
        Hypothesis confidence: {confidenceTexts[hypoConfidence + 3]}
      </Typography>
    </div>
  );


  let suggestedLocation = robotSuggestions && robotSuggestions.length > 0
      ? robotSuggestions[0].index.toFixed(2)
      : '--';
  // --- Panel JSX Definitions (top-level, outside render) ---
  const getDataCollectionPanel = (onStrengthDataChange, onLocationDataChange, onSubmitDataCollection) => (
    <div className="data-collection-panel">
      <div style={{
          background: '#e3f2fd',
          color: '#1565c0',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          marginBottom: 16,
          fontSize: 16,
          // Remove display: flex, alignItems, gap
        }}>
          <span role="img" aria-label="robot" style={{marginRight: 8}}>🤖</span>
          Based on the current status, the robot suggests going to location
          <span style={{color: 'red', fontWeight: 700, margin: '0 4px'}}>{suggestedLocation}</span>, and the robot is going to that location to take data now.
        </div>
      <div className="data-input-section">
        <div className="input-group">
          <Typography variant="body2" gutterBottom>
            <strong>Enter 1 strength data</strong>
          </Typography>
          <textarea
            placeholder="e.g., 3"
            id="latestStrength1"
            name="latestStrength1"
            onChange={onStrengthDataChange}
            rows={3}
            cols={40}
            className="data-input"
            value={inputStrength}
          />
        </div>
        <div className="input-group">
          <Typography variant="body2" gutterBottom>
            <strong>Enter location (0-1):</strong>
          </Typography>
          <textarea
            placeholder="e.g., 0.5"
            id="latestLocation"
            name="latestLocation"
            onChange={onLocationDataChange}
            rows={3}
            cols={40}
            className="data-input"
            value={inputLocation}
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmitDataCollection}
          style={{ marginTop: 20 }}
          fullWidth
        >
          Submit Data
        </Button>
      </div>
    </div>
  );

  const getPausedPanel = () => (
    <div className="settings-panel">
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>
    <div style={{
        background: '#e3f2fd',
        color: '#1565c0',
        padding: '10px 16px',
        borderRadius: '6px',
        fontWeight: 600,
        marginBottom: 16,
        fontSize: 16,
      }}>
        <span role="img" aria-label="robot" style={{marginRight: 8}}>🤖</span>
        <span>
          The robot is <span style={{ color: '#6a1b9a', fontWeight: 700 }}>interrupted</span>. You can choose one of the three features on the right toolbar to <span style={{ color: '#1976d2', fontWeight: 700 }}>update objectives</span>, <span style={{ color: '#1976d2', fontWeight: 700 }}>update locations</span>, or <span style={{ color: '#1976d2', fontWeight: 700 }}>update hypothesis</span>.
        </span>
     </div>
      
      <Button
        variant="outlined"
        onClick={() => dispatch({ type: Action.SET_CHART_SETTINGS, value: {...chartSettings, updateRequired: true} })}
        style={{ marginBottom: 10 }}
        fullWidth
      >
        Refresh Charts
      </Button>
      <Button
        variant="outlined"
        onClick={() => dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: !showRobotSuggestions })}
        style={{ marginBottom: 10 }}
        fullWidth
      >
        {showRobotSuggestions ? "Hide" : "Show"} Robot Suggestions
      </Button>
    </div>
  );

  // Handler for setting the user's rating for how well the latest sample addressed the current objective
  const handleSliderChange = (event, newValue, index) => {
    if (typeof newValue === 'number') {
      let objectivesTemp = [...objectives];
      objectivesTemp[index].addressedRating = newValue / 20 + 1;
      dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
    }
  }

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
      <p><strong>Rate the extent to which going to this location addressed each of the following beliefs (1 - Unsure, 
        2 - Did not address, 3 - Barely addressed, 4 - Somewhat addressed, 5 - Moderately addressed, 6 - Definitely 
        addressed):</strong></p>
      { objectives.map((obj, index) => (
        <div key={obj.objective.slice(0, 10) + index}>
          <p><i><strong>Belief #{index + 1}:</strong> {obj.objective}</i></p>
          <div className="slider-box">
            <Box>
              <Slider
                aria-label="Restricted values"
                value={(obj.addressedRating - 1) * 20}
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
      rejectReasonOptionsTemp[0] += objectives[i].objective + " / ";
    }
    if (objectives.length >= 1) rejectReasonOptionsTemp[0] += (objectives[objectives.length - 1].objective + ")");
    dispatch({ type: Action.SET_REJECT_REASON_OPTIONS, value: rejectReasonOptionsTemp });
  }, [objectives]);

  const rejectReasonQuestions = 
    <div className="reject-reason-questions">
      <p><strong>Why did you reject RHex's suggested locations?</strong></p>
      <RadioButtonGroup options={rejectReasonOptions} selectedIndex={rejectReason} onChange={i => dispatch({ type: Action.SET_REJECT_REASON, value: i })} />
    </div>
  
  const onRejectReasonTextChange = e => {
    dispatch({ type: Action.SET_REJECT_REASON_FREE_RESPONSE, value: e.target.value });
  }

  const rejectReasonFreeResponseQuestion = 
    <div className="reject-reason-free-response-question" style={{marginBottom: '2vh'}}>
      <p><strong>Please state your reason for rejecting the suggestion:</strong></p>
      <textarea onChange={onRejectReasonTextChange} rows={5} cols={75}/>
    </div>

  const userLocationSelectionQuestion = 
    <div className="user-location_selection-question">
      <p><strong>Please select the next location you'd like to sample from by clicking anywhere along the transect surface in the dune cross-section above. When you have finalized your selection and are ready to collect data from that location, click "Submit."</strong></p>
    </div>

  // Hook for displaying hypothesis popup
  const singleTransectNullHypothesis = require('../../assets/John Ruck Strength Hypothesis.png');
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const decisionHypothesisDialog =
    <MultiStepDialog
      open={hypothesisOpen}
      setOpen={setHypothesisOpen}
      title={""}
      allowCancel={false}
      steps={[
        [
          ""
        ]
      ]}
      img={singleTransectNullHypothesis}
    />;

  const updateHypothesisConfidence = 
  <div className="update-hypothesis-confidence">
    <div className="hypothesisBlock">
        <div className="hypothesisTitle"><strong>Updated Hypothesis Confidence</strong></div>
        <div className="hypothesisText">
          <div>
            Provide a new ranking of your certainty that the <span style={{color: 'blue', textDecorationLine: 'underline', cursor: 'pointer'}}><strong><a onClick={() => setHypothesisOpen(true)}>hypothesis</a></strong></span> will be supported or refuted. 
            If you have no preference, select "I am unsure":
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
  // Autonomous control functions
  const handlePause = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    onConcludeClick();
  };


  // --- Stable Panel JSX Definitions ---
  
  // Combined objectives selection, ranking, free response, and reject reason panel
  const objectivesCombinedPanel = (
    <div className="objectives-panel">
      <Typography variant="h6" gutterBottom>
        Objectives & Beliefs
      </Typography>
      {/* Selection UI */}
      <div style={{ marginBottom: 16 }}>
        <p><strong>Based on the data collected so far, select which of the following beliefs you currently hold (you may select multiple).</strong></p>
        <RadioButtonGroupMultipleOptions
          options={objectiveOptionsLinked}
          searchObjective={searchObjective}
          onChange={i => {
            let objectivesTemp = [...objectives];
            if (searchObjective(objectiveOptions[i])) {
              objectivesTemp = objectivesTemp.filter(obj => obj.objective !== objectiveOptions[i]);
            } else {
              let newObjective = {
                objective: objectiveOptions[i],
                ranking: -1,
                addressedRating: 1
              };
              objectivesTemp.push(newObjective);
            }
            dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
          }}
        />
      </div>
      {/* Ranking UI (only if more than one objective selected) */}
      {objectives.length > 1 && (
        <div>
          <p><strong>Now choose the order in which you agree with each of the selected beliefs, with 1 being the strongest agreement. You must assign a unique number to each belief:</strong></p>
          <table className="dropDownMenuGroup" style={{marginBottom: '2vh'}}>
            <tbody>
              {objectives.map((obj, i) => (
                <tr key={obj.objective}>
                  <td>
                    <FormControl>
                      <Select
                        id="objectives-select"
                        value={obj.ranking}
                        onChange={(e) => {
                          let objectivesTemp = [...objectives];
                          if (typeof e.target.value === 'number') objectivesTemp[i].ranking = e.target.value;
                          dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
                        }}
                      >
                        {Array.from({length: objectives.length}, (_, i) => i + 1).map((rank) => (
                          <MenuItem key={obj.objective + rank} value={rank}>{rank}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </td>
                  <td>
                    {obj.objective}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Free response UI */}
      <div className="objective-free-response-question" style={{marginBottom: '2vh'}}>
        <p><strong>Please describe your belief about the data collected so far:</strong></p>
        <textarea onChange={onObjectiveTextChange} rows={5} cols={85}/>
      </div>
      {/* Reject reason UI */}
      {rejectReasonQuestions}
    </div>
  );

  // Update panelMap
  const panelMap = {
    [PanelType.OBJECTIVE_QUESTIONS]: objectivesCombinedPanel,
    [PanelType.ACCEPT_REJECT]: acceptOrRejectQuestions,
    [PanelType.USER_LOCATION]: userLocationSelectionQuestion,
    [PanelType.HYPOTHESIS_CONFIDENCE]: updateHypothesisConfidence,

  };

  // Center Panel Component (shown when running or paused)
  const CenterPanel = () => {
    if (isRunning) return getDataCollectionPanel(onStrengthDataChange, onLocationDataChange, onSubmitDataCollection);
    if (isPaused) return panelMap[currentPanel] || <div>Select a panel</div>;
    return null;
  };

  // Floating Action Buttons for panel navigation (shown when paused)
  const PanelNavigation = () => (
    <div className="panel-navigation">
      <Tooltip title="Update Objectives" placement="left">
        <Fab size="small" color={currentPanel === PanelType.OBJECTIVE_QUESTIONS ? "primary" : "default"} onClick={() => setCurrentPanel(PanelType.OBJECTIVE_QUESTIONS)} className="panel-fab">
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>
      {/* Objective Free Response panel removed from navigation */}
      {/* Accept/Reject panel removed from navigation */}
      <Tooltip title="Update Locations" placement="left">
        <Fab size="small" color={currentPanel === PanelType.USER_LOCATION ? "primary" : "default"} onClick={() => setCurrentPanel(PanelType.USER_LOCATION)} className="panel-fab">
          <RoomIcon />
        </Fab>
      </Tooltip>
      <Tooltip title="Update Hypothesis" placement="left">
        <Fab size="small" color={currentPanel === PanelType.HYPOTHESIS_CONFIDENCE ? "primary" : "default"} onClick={() => setCurrentPanel(PanelType.HYPOTHESIS_CONFIDENCE)} className="panel-fab">
          <EmojiObjectsIcon />
        </Fab>
      </Tooltip>
      <Tooltip title="Settings" placement="left">
        <Fab size="small" color={currentPanel === PanelType.SETTINGS ? "primary" : "default"} onClick={() => setCurrentPanel(PanelType.SETTINGS)} className="panel-fab">
          <SettingsIcon />
        </Fab>
      </Tooltip>
    </div>
  );

  const clickableImageTip = "Please select a location on the transect to sample from between the crest and interdune";
  const clickableImageTipStyle = {
      fontSize: '12px'
  }

  // Main content area with center panel integrated
  const mainContent = (
    <div className="mainContent">
      <ImgAlert open={!!showImgAlert} />
      <Tooltip title={userFeedbackState !== UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA ? "" : <span style={clickableImageTipStyle}>{clickableImageTip}</span>} placement="bottom">
          <div className="clickableImageContainer">
            <ClickableImage width={600} enabled={imgClickEnabled} addDataFunc={() => addDataToPlot()} setPopOver={setImgAlert} />  
          </div>
      </Tooltip>
      
      {loadingRobotSuggestions && (
        <div className="loading-screen">
          <div className="loading-section">
            <i>
              System is processing. This should take at most 5-10 seconds...
            </i>
          </div>
          <div className="loading-section">
            <CircularProgress color="secondary" size={100} />
          </div>
        </div>
      )}
      
      {/* Show center panel content when running OR when paused with navigation */}
      {(isRunning || isPaused) && (
        <div className={`center-panel-container ${(isRunning) ? 'centered' : 'left-aligned'}`}>
          {console.log('Panel CSS class:', (isRunning) ? 'centered' : 'left-aligned')}
          
          {/* Show panel navigation only when paused */}
          {isPaused && (
            <div className={`panel-navigation`}>
              <PanelNavigation />
            </div>
          )}
          
          <Paper
            className={`center-panel ${isPaused ? 'paused' : ''}`}
            elevation={3}
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1.5px solid #e0e0e0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1.5px 4px rgba(0,0,0,0.08)'
            }}
          >
            {isRunning ? getDataCollectionPanel(onStrengthDataChange, onLocationDataChange, onSubmitDataCollection)
              : isPaused && currentPanel === PanelType.SETTINGS ? getPausedPanel()
              : panelMap[currentPanel] || <div>Select a panel</div>}
          </Paper>
        </div>
      )}
      
      <div className="quit">
        <Button className="quitButton" variant="contained" color="primary" onClick={onConcludeClick}>
          End Collection At Transect
        </Button>
      </div>
    </div>
  );

  // Popup for displaying instructions
  const [helpOpen, setHelpOpen] = useState(false);
  const helpDialog =
    <MultiStepDialog
      open={helpOpen}
      setOpen={setHelpOpen}
      title={""}
      allowCancel={false}
      steps={[
        ["This is the hybrid autonomous-manual decision-making interface.",
        "When the robot is running autonomously, you can pause it to take manual control.",
        "Use the floating buttons on the right to access different panels when paused.",
        "The system will guide you through the data collection process step by step."
        ]
      ]}
    />;

  function Helper() {
    const onClick = () => {
      setHelpOpen(true);
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

  // Prefill the location input box with the suggested location
  useEffect(() => {
    if (robotSuggestions && robotSuggestions.length > 0) {
      setInputLocation(robotSuggestions[0].index.toFixed(2));
      dispatch({ type: Action.SET_USER_LOCATION_DATA, value: robotSuggestions[0].index.toFixed(2) });
    }
  }, [robotSuggestions]);

  return (
    <div id="app" className="autonomousDecisionPage">
      { helperOpen && <Helper /> }
      { helpDialog }

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

      {/* Top Control Bar */}
      <AppBar position="static" className="control-bar">
        <Toolbar>
          <Typography variant="h6" className="title">
            Autonomous Data Collection Mode
            <span className={`status-indicator ${isRunning ? 'waiting' : 'paused'}`}>
              {isRunning ? 'WAITING FOR INPUT' : 'PAUSED'}
            </span>
          </Typography>
          
          <div className="status-info">
            <Typography variant="body2">
              Samples: {samples.length} | Step: {currentStep}
            </Typography>
          </div>
          
          <div className="control-buttons">
            <IconButton color="inherit" className="settings-button">
              <SettingsIcon />
            </IconButton>
            
            {isRunning ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePause}
                className="control-button"
              >
                <PauseIcon style={{ marginRight: 8 }} />
                PAUSE
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleResume}
                className="control-button"
              >
                <PlayArrowIcon style={{ marginRight: 8 }} />
                RESUME
              </Button>
            )}
            
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStop}
              className="control-button"
            >
              <StopIcon style={{ marginRight: 8 }} />
              STOP
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      <Grid container>
        <Grid container>
          <Grid item xs={12} md={6}>
            <ChartPanel fullSize={true} mode={"TransectView"}/>
          </Grid>
          
          <Grid item xs={12} md={6} className="rightDecisionPanel">
            <div className="rightDecisionPanelContainer">
              { mainContent }
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
} 