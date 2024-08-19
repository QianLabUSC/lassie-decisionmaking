// import * as React from "react";
// import { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import Button from '@material-ui/core/Button';
// import ConsentPanel from '../components/ConsentPanel';
// import ProgressBar from '../components/ProgressBar';
// import { CSSTransition, TransitionGroup } from "react-transition-group";
// import { useStateValue, Action } from '../state';
// import { initialConfidenceTexts } from '../constants';
// import "../styles/intro.scss";
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import { isInteger, isNumber, values } from "lodash";

// const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');
// const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');

// export default function Intro(props) {
//     const history = useHistory();
//     const [globalState, dispatch] = useStateValue();
//     const { initialHypo } = globalState;
//     const [currentPage, setCurrentPage] = useState(0);
//     const [animationDirection, setAnimationDirection] = useState("Right");
//     const pageCount = 3; //TODO: changed page count
//     // Set the textarea as reqiured for users
//     const [disable, setDisable] = useState(true);

//     function handleChange(e) {
//         setDisable(e.target.value === '');
//     }

//     const onBackClick = () => {
//         setAnimationDirection("Left");
//         setTimeout(() => {
//             setCurrentPage(currentPage - 1);
//         }, 100);
//     }

//     const onNextClick = () => {
//         if (currentPage + 1 >= pageCount) {
            
//             // When the user completes the intro section, set the "introCompleted" state property to true
//             // so that the user will not be redirected to the intro section when revisiting the website
//             dispatch({
//                 type: Action.SET_INTRO_STATUS, 
//                 value: true
//             });
//             history.push("/decision");

//         } else {
//             setAnimationDirection("Right");
//             setTimeout(() => {
//                 setCurrentPage(currentPage + 1);
//             }, 100);
//         }
//     }

//     const [nextDisable, setNextDisablee] = useState(true);
//     function onNextFreeResponse(e) {
//         if (isNumber(e)) setNextDisablee(isNumber(e) ? false : true);
//     }

//     const buttonRow = (
//         <div className="buttonRow">
//             {
//                 currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
//             }
//             <Button disabled={nextDisable} onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
//         </div>
//     );

//     const handleResponse = (value: any) => {
//         dispatch({ 
//             type: Action.SET_INIT_HYPO_CONFIDENCE, 
//             value: value 
//         });
//     }

//     const pages = [
//         // Panel 0
//         <div className="introCard">
//             <ConsentPanel onCompletion={onNextClick}/>
//         </div>,
 
//         // Panel 1
//         // Apply new changes 6/7/2022 by Zeyu
//         <div className="introCard">
//             <div className="page1 contentWrapper">
//                 <div className="contentContainer">
//                     <img src={robotDesertGif} className="robotGif"/>
//                     <div className="text">
//                         <p>
//                             The mobile hexapod robot RHex needs your help testing a hypothesis about the relationship 
//                             between sand strength and moisture at White Sands National Monument in New Mexico.
//                         </p>
//                         <p>
//                             RHex has already collected some strength and moisture data at a dune. Strength was measured 
//                             by mechanical resistance to shear (dragging) during robot leg-soil interactions and moisture 
//                             was measured using a probe attached to the robot.
//                         </p>
//                     </div>

//                     <img src={singleTransectNullHypothesis} className="nullHypothesisImg"/> 

//                     <div className="text">
//                         <p>
//                             Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune crest (see purple line).
//                             <br></br>
//                             <br></br>
//                             <b>The goal for you and RHex today is to select measurement locations on 
//                                 the dune transect (from crest to interdune) to test the following hypothesis: </b>
//                             Soil strength will increase as moisture increases until sand is saturated (somewhere along the stoss slope), 
//                             at which point strength will be constant as moisture continues to increase (see blue line).
//                         </p>
//                     </div>

