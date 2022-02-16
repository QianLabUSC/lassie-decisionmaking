import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStateValue, Action } from '../state';
import { RowType, locationColors } from '../constants';

const useStyles = makeStyles(theme => ({
  indicator: {
    display: 'inline-block',
    position: 'absolute',
    cursor: 'default',
    fontSize: '1.2rem',
    fontWeight: 700,
    //color: theme.palette.secondary.main,
    '& .dot': {
      content: '""',
      display: 'inline-block',
      //backgroundColor: theme.palette.secondary.main,
      width: 10,
      height: 10,
      borderRadius: 5,
      position: 'absolute'
    },
    '& .content': {
      borderRadius: '50%',
      border: '2px solid transparent',
      width: '1.4rem',
      display: 'inline-block',
      marginLeft: 12,
      textAlign: 'center'
    }
  },
  current: {
    '& .content': {
      borderColor: 'black',
    }
  },
  hover: {
    '& .content': {
      borderColor: theme.palette.secondary.main,
    }
  },
  [RowType.DEVIATE]: {
    '& .dot': {
      // backgroundColor: theme.palette.secondary.main
    },
    '& .content': {
      // color: theme.palette.secondary.main,
      // borderColor: theme.palette.secondary.main
    }
  },
  [RowType.NORMAL]: {

  },
  [RowType.DISCARDED]: {
    '& .content': {
      textDecoration: 'line-through',
    }
  },
  [RowType.ROBOT_SUGGESTION]: {
    '& .dot': {
      backgroundColor: '#cc0000'
    },
    '& .content': {
      color: '#cc0000',
    }
  },
}));

export default function PositionIndicator({ left, top, type, rowIndex, isHovered, locationIndex, robot }) {
  const classes = useStyles();
  const [globalState, dispatch] = useStateValue();
  const { strategy } = globalState;
  const { curRowIdx } = strategy;

  const onHover = enterOrLeave => {
    dispatch({
      type: Action.HOVER_DATA,
      value: {
        index: rowIndex,
        isHovered: enterOrLeave
      }
    });
  };

  return (
    <span onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
      className={`${classes.indicator} ${classes[type]}
                  ${rowIndex === curRowIdx - 1 && type !== RowType.DISCARDED ? classes.current : ''} 
                  ${isHovered && type !== RowType.DISCARDED ? classes.hover : ''}`}
      style={{ color: locationColors[locationIndex], left, top }}
    >
      <span className="dot" style={{ backgroundColor: locationColors[locationIndex] }}></span>
      <span className="content">{robot ? String.fromCharCode(rowIndex + 65) : rowIndex + 1}</span>
    </span>
  );
}