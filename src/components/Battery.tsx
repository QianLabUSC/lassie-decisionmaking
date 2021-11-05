import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Action, useStateValue } from '../state';
import { getBatteryCost } from '../util';
import { TransectState, batteryWarningLevels, SampleState } from '../constants';
import { Paper } from '@material-ui/core';

const batteryWidth = 215;
const batteryHeight = 30;

const useStyles = makeStyles(theme => ({
  batteryContainer: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    padding: 10,
    height: 110,
    width: "auto",
    textAlign: 'left',
    maxHeight: "20vh",
    overflow: "auto",
  },
  battery: {
    width: batteryWidth,
    height: batteryHeight,
    position: 'relative',
    border: '2px solid black',
    borderRadius: '4px'
  },
  legend: {
    width: '40px',
    display:'inline-block',
    border: '2px solid black',
    height: '1rem',
    verticalAlign: 'middle',
    marginLeft: '10px'
  },
  batteryBar: {
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: '2px 0 0 2px',
    position: 'absolute',
  },
  planned: {
    background: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(0,0,0,0.6) 8px,
      rgba(0,0,0,0.6) 10px
    )`
  },
  batteryLabel: {
    width: 165,
    display: "inline-block",
    marginTop: 0,
  },
  actual: {
    backgroundColor: 'green',
  },
  warning: {
    overflow: 'hidden',
    textAlign: 'center',
    height: '0px'
  },
  warningAnimated: {
    animation: `$warningAnimation 5s linear`,
  },
  warningTitle: {
    color: 'orange',
    marginBlockStart: '10px',
    marginBlockEnd: '10px',
    animation: '$warningTitleFlashAnimation 1.5s ease-in infinite'
  },
  warningAmount: {
    color: 'red',
    fontSize: '110%'
  },
  '@keyframes warningTitleFlashAnimation': {
    '0%': { color: 'orange' },
    '70%': { color: 'black' }
  },
  "@keyframes warningAnimation": {
    "0%": { height: '0px' },
    "10%": { height: '90px' },
    "90%": { height: '90px' },
    "100%": { height: '0px' }
  }
}));

const precision = 2;

export default function Battery() {
  const classes = useStyles();
  const [globalState, dispatch] = useStateValue();
  const { strategy, transectState, sampleState, batteryLevel, lastActualBatteryLevel, batteryWarning } = globalState;
  const [nextSampleBatteryLevel, setNextSampleBatteryLevel] = React.useState(0);
  const [animateWarning, setAnimateWarning] = React.useState(false);
  const [forceExpanded, setForceExpanded] = React.useState(false);
  const { transectIndices, transectSamples, curTransectIdx, curRowIdx } = strategy;

  let actualUsed = transectState === TransectState.INITIAL_STRATEGY ?
    0 :
    (lastActualBatteryLevel > 0 && (curTransectIdx === 0 && curRowIdx === 0)) ? lastActualBatteryLevel :
    getBatteryCost(transectIndices, transectSamples, curTransectIdx, curRowIdx);
  const planned = getBatteryCost(transectIndices, transectSamples);

  if (lastActualBatteryLevel < actualUsed && actualUsed > 0) {
    dispatch({type: Action.SET_LAST_ACTUAL_BATTERY_LEVEL, value: actualUsed});
  } else {
    actualUsed = lastActualBatteryLevel;
  }

  if (batteryLevel !== actualUsed) {
    dispatch({ type: Action.SET_BATTERY_LEVEL, value: actualUsed });
  }

  let batteryLevelWarning = <div></div>;
  if (transectState !== TransectState.INITIAL_STRATEGY && sampleState !== SampleState.FINISH_TRANSECT) {
    const hasNextSample = curRowIdx < transectSamples[curTransectIdx].length || curTransectIdx < transectIndices.length - 1;
    if (hasNextSample) {
      const nextTransectIndex = curRowIdx >= transectSamples[curTransectIdx].length && curTransectIdx < transectIndices.length - 1 ? curTransectIdx + 1 : curTransectIdx;
      const nextRowIdx = curRowIdx >= transectSamples[curTransectIdx].length ? 0 : curRowIdx + 1;
      const nextStepCost = getBatteryCost(transectIndices, transectSamples, nextTransectIndex, nextRowIdx);

      const level = batteryWarningLevels.reduce((acc, value) => {
        if (actualUsed <= value && nextStepCost >= value) return value;
        return acc;
      }, 0);

      if (batteryWarning != (level > 0)) {
        dispatch({ type: Action.SET_BATTERY_WARNING, value: level > 0 });
      }

      if (level > 0) {
        if (level !== nextSampleBatteryLevel) {
          setNextSampleBatteryLevel(level);
          setAnimateWarning(false);
          setForceExpanded(true);
          setTimeout(() => {
            setAnimateWarning(true);
            setForceExpanded(false);
          }, 100);
        }
        batteryLevelWarning = (
          <div className={`${classes.warning} ${animateWarning ? classes.warningAnimated : ''}`}>
            <h2 className={classes.warningTitle}>Warning</h2>
            <span>Next measurement will pass<br/><b className={classes.warningAmount}>{level * 100}%</b> battery usage!</span>
          </div>
        );
      }
    }
  }

  return (
    <Paper className={classes.batteryContainer}>
      <div>
        <div>
          <p className={classes.batteryLabel}>
             Actual used: { (actualUsed * 100).toFixed(precision) } %
          </p>
          <span className={`${classes.actual} ${classes.legend}`}></span>
          <br/>
          <p className={classes.batteryLabel}>
             Planned: { (planned * 100).toFixed(precision) } %
          </p>
          <span className={`${classes.planned} ${classes.legend}`}></span>
        </div>
        <div style={{ clear: 'both' }} />
        <div className={classes.battery}>
          <div className={`${classes.actual} ${classes.batteryBar}`} style={{ width: (actualUsed * batteryWidth).toString() + 'px'}} />
          <div className={`${classes.planned} ${classes.batteryBar}`} style={{ width: (planned * batteryWidth).toString() + 'px'}} />
        </div>
      </div>
      {batteryLevelWarning}
    </Paper>
  );

  // return (
  //   <CollapsablePaper
  //     top={20}
  //     right={20}
  //     icon={<BatteryStdIcon style={{ color: green[500] }} />}
  //     forceExpanded={forceExpanded}
  //   >
  //     <div>
  //       <div style={{ float: 'left', paddingRight: '40px' }}>
  //         <p>
  //            Actual used: { (actualUsed * 100).toFixed(precision) } % <span className={`${classes.actual} ${classes.legend}`}></span>
  //         </p>
  //         <p>
  //            Planned: { (planned * 100).toFixed(precision) } % <span className={`${classes.planned} ${classes.legend}`}></span>
  //         </p>
  //       </div>
  //       <div style={{ clear: 'both' }} />
  //       <div className={classes.battery}>
  //         <div className={`${classes.actual} ${classes.batteryBar}`} style={{ width: (actualUsed * batteryWidth).toString() + 'px'}} />
  //         <div className={`${classes.planned} ${classes.batteryBar}`} style={{ width: (planned * batteryWidth).toString() + 'px'}} />
  //       </div>
  //     </div>
  //     {batteryLevelWarning}
  //   </CollapsablePaper>
  // );
}