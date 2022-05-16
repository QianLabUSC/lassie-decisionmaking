/**
 * Popup is used to show at specified coordinates.
 */

import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Paper, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import { useStateValue, Action } from '../state';
import { MAX_NUM_OF_MEASUREMENTS, NUM_MEASUREMENTS } from '../constants';
import { Sample } from '../types';
import { getNOMTaken, getMeasurements } from '../util';

const useStyles = makeStyles(() => ({
  box: {
    position: 'absolute',
    zIndex: 999,
    padding: '5px 15px',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
  },
  textField: {
    width: 250
  }
}));

const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 100;

export default function Popup(props) {
  const { clickPosition, onAddData, clickIndex } = props;
  const { normOffsetX, normOffsetY } = clickPosition;
  const [value, setValue] = React.useState(0);
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState('');
  const [globalState, dispatch] = useStateValue();

  const { samples, currUserStep, transectIdx } = globalState;
  const classes = useStyles();

  const NOMTaken = getNOMTaken(samples, clickIndex);
  const allowedNOM = MAX_NUM_OF_MEASUREMENTS - NOMTaken;

  let left = clickPosition.left, top = clickPosition.top - POPUP_HEIGHT;
  const offsetParent = document.getElementById('clickable-image');
  if (offsetParent) {
    const { x, y } = offsetParent.getBoundingClientRect();
    if (x + left + POPUP_WIDTH > window.innerWidth) {
      left -= POPUP_WIDTH;
    }
    if (y + top < 0) {
      top += POPUP_HEIGHT;
    }   
  }
  
  const checkVal = val => {
    let pass = true;
    if (val.toString().indexOf('.') > -1) {
      setHelperText('Please input integer number');
      pass = false;
    } else if (val < 1) {
      setHelperText('');
      pass = false;
    }
    setHelperText('');
    setError(!pass);
    return pass;
  }

  const handleChange = ev => {
    let val = ev.target.value;
    checkVal(val);
    setValue(val);
  };

  const onBlur = () => {
    if (!error) {
      setValue(parseInt(value as any, 10));
    }
  };

  const close = () => {
    setValue(0);
    dispatch({
      type: Action.SET_SHOW_NOM_INPUT,
      value: false
    });
  }

  // This function executes when the user clicks on the check mark after inputting a number of measurements on the clickable transect image
  const onCheckClick = () => {
    if (!checkVal(value)) {
      return;
    }
    // const { shearValues, moistureValues } = getMeasurements(globalState, transectIdx, clickIndex, NUM_MEASUREMENTS);
    // const newSample : Sample = {
    //   index: clickIndex,
    //   type: 'user',
    //   measurements: NUM_MEASUREMENTS,
    //   normOffsetX: normOffsetX,
    //   normOffsetY: normOffsetY,
    //   isHovered: false,
    //   moisture: moistureValues,
    //   shear: shearValues
    // };
    // dispatch({ 
    //   type: Action.ADD_SAMPLE, 
    //   value: newSample 
    // }); // add the new sample to the state

    close();
    dispatch({ 
      type: Action.SET_IMG_CLICK_ENABLED, 
      value: false 
    });
    dispatch({ 
      type: Action.SET_DISABLE_SUBMIT_BUTTON, 
      value: false 
    });
  };

  const onCancelClick = () => {
    close();
  };

  return (
    <Paper
      className={ classes.box }
      style={{ left, top }}
    >
      {
        allowedNOM > 0
          ?
          <div className={ classes.inner }>
            <TextField
              id="nom"
              label={`Number of measurements`}
              error={error}
              className={classes.textField}
              value={value}
              helperText={helperText}
              inputProps={{
                type: "number",
                step: "1",
                min: "1",
                max: `${allowedNOM}`
              }}
              onChange={handleChange}
              onBlur={onBlur}
              margin="normal"
            />
            <IconButton onClick={onCheckClick}>
              <CheckIcon color="primary"/>
            </IconButton>
            <IconButton onClick={onCancelClick}>
              <ClearIcon color="secondary"/>
            </IconButton>
          </div>
        : <p>You cannot take more measurements at this point</p>
      }
    </Paper>
  );
}