import * as React from "react";
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ConsentPanel from '../components/ConsentPanel';
import ProgressBar from '../components/ProgressBar';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useStateValue, Action } from '../state';
import { initialConfidenceTexts } from '../constants';
import "../styles/intro.scss";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const robotDesertGif = require('../../assets/robot_desert_horizontal.gif');

export default function Intro(props) {
    const history = useHistory();
    const [globalState, dispatch] = useStateValue();
    const { initialHypo } = globalState;
    const [currentPage, setCurrentPage] = useState(0);
    const [animationDirection, setAnimationDirection] = useState("Right");
    const pageCount = 2;

    const onBackClick = () => {
        setAnimationDirection("Left");
        setTimeout(() => {
            setCurrentPage(currentPage - 1);
        }, 100);
    }

    const onNextClick = () => {
        if (currentPage + 1 >= pageCount) {
            
            // When the user completes the intro section, set the "introCompleted" state property to true
            // so that the user will not be redirected to the intro section when revisiting the website
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

    const buttonRow = (
        <div className="buttonRow">
            {
                currentPage > 0 && <Button onClick={onBackClick} color='primary' variant='contained'>Previous</Button>
            }
            <Button onClick={onNextClick} color='primary' variant='contained' className="buttonRowButton">Next</Button>
        </div>
    );

    const handleResponse = (value: any) => {
        dispatch({ 
            type: Action.SET_INIT_HYPO_CONFIDENCE, 
            value: value 
        });
    }

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
                        <p>
                            Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune 
                            crest. RHex is testing the hypothesis that strength will increase as moisture increases until 
                            sand is saturated (somewhere along the stoss slope), at which point strength will be constant 
                            as moisture continues to increase.
                        </p>
                   
                        { /* Insert modified transect hypothesis figure here*/ }

                        <div className="hypothesisBlock">
                            <div className="hypothesisTitle"><strong>Initial Hypothesis Confidence</strong></div>
                            <div className="hypothesisText">
                                Provide a ranking of your initial certainty that this hypothesis will be supported or refuted. If you have no initial preference, simply select "I am unsure":
                            </div>
                            <FormControl>
                                <Select
                                    style={{fontSize: '1.5vh'}}
                                    value={initialHypo + 3}
                                    onChange={event => handleResponse(Number(event.target.value) - 3)}>
                                    {
                                        initialConfidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                                    }
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                </div>
            </div>
            { buttonRow }
        </div>,
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