//                     <div className="hypothesisBlock">
//                         <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
//                         <div className="hypothesisText">
//                             Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
//                         </div>
//                         <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
//                             <Select
//                                 style={{fontSize: '1.5vh'}}
//                                 value={initialHypo + 3}
//                                 onChange={event => {
//                                     handleResponse(Number(event.target.value) - 3);
//                                     onNextFreeResponse(Number(event.target.value) - 3);
//                                 }}>
//                                 {
//                                     initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
//                                 }
//                             </Select>
//                         </FormControl>
//                     </div>
//                 </div>
//             </div>
//             { buttonRow }
//         </div>,

//         //Panel 2 - Objectives page 
//         <div className="introCard">
//             <div className="page2 contentWrapper">
//                 <div className="contentContainer">
//                     <div className="text">
//                         <p>
//                             Text about what is happening on this page:
//                         </p>
//                     </div>
//                     <div className="objectiveRankingBlock">
//                         <div className="objectiveRankingTitle"><strong>Initial Objective Ranking</strong></div>
//                         <div className="objectiveRankingText">
//                             Provide a ranking of the following two beliefs/objectives, with 1 being the strongest agreement. You must assign a unique number to each objective/belief.
//                         </div>
//                         <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
//                             <Select
//                                 style={{fontSize: '1.5vh'}}
//                                 value={initialHypo + 3}
//                                 onChange={event => {
//                                     handleResponse(Number(event.target.value) - 3);
//                                     onNextFreeResponse(Number(event.target.value) - 3);
//                                 }}>
//                                 {
//                                     initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
//                                 }
//                             </Select>
//                         </FormControl>
//                     </div>
//                     <div className="resolutionMethodBlock">
//                         <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
//                         <div className="hypothesisText">
//                             Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
//                         </div>
//                         <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
//                             <Select
//                                 style={{fontSize: '1.5vh'}}
//                                 value={initialHypo + 3}
//                                 onChange={event => {
//                                     handleResponse(Number(event.target.value) - 3);
//                                     onNextFreeResponse(Number(event.target.value) - 3);
//                                 }}>
//                                 {
//                                     initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
//                                 }
//                             </Select>
//                         </FormControl>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     ];

//     return (
//         <div className="introduction">
//             <CSSTransition
//                 in={true}
//                 appear={true}
//                 timeout={500}
//                 classNames={`slide${animationDirection}`}>
//                 <TransitionGroup component={null}>
//                     <CSSTransition
//                         key={currentPage}
//                         timeout={500}
//                         classNames={`slide${animationDirection}`}>
//                         { pages[currentPage] }
//                     </CSSTransition>
//                 </TransitionGroup>
//             </CSSTransition>
//             <ProgressBar value={currentPage / pageCount}/>
//         </div>
//     )
// }


// import * as React from "react";
// import { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import Button from '@material-ui/core/Button';
// import ConsentPanel from '../components/ConsentPanel';
// import ProgressBar from '../components/ProgressBar';
// import { CSSTransition, TransitionGroup } from "react-transition-group";
// import { useStateValue, Action } from '../state';
// import { initialConfidenceTexts } from '../constants';
// import "../styles/intro.scss";
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import { isNumber } from "lodash";

// const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');
// const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');

// export default function Intro(props) {
//     const history = useHistory();
//     const [globalState, dispatch] = useStateValue();
//     const { initialHypo } = globalState;
//     const [currentPage, setCurrentPage] = useState(0);
//     const [animationDirection, setAnimationDirection] = useState("Right");
//     const pageCount = 3; // Updated page count to 3

//     const [disable, setDisable] = useState(true);
//     const [nextDisable, setNextDisablee] = useState(true);

//     const objectives = [
//         { objective: "Get more information", ranking: 1 },
//         { objective: "Check discrepancies with the hypothesis", ranking: 2 }
//     ];

//     function handleChange(e) {
//         setDisable(e.target.value === '');
//     }

//     const onBackClick = () => {
//         setAnimationDirection("Left");
//         setTimeout(() => {
//             setCurrentPage(currentPage - 1);
//         }, 100);
//     }

//     const onNextClick = () => {
//         if (currentPage + 1 >= pageCount) {
//             dispatch({
//                 type: Action.SET_INTRO_STATUS, 
//                 value: true
//             });
//             history.push("/decision");
//         } else {
//             setAnimationDirection("Right");
//             setTimeout(() => {
//                 setCurrentPage(currentPage + 1);
//             }, 100);
//         }
//     }

