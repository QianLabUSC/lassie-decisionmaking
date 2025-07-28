import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import RatingComponent from './rating';
import { Typography } from '@material-ui/core';
import HypothesisConfidencePanel from './hypothesisConfidence';
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
import { pathsuggestion } from '../ApiCalls/pathsuggestion';
import { gatherDataAndUpdate } from '../ApiCalls/gatherDataAndUpdate';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStateValue, Action } from '../state';
import '../styles/decision.scss';
import RobotChart from '../components/RobotChart';
import UpperLeftRobotChart from '../components/Charts/UpperLeftRobotChart';
import ShearVsMoisturePlot from '../components/Charts/ShearVsMoisturePlot';
import { useHistory } from 'react-router-dom';
import SelectedPathChart from '../components/SelectedPathChart';
import ShearStrengthOnWorldMapChart from '../components/Charts/ShearStrengthOnWorldMapChart';
import { prior_samples_trajectories_x } from '../constants';
import { prior_samples_trajectories_y } from '../constants';
import { SubPath } from '../state';



const NO_OF_ITERATION = 1;
const RightComponent = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBelief, setSelectedBelief] = useState<string>('');
  const [userBeliefText, setUserBeliefText] = useState('');
  const [selectedPathIndex, setSelectedPathIndex] = useState('');
  const [scatter_Plot_Data, setScatterPlotData] = useState<{
    x: number[];
    y: number[];
    moisture: number[];
    shear: number[];
  }>({ x: [], y: [], moisture: [], shear: [] });

  const [generate3newPaths, setGenerate3newPaths] = useState(false); 
  const [selectedPathLastXCordinate, setSelectedPathLastXCordinate] = useState(0);
  const [selectedPathLastYCordinate, setSelectedPathLastYCordinate] = useState(0);
  
  const [selectedTransitionState, setSelectedTransitionState] = useState('');
  const [updateTransition, setUpdateTransition] = useState(false);

  const [globalState, dispatch] = useStateValue();
  const [{ simulation_api_full_data }] = useStateValue();
  const [heatMapUncertainity, setHeatMapUncertainity] = useState();
  const [currentView, setCurrentView] = useState(0);

  const history = useHistory();

  const { input_box_step_btn_click, threePaths, all_single_curve_selected_black_path } = globalState;




  useEffect(() => {
    // Initialize the arrays with prior trajectories as SubPath arrays
    let initX: number[] = prior_samples_trajectories_x;
    let initY: number[] = prior_samples_trajectories_y;
    // Dispatch the updated state
    dispatch({
      type: Action.ALL_SELECTED_BLACK_PATH,
      value: {
        initial_path: {
          initial_path_x: initX,
          initial_path_y: initY,
        },
        selectedPath:{
          selectedXs_path_cordinates: [],
          selectedYs_path_cordinates: [],
        },
        selectedPathEndCoordinates:{
          selectedXs_path_end_corinates: [],
          selectedYs_path_end_corinates: [],
        }
      }
    });
  }, []); // Empty dependency array ensures this runs once after the component mounts
  
  ////////////////////////////////////1ST BOX /////////////////
              
  const onContinueClick = () => {
    history.push('/survey');
  };

  const onUserTextInputForBelief = (e) => {
    setUserBeliefText(e.target.value);
  };

  const handleChangeRadio = (value: string) => {
    setSelectedBelief(value);
  };



  const onSubmitHumanBelief = async () => {
    setLoading(true); // Start loading spinner
    try {
          // dispatch({
    //   type: Action.UPDATE_INITIAL_HUMAN_BELIEF,
    //   value: initial_human_belief,
    // });    
      dispatch({
        type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
        value: input_box_step_btn_click + 1,
      });
     // Move to the next view or handle logic
    } catch (error) {
      console.error("Error during dispatch:", error);
    } finally {
      console.error("loading step1", loading);
      setLoading(false); // Stop loading spinner
      setCurrentView(1); 
    }
  };

  useEffect(() => {}, [selectedTransitionState]);

  const objectiveQuestions = (
    <>
      <div className="objective-questions">
        <p style={{"paddingTop":"25px"}}><strong>Based on the data collected so far, select which of the following beliefs you currently hold</strong></p>
        <FormControl component="fieldset">
          <RadioGroup
            value={selectedBelief}
            onChange={(e) => handleChangeRadio(e.target.value)}
          >
            <FormControlLabel
              value="1"
              control={<Radio />}
              label="More data is needed to make an initial evaluation"
            />
            <FormControlLabel
              value="2"
              control={<Radio />}
              label="There is a discrepancy between the data and the hypothesis needs additional evaluation"
            />
            <FormControlLabel
              value="3"
              control={<Radio />}
              label="The data seems to support the hypothesis, but additional evaluation is needed"
            />
            
          </RadioGroup>
        </FormControl>
        <p><strong>Please describe your additional belief about the data collected so far:</strong></p>
        <textarea onChange={onUserTextInputForBelief} rows={5} cols={85} />
        <br/>
       {!loading &&         <Button
        style={{"marginTop":"15px"}}
          disabled={selectedBelief === ''}
          variant="contained"
          color="secondary"
          onClick={onSubmitHumanBelief}
        >
          Next  
        </Button>}
        {loading && <CircularProgress size={24} /> }
        <Button
          style={{"marginBottom":"15px","marginLeft": "358px", "marginTop":"30px"}}
          className="continueButton"
          variant="contained"
          color="primary"
          onClick={onContinueClick}>
          End Collection Transect
        </Button>
        <br/>
      </div>
    
    </>
  );
  //////////////////////////////////////////////////////////////////////////// 2nd step form input////////////////////

  const objectives = [
    'There are areas along the dune transect (between crest and interdune) where data is needed', // Option 0 - spatial coverage algorithm
    'There are portions of the dynamic range of the moisture variable (x axis of the data plot) where data is needed', // Option 1 - hypo invalidating algorithm
    'There is a discrepancy between the data and the hypothesis that needs additional evaluation',
    'The data seems to be supporting the hypothesis so far but additional evaluation is needed',
    'I hold a different belief that is not described here'
  ];

  const initialRanking = Array.from(
    { length: objectives.length },
    (_, i) => i + 1
  );

  const [ranking, setRanking] = useState(initialRanking);

  const handleChange = (index, value) => {
    const newRanking = [...ranking];
    newRanking[index] = value;

    for (let i = 0; i < index; i++) {
      if (newRanking[i] === value) {
        newRanking[i] = ranking[index];
      }
    }

    setRanking(newRanking);
  };

  const onSubmitRanking = async () => {
    setLoading(true); // Start loading spinner
    
    try{
      
     const initial_human_belief = {
      human_belief_selected_option: [selectedBelief],
      human_belief_text_description: userBeliefText,
    };

    

    let threePaths;
    threePaths = await pathsuggestion(
      NO_OF_ITERATION,
      initial_human_belief,
      ranking,
      all_single_curve_selected_black_path,  
    );
    console.log(threePaths)
    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });

    dispatch({
      type: Action.GENERATE_THREE_PATHS,
      value: threePaths,
    });

   
  }catch (error) {
    console.error("Error during dispatch:", error);
  } finally {
    console.error("loading Error during dispatch:212", loading);
    setLoading(false); // Stop loading spinner
    setCurrentView(2);
  }
  };

  const ObjectiveRankingFormNew = (
    <>
      <p style={{"paddingTop":"25px"}}><strong> Click next to continue</strong></p>

      {/* <table className="dropDownMenuGroup" style={{ marginBottom: '2vh' }}>
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
      </table> */}
      {!loading && <Button
        disabled={selectedBelief === ''}
        variant="contained"
        color="secondary"
        onClick={onSubmitRanking}
      >
        Next
      </Button>}
      {loading && <CircularProgress size={24} /> }
      <Button
          style={{"marginBottom":"15px","marginLeft": "358px", "marginTop":"30px"}}
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
    console.log('event', event.target.value)
    setSelectedPathIndex(event.target.value);
  };

  const onSubmitSelectedPath = async () => {

    setLoading(true); // Start loading spinner
    
    try{
    console.log('selectedPathIndex', selectedPathIndex)
    const int_selected_path_index = parseInt(selectedPathIndex) - 1;
    const api_input = {
      step_number: input_box_step_btn_click,
      selected_path_number: int_selected_path_index,
      inputof_first_time_Path_Selected: threePaths[int_selected_path_index],
    };
    const selectedPathXs = threePaths[int_selected_path_index][0];
    const selectedPathYs = threePaths[int_selected_path_index][1];

    const last_Xcordinate_of_selected_path = selectedPathXs[selectedPathXs.length - 1];
    const last_Ycordinate_of_selected_path = selectedPathYs[selectedPathYs.length - 1];

    setSelectedPathLastXCordinate(last_Xcordinate_of_selected_path);
    setSelectedPathLastYCordinate(last_Ycordinate_of_selected_path);

    const jsonCreationApiResponse = await secondApiCreateJson(
      input_box_step_btn_click,
      int_selected_path_index,
      threePaths[int_selected_path_index]
    );

    let testX = all_single_curve_selected_black_path?.selectedPath?.selectedXs_path_cordinates
      ? [...all_single_curve_selected_black_path.selectedPath.selectedXs_path_cordinates]
      : [];
    let testY = all_single_curve_selected_black_path?.selectedPath?.selectedYs_path_cordinates
      ? [...all_single_curve_selected_black_path.selectedPath.selectedYs_path_cordinates]
      : [];
    testX.push(selectedPathXs);
    testY.push(selectedPathYs);

    let endX = all_single_curve_selected_black_path?.selectedPathEndCoordinates?.selectedXs_path_end_corinates
      ? [...all_single_curve_selected_black_path.selectedPathEndCoordinates.selectedXs_path_end_corinates]
      : [];
    let endY = all_single_curve_selected_black_path?.selectedPathEndCoordinates?.selectedYs_path_end_corinates
      ? [...all_single_curve_selected_black_path.selectedPathEndCoordinates.selectedYs_path_end_corinates]
      : [];
    endX.push(last_Xcordinate_of_selected_path);
    endY.push(last_Ycordinate_of_selected_path);
    console.log('testx', testX)
    // instead of waiting for dispatch update, directly use the updated one
    const updatedAllSingleCurveSelectedBlackPath = {
      ...all_single_curve_selected_black_path,
      selectedPath: {
        selectedXs_path_cordinates: testX,
        selectedYs_path_cordinates: testY,
      },
      selectedPathEndCoordinates: {
        selectedXs_path_end_corinates: endX,
        selectedYs_path_end_corinates: endY,
      }
    };
    // Dispatch the action with the updated state
    dispatch({
      type: Action.ALL_SELECTED_BLACK_PATH,
      value: updatedAllSingleCurveSelectedBlackPath,
    });

    dispatch({
      type: Action.GENERATE_PATH_FULL_DATA,
      value: jsonCreationApiResponse,
    });

    const int_selected_path_index_2 = parseInt(selectedPathIndex) - 1;

    const api_input_2 = {
      step_number: input_box_step_btn_click,
      selected_path_number: int_selected_path_index_2,
      end_x_cordinate: 1,
      end_y_cordinate: 1,
      selected_path_data: threePaths[int_selected_path_index_2],
    };
    // need to add the full path here 
    // no need to call api any more. 
    // const scatterData: any = await thirdApiCallHeatMapScatterPLot(
    //   input_box_step_btn_click,
    //   int_selected_path_index_2,
    //   1,
    //   1,
    //   threePaths[int_selected_path_index_2]
    // );

    // const simulationApiFullData: any = await fourthApiCallSimulate(
    //   input_box_step_btn_click
    // );
    // check what is returned here. 
    
    
    const simulationApiFullData: any = await gatherDataAndUpdate(
      input_box_step_btn_click,
      updatedAllSingleCurveSelectedBlackPath
    )
    dispatch({
      type: Action.GATHER_SIMULATION_API_FULL_DATA,
      value: simulationApiFullData,
    });
    // setScatterPlotData(scatterData?.scatter_plot_data);
    setHeatMapUncertainity(simulationApiFullData?.uncertainity);

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
    setCurrentView(3);
  }catch (error) {
    console.error("Error during dispatch:", error);
  } finally {
    setLoading(false); // Stop loading spinner
  }
  };

  console.log('loading', loading)
  const objectiveSelectPath = (
    <div className="objective-questions">
      <p style={{"paddingTop":"25px"}}><strong>Based on your belief, the robot suggests three different paths, please select one of them</strong></p>
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
          label="Accept suggested path A"
        />
        <FormControlLabel
          value="2"
          control={<Radio />}
          label="Accept suggested path B"
        />
        <FormControlLabel
          value="3"
          control={<Radio />}
          label="Accept suggested path C"
        />
      </RadioGroup>
     {!loading &&  <Button
        style={{"marginTop":"20px"}}
        disabled={!selectedPathIndex}
        variant="contained"
        color="secondary"
        onClick={onSubmitSelectedPath}
      >
        Submit
      </Button>}
      {loading && <CircularProgress size={24} /> }
      <Button
        style={{"marginBottom":"15px","marginLeft": "429px", "marginTop":"-40px"}}
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
    </div>
  );
