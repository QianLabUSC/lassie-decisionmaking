import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import RatingComponent from './rating';

import {
  Select,
  MenuItem,
  Box,
  Radio,
  RadioGroup,
  Checkbox,
  FormControl, FormGroup, FormControlLabel 
} from '@material-ui/core';

import { ConfirmDialog } from '../components/Dialogs';

import { firstApiGetThreePaths } from '../ApiCalls/first_api_get_three_paths';
import { secondApiCreateJson } from '../ApiCalls/second_api_create_json';
import { thirdApiCallHeatMapScatterPLot } from '../ApiCalls/third_api_call_heat_map_scatterplot';
import { fourthApiCallSimulate } from '../ApiCalls/fourth_api_simulate';

import { useStateValue, Action } from '../state';
import '../styles/decision.scss';
import RobotChart from '../components/RobotChart';
import ShearVsMoisturePlot from '../components/Charts/ShearVsMoisturePlot';
import { useHistory } from 'react-router-dom';
import SelectedPathChart from '../components/SelectedPathChart';

const NO_OF_ITERATION = 1;
const RightComponent = () => {
  const [selectedBelief, setSelectedBelief] = useState<string[]>([]);
  const [userBeliefText, setUserBeliefText] = useState('');
  const [selectedPathIndex, setSelectedPathIndex] = useState('');
  const [scatter_Plot_Data, setScatterPlotData] = useState<{
    x: number[];
    y: number[];
    moisture: number[];
    shear: number[];
  }>({ x: [], y: [], moisture: [], shear: [] });

  const [generate3newPaths, setGenerate3newPaths] = useState(false); 
  const [selectedPathLastXCordinate, setSelectedPathLastXCordinate] = useState(0)
  const [selectedPathLastYCordinate, setSelectedPathLastYCordinate] = useState(0)
  
  const [selectedTransitionState, setSelectedTransitionState] = useState('');
  const [updateTransition, setUpdateTransition] = useState(false);

  const [globalState, dispatch] = useStateValue();
  const [{ simulation_api_full_data }] = useStateValue();
  const [heatMapUncertainity, setHeatMapUncertainity] = useState();
  const [currentView, setCurrentView] = useState(0);

  const history = useHistory();

  const { input_box_step_btn_click, threePaths, path_full_data } = globalState;

  ////////////////////////////////////1ST BOX /////////////////
              
  const onContinueClick = () => {
    history.push('/survey');
  };
  const onUserTextInputForBelief = (e) => {
    setUserBeliefText(e.target.value);
  };

  const handleChangeCheckbox = (value: string) => {
    setSelectedBelief(prev => {
      const currentIndex = prev.indexOf(value);
      const newChecked = [...prev];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      return newChecked;
    });
  };
  const onSubmitHumanBelief = async () => {
    console.log(selectedBelief, 'selectedbelief')
    // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });
    setCurrentView(1);
    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
  };

  useEffect(() => {
    console.log(selectedTransitionState, '1selectedTransitionState after update');
  }, [selectedTransitionState]);

  const objectiveQuestions = (
    <>
    <div className="objective-questions">
  
      <p><strong>During the sampling process, the following objectives are considered:</strong></p>
      <FormControl component="fieldset">
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox checked={selectedBelief.includes('1')} onChange={() => handleChangeCheckbox('1')} />}
            label="Gather more data on unsampled area"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedBelief.includes('2')} onChange={() => handleChangeCheckbox('2')} />}
            label="The risk of robot entrapment"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedBelief.includes('3')} onChange={() => handleChangeCheckbox('3')} />}
            label="Accept suggested location C"
          />
          <FormControlLabel
            control={<Checkbox checked={selectedBelief.includes('4')} onChange={() => handleChangeCheckbox('4')} />}
            label="The time cost"
          />
        </FormGroup>
      </FormControl>
      <p><strong>Please describe your additional belief about the data collected so far:</strong></p>
      <textarea onChange={onUserTextInputForBelief} rows={5} cols={85} />
     
      <Button
        disabled={selectedBelief.length === 0}
        variant="contained"
        color="secondary"
        onClick={onSubmitHumanBelief}
      >
        Next
      </Button>

      <br/>
      <br/>
      <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
        End Collection Transect
    </Button>
    </div>