//     function onNextFreeResponse(e) {
//         if (isNumber(e)) setNextDisablee(isNumber(e) ? false : true);
//     }

//     const buttonRow = (
//         <div className="buttonRow">
//             {
//                 currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
//             }
//             <Button disabled={nextDisable} onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
//         </div>
//     );

//     const handleResponse = (value: any) => {
//         dispatch({ 
//             type: Action.SET_INIT_HYPO_CONFIDENCE, 
//             value: value 
//         });
//     }

//     const objectivesToRank = 
//         <table className="dropDownMenuGroup" style={{marginBottom: '2vh'}}>
//             <tbody>
//                 {
//                     objectives.map((obj, i) => (
//                         <tr key={obj.objective}>
//                             <td>
//                                 <FormControl>
//                                     <Select
//                                         id="objectives-select"
//                                         value={obj.ranking}
//                                         onChange={(e) => {
//                                             let objectivesTemp = [...objectives];
//                                             if (typeof e.target.value === 'number') objectivesTemp[i].ranking = e.target.value;
//                                             dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
//                                         }}
//                                     >
//                                         {Array.from({ length: objectives.length }, (_, i) => i + 1).map((rank) => (
//                                             <MenuItem key={obj.objective + rank} value={rank}>{rank}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </td>
//                             <td>
//                                 { obj.objective }
//                             </td>
//                         </tr>
//                     ))
//                 }
//             </tbody>
//         </table>;

//     const pages = [
//         // Panel 0
//         <div className="introCard">
//             <ConsentPanel onCompletion={onNextClick}/>
//         </div>,
 
//         // Panel 1
//         <div className="introCard">
//             <div className="page1 contentWrapper">
//                 <div className="contentContainer">
//                     <img src={robotDesertGif} className="robotGif"/>
//                     <div className="text">
//                         <p>
//                             The mobile hexapod robot RHex needs your help testing a hypothesis about the relationship 
//                             between sand strength and moisture at White Sands National Monument in New Mexico.
//                         </p>
//                         <p>
//                             RHex has already collected some strength and moisture data at a dune. Strength was measured 
//                             by mechanical resistance to shear (dragging) during robot leg-soil interactions and moisture 
//                             was measured using a probe attached to the robot.
//                         </p>
//                     </div>

//                     <img src={singleTransectNullHypothesis} className="nullHypothesisImg"/> 

//                     <div className="text">
//                         <p>
//                             Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune crest (see purple line).
//                             <br></br>
//                             <br></br>
//                             <b>The goal for you and RHex today is to select measurement locations on 
//                                 the dune transect (from crest to interdune) to test the following hypothesis: </b>
//                             Soil strength will increase as moisture increases until sand is saturated (somewhere along the stoss slope), 
//                             at which point strength will be constant as moisture continues to increase (see blue line).
//                         </p>
//                     </div>

//                     <div className="hypothesisBlock">
//                         <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
//                         <div className="hypothesisText">
//                             Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
//                         </div>
//                         <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
//                             <Select
//                                 style={{fontSize: '1.5vh'}}
//                                 value={initialHypo + 3}
//                                 onChange={event => {
//                                     handleResponse(Number(event.target.value) - 3);
//                                     onNextFreeResponse(Number(event.target.value) - 3);
//                                 }}>
//                                 {
//                                     initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
//                                 }
//                             </Select>
//                         </FormControl>
//                     </div>
//                 </div>
//             </div>
//             { buttonRow }
//         </div>,

//         // Panel 2 - New Objectives Page
//         <div className="introCard">
//             <div className="page2 contentWrapper">
//                 <div className="contentContainer">
//                     <div className="text">
//                         <p>
//                             Please rank the following objectives:
//                         </p>
//                     </div>
//                     {objectivesToRank}
//                 </div>
//             </div>
//             { buttonRow }
//         </div>
//     ];