//////      4th step 
const onSubmitRankingEvaluation = () => {
  dispatch({
    type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
    value: input_box_step_btn_click + 1,
  });
  setCurrentView(4);
};

const rankingEvaluationPanel_Step4 = (
  <div className="objective-questions">
    <p style={{"paddingTop":"25px"}}><strong>Ranking Evaluation  Panel</strong></p>
    <RatingComponent/>
    <Button
          className="continueButton"
          variant="contained"
          color="primary"
          style={{"marginTop":"45px", "marginBottom":"15px"}}
          onClick={onSubmitRankingEvaluation}>
          Submit ranking
        </Button>
        <Button
        style={{"marginBottom":"15px","marginLeft": "429px", "marginTop":"-65px"}}
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
  </div>
);

/////////////// 5th step  TODO: CHANGE WHOLE OF THIS ////////
const onSubmitHypothesisConfidence = () => {
  setLoading(true); // Start loading spinner
    
  try{
    dispatch({
    type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
    value: input_box_step_btn_click + 1,
  });
  setCurrentView(5);
}catch (error) {
  console.error("Error during dispatch:", error);
} finally {
  setLoading(false); // Stop loading spinner
}
};

const [hypoConfidence, setHypoConfidence] = useState<number>(0);
const [hypothesisOpen, setHypothesisOpen] = useState<boolean>(false);

