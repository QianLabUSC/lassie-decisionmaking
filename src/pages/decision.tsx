import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Tab, Tabs } from '@material-ui/core';

import PositionChart from '../components/PositionChart';
import { INDEX_LENGTH } from '../constants';

import HelpIcon from '@material-ui/icons/Help';
import {
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Slider,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@material-ui/core';

import Popbox from '../components/Popbox';
import ClickableImage from '../components/ClickableImage';
import { ConfirmDialog, MultiStepDialog } from '../components/Dialogs';
import {
  getMeasurements,
  calculateRobotSuggestions,
  commandRobotCollectData,
} from '../util';

import { firstApiGetThreePaths } from '../ApiCalls/first_api_get_three_paths';

import {
  PopboxTypeEnum,
  confidenceTexts,
  NUM_OF_HYPOS,
  UserFeedbackState,
  objectiveOptions,
  transitionOptions,
} from '../constants';
import { useStateValue, Action } from '../state';
import ChartPanel from '../components/ChartPanel';
import '../styles/decision.scss';
import { CurrUserStepData, UserStepsData, Sample, PreSample } from '../types';
import { initializeCharts } from '../handlers/ChartHandler';
import RadioButtonGroup from '../components/RadioButtonGroup';
import RadioButtonGroupMultipleOptions from '../components/RadioButtonGroupMultipleOptions';
import { sampleRobotSuggestion } from '../sampleTemplates';
import Tooltip from '@material-ui/core/Tooltip';
import createBreakpoints from '@material-ui/core/styles/createBreakpoints';
import RobotChart from '../components/RobotChart';
import MoistureStressScatterPlot from '../components/Charts/MositureStressScatterPlot';
import MoistureHeatMap from '../components/Charts/MoistureHeatMap';
import ShearVsMoisturePlot from '../components/Charts/ShearVsMoisturePlot';

import DiscrepancyChart from '../components/Charts/Discrepancy';
function ImgAlert({ open }) {
  return (
    <Popbox
      open={open}
      type={PopboxTypeEnum.ERROR}
      anchorEl={() => document.getElementById('pos-picker')}
    >
      Please click near the surface of stoss slope!
    </Popbox>
  );
}

export default function Main() {
  const [selectedBelief, setSelectedBelief] = useState('');
  const [userBeliefText, setUserBeliefText] = useState('');

  const [showImgAlert, setImgAlert] = useState(false);
  const [globalState, dispatch] = useStateValue();

  const {
    currSampleIdx,
    samples,
    currUserStep,
    userSteps,
    chart,
    chartSettings,
    loadingRobotSuggestions,
    showRobotSuggestions,
    disableSubmitButton,
    numSubmitClicks,
    imgClickEnabled,
    numImgClicks,
    transectIdx,
    initial_human_belief,
  } = globalState;

  console.log('initial_human_belief', initial_human_belief);
  console.log('currSampleIdx', currSampleIdx);
  const {
    step,
    userFeedbackState,
    objectives,
    objectiveFreeResponse,
    sampleType,
    robotSuggestions,
    spatialReward,
    variableReward,
    discrepancyReward,
    acceptOrRejectOptions,
    acceptOrReject,
    acceptOrRejectFreeResponse,
    rejectReasonOptions,
    rejectReason,
    rejectReasonFreeResponse,
    userFreeSelection,
    userSample,
    hypoConfidence,
    transition,
  } = currUserStep;

  const history = useHistory();

  // Function to add next sample to the data plot
  const addDataToPlot = () => {
    dispatch({ type: Action.SET_CURR_SAMPLE_IDX, value: currSampleIdx + 1 });
    dispatch({
      type: Action.SET_CHART_SETTINGS,
      value: { ...chartSettings, updateRequired: true },
    });
  };

  // Automatically populate the charts with any remaining measurements from the transectSamples in the strategy (if the image hasn't been clicked)
  if (currSampleIdx < samples.length && numImgClicks === 0) {
    addDataToPlot();
  }

  // Function to add the latest user step data to the finalized set of userSteps
  const updateUserSteps = () => {
    let acceptedRobotSuggestion;
    if (
      acceptOrReject !== -1 &&
      acceptOrReject !== acceptOrRejectOptions.length - 1
    ) {
      const robotSuggestionFinal = robotSuggestions[acceptOrReject];
      // const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, robotSuggestionFinal.index, robotSuggestionFinal.measurements);
      const shearValues = -1;
      const moistureValues = -1;
      acceptedRobotSuggestion = {
        ...robotSuggestionFinal,
        shear: shearValues,
        moisture: moistureValues,
      };
    }
    const transitionAdj = !userFreeSelection ? transition : transition + 1;
    const newUserStep: UserStepsData = {
      step: step,
      objectives: JSON.parse(JSON.stringify(objectives)),
      objectiveFreeResponse: objectiveFreeResponse,
      sampleType: sampleType,
      robotSuggestions: robotSuggestions,
      acceptOrReject:
        acceptOrReject === -1 ? null : acceptOrRejectOptions[acceptOrReject],
      acceptedRobotSuggestion:
        acceptOrReject !== -1 &&
        acceptOrReject !== acceptOrRejectOptions.length - 1
          ? acceptedRobotSuggestion
          : null,
      acceptOrRejectFreeResponse: acceptOrRejectFreeResponse,
      rejectReason:
        rejectReason === -1 ? null : rejectReasonOptions[rejectReason],
      rejectReasonFreeResponse: rejectReasonFreeResponse,
      userFreeSample: userSample,
      hypoConfidence: confidenceTexts[hypoConfidence + 3],
      samples: JSON.parse(JSON.stringify(samples)),
      transition: transitionOptions[transitionAdj],
      spatialReward: spatialReward,
      variableReward: variableReward,
      discrepancyReward: discrepancyReward,
    };
    dispatch({ type: Action.ADD_USER_STEP, value: newUserStep });
  };

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);
  const [helperOpen, setHelperOpen] = useState(true);

  const onConcludeClick = () => {
    setConfirmConcludeOpen(true);
  };

  const onQuit = () => {
    updateUserSteps(); // Update userSteps
    if (chart) {
      Object.values(chart).forEach((c) => {
        if (!c) return;
        c.data.datasets.forEach((dataset) => {
          dataset.data = [];
        });
        c.update();
        c.clear();
      });
    }
    history.push('/conclusion');
    console.log({ globalState });
  };

  const handleHypoResponse = (value: any) => {
    dispatch({ type: Action.SET_HYPO_CONFIDENCE, value: value });
  };

  const searchObjective = (target: string) => {
    console.log('target123', target);
    for (let obj = 0; obj < objectives.length; obj++) {
      if (objectives[obj].objective === target) {
        return true;
      }
    }
    return false;
  };



  ////////////////////////////////////////////////////////FIRST BOX ||||||||||||||||||||||||||||||||||||||||||||
  

  const handleChangeRadioBtn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBelief(event.target.value);
  };

  const onUserTextInputForBelief = (e) => {
    setUserBeliefText(e.target.value);
  };


  const onSubmitHumanBelief = async () => {
    console.log('heree123');
    const initial_human_belief = {
      human_belief_selected_option: selectedBelief,
      human_belief_text_description: userBeliefText,
    };

    console.log(initial_human_belief, 'tfinallll');

    // const input2 = {
    //       "input1_human_belief": {
    //           "human_belief_selected_option": 1 ,
    //           "human_belief_text_description":""
    //       },
    //       "input2_human_rank_order": [1,2,3,4],
    //       "x_origin": 0,
    //       "y_origin": 0
    //   }

    const test = await firstApiGetThreePaths(
      initial_human_belief,
      [1, 2, 3, 4],
      0,
      0
    );
    console.log('testtttttttttttttttttt', test);

    // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });

    // for going to next step this is using previous code
    dispatch({
      type: Action.SET_USER_FEEDBACK_STATE,
      value: UserFeedbackState.RANK_OBJECTIVES,
    });

    // not used
    dispatch({
      type: Action.SET_NUM_SUBMIT_CLICKS,
      value: numSubmitClicks + 1,
    });
  };


  const objectiveQuestions = (
    <div className="objective-questions">
      <p>
        <strong>
          During the sampling process, the following objectives are considered.
        </strong>
      </p>

      <RadioGroup
        row
        aria-label="path selection"
        name="path_selection"
        value={selectedBelief}
        onChange={handleChangeRadioBtn}
      >
        <FormControlLabel
          value="1"
          control={<Radio />}
          label="Gather more data on unsampled area"
        />
        <FormControlLabel
          value="2"
          control={<Radio />}
          label="The risk of robot entrapment"
        />
        <FormControlLabel
          value="3"
          control={<Radio />}
          label="Accept suggested location C"
        />
        <FormControlLabel value="4" control={<Radio />} label="The time cost" />
      </RadioGroup>

      <p>
        <strong>
          Please describe your additional belief about the data collected so
          far:
        </strong>
      </p>
      <textarea onChange={onUserTextInputForBelief} rows={5} cols={85} />

      <Button
        disabled={!selectedBelief}
        variant="contained"
        color="secondary"
        onClick={onSubmitHumanBelief}
      >
        Next
      </Button>
    </div>
  );






  //////////////////////////////////////////////////////////////////////////// 2nd step form input////////////////////

  const objectiveOptions2 = [
    'Gather more data on unsampled area', // Option 0 - spatial coverage algorithm
    'Gather more data where the data has discrepancy with the hypothesis', // Option 1 - hypo invalidating algorithm
    'The risk of robot entrapment',
    'The time cost',
  ];

  // Initial state for ranking
  const initialRanking = Array.from(
    { length: objectiveOptions2.length },
    (_, i) => i + 1
  );
  const [ranking, setRanking] = useState(initialRanking);

  // Handle change in ranking for a specific objective
  const handleChange = (index, value) => {
    const newRanking = [...ranking];
    newRanking[index] = value;

    // Adjust available options for subsequent objectives
    for (let i = 0; i < index; i++) {
      if (newRanking[i] === value) {
        newRanking[i] = ranking[index];
      }
    }

    setRanking(newRanking);
  };

  const onSubmitRanking = async () => {
    console.log('heree123');
    console.log('Rankingtest123:', ranking);
    dispatch({
      type: Action.SET_USER_FEEDBACK_STATE,
      value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE,
    });
  };

  const ObjectiveRankingFormNew = (
    <>
      <table className="dropDownMenuGroup" style={{ marginBottom: '2vh' }}>
        <tbody>
          {objectiveOptions2.map((option, index) => (
            <tr key={option}>
              <td>
                <FormControl>
                  <Select
                    value={ranking[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                  >
                    {ranking.map((rank, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </td>
              <td>{option}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button
        disabled={!selectedBelief}
        variant="contained"
        color="secondary"
        onClick={onSubmitRanking}
      >
        Next
      </Button>
    </>
  );

  const objectivesToRank = (
    <table className="dropDownMenuGroup" style={{ marginBottom: '2vh' }}>
      <tbody>
        {objectives.map((obj, i) => (
          <tr key={obj.objective}>
            <td>
              <FormControl>
                <Select
                  id="objectives-select"
                  value={obj.ranking}
                  onChange={(e) => {
                    const objectivesTemp = [...objectives];
                    if (typeof e.target.value === 'number')
                      objectivesTemp[i].ranking = e.target.value;
                    dispatch({
                      type: Action.SET_OBJECTIVES,
                      value: objectivesTemp,
                    });
                  }}
                >
                  {Array.from(
                    { length: objectives.length },
                    (_, i) => i + 1
                  ).map((rank) => (
                    <MenuItem key={obj.objective + rank} value={rank}>
                      {rank}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </td>
            <td>{obj.objective}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // 3rd step form input

  const objectiveRankings = (
    <div className="objective-rankings">
      <p>
        <strong>
          Now choose the order in which you agree with each of the selected
          beliefs, with 1 being the strongest agreement. You must assign a
          unique number to each belief:
        </strong>
      </p>
      {objectivesToRank}
    </div>
  );


  const onObjectiveTextChange = (e) => {
    dispatch({
      type: Action.SET_OBJECTIVES_FREE_RESPONSE,
      value: e.target.value,
    });
  };

  const objectiveFreeResponseQuestion = (
    <div
      className="objective-free-response-question"
      style={{ marginBottom: '2vh' }}
    >
      <p>
        <strong>
          Please describe your belief about the data collected so far:
        </strong>
      </p>
      {/* <textarea onChange={onObjectiveTextChange} rows={5} cols={85} /> */}
    </div>
  );

  console.log('robotsuggestion', robotSuggestions); // DEBUG
  useEffect(() => {
    const acceptOrRejectTemp: string[] = robotSuggestions.map(
      (suggestion, index) =>
        'Accept suggested location ' + String.fromCharCode(index + 65)
    );
    acceptOrRejectTemp.push('Reject suggestions');
    dispatch({
      type: Action.SET_ACCEPT_OR_REJECT_OPTIONS,
      value: acceptOrRejectTemp,
    });
  }, [robotSuggestions]);

  const onAcceptOrRejectTextChange = (e) => {
    console.log('acceptOrRejectFreeResponse: ', e.target.value);
    dispatch({
      type: Action.SET_ACCEPT_OR_REJECT_FREE_RESPONSE,
      value: e.target.value,
    });
  };

  const acceptOrRejectQuestions = (
    <div className="accept-or-reject-questions">
      <p>
        <strong>
          Based on your belief rankings, RHex suggests sampling from one of the
          lettered locations marked on the dune cross-section above.
        </strong>
      </p>
      <RadioButtonGroup
        options={acceptOrRejectOptions}
        selectedIndex={acceptOrReject}
        onChange={(i) => {
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: i });
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
        }}
      />
      <div
        className="accept-or-reject-free-response-question"
        style={{ marginTop: '-15px' }}
      >
        <p style={{ marginBottom: '-12px' }}>
          <strong>Impressions about suggested locations (optional):</strong>
        </p>
        <p>
          <i>
            <small>
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
            </small>
          </i>
        </p>
        <textarea
          style={{ marginTop: '-3px', marginBottom: '5px' }}
          onChange={onAcceptOrRejectTextChange}
          rows={5}
          cols={75}
        />
      </div>
    </div>
  );

  //New data Type in page
  const onObjectiveTextChangeStrength1 = (e1) => {
    console.log('Shear Strength Input1: ' + e1.target.value);
    dispatch({ type: Action.SET_USER_STRENGTH_DATA, value: e1.target.value });
  };

  const typeInNewData = (
    <div className="type-in-new-data" style={{ marginBottom: '2vh' }}>
      <div className="TypeInDataTitle">
        <strong>Enter strength data</strong>
      </div>
      <div>
        Type 3 measurement values separated by a space:
        <textarea
          placeholder="e.g., 3 4 5"
          style={{ marginTop: '1vh' }}
          id="latestStrength1"
          name="latestStrength1"
          onChange={onObjectiveTextChangeStrength1}
          rows={5}
          cols={50}
        />
      </div>
    </div>
  );
  //var x = document.getElementById("myTextarea").value;

  //New data Type with User Location in page
  const onObjectiveTextChangeStrength2 = (e2) => {
    console.log('Shear Strength Input2: ' + e2.target.value);
    dispatch({ type: Action.SET_USER_STRENGTH_DATA, value: e2.target.value });
  };
  const onObjectiveTextChangeLocation3 = (e3) => {
    console.log('Distance Input: ' + e3.target.value);
    dispatch({ type: Action.SET_USER_LOCATION_DATA, value: e3.target.value });
  };

  const typeInNewLocationData = (
    <div className="type-in-new-location-data" style={{ marginBottom: '2vh' }}>
      <div className="TypeInDataTitle">
        <strong>Enter stifness and location data</strong>
      </div>
      <div>
        Stiffness (type 1 stiffness values):
        <br />
        <textarea
          placeholder="e.g., 3"
          id="latestStrength3"
          name="latestStrength3"
          onChange={onObjectiveTextChangeStrength2}
          rows={5}
          cols={50}
        />
        <br />
        <br />
        location (type 1 location value, must be between 0-1):
        <br />
        <textarea
          placeholder="e.g., 0.5"
          id="latestLocation"
          name="latestLocation"
          onChange={onObjectiveTextChangeLocation3}
          rows={5}
          cols={50}
        />
      </div>
    </div>
  );

  // Handler for setting the user's rating for how well the latest sample addressed the current objective
  const handleSliderChange = (event, newValue, index) => {
    if (typeof newValue === 'number') {
      const objectivesTemp = [...objectives];
      objectivesTemp[index].addressedRating = newValue / 20 + 1;
      dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
    }
  };

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

  const acceptFollowUpQuestions = (
    <div className="accept-follow-up-questions">
      <p>
        <strong>
          Rate the extent to which going to this location addressed each of the
          following beliefs (1 - Unsure, 2 - Did not address, 3 - Barely
          addressed, 4 - Somewhat addressed, 5 - Moderately addressed, 6 -
          Definitely addressed):
        </strong>
      </p>
      {objectives.map((obj, index) => (
        <div key={obj.objective.slice(0, 10) + index}>
          <p>
            <i>
              <strong>Belief #{index + 1}:</strong> {obj.objective}
            </i>
          </p>
          <div className="slider-box">
            <Box>
              <Slider
                aria-label="Restricted values"
                value={(obj.addressedRating - 1) * 20}
                valueLabelFormat={valueLabelFormat}
                valueLabelDisplay="auto"
                step={20}
                marks={marks}
                onChange={(event, value) =>
                  handleSliderChange(event, value, index)
                }
              />
            </Box>
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    const rejectReasonOptionsTemp = [
      'The suggested location did not address the beliefs I selected (',
      'I rejected the suggested location for a different reason',
    ];
    for (let i = 0; i < objectives.length - 1; i++) {
      rejectReasonOptionsTemp[0] += objectives[i].objective + ' / ';
    }
    if (objectives.length >= 1)
      rejectReasonOptionsTemp[0] +=
        objectives[objectives.length - 1].objective + ')';
    dispatch({
      type: Action.SET_REJECT_REASON_OPTIONS,
      value: rejectReasonOptionsTemp,
    });
  }, [objectives]);

  const rejectReasonQuestions = (
    <div className="reject-reason-questions">
      <p>
        <strong>Why did you reject RHex's suggested locations?</strong>
      </p>
      <RadioButtonGroup
        options={rejectReasonOptions}
        selectedIndex={rejectReason}
        onChange={(i) => dispatch({ type: Action.SET_REJECT_REASON, value: i })}
      />
    </div>
  );

  const onRejectReasonTextChange = (e) => {
    dispatch({
      type: Action.SET_REJECT_REASON_FREE_RESPONSE,
      value: e.target.value,
    });
  };

  const rejectReasonFreeResponseQuestion = (
    <div
      className="reject-reason-free-response-question"
      style={{ marginBottom: '2vh' }}
    >
      <p>
        <strong>Please state your reason for rejecting the suggestion:</strong>
      </p>
      <textarea onChange={onRejectReasonTextChange} rows={5} cols={75} />
    </div>
  );

  const userLocationSelectionQuestion = (
    <div className="user-location_selection-question">
      <p>
        <strong>
          Please select the next location you'd like to sample from by clicking
          anywhere along the transect surface in the dune cross-section above.
          When you have finalized your selection and are ready to collect data
          from that location, click "Submit."
        </strong>
      </p>
    </div>
  );

  // Hook for displaying hypothesis popup
  const singleTransectNullHypothesis = require('../assests/John Ruck Strength Hypothesis.png');
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const decisionHypothesisDialog = (
    <MultiStepDialog
      open={hypothesisOpen}
      setOpen={setHypothesisOpen}
      title={''}
      allowCancel={false}
      steps={[['']]}
      img={singleTransectNullHypothesis}
    />
  );

  const updateHypothesisConfidence = (
    <div className="update-hypothesis-confidence">
      <div className="hypothesisBlock">
        <div className="hypothesisTitle">
          <strong>Updated Hypothesis Confidence</strong>
        </div>
        <div className="hypothesisText">
          <div>
            Provide a new ranking of your certainty that the{' '}
            <span
              style={{
                color: 'blue',
                textDecorationLine: 'underline',
                cursor: 'pointer',
              }}
            >
              <strong>
                <a onClick={() => setHypothesisOpen(true)}>hypothesis</a>
              </strong>
            </span>{' '}
            will be supported or refuted. If you have no preference, select "I
            am unsure":
          </div>
        </div>
        <FormControl>
          <Select
            style={{ fontSize: '1.5vh' }}
            value={hypoConfidence + 3}
            onChange={(event) =>
              handleHypoResponse(Number(event.target.value) - 3)
            }
          >
            {confidenceTexts.map((text, i) => (
              <MenuItem key={i} value={i}>
                {text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );

  const transitionQuestions = (
    <div className="reject-reason-questions">
      <p>
        <strong>What would you like to do next?</strong>
      </p>
      <RadioButtonGroup
        options={transitionOptions.slice(!userFreeSelection ? 0 : 1)}
        selectedIndex={transition}
        onChange={(i) => dispatch({ type: Action.SET_TRANSITION, value: i })}
      />
    </div>
  );

  // Match the order of UserFeedbackStates in 'constants.ts'

  const userFeedbackStateMap = [
    objectiveQuestions,
    ObjectiveRankingFormNew,
    // objectiveSelectPath,

    objectiveFreeResponseQuestion,
    acceptOrRejectQuestions,
    typeInNewData,
    acceptFollowUpQuestions,
    rejectReasonQuestions,
    rejectReasonFreeResponseQuestion,
    userLocationSelectionQuestion,
    typeInNewLocationData,
    updateHypothesisConfidence,
    transitionQuestions,
  ];

  // DEBUG_HERE_TEST
  // export enum UserFeedbackState {
  //   OBJECTIVE,
  //   RANK_OBJECTIVES,
  //   OBJECTIVE_FREE_RESPONSE,
  //   ACCEPT_OR_REJECT_SUGGESTION,
  //   TYPE_IN_NEW_DATA,
  //   ACCEPT_FOLLOW_UP,
  //   REJECT_REASON,
  //   REJECT_REASON_FREE_RESPONSE,
  //   USER_LOCATION_SELECTION,
  //   TYPE_IN_NEW_LOCATION_DATA,
  //   HYPOTHESIS_CONFIDENCE,
  //   TRANSITION,
  // }

  useEffect(() => {
    if (userFeedbackState === UserFeedbackState.OBJECTIVE) {
      // Initialize objectives with all options selected
      const initialObjectives = objectiveOptions.map((option) => ({
        objective: option,
        ranking: -1,
        addressedRating: 1,
      }));
      dispatch({ type: Action.SET_OBJECTIVES, value: initialObjectives });
      dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
    }
  }, [userFeedbackState]);

  const rankObjectives = () => {
    const objectivesTemp = [...objectives];
    objectivesTemp.sort((a, b) => (a.ranking > b.ranking ? 1 : -1));
    return objectivesTemp;
  };

  console.log(rankObjectives(), 'objectivesTemp12rankobjectss123');

  const newSubmit = async () => {
    dispatch({ type: Action.INCREMENT_STEP_IDX });
  };

  const onSubmit = async () => {
    dispatch({
      type: Action.SET_NUM_SUBMIT_CLICKS,
      value: numSubmitClicks + 1,
    });
    switch (userFeedbackState) {
      case UserFeedbackState.OBJECTIVE: {
        // if user add a new objective, show next time(potential study) in new position
        // if (objectiveFreeResponse !== ''){
        //   objectiveOptions.push(objectiveFreeResponse)
        //   console.log(objectiveOptions)
        // }
        console.log(samples);
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.RANK_OBJECTIVES,
        });

        console.log({ globalState }); // for debugging
        return;
      }
      case UserFeedbackState.RANK_OBJECTIVES: {
        // Order the objectives by ranking
        const objectivesTemp = rankObjectives();
        dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
        // Check if objectives contains free response option and if this option is ranked the highest
        let freeResponseRankedHighest = false;
        for (let i = 0; i < objectives.length; i++) {
          if (
            objectives[i].objective === objectiveOptions[4] &&
            objectives[i].ranking === 1
          ) {
            freeResponseRankedHighest = true;
          }
        }
        if (freeResponseRankedHighest) {
          dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: '' });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.OBJECTIVE_FREE_RESPONSE,
          });
        } else {
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });

          //  DEBUG_HERE_TEST
          // DEBUG here is the api call
          const robotResults = await calculateRobotSuggestions(
            samples,
            globalState,
            objectivesTemp
          );

          //  DEBUG_HERE_TEST
          const { results, spatialReward, variableReward, discrepancyReward } =
            robotResults;
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
          dispatch({
            type: Action.SET_DISCREPANCY_REWARD,
            value: discrepancyReward,
          });

          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: 0 });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION,
          });
          dispatch({
            type: Action.SET_LOADING_ROBOT_SUGGESTIONS,
            value: false,
          });
        }
        console.log({ globalState }); // for debugging
        return;
      }
      case UserFeedbackState.OBJECTIVE_FREE_RESPONSE: {
        // dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: true });
        // dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
        // dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA,
        });
        // dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        console.log({ globalState }); // for debugging
        return;
      }
      case UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION: {
        if (acceptOrReject !== acceptOrRejectOptions.length - 1) {
          // here we decide to allow user to manually input both location and measured variable
          // dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA});
          // here we decide to allow user to manually input only the measured variable but the location is directly generated from
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.TYPE_IN_NEW_DATA,
          });
          // here we directly get the data from the server(which is the robot sampling)
          // let robotSample = robotSuggestions[acceptOrReject];
          // dispatch({ type: Action.ADD_SAMPLE, value: robotSample }); // add the new sample to the StateContext
          // dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.HYPOTHESIS_CONFIDENCE });
          // dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        } else {
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.REJECT_REASON,
          });
          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'robot' });
          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.HYPOTHESIS_CONFIDENCE,
          });
        }
        console.log({ globalState }); // for debugging
        return;
      }

      //Add user type in new method submit method
      case UserFeedbackState.TYPE_IN_NEW_DATA: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
        const robotSample = robotSuggestions[acceptOrReject];
        const { userStrengthData } = globalState;
        const stringStrengthData = String(userStrengthData);
        console.log('stringStrengthData', stringStrengthData);
        var splittedStrength = stringStrengthData.split(' ');
        const strengthNumArr = splittedStrength.map(Number);
        // const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, robotSample.index, robotSample.measurements);
        const newSample: Sample = {
          ...robotSample,
          shear: strengthNumArr,
          moisture: [5, 5, 5],
        };
        dispatch({ type: Action.ADD_SAMPLE, value: newSample }); // add the new sample to the StateContext

        dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'robot' });

        // add the new sample to the state
        var curStrength = document.getElementById('latestStrength')?.innerText;
        var curLocation = document.getElementById('latestLocation')?.innerText;
        // pushUserMeasurements(globalState,curStrength,curLocation);
        dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.HYPOTHESIS_CONFIDENCE,
        });
        //dispatch({type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TYPE_IN_NEW_DATA})
      }
      // case UserFeedbackState.ACCEPT_FOLLOW_UP: {
      //   dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TYPE_IN_NEW_DATA });
      //   return;

      case UserFeedbackState.REJECT_REASON: {
        if (rejectReason === 0) {
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
          //   dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
          //   dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA,
          });
          //   dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        } else if (rejectReason === 1) {
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.REJECT_REASON_FREE_RESPONSE,
          });
        }
        console.log({ globalState }); // for debugging
        return;
      }
      case UserFeedbackState.REJECT_REASON_FREE_RESPONSE: {
        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
        // dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
        // dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA,
        });
        // dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        console.log({ globalState }); // for debugging
        console.log('test');
        return;
      }

      case UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA: {
        const { userStrengthData, userLocationData } = globalState;
        const stringStrengthData = String(userStrengthData);
        console.log('stringStrengthData', stringStrengthData);
        var splittedStrength = stringStrengthData.split(' ');
        const strengthNumArr = splittedStrength.map(Number);

        const newLocationData = Number(userLocationData);
        console.log('newLocationData:', newLocationData);

        const newSample: Sample = {
          index: newLocationData,
          type: 'user',
          measurements: 1,
          normOffsetX: 800,
          normOffsetY: 200,
          isHovered: false,
          moisture: [13],
          shear: strengthNumArr,
          path: [[0.5], [0]],
        };
        dispatch({ type: Action.ADD_SAMPLE, value: newSample }); // add the new sample to the StateContext

        dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user' });

        // add the new sample to the state
        var curStrength = document.getElementById('latestStrength')?.innerText;
        var curLocation = document.getElementById('latestLocation')?.innerText;
        dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: false });
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.HYPOTHESIS_CONFIDENCE,
        });
        dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
        console.log({ globalState });
        return;
      }
      // case UserFeedbackState.USER_LOCATION_SELECTION: {
      //   dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: false });
      //   dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 }); // load the next Sample into the charts and strategy
      //   dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user'});
      //   dispatch({ type: Action.SET_USER_FEEDBACK_STATE, value: UserFeedbackState.TYPE_IN_NEW_DATA });
      //   console.log({globalState}); // for debugging
      //   return;
      // }
      case UserFeedbackState.HYPOTHESIS_CONFIDENCE: {
        dispatch({
          type: Action.SET_USER_FEEDBACK_STATE,
          value: UserFeedbackState.TRANSITION,
        });
        console.log({ globalState }); // for debugging
        return;
      }
      case UserFeedbackState.TRANSITION: {
        const transitionAdj = !userFreeSelection ? transition : transition + 1;
        console.log({ globalState, transitionAdj });

        // Move to the next round with the same objectives as the previous round and automatically run
        // the robot calculation
        if (transitionAdj === 0) {
          dispatch({ type: Action.SET_LOADING_ROBOT_SUGGESTIONS, value: true });

          //  DEBUG_HERE_TEST
          // DEBUG here is the api call
          const robotResults = await calculateRobotSuggestions(
            samples,
            globalState,
            objectives
          );
          console.log(robotResults);
          const { results, spatialReward, variableReward, discrepancyReward } =
            robotResults;
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: results });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: spatialReward });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: variableReward });
          dispatch({
            type: Action.SET_DISCREPANCY_REWARD,
            value: discrepancyReward,
          });

          dispatch({ type: Action.SET_SHOW_ROBOT_SUGGESTIONS, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.ACCEPT_OR_REJECT_SUGGESTION,
          });
          dispatch({
            type: Action.SET_LOADING_ROBOT_SUGGESTIONS,
            value: false,
          });
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });

          // Move to the next round with the objectives reset and ask the user to reselect the objectives
        } else if (transitionAdj === 1) {
          dispatch({ type: Action.SET_OBJECTIVES, value: [] });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: false });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.OBJECTIVE,
          });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: null });
          dispatch({ type: Action.SET_ROBOT_SUGGESTIONS, value: [] });
          dispatch({ type: Action.SET_SPATIAL_REWARD, value: [] });
          dispatch({ type: Action.SET_VARIABLE_REWARD, value: [] });
          dispatch({ type: Action.SET_DISCREPANCY_REWARD, value: [] });

          // Move to the next round enabling the user to freely select the next sample location
        } else if (transitionAdj === 2) {
          dispatch({ type: Action.SET_OBJECTIVES, value: [] });
          dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
          dispatch({ type: Action.SET_IMG_CLICK_ENABLED, value: true });
          dispatch({ type: Action.SET_USER_FREE_SELECTION, value: true });
          dispatch({
            type: Action.SET_USER_FEEDBACK_STATE,
            value: UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA,
          });
          dispatch({ type: Action.SET_NUM_IMG_CLICKS, value: 0 });
          dispatch({ type: Action.SET_SAMPLE_TYPE, value: 'user' });
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
          dispatch({ type: Action.SET_OBJECTIVES_FREE_RESPONSE, value: '' });
          dispatch({ type: Action.SET_ACCEPT_OR_REJECT, value: -1 });
          dispatch({ type: Action.SET_REJECT_REASON, value: -1 });
          dispatch({ type: Action.SET_REJECT_REASON_FREE_RESPONSE, value: '' });
          dispatch({ type: Action.SET_USER_SAMPLE, value: null });
          dispatch({ type: Action.SET_TRANSITION, value: 0 });
          updateUserSteps();
        }
        console.log({ globalState }); // for debugging
        return;
      }
    }
  };

  const clickableImageTip =
    'Please select a location on the transect to sample from between the crest and interdune';
  const clickableImageTipStyle = {
    fontSize: '12px',
  };

  // Right panel to display when collecting data, sampleState != FINISH_TRANSECT
  const collectionRightPanel = (
    <div className="collectionRightPanel">
      <ImgAlert open={!!showImgAlert} />
      {/* <Tooltip title={userFeedbackState !== UserFeedbackState.TYPE_IN_NEW_LOCATION_DATA ? "" : <span style={clickableImageTipStyle}>{clickableImageTip}</span>} placement="bottom">
          <div className="clickableImageContainer">
            <ClickableImage width={600} enabled={imgClickEnabled} addDataFunc={() => addDataToPlot()} setPopOver={setImgAlert} />  
          </div>
      </Tooltip> */}
      <RobotChart />
      {!loadingRobotSuggestions && (
        <div
          className={
            numSubmitClicks === 0 ? 'user-feedback-flashing' : 'user-feedback'
          }
        >
          {/* {userFeedbackStateMap[userFeedbackState]} */}

          {}
          <div className="submit-user-feedback-button">
            <Button
              disabled={disableSubmitButton}
              variant="contained"
              color="secondary"
              onClick={onSubmit}
            >
              Submit
              {/* here  */}
            </Button>
          </div>

          <div className="submit-user-feedback-button">
            <Button
              disabled={disableSubmitButton}
              variant="contained"
              color="secondary"
              onClick={newSubmit}
            >
              GATHER NEW PATH
            </Button>
          </div>
        </div>
      )}
      {loadingRobotSuggestions && (
        <div className="loading-screen">
          <div className="loading-section">
            <i>
              RHex is determining where to sample from next. This should take at
              most 5-10 seconds...
            </i>
          </div>
          <div className="loading-section">
            <CircularProgress color="secondary" size={100} />
          </div>
        </div>
      )}
      <div className="quit">
        <Button
          className="quitButton"
          variant="contained"
          color="primary"
          onClick={onConcludeClick}
        >
          End Collection At Transect
        </Button>
      </div>
    </div>
  );

  // Popup for displaying instructions on the decision page
  const [decisionHelpOpen, setDecisionHelpOpen] = useState(false);
  const decisionHelpDialog = (
    <MultiStepDialog
      open={decisionHelpOpen}
      setOpen={setDecisionHelpOpen}
      title={''}
      allowCancel={false}
      steps={[
        [
          'RHex will always take 3 measurements of moisture and strength at each location visited.',
          'The dune cross-section on the right displays the locations where RHex has already sampled and the charts on the left display the corresponding data.',
          'You will be asked a few questions to determine where RHex should sample next.',
          'If at any point you feel you have collected enough data to make a judgment about the hypothesis, select "End Collection at Transect."',
        ],
      ]}
    />
  );

  function Helper() {
    const onClick = () => {
      setDecisionHelpOpen(true);
    };

    return (
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 40,
        }}
      >
        <HelpIcon
          id="helper"
          onClick={onClick}
          color="primary"
          fontSize="large"
        />
      </div>
    );
  }

  const [tabValue, setTabValue] = React.useState(0);
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const ChartTabs = () => (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabValue} onChange={handleChangeTab} centered>
        <Tab label="Shear VS Mositure" />
      </Tabs>
      {/* {tabValue === 0 && <ShearVsMoisturePlot width={1400} height={1100} />} */}
      {/* {tabValue === 0 && <DiscrepancyChart width={1100} height={600} />} */}

      {/* {tabValue === 1 && (
        <MoistureStressScatterPlot width={1100} height={600} />
      )}
      {tabValue === 2 && <MoistureHeatMap width={1100} height={600} />} */}
    </Box>
  );

  return (
    <div id="app" className="decisionPage">
      {helperOpen && <Helper />}
      {decisionHypothesisDialog}
      {decisionHelpDialog}

      <ConfirmDialog
        open={confirmConcludeOpen}
        title={''}
        text={
          'Are you sure you are ready to quit data collection at this transect? Press GO BACK to collect more data. Press CONTINUE to move on to a few final survey questions.'
        }
        okText="CONTINUE"
        cancelText="GO BACK"
        allowCancel={true}
        onClose={() => setConfirmConcludeOpen(false)}
        onCancel={() => setConfirmConcludeOpen(false)}
        onOk={onQuit}
      />

      <Grid container>
        <Grid container>
          <Grid item xs={12} md={7}>
            <ChartTabs />

            {/* <ChartPanel fullSize={true} mode={"TransectView"}/> */}
          </Grid>
          <Grid item xs={12} md={5} className="rightDecisionPanel">
            <div className="rightDecisionPanelContainer">
              {collectionRightPanel}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