//     return (
//         <div className="introduction">
//             <CSSTransition
//                 in={true}
//                 appear={true}
//                 timeout={500}
//                 classNames={`slide${animationDirection}`}>
//                 <TransitionGroup component={null}>
//                     <CSSTransition
//                         key={currentPage}
//                         timeout={500}
//                         classNames={`slide${animationDirection}`}>
//                         { pages[currentPage] }
//                     </CSSTransition>
//                 </TransitionGroup>
//             </CSSTransition>
//             <ProgressBar value={currentPage / pageCount}/>
//         </div>
//     )
// }



















// import * as React from "react";
// import { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import Button from '@material-ui/core/Button';
// import ConsentPanel from '../components/ConsentPanel';
// import ProgressBar from '../components/ProgressBar';
// import { CSSTransition, TransitionGroup } from "react-transition-group";
// import { useStateValue, Action } from '../state';
// import { initialConfidenceTexts } from '../constants';
// import "../styles/intro.scss";
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import { isNumber } from "lodash";

// const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');
// const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');

// export default function Intro(props) {
//     const history = useHistory();
//     const [globalState, dispatch] = useStateValue();
//     const { initialHypo } = globalState;
//     const [currentPage, setCurrentPage] = useState(0);
//     const [animationDirection, setAnimationDirection] = useState("Right");
//     const pageCount = 3; // Updated page count to 3

//     const [disable, setDisable] = useState(true);
//     const [nextDisable, setNextDisablee] = useState(true);

//     // Define objectives state
//     const [objectives, setObjectives] = useState([
//         { objective: "Info coverage", ranking: 1 },
//         { objective: "Hypothesis discrepancy", ranking: 2 }
//     ]);


//     const [resolutionMethods, setResolutionMethods] = useState('');


//     function handleChange(e) {
//         setDisable(e.target.value === '');
//     }

//     const onBackClick = () => {
//         setAnimationDirection("Left");
//         setTimeout(() => {
//             setCurrentPage(currentPage - 1);
//         }, 100);
//     }

//     const onNextClick = () => {
//         if (currentPage + 1 >= pageCount) {
//             dispatch({
//                 type: Action.SET_INTRO_STATUS, 
//                 value: true
//             });
//             history.push("/decision");
//         } else {
//             setAnimationDirection("Right");
//             setTimeout(() => {
//                 setCurrentPage(currentPage + 1);
//             }, 100);
//         }
//     }

//     function onNextFreeResponse(e) {
//         if (isNumber(e)) setNextDisablee(isNumber(e) ? false : true);
//     }

//     const buttonRow = (
//         <div className="buttonRow">
//             {
//                 currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
//             }
//             <Button disabled={nextDisable} onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
//         </div>
//     );

//     const handleResponse = (value: any) => {
//         dispatch({ 
//             type: Action.SET_INIT_HYPO_CONFIDENCE, 
//             value: value 
//         });
//     }

//     const objectivesToRank = 
//         <table className="dropDownMenuGroup" style={{marginBottom: '2vh'}}>
//             <tbody>
//                 {
//                     objectives.map((obj, i) => (
//                         <tr key={obj.objective}>
//                             <td>
//                                 <FormControl>
//                                     <Select
//                                         id="objectives-select"
//                                         value={obj.ranking}
//                                         onChange={(e) => {
//                                             let objectivesTemp = [...objectives];
//                                             if (typeof e.target.value === 'number') objectivesTemp[i].ranking = e.target.value;
//                                             setObjectives(objectivesTemp); // Update local state
//                                             dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
//                                         }}
//                                     >
//                                         {Array.from({ length: objectives.length }, (_, i) => i + 1).map((rank) => (
//                                             <MenuItem key={obj.objective + rank} value={rank}>{rank}</MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             </td>
//                             <td>
//                                 { obj.objective }
//                             </td>
//                         </tr>
//                     ))
//                 }
//             </tbody>
//         </table>;

        

//     const pages = [
//         // Panel 0
//         <div className="introCard">
//             <ConsentPanel onCompletion={onNextClick}/>
//         </div>,
 
