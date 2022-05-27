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
import { useStateValue, Action } from '../state';
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
    loadingRobotSuggestions, showRobotSuggestions, disableSubmitButton, numSubmitClicks, 
    imgClickEnabled, numImgClicks, transectIdx, } = globalState;

  const { step, userFeedbackState, objectives, objectiveFreeResponse, sampleType,
    robotSuggestions, spatialReward, variableReward, discrepancyReward, acceptOrRejectOptions, acceptOrReject, 
    rejectReasonOptions, rejectReason, rejectReasonFreeResponse, userFreeSelection, userSample, 
    hypoConfidence, transition } = currUserStep;

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
      const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, robotSuggestionFinal.index, robotSuggestionFinal.measurements);
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

  // Disable submit button if the user has selected no objectives during the OBJECTIVE step
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
    // Add option 0 and 1 by Zeyu 5/16/2022
    if (i === 0) {
      return (
      <span>There are areas along the dune transect where data is needed</span>
      );
    } else if (i === 1) {
      return (
      <span>There are portions of the dynamic range of the moisture variable where data is needed</span>
      );
    } else if (i === 2) {
      return (
        <span>There is a discrepancy between the data and the <span style={{color: 'blue', textDecorationLine: 'underline', cursor: 'pointer'}}><strong><a onClick={() => setHypothesisOpen(true)}>hypothesis</a></strong></span> that needs additional evaluation</span>
      );
    } else if (i === 3) {
      return (
        <span>
          The data seems to be supporting the <span style={{color: 'blue', textDecorationLine: 'underline', cursor: 'pointer'}}><strong><a onClick={() => setHypothesisOpen(true)}>hypothesis</a></strong></span> so far but additional evaluation is needed
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
  
  const acceptOrRejectQuestions = 
    <div className="accept-or-reject-questions">
      <p><strong>Based on your belief rankings, RHex suggests sampling from one of the lettered locations marked on the dune cross-section above.</strong></p>
      <RadioButtonGroup options={acceptOrRejectOptions} selectedIndex={acceptOrReject} onChange={i => {
        dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: i });
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
      }}/>
    </div>

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
      <textarea onChange={onRejectReasonTextChange} rows={5} cols={85}/>
    </div>

  const userLocationSelectionQuestion = 
    <div className="user-location_selection-question">
      <p><strong>Please select the next location you'd like to sample from by clicking anywhere along the transect surface in the dune cross-section above. When you have finalized your selection and are ready to collect data from that location, click "Submit."</strong></p>
    </div>

  // Hook for displaying hypothesis popup
  const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const decisionHypothesisDialog =
    <MultiStepDialog
      open={hypothesisOpen}
      setOpen={setHypothesisOpen}
      title={""}
      allowCancel={false}
      steps={[
        [
          "Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune crest. RHex is testing the hypothesis that strength will increase as moisture increases until sand is saturated (somewhere along the stoss slope), at which point strength will be constant as moisture continues to increase."
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

  const rankObjectives = () => {
    let objectivesTemp = [...objectives];
    objectivesTemp.sort((a, b) => (a.ranking > b.ranking) ? 1 : -1);
    return objectivesTemp;
  }

  const onSubmit = async () => {
    dispatch({ type: Action.SET_NUM_SUBMIT_CLICKS, value: numSubmitClicks + 1 });
    switch (userFeedbackState) {
      case UserFeedbackState.OBJECTIVE: {
        if (objectives.length === 1) {

          // Set the rank of the single objective to 1
          let objectivesTemp = [...objectives];
          objectivesTemp[0].ranking = 1;
          dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });

          if (objectives[0].objective === objectiveOptions[4]) {
            dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: "" });
            dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE });
          } else {
            
            dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });

            let robotResults = await calculateRobotSuggestions(samples, globalState, objectives);
            const { results, spatialReward, variableReward, discrepancyReward } = robotResults;
            dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
            dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
            dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
            dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: discrepancyReward });

            dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
            dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
            dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
            dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
          }
        } else {
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.RANK_OBJECTIVES });
        } 
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.RANK_OBJECTIVES: {
        // Order the objectives by ranking
        let objectivesTemp = rankObjectives();
        dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
        // Check if objectives contains free response option and if this option is ranked the highest
        let freeResponseRankedHighest = false; 
        for (let i = 0; i < objectives.length; i++) {
          if (objectives[i].objective === objectiveOptions[4] && objectives[i].ranking === 1) {
            freeResponseRankedHighest = true;
          }
        }
        if (freeResponseRankedHighest) {
          dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: "" });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE });
        } else {
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });

          let robotResults = await calculateRobotSuggestions(samples, globalState, objectivesTemp);
          const { results, spatialReward, variableReward, discrepancyReward } = robotResults;
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
          dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: discrepancyReward });

          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
        }
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.OBJECTIVE_FREE_RESPONSE: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
        dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION: {
        if (acceptOrReject !== acceptOrRejectOptions.length - 1) {
          let robotSample = robotSuggestions[acceptOrReject]; 
          const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, robotSample.index, robotSample.measurements);
          let newSample : Sample = {...robotSample, shear: shearValues, moisture: moistureValues};
          dispatch({ type: Action.ADD_SAMPLE, value: newSample }); // add the new sample to the StateContext
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_FOLLOW_UP });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'robot'});
        } else {
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.REJECT_REASON });
        }
        dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
        console.log({globalState}); // for debugging
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
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.REJECT_REASON_FREE_RESPONSE: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
        dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.USER_LOCATION_SELECTION: {
        dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 }); // load the next Sample into the charts and strategy 
        dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user'});
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.HYPOTHESIS_CONFIDENCE });
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.HYPOTHESIS_CONFIDENCE: {
        dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TRANSITION });
        dispatch({ type: Action.SET_TRANSITION, value: userFreeSelection ? 0 : 1 }); // Add this for transition adjustment by Zeyu 5/18/2022
        console.log({globalState}); // for debugging
        return;
      }
      case UserFeedbackState.TRANSITION: {
        let transitionAdj = (!userFreeSelection) ? transition : transition + 1;
        console.log({globalState, transitionAdj});
        // **Transition Adjustment** is used to align the transition options from transition variabite in constant.ts between 
        // userFreeSelection being true or false, and thus we can apply the same logic for the functions below - Zeyu & Steven 5/18/2022

        // Move to the next round with the same objectives as the previous round and automatically run
        // the robot calculation 

        // Move to the next round with the same objectives as the previous round and automatically run
        // the robot calculation 
        if (transitionAdj === 0) {
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });

          let robotResults = await calculateRobotSuggestions(samples, globalState, objectives);
          const { results, spatialReward, variableReward, discrepancyReward } = robotResults;
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
          dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: discrepancyReward });

          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION });
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: false });
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          
        // Move to the next round with the objectives reset and ask the user to reselect the objectives
        } else if (transitionAdj === 1) {
          dispatch({ type: Action.SET_OBJECTIVES, value: [] });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.OBJECTIVE });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: null});
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: [] });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: [] });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: [] });
          dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: [] });

        // Move to the next round enabling the user to freely select the next sample location
        } else if (transitionAdj === 2) {
          dispatch({ type: Action.SET_OBJECTIVES, value: [] });
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
          dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });// **Set the default opton pointing to "ignore" if the user selected it. - Zeyu & Steven 5/18/2022
          dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.USER_LOCATION_SELECTION });
          dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user'});
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: [] });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: [] });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: [] });
          dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: [] });

        // Bring up the quit screen
        } else if (transitionAdj === 3) {
          onConcludeClick();
        }

        // If the user selects any option besides the quit screen, then automatically add the data
        // from the current step to the finalized userSteps and reset some of the currUserStep data
        if (transitionAdj !== 3) {
          dispatch({ type: Action.SET_USER_STEP_IDX, value: step + 1});
          dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: ""});
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: -1 });
          dispatch({ type: Action.SET_REJECT_REASON, value: -1 });
          dispatch({ type: Action.SET_REJECT_REASON_FREE_RESPONSE, value: ""});
          dispatch({ type: Action.SET_USER_SAMPLE, value: null });
          dispatch({ type: Action.SET_TRANSITION, value: 1 }); // Set default option pointing to if the user didn't choose *ignore*. - Zeyu 5/18/2022
          // console.log("hello"); for debugging
          updateUserSteps();
        }
        console.log({globalState}); // for debugging
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
            <ClickableImage width={750} enabled={imgClickEnabled} addDataFunc={() => addDataToPlot()} setPopOver={setImgAlert} />  
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
        "The dune cross-section on the right displays the locations where RHex has already sampled and the charts on the left display the corresponding data.",
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
      { decisionHypothesisDialog }
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
