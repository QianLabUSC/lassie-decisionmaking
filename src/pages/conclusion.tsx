import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useStateValue, Action } from '../state';
import '../styles/conclusion.scss';
import ChartPanel from '../components/ChartPanel';
import { initializeCharts, updateCharts } from '../handlers/ChartHandler';
import { confidenceTexts } from '../constants';

const singleTransectNullHypothesis = require('../../assets/SingleTransectNullHypothesis.png');

export default function Conclusion() {
  const history = useHistory();
  const [globalState, dispatch] = useStateValue();
  const { finalHypo } = globalState;

  // Display the charts when the conclusion screen is first loaded
  useEffect(() => {
    // Re-initialize the charts
    initializeCharts(globalState, dispatch);
    setTimeout(() => {updateCharts(globalState, dispatch)}, 100);
  }, []);

  const onContinueClick = () => {
    history.push('/survey');
  };

  const continueButton = (
    <Button
      className="continueButton"
      variant="contained"
      color="primary"
      onClick={onContinueClick}>
      Continue
    </Button>
  );

  const handleResponse = (value: any) => {
    dispatch({ 
        type: Action.SET_FINAL_HYPO_CONFIDENCE, 
        value: value 
    });
  }

  const responsePage = (
    <Grid container>
      <Grid item xs={12} md={6}>
        <ChartPanel fullSize={true} mode="ConclusionView"/>
      </Grid>
      <Grid item xs={12} md={6} className="rightDecisionPanel">
        <div className="rightDecisionPanelContainer">
          <div className="title">
              <h1>Conclusion</h1>
              <hr style={{width: '90%'}}/>
          </div>
          {/* <img src={singleTransectNullHypothesis} className="nullHypothesisImg"/>  */}
          {/* <div className="text">
              <p>
                  Sand moisture should be highest (most wet) in the interdune and lowest (most dry) at the dune 
                  crest. RHex is testing the hypothesis that strength will increase as moisture increases until 
                  sand is saturated (somewhere along the stoss slope), at which point strength will be constant 
                  as moisture continues to increase.
              </p>
          </div> */}
          <div className="hypothesisBlock">
              <div className="hypothesisTitle"><strong>Final Hypothesis Confidence</strong></div>
              <div className="hypothesisText">
                Provide a final ranking of your certainty that the hypothesis has been supported or refuted:
              </div>
              <FormControl>
                  <Select
                      style={{fontSize: '1.5vh'}}
                      value={finalHypo + 3}
                      onChange={event => handleResponse(Number(event.target.value) - 3)}>
                      {
                          confidenceTexts.map((text, i) => (<MenuItem key={i} value={i}>{text}</MenuItem>))
                      }
                  </Select>
              </FormControl>
          </div>
          <div>
            <div>
              <Grid item xs={12}>
                <div className="confirmButtonContainer">
                  { continueButton }
                </div>
              </Grid>
            </div> 
          </div>
        </div>
      </Grid>
    </Grid>
  )

  return (
    <div className="conclusionPage">
      {responsePage}
    </div> 
  );
}
