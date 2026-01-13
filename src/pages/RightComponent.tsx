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
import { submit_rating } from '../ApiCalls/submit_rating';
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
import MCTSBarChart from '../components/Charts/MCTSBarChart';




const NO_OF_ITERATION = 1;
const RightComponent = () => {
  const [loading, setLoading] = useState(false);
  const [selectedBelief, setSelectedBelief] = useState<string>('');
  const [userBeliefText, setUserBeliefText] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [chosenIndex, setChosenIndex] = useState('');
  const [savedPathIndex, setSavedPathIndex] = useState('');
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
  const [numPaths, setNumPaths] = useState<number>(0);
  const history = useHistory();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [mctsLabels, setMctsLabels] = useState<string[]>([]);
  const [mctsRewards, setMctsRewards] = useState<number[]>([]);


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
        <p style={{paddingTop: "20px", marginBottom: "20px", fontSize: "16px", color: "#333"}}><strong>Based on the data collected so far, select which of the following beliefs you currently hold</strong></p>
        <FormControl component="fieldset" style={{marginBottom: "24px"}}>
          <RadioGroup
            value={selectedBelief}
            onChange={(e) => handleChangeRadio(e.target.value)}
          >
            <FormControlLabel
              value="1"
              control={<Radio />}
              label="More data is needed to make an initial evaluation"
              style={{marginBottom: "8px"}}
            />
            <FormControlLabel
              value="2"
              control={<Radio />}
              label="There is a discrepancy between the data and the hypothesis needs additional evaluation"
              style={{marginBottom: "8px"}}
            />
            <FormControlLabel
              value="3"
              control={<Radio />}
              label="The data seems to support the hypothesis, but additional evaluation is needed"
              style={{marginBottom: "8px"}}
            />
            
          </RadioGroup>
        </FormControl>
        <p style={{marginBottom: "12px", fontSize: "16px", color: "#333"}}><strong>Please describe your additional belief about the data collected so far:</strong></p>
        <textarea onChange={onUserTextInputForBelief} rows={5} cols={85} style={{marginBottom: "20px", width: "100%", maxWidth: "500px"}} />
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px"}}>
          <div>
            {!loading && <Button
              disabled={selectedBelief === ''}
              variant="contained"
              color="secondary"
              onClick={onSubmitHumanBelief}
              style={{padding: "10px 24px"}}
            >
              Next  
            </Button>}
            {loading && <CircularProgress size={24} /> }
          </div>
          <Button
            className="continueButton"
            variant="contained"
            color="primary"
            onClick={onContinueClick}
            style={{padding: "10px 24px"}}>
            End Collection Transect
          </Button>
        </div>
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
    console.log(newRanking);
  };

  const onSubmitRanking = async () => {
    setLoading(true); // Start loading spinner
    
    try{
      
     const initial_human_belief = {
      human_belief_selected_option: [selectedBelief],
      human_belief_text_description: userBeliefText,
    };
    // if (chosenIndex !== null && chosenIndex !== '') {
    //   console.log("Performing RATE behavior...");
    //   const simulationApiFullData = await submit_rating(ranking, chosenIndex);
    // }
    // dispatch({
    //   type: Action.GATHER_SIMULATION_API_FULL_DATA,
    //   value: simulationApiFullData,
    // });
    

    let threePaths;
    threePaths = await pathsuggestion(
      NO_OF_ITERATION,
      initial_human_belief,
      ranking,
      all_single_curve_selected_black_path,  
    );
    const realPaths = threePaths.filter(path =>
      Array.isArray(path) &&
      path.some(segment => Array.isArray(segment) && segment.length > 0)
    );
    
    console.log("Raw paths:", threePaths);
    console.log("Filtered real paths:", realPaths);
    console.log(threePaths)
    setNumPaths(realPaths.length)
    dispatch({
      type: Action.UPDATE_INPUT_BOX_BTN_CLICK,
      value: input_box_step_btn_click + 1,
    });

    dispatch({
      type: Action.GENERATE_THREE_PATHS,
      value: threePaths,
    });
    setHasSubmitted(false);

   
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
      <p style={{paddingTop: "20px", marginBottom: "20px"}}><strong>Click next to continue</strong></p>

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
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px"}}>
        <div>
          {!loading && <Button
            disabled={selectedBelief === ''}
            variant="contained"
            color="secondary"
            onClick={onSubmitRanking}
          >
            Next
          </Button>}
          {loading && <CircularProgress size={24} /> }
        </div>
        <Button
          className="continueButton"
          variant="contained"
          color="primary"
          onClick={onContinueClick}>
          End Collection Transect
        </Button>
      </div>
    </>
  );
  //////////////////////////////////////////////////////////////////////////3RD INPUT BOX ///////////////////////

  const handleSelectPath = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value; // e.g., 'selectA', 'preferB', etc.
    console.log("radio clicked:", val);
  
    // Set both selectedPathIndex and savedPathIndex if needed
    setSelectedLabel(val);
  
    if (val === 'selectA') setSavedPathIndex("1");
    if (val === 'selectB') setSavedPathIndex("2");
    setChosenIndex('1')
    if (val === "selectB" || val === "preferB") {
      setChosenIndex('2')
    }
  };

  const onSubmitSelectedPath = async () => {
    setHasSubmitted(true);
    setLoading(true); // Start loading spinner
    let int_chosen_idx = 0;
    try{
    console.log('selectedPathIndex', selectedLabel)
    setChosenIndex('1')
    if (selectedLabel === "selectB" || selectedLabel === "preferB") {
      setChosenIndex('2')
      int_chosen_idx = 1
    } 
    const isSelectAction = 
      selectedLabel === "selectA" || selectedLabel === "selectB";

    const isRateAction =
      selectedLabel === "rateA" || selectedLabel === "rateB";

    const isPreferAction =
      selectedLabel === "preferA" || selectedLabel === "preferB";


    const int_selected_path_index = int_chosen_idx
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
    //Dispatch the action with the updated state
    // dispatch({
    //   type: Action.ALL_SELECTED_BLACK_PATH,
    //   value: updatedAllSingleCurveSelectedBlackPath,
    // });

    // dispatch({
    //   type: Action.GENERATE_PATH_FULL_DATA,
    //   value: jsonCreationApiResponse,
    // });

    const int_selected_path_index_2 = int_chosen_idx;

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
    
    // --- BRANCH LOGIC HERE ---
    if (isSelectAction) {
      console.log("Performing SELECT behavior...");
      dispatch({
        type: Action.ALL_SELECTED_BLACK_PATH,
        value: updatedAllSingleCurveSelectedBlackPath,
      });
  
      dispatch({
        type: Action.GENERATE_PATH_FULL_DATA,
        value: jsonCreationApiResponse,
      });
      // Do your SELECT workflow here
      const simulationApiFullData: any = await gatherDataAndUpdate(
        input_box_step_btn_click,
        updatedAllSingleCurveSelectedBlackPath
      )
      dispatch({
        type: Action.GATHER_SIMULATION_API_FULL_DATA,
        value: simulationApiFullData,
      });
      setMctsLabels(simulationApiFullData?.mcts_labels ?? []);
      // setScatterPlotData(scatterData?.scatter_plot_data);
      let mcts_rewards
      mcts_rewards = simulationApiFullData?.mcts_rewards
      console.log(mcts_rewards[int_chosen_idx])
      console.log(simulationApiFullData?.mcts_labels)
      setMctsRewards(mcts_rewards[int_chosen_idx]);
      setHeatMapUncertainity(simulationApiFullData?.uncertainity);
    }

    if (isRateAction) {
      // Do your RATE workflow here
    }

    if (isPreferAction) {
      console.log("Performing PREFER behavior...");
      // Do your PREFER workflow here
    }
    // const simulationApiFullData: any = await gatherDataAndUpdate(
    //   input_box_step_btn_click,
    //   updatedAllSingleCurveSelectedBlackPath
    // )
    // dispatch({
    //   type: Action.GATHER_SIMULATION_API_FULL_DATA,
    //   value: simulationApiFullData,
    // });
    // // setScatterPlotData(scatterData?.scatter_plot_data);
    // setHeatMapUncertainity(simulationApiFullData?.uncertainity);

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
  console.log('numpaths', numPaths)
  const objectiveSelectPath = (
    <div className="objective-questions">
      <p
        style={{
          paddingTop: "20px",
          marginBottom: "20px",
          fontSize: "16px",
          color: "#333"
        }}
      >
        <strong>
          {numPaths === 2
            ? "Two paths were generated. Please choose how you'd like to proceed."
            : "One path was generated. Please choose how you'd like to proceed."}
        </strong>
      </p>
  
      <FormControl component="fieldset" style={{ marginBottom: "24px" }}>
        <RadioGroup
          row
          aria-label="path selection"
          name="path_selection"
          value={selectedLabel}
          onChange={handleSelectPath}
        >
          {numPaths === 2 && (
            <>
              <FormControlLabel
                value="preferA"
                control={<Radio />}
                label="Prefer path A"
                style={{ marginRight: "16px" }}
              />
              <FormControlLabel
                value="preferB"
                control={<Radio />}
                label="Prefer path B"
                style={{ marginRight: "16px" }}
              />
              <FormControlLabel
                value="selectA"
                control={<Radio />}
                label="Select path A"
                style={{ marginRight: "16px" }}
              />
              <FormControlLabel
                value="selectB"
                control={<Radio />}
                label="Select path B"
                style={{ marginRight: "16px" }}
              />
            </>
          )}
  
          {numPaths === 1 && (
            <>
              <FormControlLabel
                value="selectA"
                control={<Radio />}
                label="Select path A"
                style={{ marginRight: "16px" }}
              />
              <FormControlLabel
                value="rateA"
                control={<Radio />}
                label="Rate path A"
                style={{ marginRight: "16px" }}
              />
            </>
          )}
        </RadioGroup>
      </FormControl>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px"}}>
        <div>
          {!loading && <Button
            disabled={!selectedLabel}
            variant="contained"
            color="secondary"
            onClick={onSubmitSelectedPath}
            style={{padding: "10px 24px"}}
          >
            Submit
          </Button>}
          {loading && <CircularProgress size={24} /> }
        </div>
        <Button
          className="continueButton"
          variant="contained"
          color="primary"
          onClick={onContinueClick}
          style={{padding: "10px 24px"}}>
          End Collection Transect
        </Button>
      </div>
    </div>
  );
  // const objectiveSelectPath = (
  //   <div className="objective-questions">
  //     <p style={{paddingTop: "20px", marginBottom: "20px", fontSize: "16px", color: "#333"}}><strong>Based on your belief, the robot suggests three different paths, please select one of them</strong></p>
  //     <FormControl component="fieldset" style={{marginBottom: "24px"}}>
  //       <RadioGroup
  //         row
  //         aria-label="path selection"
  //         name="path_selection"
  //         value={selectedPathIndex}
  //         onChange={handleSelectPath}
  //       >
  //         <FormControlLabel
  //           value="1"
  //           control={<Radio />}
  //           label="Accept suggested path A"
  //           style={{marginRight: "16px"}}
  //         />
  //         <FormControlLabel
  //           value="2"
  //           control={<Radio />}
  //           label="Accept suggested path B"
  //           style={{marginRight: "16px"}}
  //         />
  //         <FormControlLabel
  //           value="3"
  //           control={<Radio />}
  //           label="Accept suggested path C"
  //         />
  //       </RadioGroup>
  //     </FormControl>
  //     <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px"}}>
  //       <div>
  //         {!loading && <Button
  //           disabled={!selectedPathIndex}
  //           variant="contained"
  //           color="secondary"
  //           onClick={onSubmitSelectedPath}
  //           style={{padding: "10px 24px"}}
  //         >
  //           Submit
  //         </Button>}
  //         {loading && <CircularProgress size={24} /> }
  //       </div>
  //       <Button
  //         className="continueButton"
  //         variant="contained"
  //         color="primary"
  //         onClick={onContinueClick}
  //         style={{padding: "10px 24px"}}>
  //         End Collection Transect
  //       </Button>
  //     </div>
  //   </div>
  // );
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
    <p style={{paddingTop: "20px", marginBottom: "20px"}}><strong>Ranking Evaluation Panel</strong></p>
    <RatingComponent chosenIndex={chosenIndex}/>
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px"}}>
      <Button
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onSubmitRankingEvaluation}>
        Submit ranking
      </Button>
      <Button
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
    </div>
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
    <p style={{paddingTop: "20px", marginBottom: "20px"}}><strong>Provide Your Hypothesis Confidence</strong></p>
    <HypothesisConfidencePanel
      open={hypothesisOpen}
      hypoConfidence={hypoConfidence}
      confidenceTexts={confidenceTexts}
      setHypothesisOpen={setHypothesisOpen}
      handleHypoResponse={handleHypoResponse}
    />
   
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px"}}>
      <div>
        {!loading && <Button
          className="continueButton"
          variant="contained"
          color="primary"
          onClick={onSubmitHypothesisConfidence}>
          Submit Hypothesis
        </Button> }
        {loading && <CircularProgress size={24} /> }
      </div>
      <Button
        className="continueButton"
        variant="contained"
        color="primary"
        onClick={onContinueClick}>
        End Collection Transect
      </Button>
    </div>
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
       <p style={{paddingTop: "20px", marginBottom: "20px", fontSize: "16px", color: "#333"}}><strong>During the sampling process, the following objectives are considered.</strong></p>

      <FormControl component="fieldset" style={{marginBottom: "24px"}}>
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
            style={{marginBottom: "8px", marginRight: "16px"}}
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="Update belief rankings to receive new suggestions from Robot of where to sample next"
            style={{marginBottom: "8px", marginRight: "16px"}}
          />
          <FormControlLabel
            value="3"
            control={<Radio />}
            label="Ignore suggestions and select a location for Robot to sample next"
            style={{marginBottom: "8px", marginRight: "16px"}}
          />
          <FormControlLabel
            value="4"
            control={<Radio />}
            label="Stop data collection and make a conclusion about the hypothesis"
            style={{marginBottom: "8px"}}
          />
        </RadioGroup>
      </FormControl>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px"}}>
        <div>
          {!loading && <Button
            disabled={selectedBelief === ''}
            variant="contained"
            color="secondary"
            onClick={onSubmitTransitionState}
            style={{padding: "10px 24px"}}
          >
            Submit Transition State
          </Button>}
          {loading && <CircularProgress size={24} /> }
        </div>
        <Button
          className="continueButton"
          variant="contained"
          color="primary"
          onClick={onContinueClick}
          style={{padding: "10px 24px"}}>
          End Collection Transect
        </Button>
      </div>
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
    <div className="collectionRightPanel" style={{marginLeft: '80px', padding: '20px 0'}}>
         <Typography
        variant="h6"
        style={{ textAlign: 'center', marginBottom: '15px', color: '#333', fontWeight: '600' }}
      >
            {mctsLabels.length > 0 && (
      <>
        <Typography
          variant="h6"
          style={{
            textAlign: 'center',
            marginTop: '30px',
            marginBottom: '15px',
            color: '#333',
            fontWeight: '600',
          }}
        >
          MCTS Rewards
        </Typography>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MCTSBarChart
            labels={mctsLabels}
            rewards={mctsRewards}
            width={420}
            height={260}
          />
        </div>
      </>
    )}
      Information Gain 
      </Typography>
      <RobotChart currentselectedpath={chosenIndex}  heatMapType='INFO_GAIN' hasSubmitted={hasSubmitted}/>
      <Typography
        variant="h6"
        style={{ textAlign: 'center', marginTop: '20px', marginBottom: '15px', color: '#333', fontWeight: '600' }}
      >
       Discrepancy Reward
      </Typography>
      <RobotChart currentselectedpath={chosenIndex}  heatMapType='DISCREPANCY_REWARD'  hasSubmitted={hasSubmitted}/>
    </div>
  );

  const ChartTabs = () => (
    <Box sx={{ width: '100%' }}>
        <Typography
        variant="h6"
        style={{ marginTop: '10px', marginBottom: '15px', textAlign: 'center', color: '#333', fontWeight: '600' }}
      >
       World Map With Robot Actual Trajectory
      </Typography>
   
      {/* <ShearVsMoisturePlot width={550} height={550} /> */}

      <UpperLeftRobotChart currentselectedpath={chosenIndex} hasSubmitted={hasSubmitted}/>

 
      <div className="collectionRightPanel" 
       style={{
        margin: '20px 30px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px'
      }}>
        {!updateTransition && (
          <div className="user-feedback" style={{margin: '0 50px'}}>
            {userFeedbackStateMap[input_box_step_btn_click]}
          </div>
        )}
        {updateTransition && (
          <div className="user-feedback" style={{margin: '0 50px'}}>
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
          <Grid item xs={12} md={6} style={{padding: '0'}}>
            {<ChartTabs />}
          </Grid>
          <Grid item xs={12} md={6} className="rightDecisionPanel" style={{paddingTop: '10px'}}>
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
