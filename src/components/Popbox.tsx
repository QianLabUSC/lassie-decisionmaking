import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { amber } from '@material-ui/core/colors';

import { PopboxTypeEnum } from '../constants';

export default function Popbox(props) {
  let { open, anchorEl, type } = props;
  type = type || PopboxTypeEnum.INFO;

  if (!open) {
    return null;
  }

  const useStyles = makeStyles(theme => ({
    box: {
      position: 'absolute',
      padding: '10px 15px',
      display: 'flex',
      width: 200,
      fontSize: '0.8rem',
      opacity: 0.8,
      zIndex: 999,
      backgroundColor: type === PopboxTypeEnum.ERROR
        ? amber[700]
        : 'rgb(255, 255, 255)',
      textAlign: 'center',
      justifyContent: 'space-around',
      alignItems: 'center',
      fontFamily: theme.typography.fontFamily
    }
  }));

  const classes = useStyles();
  const ele = anchorEl();
  if (!ele) {
    return null;
  }
  const { x, y, width } = ele.getBoundingClientRect();

  return (
    <Paper className={ classes.box } style={{
      left: window.scrollX + x + width / 2 - 100,
      top: window.scrollY + y - 20,
    }}>
      { props.children }
    </Paper>
  );
}