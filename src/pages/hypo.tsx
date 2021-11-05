import * as React from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { NUM_OF_HYPOS, confidenceTexts } from '../constants';
import { useStateValue, Action } from '../state'; 
import { LocalHypoSelect, GlobalHypoSelect } from '../components/HypoSelect';

export default function Hypo() {
  const history = useHistory();
  const [globalState, dispatch] = useStateValue();
  const hypoArr = new Array(NUM_OF_HYPOS);
  hypoArr.fill(confidenceTexts[0]);
  const globalHypoArr = new Array(NUM_OF_HYPOS);
  globalHypoArr.fill(confidenceTexts[0]);
  const [hypos, setHypos] = useState<string[]>(hypoArr);
  const [globalHypos, setGlobalHypos] = useState<string[]>(globalHypoArr);
 
  return (
    <div id="hypo" style={{ textAlign: 'center' }}>
      <Typography variant="h4">Initial hypothesis</Typography>
      <div style={{ textAlign: 'left', width: '50%', margin: '0 auto' }}>
      <Typography variant="body1" style={{ paddingBottom: '1rem' }}>
        In a moment, you will be asked to select a data collection strategy for evaluating these hypotheses, but first we want to know if you have any initial preferences or hunches.
      </Typography>
      <Typography variant="body1">
        For each of the hypotheses, provide a ranking of your certainty that it will be supported or refuted. If you have no initial preference, simply select “I am unsure”.
      </Typography>
      </div>
      <Typography variant="h6">
        Soil Strength v.s. Soil Moisture
      </Typography>
      <LocalHypoSelect
        value={hypos}
        onChange={(ev, i) => {
          const newHypos = [...hypos];
          newHypos[i] = ev.target.value;
          setHypos(newHypos);
        }}
      /> 
      <Typography variant="h6">Grain Size v.s. Dune Location</Typography>
      <GlobalHypoSelect
        value={globalHypos}
        onChange={(ev, i) => {
          const newHypos = [...globalHypos];
          newHypos[i] = ev.target.value;
          setGlobalHypos(newHypos);
        }}
      /> 
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          dispatch({ type: Action.SET_INITIAL_HYPOS, value: [...hypos]});
          history.replace('/geo');
        }
      }>Continue</Button>
    </div>
  );
}