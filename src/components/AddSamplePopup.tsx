/**
 * Popup is used to show at specified coordinates.
 */

import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Paper, IconButton } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import { useStateValue, Action } from '../state';
import { SampleState, RowType, MAX_NUM_OF_MEASUREMENTS } from '../constants';
import { getNOMTaken, getBatteryCost, trimSamplesByBatteryUsage } from '../util';
import { DialogProps, DialogType } from '../types';

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
  const { sampleState, strategy } = globalState;
  const { transectSamples, transectIndices, curTransectIdx, curRowIdx } = strategy;
  const rows = transectSamples[curTransectIdx];
  const classes = useStyles();

  const NOMTaken = getNOMTaken(rows, clickIndex);
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
      type: Action.SHOW_NOM_INPUT,
      value: false
    });
  }

  // This function executes when the user clicks on the check mark after inputting a number of measurements on the clickable transect image
  const onCheckClick = () => {
    if (!checkVal(value)) {
      return;
    }
    const newRow : IRow = {
      index: clickIndex,
      measurements: parseInt(value as any, 10),
      type: sampleState === SampleState.DEVIATED ? RowType.DEVIATE : RowType.NORMAL,
      normOffsetX,
      normOffsetY,
      isHovered: false
    };
    // Evaluate whether the next step would exceed battery limit
    const nextRows= [...rows, newRow];
    const nextSamples = transectSamples.map((t, idx) => {
      if (idx === curTransectIdx) {
        return nextRows;
      }
      return t;
    });
    const batteryCost = getBatteryCost(transectIndices, nextSamples);
    if (batteryCost >= 1) {
      let text = ["You do not have enough battery life remaining."];
      let onOk = () => dispatch({ type: Action.SET_DIALOG_PROPS, value: null });
      let onCancel: any = null;
      
      if (sampleState === SampleState.DEVIATED) {
        text = [
          "If you collect more data here now, you won’t have enough battery to complete your entire field initial strategy.",
          "Press Ok to take additional measurements.  Note that this will cut off a corresponding number of measurements from the end of your initial strategy."
        ];
        onOk = () => {
          dispatch({ type: Action.SET_DIALOG_PROPS, value: null});
          dispatch({ type: Action.ADD_ROW, value: newRow });
          const newSamples = trimSamplesByBatteryUsage(batteryCost, transectSamples);
          dispatch({ type: Action.TRIM_SAMPLES_FROM_END, value: {newSamples} });
          onAddData(newRow);
        };
        onCancel = () => dispatch({ type: Action.SET_DIALOG_PROPS, value: null });
      }

      dispatch({
        type: Action.SET_DIALOG_PROPS,
        value: {
          type: DialogType.SIMPLE,
          text: text,
          onOk: onOk,
          onCancel: onCancel
        } as DialogProps
      });
    } else {
      dispatch({
        type: Action.ADD_ROW, // add the new row to the state
        value: newRow
      });
      if (sampleState === SampleState.DEVIATED) {
        onAddData(newRow);
      }
    }    
    close();
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