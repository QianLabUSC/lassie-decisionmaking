import * as React from 'react';
import { useState, FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CallMadeIcon from '@material-ui/icons/CallMade';
import useStateWithCallback from 'use-state-with-callback';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'fixed',
    padding: 15,
    fontFamily: theme.typography.fontFamily,
    zIndex: 999
  }
}));

interface IProps {
  icon: React.ReactElement,
  top: number,
  right?: number,
  left?: number,
  width?: number,
  height?: number,
  className?: string,
  forceExpanded?: boolean,
  initialState?: boolean,
  onExpand?: any
}

const CollapsablePaper : FunctionComponent<IProps> = ({ children, icon, top, right, left, width, height, className, forceExpanded, initialState, onExpand }) => {
  const classes = useStyles();
  const [prevExpand, setPrevExpand] = useState(false);
  const [expand, setExpand] = useStateWithCallback(initialState !== undefined ? initialState : true, (expanded) => {
    if (expanded && !prevExpand && onExpand) {
      setPrevExpand(true);
      onExpand();
    }
  });

  let cNames = classes.container;
  if (className) {
    cNames += ' ' + className;
  }
  
  if (forceExpanded && !expand) {
    setExpand(true);
    // tryOnExpand();
  }

  return (
    <Paper
      className={cNames}
      style={{ top, right: (right || undefined), left: (left || undefined), width: expand ? width : undefined, height: expand ? height : undefined }}
    >
      {
        expand
        ? 
          <div style={{height: (height || undefined)}}>
            <div style={{
              textAlign: 'right',
              margin: '-10px',
              marginBottom: '-50px'
            }}>
              <IconButton onClick={() => { setExpand(!expand); }}>
                <CallMadeIcon />
              </IconButton>
            </div>
            {children}
          </div>
        : 
        <IconButton onClick={() => { setExpand(!expand); }}>
          {icon}
        </IconButton>
      }
    </Paper>
  );
}

export default CollapsablePaper;