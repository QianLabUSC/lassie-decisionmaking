import { useState } from 'react';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core';
import HelpIcon from '@material-ui/icons/Help';
import Popover from '@material-ui/core/Popover';

import Popbox from '../components/Popbox';
import { MultiStepDialog } from '../components/Dialogs';
import ClickableImage from '../components/ClickableImage';
import { PopboxTypeEnum, } from '../constants';
import RowTable from '../components/RowTable';
import { useStateValue, Action } from '../state';
import '../styles/strategy.scss';
import Battery from '../components/Battery';

const useStyles = makeStyles(() => {
  return {
    popoverList: {
      width: 500,
      margin: '10px',
      'padding-inline-start': '20px',
      '& .MuiTypography-h6': {
        fontSize: '0.8rem'
      }
    }
  };
});

function ImgAlert({ open }) {
  return (
    <Popbox
      open={open}
      type={PopboxTypeEnum.ERROR}
      anchorEl={() => document.getElementById("pos-picker")}
    >
      Please click near the surface of stoss slope!
    </Popbox>
  );
}


function Helper() {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const onClick = () => {
    setOpen(!open);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      right: 40
    }}>
      <HelpIcon
        id="helper"
        onClick={onClick}
        color="primary"
        fontSize="large"
      />
      <Popover
        open={open}
        // Non null operator
        anchorEl={() => document.getElementById("helper")!}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        onClose={() => setOpen(false)}
        style={{
          position: 'inherit'
        }}
      >
        <ul className={classes.popoverList}>
          <li><Typography variant="h6" paragraph>
            To begin, you will decide on an initial sampling strategy.
          </Typography>
          </li>
          <li>
            <Typography variant="h6" paragraph>
              Select a sampling location by clicking on the diagram of the dune cross-section, anywhere along the stoss slope. You will be prompted to enter the number of measurements you wish to take at each location.
            </Typography>
            <Typography variant="h6" paragraph>
              Note that taking multiple measurements at each location will ensure you have accurately captured the variability.
            </Typography>
          </li>
          <li><Typography variant="h6" paragraph>
            You may take as many measurements from as many locations as you wish. However, we ask that you select a sampling strategy that is efficient and reflects how you would behave in similar situations in the real world.
          </Typography>
          </li>
        </ul>
      </Popover>
    </div>
  );
}

export default function Strategy() {
  const history = useHistory();
  const [globalState, dispatch] = useStateValue();
  const { imgClickEnabled, strategy } = globalState;
  const { transectSamples, curTransectIdx, transectIndices } = strategy;
  const rows = transectSamples[curTransectIdx];
  // Open the alert for the first transect
  const [firstAlertOpen, setFirstAlertOpen] = useState(transectIndices.length === 1);
  const [showImgAlert, setImgAlert] = useState(false);

  const onFinalizeClick = () => {
    dispatch({
      type: Action.SET_CUR_TRANSECT_IDX,
      value: curTransectIdx + 1
    });
    // Reset row idx
    dispatch({
      type: Action.SET_CUR_ROW_IDX,
      value: 0
    });
    history.push('/geo');
  };

  return (
    <div className="strategyPage">
      <div className="batteryContainer">
        <Battery/>
      </div>
      <div className="container">
        <div className="header">
          <h2>
            Sampling Strategy for Transect {transectIndices[curTransectIdx].number + 1}
          </h2>
          <i>Click each point you would like to sample from on the diagram below. Then specify how many samples you would like to take at that point.</i>
        </div>
        <MultiStepDialog
          open={firstAlertOpen}
          setOpen={setFirstAlertOpen}
          title={""}
          allowCancel={false}
          steps={[
            [
              "Select a sampling location by clicking on the diagram of the dune cross-section, anywhere along the stoss slope. You will be prompted to enter the number of measurements you wish to take at each location.",
              "Note that taking multiple measurements at each location will ensure you have accurately captured the variability."  
            ]
          ]}
        />
        <div>
          <ImgAlert open={!!showImgAlert} />
          <div>
            <div className="clickableImageContainer">
              <ClickableImage enabled={imgClickEnabled} addDataFunc={() => {}} setPopOver={setImgAlert} transectIdx={curTransectIdx} />
            </div>
          </div>
          <div className="buttonRow">
            <Button variant="contained" color="primary" disabled={rows.length === 0} onClick={onFinalizeClick}>Strategy Completed</Button>
          </div>
          <div className="tableContainer">
            <RowTable rows={rows} />
          </div>
        </div>
        <Helper />
      </div>
    </div>
  );
}