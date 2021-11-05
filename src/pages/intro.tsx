import * as React from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ConsentPanel from '../components/ConsentPanel';
import HypothesisPanel from '../components/HypothesisPanel';
import ProgressBar from '../components/ProgressBar';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useStateValue, Action } from '../state';
import { defaultHypothesisResponse } from '../constants';
import "../styles/intro.scss";
import { HypothesisResponse } from "../types";

const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');
const localHypoImage = require('../../assets/LocalHypo_flipped.png');
const globalHypoImage = require('../../assets/globalHypo.png');
const globalMoistureImage = require('../../assets/GlobalMoisture.png');

export default function Intro(props) {
    const history = useHistory();
    const [currentPage, setCurrentPage] = useState(0);
    const [animationDirection, setAnimationDirection] = useState("Right");
    const [localHypos, setLocalHypos] = useState<HypothesisResponse>(defaultHypothesisResponse);
    const [globalHypos, setGlobalHypos] = useState<HypothesisResponse>(defaultHypothesisResponse);
    const [globalState, dispatch] = useStateValue();
    const pageCount = 7;

    const onBackClick = () => {
        setAnimationDirection("Left");
        setTimeout(() => {
            setCurrentPage(currentPage - 1);
        }, 100);
    }

    const onNextClick = () => {
        if (currentPage + 1 >= pageCount) {
            // dispatch({ type: Action.SET_INITIAL_HYPOS, value: [...hypos]});
            
            // When the user completes the intro section, set the "introCompleted" state property to true
            // so that the user will not be redirected to the intro section when revisiting the website
            dispatch({type: Action.SET_INTRO_STATUS, value: true});
            history.push("/decision");

            console.log({globalState}); // for debugging
        } else {
            setAnimationDirection("Right");
            setTimeout(() => {
                setCurrentPage(currentPage + 1);
            }, 100);
        }
    }

    const buttonRow = (
        <div className="buttonRow">
            {
                currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
            }
            <Button onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
        </div>
    );

    const configurations: number[][] = [[1, 1], [1, 2], [2, 1], [2, 2]];

    const pages = [
        // Panel 0
        <div className="introCard">
            <ConsentPanel onCompletion={onNextClick}/>
        </div>,
        
        // Panel 1
        <div className="introCard">
            <div className="page1">
                <h3 className="title">Welcome!</h3>
                <hr/>
                <p>
                    You are about to engage in a simulated scientific data collection scenario involving human-robot teaming.
                </p>
                <p>
                    You will be provided with multiple competing hypotheses and use a mobile robot to
                    sample data until you are confident enough to make a conclusion about the hypotheses,
                    or until you have run out of battery life.
                </p>
                <p>
                    There will likely be features of the decision scenario that are outside your area of
                    expertise. However, the scenario is representative of an ongoing decision process all
                    scientists face – at what point is there enough data to be confident in my conclusion
                    about a hypothesis?
                </p>
            </div>
            { buttonRow }
        </div>,
        
        // Panel 2
        <div className="introCard">
            <div className="page2 contentWrapper">
                <div className="contentContainer">
                    <img src={robotDesertGif} className="robotGif"/>
                    <div className="text">
                        <p>
                            Imagine you are a geoscientist studying erosion, transport, and deposition of
                            sediment by the wind. Today you are focusing on the relationship between wind
                            direction, sediment moisture, size, and strength (i.e., resistance to erosion).
                        </p>
                        <p>
                            You have chosen to study the relationship between these variables at White Sands
                            National Monument in New Mexico, where moisture and grain size play an important 
                            role in wind-based sand dynamics.
                        </p>
                        <p>
                            Your fieldwork at White Sands is assisted by RHex, a mobile hexapod robot. RHex walks
                            along dunes and takes measurements of sand moisture, size, and strength. Strength is
                            determined by mechanical resistance to shear (dragging) during robot leg-soil interactions.
                            The size of sand grains is determined by images taken of the surface, which are analyzed
                            automatically by software to produce an average grain size.
                        </p>
                    </div>
                </div>
            </div>
            { buttonRow }
        </div>,

        // Panel 3
        <div className="introCard">
            <div className="page3">
                <div>
                    <img src={localHypoImage} className="localHypoImage"/>
                </div>
                <div>
                    <p className="text">
                        Common sense tells us that sand moisture will be highest (most wet)
                        in the interdune and lowest (most dry) at the dune crest.
                        There are several competing hypotheses about the relationship
                        between sand moisture and strength along a dune.
                    </p>
                    <table className="table">
                        <tbody>  
                            <tr>
                                <td className="titleCol tableCell">Null Hypothesis</td>
                                <td className="tableCell">Soil moisture has no discernible effect on soil strength.</td>
                            </tr>
                            <tr>
                                <td className="titleCol tableCell">Alternative Hypothesis 1</td>
                                <td className="tableCell">
                                    Soil moisture and soil strength increase together
                                    (moving from crest to interdune) until sand is saturated, at which point strength is
                                    constant as moisture continues to increase.
                                </td>
                            </tr>
                            <tr>
                                <td className="titleCol">Alternative Hypothesis 2</td>
                                <td>
                                    Soil moisture and strength increase together
                                    (moving from crest to interdune) until sand is saturated, at which point strength
                                    drops before becoming constant and moisture continues to increase.
                                </td>
                            </tr>
                        </tbody>  
                    </table>
                </div>
            </div>
            { buttonRow }
        </div>,

        // Panel 4
        <div className="introCard introCardTall">
            <div className="page4 contentWrapper">
                <div className="contentContainer">
                    <img src={globalMoistureImage} className="localHypoImage"/>
                    <div className="text">
                        <p>
                            At White Sands, the dominant wind direction is toward the Northeast.
                            The wind gradually slows down across the dune field because the upwind
                            dunes are most exposed to the wind, while downwind dunes are shielded
                            by their upwind neighbors, allowing for more plant growth.
                        </p>
                        <p>
                            With the increase in plant growth, there is a corresponding increase in
                            soil moisture. Therefore, moving from upwind to downwind, there is a gradual
                            but systematic increase in soil moisture across the dune field.
                        </p>
                    </div>
                </div>
            </div>
            { buttonRow }
        </div>,

        // Panel5
        <div className="introCard introCardTall">
            <div className="page5">
                <p>
                    The size of the sand grains is also expected to systematically vary, both at the dune
                    scale and moving from upwind to downwind across the dune field. At the dune scale, grain 
                    size should be larger along the stoss slope and get progressively smaller moving towards 
                    the crest. At the dune field scale, the prevailing view among geologists is that the source 
                    of sand that makes the dunes is located at the upwind margin. Common sense would suggest 
                    that grain size should decrease moving downwind from this source, due to: (1) the downwind 
                    decline in wind energy which determines the size of particles that can be transported, and 
                    (2) the chipping of sand induced by collisions with other grains during transport.
                </p>
                <p>
                    There may, however, be other sources of sediment within the dune field as wind erodes
                    into the underlying substrate. This leads to several competing hypotheses about the
                    downwind gradient in grain size across the dune field.
                </p>
                <img src={globalHypoImage} className="globalHypoImage"/>
                <div>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="titleCol tableCell">Null Hypothesis</td>
                                <td className="tableCell">There is no discernible trend in grain size across the dune field.</td>
                            </tr>
                            <tr>
                                <td className="titleCol tableCell">Alternative Hypothesis 1 - Single Sediment Source</td>
                                <td className="tableCell">
                                    Grain size decreases gradually and systematically downwind.
                                </td>
                            </tr>
                            <tr>
                                <td className="titleCol">Alternative Hypothesis 2 - Multiple Sediment Sources</td>
                                <td>
                                    Grain size oscillates downwind, due to the presence of more than one sediment source.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            { buttonRow }
        </div>,

        // Panel 6, initial hypotheses
        <div className="introCard">
            <div className="page6 contentWrapper">
                <div className="contentContainer">
                    <p>
                        In a moment, you will be asked to select a data collection
                        strategy for evaluating these hypotheses, but first we want to
                        know if you have any initial preferences or hunches. For each of 
                        the hypotheses, provide a ranking of your certainty that it will 
                        be supported or refuted. If you have no initial preference, simply 
                        select “I am unsure”.
                    </p>
                </div>
                <Grid container className="page6 introHypotheses">
                    <Grid item xs={6} md={6} className="localHypotheses">
                        <div>
                            <HypothesisPanel
                                default={localHypos}
                                initialHypothesis={true}
                                hypothesis={'soil'}
                                updateHypotheses={(hypotheses: HypothesisResponse) => {
                                    setLocalHypos(hypotheses);
                                    dispatch({ type: Action.SET_INITIAL_LOCAL_HYPOTHESIS, value: hypotheses });
                                }
                            }/>
                        </div>
                    </Grid>
                    <Grid item xs={6} md={6} className="globalHypotheses">
                        <div>
                            <HypothesisPanel
                                default={globalHypos}
                                initialHypothesis={true}
                                hypothesis={'grain'}
                                updateHypotheses={(hypotheses: HypothesisResponse) => {
                                    setGlobalHypos(hypotheses);
                                    dispatch({ type: Action.SET_INITIAL_GLOBAL_HYPOTHESIS, value: hypotheses });
                                }
                            }/>
                        </div>
                    </Grid>
                </Grid>
            </div>
            { buttonRow }
        </div>
    ];

    return (
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
    )
}