<RatingComponent />
</>
  );

  //////////////////////////////////////////////////////////////////////////// 2nd step form input////////////////////

  const objectives = [
    'Gather more data on unsampled area', // Option 0 - spatial coverage algorithm
    'Gather more data where the data has discrepancy with the hypothesis', // Option 1 - hypo invalidating algorithm
    'The risk of robot entrapment',
    'The time cost',
  ];

  // Initial state for ranking
  const initialRanking = Array.from(
    { length: objectives.length },
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
    const initial_human_belief = {
      human_belief_selected_option: selectedBelief,
      human_belief_text_description: userBeliefText,
    };

  let threePaths, selected_path_x_corrdinate, selected_path_y_corrdinate  ;

  selected_path_x_corrdinate = path_full_data.selected_path_data
  selected_path_y_corrdinate = path_full_data.selected_path_data

    if(generate3newPaths == true){
      threePaths = await firstApiGetThreePaths(
        NO_OF_ITERATION,
        initial_human_belief,
        ranking,
        selectedPathLastXCordinate,
        selectedPathLastYCordinate,
      );
    }
    else{
      threePaths = await firstApiGetThreePaths(
        NO_OF_ITERATION,
        initial_human_belief,
        ranking,
        0,
        0
      );
    }
    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });

    dispatch({
      type: Action.GENERATE_THREE_PATHS,
      value: threePaths,
    });

    setCurrentView(2);
  };

  const ObjectiveRankingFormNew = (
    <>
      Step2:
      <table className="dropDownMenuGroup" style={{ marginBottom: '2vh' }}>
        <tbody>
          {objectives.map((option, index) => (
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

      <br/>
      <br/>
      <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
        End Collection Transect
    </Button>
    </>
  );

  //////////////////////////////////////////////////////////////////////////3RD INPUT BOX ///////////////////////

  const handleSelectPath = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPathIndex(event.target.value);
  };

  const onSubmitSelectedPath = async () => {
    const int_selected_path_index = parseInt(selectedPathIndex) - 1;
    const api_input = {
      step_number: input_box_step_btn_click,
      selected_path_number: int_selected_path_index,
      inputof_first_time_Path_Selected: threePaths[int_selected_path_index],
    };
    const selectedPathXs=threePaths[int_selected_path_index][0]
    const selectedPathYs=threePaths[int_selected_path_index][1]

    const last_Xcordinate_of_selected_path = selectedPathXs[selectedPathXs.length-1]
    const last_Ycordinate_of_selected_path = selectedPathYs[selectedPathYs.length-1]

    setSelectedPathLastXCordinate(last_Xcordinate_of_selected_path)
    setSelectedPathLastYCordinate(last_Ycordinate_of_selected_path)

    const jsonCreationApiResponse = await secondApiCreateJson(
      input_box_step_btn_click,
      int_selected_path_index,
      threePaths[int_selected_path_index]
    );

    dispatch({
      type: Action.GENERATE_PATH_FULL_DATA,
      value: jsonCreationApiResponse,
    });

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });

    
    setCurrentView(3);
  };

  const objectiveSelectPath = (
    <div className="objective-questions">
      <p>
        <strong>Step3: Your input is saved in json</strong>
      </p>
      <RadioGroup
        row
        aria-label="path selection"
        name="path_selection"
        value={selectedPathIndex}
        onChange={handleSelectPath}
      >
        <FormControlLabel
          value="1"
          control={<Radio />}
          label="Accept suggested location A"
        />
        <FormControlLabel
          value="2"
          control={<Radio />}
          label="Accept suggested location B"
        />
        <FormControlLabel
          value="3"
          control={<Radio />}
          label="Accept suggested location C"
        />
        <FormControlLabel value="4" control={<Radio />} label="The time cost" />
      </RadioGroup>
      <Button
        disabled={!selectedBelief}
        variant="contained"
        color="secondary"
        onClick={onSubmitSelectedPath}
      >
        Submit
      </Button>

      <br/>
      <br/>
      <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
        End Collection Transect
    </Button>
    </div>
  );

  ////////////////////////////////////////////////////////////////STEP 4 ///////////////////////

  const onGatherData = async () => {
    const int_selected_path_index = parseInt(selectedPathIndex) - 1;

    const api_input = {
      step_number: input_box_step_btn_click,
      selected_path_number: int_selected_path_index,
      end_x_cordinate: 1,
      end_y_cordinate: 1,
      selected_path_data: threePaths[int_selected_path_index],
    };

    const scatterData: any = await thirdApiCallHeatMapScatterPLot(
      input_box_step_btn_click,
      int_selected_path_index,
      1,
      1,
      threePaths[int_selected_path_index]
    );

    // API CALL HERE 
    const simulationApiFullData: any = await fourthApiCallSimulate(
      input_box_step_btn_click
    ); // for now to update the path

    console.log('final_main', simulationApiFullData);

    dispatch({
      type: Action.GATHER_SIMULATION_API_FULL_DATA,
      value: simulationApiFullData,
    });
    setScatterPlotData(scatterData?.scatter_plot_data);
    setHeatMapUncertainity(simulationApiFullData?.uncertainity);

    // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
    setCurrentView(4);
    console.log('final_heatMapUncertainity', heatMapUncertainity);
  };


  // TODO MAKE THE SELECTED PATH BLACK HERE
  const objectiveGatherData = (
    <div className="objective-questions">
      <p>
        <strong>
          Step4: CLICK GATHER DATA BUTOON PROCESS: 1- SHEAR STRESS AND MOISTURE
          APPEARS 2- Robot Marker should go from 0,0 to end of selected path 3-
          selected path black 4- update the left figure 5- update heat map 7 -
          update line
        </strong>
      </p>
      <Button
        disabled={!selectedBelief}
        variant="contained"
        color="secondary"
        onClick={onGatherData}
      >
        Gather Data
      </Button>
      <br/>
      <br/>
      <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
        End Collection Transect
    </Button>
    </div>
  );
  ///////////////////////////////////////////////////            STEP 5               ////////////////////////////////////////

  const handleTransitionState = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(selectedTransitionState,'1selectedTransitionState')
    setSelectedTransitionState(event.target.value);
  };

  const onSubmitTransitionState = async () => {

    setUpdateTransition(true)
    console.log(selectedTransitionState, 'qselectedTransitionState before processing');
    if (selectedTransitionState === '1') {
      setCurrentView(1);
      setGenerate3newPaths(true);
    } else if (selectedTransitionState === '2') {
      setCurrentView(0);
    } else if (selectedTransitionState === '3') {
      setCurrentView(5);
      setTimeout(() => setCurrentView(1), 3000); // Wait for 3 seconds before redirecting
    } else {
      history.push('/survey');
    }

    // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
  };

  const objectiveTranisition = (
    <div className="objective-questions">
      <p>
        <strong>
          Step 1: During the sampling process, the following objectives are
          considered.
        </strong>
      </p>

      <RadioGroup
        row
        aria-label="path selection"
        name="path_selection"
        value={selectedTransitionState}
        onChange={handleTransitionState}
      >
        <FormControlLabel
          value="1"
          control={<Radio />}
          label="See Robot's suggestions for where to sample next based on your current belief rankings"
        />
        <FormControlLabel
          value="2"
          control={<Radio />}
          label="Update belief rankings to receive new suggestions from Robot of where to sample next"
        />
        <FormControlLabel
          value="3"
          control={<Radio />}
          label="Ignore suggestions and select a location for Robot to sample next"
        />
        <FormControlLabel
          value="4"
          control={<Radio />}
          label="Stop data collection and make a conclusion about the hypothesis"
        />
      </RadioGroup>

      <Button
        disabled={!selectedBelief}
        variant="contained"
        color="secondary"
        onClick={onSubmitTransitionState}
      >
        Submit Transition State
      </Button>

      <br/>
      <br/>
      <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
        End Collection Transect
    </Button>
    </div>
  );

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
  const comingSoon = (
    <div className="objective-questions">
      <h1>This Feature is Coming Soon...</h1>
      <h2>Taking you to step 1</h2>
    </div>
  );

  const userFeedbackStateMap = [
    objectiveQuestions,
    ObjectiveRankingFormNew,
    objectiveSelectPath,
    objectiveGatherData,
    objectiveTranisition,
    comingSoon,
  ];

  ////////////////////////////////////////////////////////////////////////////////////////

  const collectionRightPanel = (
    <div className="collectionRightPanel">
      <RobotChart currentselectedpath={selectedPathIndex}/>
      {/* <SelectedPathChart/> */}
      <div className="collectionRightPanel">
        {!updateTransition && (
          <div className="user-feedback">
            {userFeedbackStateMap[input_box_step_btn_click]}
          </div>
        )}
        {updateTransition && (
          <div className="user-feedback">
            {userFeedbackStateMap[currentView]}
          </div>
        )}
      </div>
    </div>
  );

 

  const ChartTabs = () => (
    <Box sx={{ width: '100%' }}>
      {(
        <ShearVsMoisturePlot width={1400} height={1100} />
      )}
    </Box>
  );

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);

  const onQuit = () => {
    // history.push('/conclusion');
    console.log({ globalState });
  };

  console.log('hereee selectedPathIndexselectedPathIndex',selectedPathIndex)
  return (
    <div id="app" className="decisionPage">
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
            {<ChartTabs />}
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
};

export default RightComponent;
