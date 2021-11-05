import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { useStateValue, Action } from '../state';
import '../styles/conclusion.scss';
import HypothesisPanel from '../components/HypothesisPanel';
import { HypothesisResponse } from '../types';
import { defaultHypothesisResponse } from '../constants';
import ChartPanel from '../components/ChartPanel';
import { initializeCharts, updateCharts } from '../handlers/ChartHandler';

const mapConclusionImage = require('../../assets/map_conclusion.png');

export default function Conclusion() {
  const history = useHistory();
  const [globalState, dispatch] = useStateValue();
  const { initialStrategyData, actualStrategyData, finalLocalHypothesis, finalGlobalHypothesis } = globalState;
  const [page, setPage] = useState(0);

  const [localResponse, setLocalResponse] = useState({...defaultHypothesisResponse});
  const [globalResponse, setGlobalResponse] = useState({...defaultHypothesisResponse});
  
  // Display the charts when the conclusion screen is first loaded
  useEffect(() => {
    // Re-initialize the charts
    initializeCharts(globalState, dispatch);
    setTimeout(() => {updateCharts(globalState, dispatch)}, 100);
  }, []);

  const onContinueClick = () => {
    if (page < 1) {
      setPage(page + 1);
      // Re-initialize the charts
      initializeCharts(globalState, dispatch);
      setTimeout(() => {updateCharts(globalState, dispatch)}, 100);
    } else {
      const logs = {initialStrategyData, actualStrategyData, finalLocalHypothesis, finalGlobalHypothesis};
      //console.log(JSON.stringify(logs));
      history.push('/survey');
    }
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

  const page0 = (
    <div className="page0">
      <h2>Conclusion</h2>
      <hr/>
      <p style={{width: "50%", margin: "auto", marginBottom: 40}}>
        Please complete the following final questions about your certainty of the hypotheses after having completed your data collection.
      </p>
      { continueButton }
    </div>
  );

  const responsePage = (
    <Grid container>
      <Grid item xs={12} md={6}>
        <ChartPanel fullSize={true} mode="ConclusionView"/>
      </Grid>
      <Grid item xs={12} md={6} className="rightDecisionPanel">
        <div className="rightDecisionPanelHypothesis">
          <div className="hypothesisContainer">
            <HypothesisPanel 
              hypothesis={'soil'} 
              default={actualStrategyData.transects.length > 0 ? actualStrategyData.transects[actualStrategyData.transects.length - 1].localHypotheses : undefined}
              updateHypotheses={((hypotheses: HypothesisResponse) => {
                setLocalResponse(hypotheses);
                dispatch({type: Action.SET_FINAL_LOCAL_HYPOTHESIS, value: hypotheses});
              })}
            />
            <HypothesisPanel 
              hypothesis={'grain'} 
              default={actualStrategyData.transects.length > 0 ? actualStrategyData.transects[actualStrategyData.transects.length - 1].globalHypotheses : undefined}
              updateHypotheses={((hypotheses: HypothesisResponse) => {
                setGlobalResponse(hypotheses);
                dispatch({type: Action.SET_FINAL_GLOBAL_HYPOTHESIS, value: hypotheses});
              })}
            />
          </div>
          <div>
            <Grid container className="mapConclusionImageContainer">
              <Grid item xs={6}>
                <div className="confirmButtonContainer">
                  { continueButton }
                </div>
              </Grid>
              <Grid item xs={6}>
                <div>
                  <img src={mapConclusionImage} className="mapConclusionImage"/>
                </div>
              </Grid>
            </Grid>
          </div> 
        </div>
      </Grid>
    </Grid>
  )

  return (
    <>
      {
        page === 0 ? 
          <div className="conclusionPage">{page0}</div> 
        :
        <div className="decisionPage">{responsePage}</div> 
      }
    </>
  );
}