//         // Panel 1
//         <div className="introCard">
//             <div className="page1 contentWrapper">
//                 <div className="contentContainer">
//                     <img src={robotDesertGif} className="robotGif"/>
//                     <div className="text">
//                         <p>
//                             The mobile hexapod robot RHex needs your help testing a hypothesis about the relationship 
//                             between sand strength and moisture at White Sands National Monument in New Mexico.
//                         </p>
//                         <p>
//                             RHex has already collected some strength and moisture data at a dune. Strength was measured 
//                             by mechanical resistance to shear (dragging) during robot leg-soil interactions and moisture 
//                             was measured using a probe attached to the robot.
//                         </p>
//                     </div>

//                     <img src={singleTransectNullHypothesis} className="nullHypothesisImg"/> 

//                     <div className="text">
//                         <p>
//                             Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune crest (see purple line).
//                             <br></br>
//                             <br></br>
//                             <b>The goal for you and RHex today is to select measurement locations on 
//                                 the dune transect (from crest to interdune) to test the following hypothesis: </b>
//                             Soil strength will increase as moisture increases until sand is saturated (somewhere along the stoss slope), 
//                             at which point strength will be constant as moisture continues to increase (see blue line).
//                         </p>
//                     </div>

//                     <div className="hypothesisBlock">
//                         <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
//                         <div className="hypothesisText">
//                             Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
//                         </div>
//                         <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
//                             <Select
//                                 style={{fontSize: '1.5vh'}}
//                                 value={initialHypo + 3}
//                                 onChange={event => {
//                                     handleResponse(Number(event.target.value) - 3);
//                                     onNextFreeResponse(Number(event.target.value) - 3);
//                                 }}>
//                                 {
//                                     initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
//                                 }
//                             </Select>
//                         </FormControl>
//                     </div>
//                 </div>
//             </div>
//             { buttonRow }
//         </div>,

//         // Panel 2 - New Objectives Page
//         <div className="introCard">
//             <div className="page2 contentWrapper">
//                 <div className="contentContainer">
//                 <div className="objectiveRankingTitle"><strong>Initial Objective Ranking</strong></div>

//                     <div className="text">
//                         <p>
//                             Please rank the following objectives:
//                         </p>
//                     </div>
//                     {objectivesToRank}
//                 </div>
//             </div>
//             { buttonRow }
//         </div>
//     ];

//     return (
//         <div className="introduction">
//             <CSSTransition
//                 in={true}
//                 appear={true}
//                 timeout={500}
//                 classNames={`slide${animationDirection}`}>
//                 <TransitionGroup component={null}>
//                     <CSSTransition
//                         key={currentPage}
//                         timeout={500}
//                         classNames={`slide${animationDirection}`}>
//                         { pages[currentPage] }
//                     </CSSTransition>
//                 </TransitionGroup>
//             </CSSTransition>
//             <ProgressBar value={currentPage / pageCount}/>
//         </div>
//     )
// }













import * as React from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ConsentPanel from '../components/ConsentPanel';
import ProgressBar from '../components/ProgressBar';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useStateValue, Action } from '../state';
import { initialConfidenceTexts, resolutionTexts } from '../constants';
import "../styles/intro.scss";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import RadioButtonGroup from '../components/RadioButtonGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import { styled } from '@material-ui/core/styles';
import { isNumber } from "lodash";
const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');
const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');

const CustomFormControlLabel = styled(FormControlLabel)({
    '& .MuiFormControlLabel-label': {
        color: 'black',
        fontSize: '13px',
        fontFamily: 'Helvetic'
    },
    '& .MuiRadio-root': {
        color: 'black',
    },
}); 

