import * as React from 'react';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
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
const RightComponent = () => {
  const [selectedBelief, setSelectedBelief] = useState('');
  const [userBeliefText, setUserBeliefText] = useState('');
  const [selectedPathIndex, setSelectedPathIndex] = useState('');
  const [scatter_Plot_Data, setScatterPlotData] = useState<{
    x: number[];
    y: number[];
    moisture: number[];
    shear: number[];
  }>({ x: [], y: [], moisture: [], shear: [] });
  const [globalState, dispatch] = useStateValue();

  const [heatMapUncertainity, setHeatMapUncertainity] = useState();

  const { input_box_step_btn_click, threePaths, path_full_data } = globalState;

  ////////////////////////////////////1ST BOX /////////////////

  const handleChangeRadioBtn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBelief(event.target.value);
  };

  const onUserTextInputForBelief = (e) => {
    setUserBeliefText(e.target.value);
  };

  const onSubmitHumanBelief = async () => {
    // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
  };

  const objectiveQuestions = (
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

    const threePaths = await firstApiGetThreePaths(
      initial_human_belief,
      ranking,
      0,
      0
    );

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });

    dispatch({
      type: Action.GENERATE_THREE_PATHS,
      value: threePaths,
    });
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

    const simulationApiFullData: any = await fourthApiCallSimulate(1);
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

    console.log('final_heatMapUncertainity', heatMapUncertainity);
  };

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
        Submit
      </Button>
    </div>
  );
  ///////////////////////////////////////////////////////////////////////////////////////////
  const userFeedbackStateMap = [
    objectiveQuestions,
    ObjectiveRankingFormNew,
    objectiveSelectPath,
    objectiveGatherData,
  ];

  ////////////////////////////////////////////////////////////////////////////////////////

  const collectionRightPanel = (
    <div className="collectionRightPanel">
      <RobotChart />
      <div className="collectionRightPanel">
        <div className="user-feedback">
          {userFeedbackStateMap[input_box_step_btn_click]}
        </div>
      </div>
    </div>
  );

  const ChartTabs = () => (
    <Box sx={{ width: '100%' }}>
      {
        <ShearVsMoisturePlot
          width={1400}
          height={1100}
          scatterPlotData={scatter_Plot_Data}
        />
      }
    </Box>
  );

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);

  const onQuit = () => {
    // history.push('/conclusion');
    console.log({ globalState });
  };

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
            {input_box_step_btn_click === 4 && <ChartTabs />}
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
