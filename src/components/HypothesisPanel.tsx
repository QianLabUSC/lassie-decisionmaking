import * as React from "react";
import { useState, useEffect } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useStateValue } from '../state';
import { confidenceTexts, experimentTitles, hypothesisTitles, hypothesesTexts, initialConfidenceTexts, SampleState } from '../constants';
import '../styles/hypothesisPanel.scss';
import { HypothesisResponse } from "../types";

interface HypothesisPanelProps {
    hypothesis: 'soil' | 'grain',
    subtitle?: string,
    default?: HypothesisResponse,
    initialHypothesis?: boolean,
    updateHypotheses: (hypotheses: HypothesisResponse) => void
}

export default function HypothesisPanel(props: HypothesisPanelProps) {

    const [globalState, dispatch] = useStateValue();
    const {sampleState, strategy } = globalState;
      
    // Update the local and global hypotheses to the user's selections from the previous transect by default (excluding the very first
    // transect, which is defaulted to "I am unsure" for all hypotheses.
    useEffect(() => {
        if (sampleState > SampleState.COLLECT_DATA) {
            let prevTransectResponses = props.default ? Object.values(props.default) : [0, 0, 0];
            props.updateHypotheses({
                nullHypothesis: prevTransectResponses[0],
                alternativeHypothesis1: prevTransectResponses[1],
                alternativeHypothesis2: prevTransectResponses[2]
            });
        }
    }, []);
    
    const [responses, setResponses] = useState(props.default ? Object.values(props.default) as number[] : [0, 0, 0]);
    const handleResponse = (i: number, value: any) => {
        let newResponses = [...responses];
        newResponses[i] = value;
        setResponses(newResponses);
        props.updateHypotheses({
            nullHypothesis: newResponses[0],
            alternativeHypothesis1: newResponses[1],
            alternativeHypothesis2: newResponses[2]
        });
    }

    const [responsesGrain, setResponsesGrain] = useState(props.default ? Object.values(props.default) as number[] : [0, 0, 0]);
    const handleResponseGrain = (i: number, value: any) => {
        let newResponsesGrain = [...responsesGrain];
        newResponsesGrain[i] = value;
        setResponsesGrain(newResponsesGrain);
        props.updateHypotheses({
            nullHypothesis: newResponsesGrain[0],
            alternativeHypothesis1: newResponsesGrain[1],
            alternativeHypothesis2: newResponsesGrain[2]
        });
    }

    const confidenceOptions = props.initialHypothesis ? initialConfidenceTexts : confidenceTexts;

    return (
        // <div className="HypothesisPanel contentWrapper" style={{marginBottom: '20px'}} >
        <div className={sampleState > SampleState.COLLECT_DATA ? "HypothesisPanel contentWrapper" : "HypothesisPanelIntro contentWrapper"} style={{marginBottom: '20px'}} >    
            <div className="contentContainer">
                <h2 className="title">
                    { experimentTitles[props.hypothesis] }
                </h2>
                {
                    props.subtitle && <p>{ props.subtitle }</p>
                }
                <div>
                    {
                        [0, 1, 2].map(hypothesisIndex => {
                            return (
                                <div className="hypothesisBlock" key={hypothesisIndex}>
                                    <div className="hypothesisTitle">
                                        { hypothesisTitles[props.hypothesis][hypothesisIndex] }
                                    </div>
                                    <div className="hypothesisText">
                                        { hypothesesTexts[props.hypothesis][hypothesisIndex] }
                                    </div>
                                    <FormControl>
                                        {props.hypothesis == 'soil' && <Select
                                            style={{fontSize: '1.5vh'}}
                                            value={responses[hypothesisIndex] + 3}
                                            onChange={event => handleResponse(hypothesisIndex, Number(event.target.value) - 3)}>
                                            {
                                                confidenceOptions.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                                            }
                                        </Select>}
                                        {props.hypothesis == 'grain' && <Select
                                            style={{fontSize: '1.5vh'}}
                                            value={responsesGrain[hypothesisIndex] + 3}
                                            onChange={event => handleResponseGrain(hypothesisIndex, Number(event.target.value) - 3)}>
                                            {
                                                confidenceOptions.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                                            }
                                        </Select>}
                                    </FormControl>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div> 
    );
}