const handleHypoResponse = (confidence: number, texts: string[]) => {
  setHypoConfidence(confidence);
  setHypothesisOpen(false); // Close the HypothesisConfidencePanel
};

const confidenceTexts = ['Very Low', 'Low', 'Neutral', 'High', 'Very High']; // Example array, replace with actual texts

const HypothesisConfidencePanel_Step5 = (
  <div className="objective-questions">
    <p style={{"paddingTop":"25px"}}><strong>Provide Your Hypothesis Confidence</strong></p>
    <HypothesisConfidencePanel
      open={hypothesisOpen}
      hypoConfidence={hypoConfidence}
      confidenceTexts={confidenceTexts}
      setHypothesisOpen={setHypothesisOpen}
      handleHypoResponse={handleHypoResponse}
    />
   
  {!loading &&  <Button
      className="continueButton"
      variant="contained"
      color="primary"
      style={{"marginTop":'25px'}}
      onClick={onSubmitHypothesisConfidence}>
        Submit Hypothesis
      </Button> }
      {loading && <CircularProgress size={24} /> }
      <br/>
      <br/>
      <Button
        style={{"marginBottom":"15px","marginLeft": "429px", "marginTop":"-75px"}}
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
  </div>
);

///////////////////////////////// 6th step

  const handleTransitionState = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedTransitionState(event.target.value);
  };

  const onSubmitTransitionState = async () => {
    setLoading(true); // Start loading spinner
    
    try{
    setUpdateTransition(true)
  
    if (selectedTransitionState === '1') {
      setCurrentView(1);
      setGenerate3newPaths(true);
    } else if (selectedTransitionState === '2') {
      setCurrentView(0);
    } else if (selectedTransitionState === '3') {
      setCurrentView(6);
      setTimeout(() => setCurrentView(1), 3000); // Wait for 3 seconds before redirecting
    } else {
      history.push('/survey');
    }

    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });
  }catch (error) {
    console.error("Error during dispatch:", error);
  } finally {
    setLoading(false); // Stop loading spinner
  }
  };


  const objectiveTranisition = (
    <div className="objective-questions">
       <p style={{"paddingTop":"25px"}}><strong>During the sampling process, the following objectives are considered.</strong></p>

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
      {!loading && <Button
      style={{"marginTop":'15px'}}
        disabled={selectedBelief === ''}
        variant="contained"
        color="secondary"
        onClick={onSubmitTransitionState}
      >
        Submit Transition State
      </Button>}
      {loading && <CircularProgress size={24} /> }
      <br/>
      <br/>
      <Button
        style={{"marginBottom":"15px","marginLeft": "429px", "marginTop":"-80px"}}
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
    </div>
  );

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
    rankingEvaluationPanel_Step4,
    // objectiveGatherData,
    HypothesisConfidencePanel_Step5,
    objectiveTranisition,
    comingSoon,
  ];

  const collectionRightPanel = (
    <div className="collectionRightPanel" style={{marginLeft:'80px'}}>
         <Typography
        variant="h6"
        style={{ textAlign: 'center' }}
      >
      Information Gain 
      </Typography>
      <RobotChart currentselectedpath={selectedPathIndex}  heatMapType='INFO_GAIN'/>
      <Typography
        variant="h6"
        style={{  textAlign: 'center' }}
      >
       Discrepancy Reward
      </Typography>
      <RobotChart currentselectedpath={selectedPathIndex}  heatMapType='DISCREPANCY_REWARD'/>
    </div>
  );

  const ChartTabs = () => (
    <Box sx={{ width: '100%' }}>
        <Typography
        variant="h6"
        style={{ marginTop: '10px', marginLeft:'300px' }}
      >
       World Map With Robot Actual Trajectory
      </Typography>
   
      {/* <ShearVsMoisturePlot width={550} height={550} /> */}

      <UpperLeftRobotChart currentselectedpath={selectedPathIndex} />

 
      <div className="collectionRightPanel" 
       style={{
        marginLeft: '30px',
        marginRight: '30px',
        boxShadow:' 0px 2px 6px rgba(0, 0, 0, 0.3)'
      }}>
        {!updateTransition && (
          <div className="user-feedback" style={{    marginLeft: '50px',
            marginRight: '50px',}}>
            {userFeedbackStateMap[input_box_step_btn_click]}
          </div>
        )}
        {updateTransition && (
          <div className="user-feedback" style={{    marginLeft: '50px',
            marginRight: '50px',}}>
            {userFeedbackStateMap[currentView]}
          </div>
        )}
      </div>
   


      
      {/* <Typography
        variant="h6"
        style={{ marginTop: '50px', textAlign: 'center' }}
      >
      
     Collected Shear Data from the Transect
      </Typography>
    
      Height and Width of the image in the background is provided via prop 
      <ShearStrengthOnWorldMapChart width={650} height={650} shearPlotdata={scatter_Plot_Data}/>  */}

    </Box>
  );

  const [confirmConcludeOpen, setConfirmConcludeOpen] = useState(false);

  const onQuit = () => {
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
          <Grid item xs={12} md={6} style={{padding:'0px'}}>
            {<ChartTabs />}
          </Grid>
          <Grid item xs={12} md={6} className="rightDecisionPanel" style={{paddingTop:'5px'}}>
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
