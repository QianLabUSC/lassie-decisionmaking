import * as React from 'react';
import { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  RowType, SampleState, MAX_NUM_OF_MEASUREMENTS,
} from '../constants';
import { useStateValue, Action } from '../state';
import { getNOMTaken } from '../util';

const useStyles = makeStyles(theme => ({
  [RowType.DEVIATE]: {
    // backgroundColor: theme.palette.secondary.main
  },
  [RowType.NORMAL]: {},
  [RowType.DISCARDED]: {
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
  legend: {
    display: 'inline-flex',
    fontSize: '0.8rem',
    color: theme.palette.grey[600],
    fontFamily: theme.typography.fontFamily,
    '& + &': {
      marginLeft: 20
    }
  },
  legendBox: {
    width: 30,
    height: '0.8rem',
    display: 'inline-block',
    marginRight: 8,
    boxSizing: 'border-box'
  },
  table: {
    '& .MuiTableCell-root': {
      padding: 10
    }
  }
}));

interface IProps {
  rows: IRow[],
  editable?: boolean
}

export default function RowTable({ rows, editable }: IProps) {
  const classes = useStyles();
  const [editIndex, setEditIndex] = React.useState(-1);
  // Temp state used to store the row value when editing row
  const [tempNOM, setTempNOM] = React.useState(0);
  const [NOMError, setNOMError] = React.useState(false);
  const [globalState, dispatch] = useStateValue();
  const { sampleState, strategy, robotVersion } = globalState;
  const { curRowIdx, lastHoverRowIdx } = strategy;
  const [editButtonClicked, setEditButtonClicked] = React.useState(false);
  editable = editable === undefined ? true : editable;

  // Edit when editIndex === -1 
  // else confirm the updated value
  useEffect(() => {
    if (sampleState !== SampleState.COLLECT_DATA) {
      setEditIndex(-1);
    }
  }, [sampleState]);

  const onEditRowClick = (row: IRow, index) => {
    if (!editable) {
      return;
    }
    if (editIndex === -1) {
      setEditIndex(index);
      setTempNOM(row.measurements);
      setEditButtonClicked(true);
    } else {
      // Return if either is not right
      if (NOMError) {
        return;
      }
      const newRow : IRow = { ...row };
      newRow.measurements = parseInt(tempNOM as any, 10);
      dispatch({
        type: Action.EDIT_ROW,
        value: { index, row: newRow }
      });
      setEditIndex(-1);
      setEditButtonClicked(false);
    }
  };

  const onDeleteRowClick = index => {
    dispatch({
      type: Action.DELETE_ROW,
      value: index
    });
    if (lastHoverRowIdx === index) {
      dispatch({
        type: Action.SET_LAST_HOVER_ROW_IDX,
        value: -1
      });
    }
  };

  // Subtract measurements other than the current one
  const allowedNOM = editIndex === -1
    ? MAX_NUM_OF_MEASUREMENTS
    : MAX_NUM_OF_MEASUREMENTS - getNOMTaken(rows, rows[editIndex].index) + rows[editIndex].measurements;
  
  // const NOMHelperText = `Please select between 1-${allowedNOM}`;
  const NOMHelperText = '';

  const onMeasurementChange = ev => {
    let val = ev.target.value;
    setNOMError(val.indexOf('.') > -1 || val < 1 || val > allowedNOM);
    setTempNOM(val);
  };

  const onRowHover = (index, enterOrLeave) => {
    dispatch({
      type: Action.HOVER_DATA,
      value: { index, isHovered: enterOrLeave }
    });
  }

  return (
    <div className="row-table" style={{ textAlign: 'center' }}>
      {
        sampleState !== SampleState.COLLECT_DATA &&
        <div>
          <div className={classes.legend}>
            <div className={`${classes.legendBox} ${classes.currentRow}`}></div>
            Current
          </div>
          <div className={classes.legend}>
            <div className={`${classes.legendBox} ${classes.hoverRow}`}></div>
            Hovered
          </div>
          <div className={classes.legend}>
            <div className={`${classes.legendBox} ${classes[RowType.DISCARDED]}`}></div>
            Discarded
          </div>
        </div>
      }
      <Table className={classes.table} id="row-table">
        <TableHead>
          <TableRow>
            <TableCell>No.</TableCell>
            <TableCell>Measurements</TableCell>
            {
              editable && sampleState === SampleState.COLLECT_DATA && !robotVersion &&
              <TableCell align="right">Action</TableCell>
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rows.map((row, index) => (
              <TableRow
                onMouseEnter={() => onRowHover(index, true)}
                onMouseLeave={() => onRowHover(index, false)}
                className={`${classes[row.type]}
                            ${row.type !== RowType.DISCARDED && index === curRowIdx - 1 ? classes.currentRow : ''}
                            ${row.type !== RowType.DISCARDED && row.isHovered ? classes.hoverRow : ''}`}
                key={index}
              >
                <TableCell component="th" scope="row">{index + 1}</TableCell>
                <TableCell>
                {
                  editIndex === index
                    ? <TextField
                        inputProps={{ type: "number", min: "1", max: allowedNOM, step: 1}}
                        fullWidth
                        value={tempNOM}
                        error={NOMError}
                        helperText={NOMHelperText}
                        onChange={onMeasurementChange}
                      />
                    : row.measurements
                }
                </TableCell>
                {
                  editable && sampleState === SampleState.COLLECT_DATA && !robotVersion &&
                  <TableCell align="right">
                    <IconButton onClick={ () => onEditRowClick(row, index) }>
                      {
                        editIndex === index
                          ? <CheckIcon color="primary" /> 
                          : <EditIcon color="primary" />
                      }
                    </IconButton>
                    <IconButton style={{ marginLeft: 10 }} disabled={editButtonClicked} onClick={ () => onDeleteRowClick(index) }>
                      <DeleteIcon color="secondary" />
                    </IconButton>
                  </TableCell>
                }
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  );
}