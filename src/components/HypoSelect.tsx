import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';

import { NUM_OF_HYPOS, confidenceTexts } from '../constants';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 240,
  }
}));


interface IProps {
  value: string[],
  hypoItems: any[],
  onChange: (ev: React.ChangeEvent<any>, index: number) => void
}

function HypoSelect({ value, onChange, hypoItems } : IProps) {
  const classes = useStyles();
  const selects : any[] = [];
  
  for (let i = 0; i < hypoItems.length; i++) {
    selects.push(
      <div key={i}>
        <Typography variant="body1" style={{
          width: 800,
          textAlign: 'left',
          margin: '0 auto'
        }}>{hypoItems[i]}</Typography>
        <FormControl className={classes.formControl}>
          <Select
            value={value[i]}
            onChange={(ev : any) => onChange(ev, i)}
          >
            {
              confidenceTexts.map(t => (<MenuItem value={t} key={t}>{t}</MenuItem>))
            }
          </Select>
        </FormControl>
      </div>
    );
  }
  return (
    <div>
      {selects}
    </div>
  );
}

export function LocalHypoSelect({ value, onChange } : Omit<IProps, "hypoItems">) {
  return <HypoSelect
    value={value}
    hypoItems={[
      <React.Fragment><b>Null hypothesis</b> - Soil moisture has no discernible effect on soil strength.</React.Fragment>,
      <React.Fragment><b>Alternative hypothesis 1</b> - Soil moisture and soil strength increase together (moving from crest to interdune) until sand is saturated, at which point strength is constant as moisture continues to increase</React.Fragment>,
      <React.Fragment><b>Alternative hypothesis 2</b> - Soil moisture and strength increase together (moving from crest to interdune) until sand is saturated, at which point strength drops before becoming constant and moisture continues to increase</React.Fragment>
    ]}
    onChange={onChange}
  />
}

export function GlobalHypoSelect({ value, onChange } : Omit<IProps, "hypoItems">) {
  return <HypoSelect
    value={value}
    hypoItems={[
      <React.Fragment><b>Null hypothesis</b> - There is no discernible trend in grain size across the dune field.</React.Fragment>,
      <React.Fragment><b>Alternative hypothesis 1 ('single sediment source')</b> - Grain size decreases gradually and systematically downwind.</React.Fragment>,
      <React.Fragment><b>Alternative hypothesis 2 ('multiple sediment sources')</b> - Grain size oscillates downwind, due to the presence of more than one sediment source.</React.Fragment>,
    ]}
    onChange={onChange}
  />
}