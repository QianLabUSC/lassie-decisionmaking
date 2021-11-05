import * as React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { useStateValue, Action } from '../state';
import { TransectState } from '../constants';
import { TransectType, Transect } from '../types';


const useStyles = makeStyles(theme => ({
  transectTableContainer: {
    backgroundColor: "white",
    maxHeight: "15vh",
    overflow: "auto",
    overflowX: "hidden",
  },
  discardRow: {
    background: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 8px,
      rgba(0,0,0,0.6) 8px,
      rgba(0,0,0,0.6) 10px
    )`
  },
  currentRow: {
    border: '2px solid rgba(0, 0, 0, 0.6)'
  },
  hoverRow: {
    border: `2px solid ${theme.palette.secondary.main}`
  },
  columnHeader: {
    color: "black",
    fontSize: "1em"
  }
}));

export default function TransectTable() {
  const [globalState, dispatch] = useStateValue();
  const { strategy, transectState, robotVersion, actualStrategyData } = globalState;
  const { transectIndices, curTransectIdx, transectSamples } = strategy;
  const classes = useStyles();
  const onTransectDelete = (idx : number) => {
    dispatch({ type: Action.DELETE_TRANSECT, value: idx });
    if (idx <= curTransectIdx) {
      dispatch({ type: Action.SET_CUR_TRANSECT_IDX, value: curTransectIdx - 1 });
    }
  };
  const getRowClass = (transect: Transect, idx: number) => {
    let className = '';
    if (transect.type === TransectType.DISCARDED) {
      className += classes.discardRow;
      className += ' ';
    }
    if (idx === curTransectIdx && actualStrategyData.transects.length !== 0) {
      className += classes.currentRow;
      className += ' ';
    }
    return className;
  }
  
  return (
    <div id="transect-table-container" className={classes.transectTableContainer}>
      <Table id="transect-table" size="small">
        <TableHead>
          <TableRow>
            <TableCell className={classes.columnHeader}>Transect</TableCell>
            <TableCell className={classes.columnHeader}>Measurements</TableCell>
            <TableCell className={classes.columnHeader}>Locations</TableCell>
            {
              transectState === TransectState.INITIAL_STRATEGY && !robotVersion &&
              <TableCell></TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            transectIndices.map((transect, idx) => {
              const measurements = transectSamples[idx].reduce((acc, v) => acc + v.measurements, 0);
              const locations = transectSamples[idx].length;
              return (
                <TableRow key={idx} className={transectState === TransectState.INITIAL_STRATEGY && robotVersion ? '' : getRowClass(transect, idx)}>
                  <TableCell>{ transect.number + 1 }</TableCell>
                  <TableCell>{ measurements }</TableCell>
                  <TableCell>{ locations }</TableCell>
                  {
                    transectState === TransectState.INITIAL_STRATEGY && !robotVersion &&
                      <TableCell>
                        <IconButton onClick={() => onTransectDelete(idx)} style={{maxHeight: "3vh"}}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                  }
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </div>
  ); 
}