export default function Intro(props) {
    const history = useHistory();
    const [globalState, dispatch] = useStateValue();
    const { initialHypo, initialResolutionMethod } = globalState;
    const [currentPage, setCurrentPage] = useState(0);
    const [animationDirection, setAnimationDirection] = useState("Right");
    const pageCount = 3; // Updated page count to 3

    const [disable, setDisable] = useState(true);
    const [nextDisable, setNextDisablee] = useState(true);

    // Define objectives state
    const [objectives, setObjectives] = useState([
        { objective: "Get more information", ranking: 1 },
        { objective: "Check discrepancies with the hypothesis", ranking: 2 }
    ]);

    // Define radio button state
    const [selectedOption, setSelectedOption] = useState('');

    function handleChange(e) {
        setDisable(e.target.value === '');
    }

    const onBackClick = () => {
        setAnimationDirection("Left");
        setTimeout(() => {
            setCurrentPage(currentPage - 1);
        }, 100);
    }

    const onNextClick = () => {
        //if done with intro, go to decision page
        if (currentPage + 1 >= pageCount) {
            dispatch({
                type: Action.SET_INTRO_STATUS, 
                value: true
            });
            history.push("/decision");
        } else {
            setAnimationDirection("Right");
            setTimeout(() => {
                setCurrentPage(currentPage + 1);
            }, 100);
        }
    }

    function onNextFreeResponse(e) {
        if (isNumber(e)) setNextDisablee(isNumber(e) ? false : true);
    }

    const buttonRow = (
        <div className="buttonRow">
            {
                currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
            }
            <Button disabled={nextDisable} onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
        </div>
    );

    const handleResponse = (value: any) => {
        dispatch({ 
            type: Action.SET_INIT_HYPO_CONFIDENCE, 
            value: value 
        });
    }


    const combinedQuestions = (
        <div className="introCard">
            <div className="page2 contentWrapper">
                <div className="contentContainer">

                {/* <div className="objectiveBlock">
                    
                <div className="objectiveTitle"><strong>Initial Objective Ranking</strong></div>

                    <div className="objectiveText">
                        <p>Please rank the following objectives:</p>
                    </div>
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
                                                    let objectivesTemp = [...objectives];
                                                    if (typeof e.target.value === 'number') objectivesTemp[i].ranking = e.target.value;
                                                    setObjectives(objectivesTemp); // Update local state
                                                    dispatch({ type: Action.SET_OBJECTIVES, value: objectivesTemp });
                                                }}
                                            >
                                                {Array.from({ length: objectives.length }, (_, i) => i + 1).map((rank) => (
                                                    <MenuItem key={obj.objective + rank} value={rank}>{rank}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </td>
                                    <td>{obj.objective}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    </div> */}

                    <div className="resolutionMethodBlock">

                        <div className="resolutionMethodtext">
                            {/* <p>You will be asked to rank the following two objectives after seeing the initial data: <br></br>
                            1. DISCREPANCY There is either a discrepancy or a correlation between the data and the hypothesis that needs additional evaluation 
                            <br></br>
                                2.INFO COVERAGE There are areas along the dune transect (between crest and interdune) where data is needed
                            </p>
                                <p>
                                There are three possible ways that the robot can balance these objectives when suggesting sampling locations. 
                                
                                 Please select one option for the method used to resolve the objectives above:</p>

                                </p> */}
                            <p>
                                On the next page, you will be asked to rank the following two objectives after seeing the initial data:
                                
                            </p>
                            <p>
                                1. There is either a discrepancy or a correlation between the data and the hypothesis that needs additional evaluation 
                                <br></br>    
                                2. There are areas along the dune transect (between crest and interdune) where data is needed
                            </p>
                            <div className="resolutionMethodTitle"><strong>Initial Resolution Method Choice</strong></div>

                            <p>
                                There are three possible ways that the robot can balance these objectives when suggesting sampling locations. 
                            </p>
                            <p>
                                1. ONE-AT-A-TIME: choose a location that optimizes primary objective <br></br>
                                2. WEIGHTED HIERARCHY: determine locations that optimize primary objective and from these choose a location that also addresses the secondary objective
                                <br></br>
                                3. WEIGHTED BALANCED: choose a location that addresses both primary and secondary objectives but optimizes neither
                            </p>
                            <p>
                                <strong>Please select your initial preference for the method used to resolve the two objectives: </strong>
                            </p>

                        </div>
                        {/* <FormControl component="fieldset">
                            <RadioGroup
                                aria-label="question"
                                name="question1"
                                value={selectedOption}
                                onChange={(e) => {
                                    setSelectedOption(e.target.value);
                                    setNextDisablee(false);
                                }}
                            >
                                <CustomFormControlLabel value="even-weighting" control={<Radio />} label="Even weighting" />
                                <CustomFormControlLabel value="weighted-hierarchy" control={<Radio />} label="Weighted hierarchy" />
                                <CustomFormControlLabel value="one-at-a-time" control={<Radio />} label="One-at-a-time" />
                            </RadioGroup>
                        </FormControl> */}
                        <RadioButtonGroup options={resolutionTexts} selectedIndex={initialResolutionMethod} onChange={i => {
                        dispatch({ type: Action.SET_INITIAL_RESOLUTION_METHOD, value: i });
                        dispatch({type: Action.SET_RES_METHOD, value: i}); //LUCKY there is still an initial and a general one to keep track of both
                        // onNextFreeResponse(i);
                        dispatch({ type: Action.SET_DISABLE_SUBMIT_BUTTON, value: false });
                    }}/>
                    </div>
                   
                </div>
            </div>
            {buttonRow}
        </div>
    );

    const pages = [
        // Panel 0
        <div className="introCard">
            <ConsentPanel onCompletion={onNextClick}/>
        </div>,
 
        // Panel 1
        <div className="introCard">
            <div className="page1 contentWrapper">
                <div className="contentContainer">
                    <img src={robotDesertGif} className="robotGif"/>
                    <div className="text">
                        <p>
                            The mobile hexapod robot RHex needs your help testing a hypothesis about the relationship 
                            between sand strength and moisture at White Sands National Monument in New Mexico.
                        </p>
                        <p>
                            RHex has already collected some strength and moisture data at a dune. Strength was measured 
                            by mechanical resistance to shear (dragging) during robot leg-soil interactions and moisture 
                            was measured using a probe attached to the robot.
                        </p>
                    </div>

                    <img src={singleTransectNullHypothesis} className="nullHypothesisImg"/> 

                    <div className="text">
                        <p>
                            Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune crest (see purple line).
                            <br></br>
                            <br></br>
                            <b>The goal for you and RHex today is to select measurement locations on 
                                the dune transect (from crest to interdune) to test the following hypothesis: </b>
                            Soil strength will increase as moisture increases until sand is saturated (somewhere along the stoss slope), 
                            at which point strength will be constant as moisture continues to increase (see blue line).
                        </p>
                    </div>

                    <div className="hypothesisBlock">
                        <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
                        <div className="hypothesisText">
                            Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
                        </div>
                        <FormControl style={{border: '2.5px solid red', animation: 'blinker 2s linear infinite'}}>
                            <Select
                                style={{fontSize: '1.5vh'}}
                                value={initialHypo + 3}
                                onChange={event => {
                                    dispatch({ 
                                        type: Action.SET_INIT_HYPO_CONFIDENCE, 
                                        value: Number(event.target.value)-3 
                                    });
                                    dispatch({ type: Action.SET_HYPO_CONFIDENCE, value: Number(event.target.value)-3});
                                    //handleResponse(Number(event.target.value)-3);
                                    onNextFreeResponse(Number(event.target.value)-3);
                                }}>
                                {
                                    initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                                }
                            </Select>
                        </FormControl>
                    </div>
                </div>
            </div>
            { buttonRow }
        </div>,

        // Panel 2 - Combined Objectives and New Question Page
        combinedQuestions
    ];

    return (
        // <div className="introduction">
        //     {pages[currentPage]}
        // </div>
        <div className="introduction">
            <CSSTransition
                in={true}
                appear={true}
                timeout={500}
                classNames={`slide${animationDirection}`}>
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={currentPage}
                        timeout={500}
                        classNames={`slide${animationDirection}`}>
                        { pages[currentPage] }
                    </CSSTransition>
                </TransitionGroup>
            </CSSTransition>
            <ProgressBar value={currentPage / pageCount}/>
        </div>
    );
}
