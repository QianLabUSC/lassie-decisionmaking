import * as React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useStateValue, Action } from '../state';
import { RowType, locationColors } from '../constants';

const useStyles = makeStyles(theme => ({
  indicator: {
    display: 'inline-block',
    position: 'absolute',
    cursor: 'default',
    fontSize: '1.2rem',
    fontWeight: 700,
    color: theme.palette.secondary.main,
    '& .dot': {
      content: '""',
      display: 'inline-block',
      //backgroundColor: theme.palette.secondary.main,
      width: 12,
      height: 12,
      borderRadius: 5,
      position: 'absolute'
    },
    '& .triangle': {
      content: '""',
      display: 'inline-block',
      width: 0,
      height: 0,
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderBottom: `10px solid ${theme.palette.secondary.main}`,
    },
    '& .content': {
      borderRadius: '50%',
      border: '2px solid transparent',
      width: '1.4rem',
      display: 'inline-block',
      marginLeft: 12,
      textAlign: 'center',
      transform: 'translate(-140%, 50%)'
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
  const theme = useTheme();
  const [globalState, dispatch] = useStateValue();
  const { currSampleIdx } = globalState;

  const onHover = enterOrLeave => {
    dispatch({
      type: Action.SET_HOVER,
      value: {
        index: rowIndex,
        isHovered: enterOrLeave
      }
    });
  };
  // console.log(locationColors)

  return (
    <span onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}
      className={`${classes.indicator} ${classes[type]}
                  ${rowIndex === currSampleIdx - 1 && type !== RowType.DISCARDED ? classes.current : ''} 
                  ${isHovered ? classes.hover : ''}`}
      style={{ left, top }}
    >
      {!robot && <span className="dot" style={{ backgroundColor: locationColors[locationIndex] }}></span>}
      {robot && 
        <span 
          style={{ 
            content: '""', 
            display: 'block',
            width: 0,
            height: 0,
            borderLeft: '1vh solid transparent',
            borderRight: '1vh solid transparent',
            borderBottom: `1.5vh solid ${locationColors[locationIndex]}`,
        }}>
      </span>}
        {robot && <span className="content" style={{ color: theme.palette.secondary.main, fontSize: '2.5vh', transform: 'translate(-70%, -140%)' }}>{String.fromCharCode(rowIndex + 65)}
      </span>}
    </span>
  );
}