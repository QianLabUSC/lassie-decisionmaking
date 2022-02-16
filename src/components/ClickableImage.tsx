import * as React from 'react';
import { useState, useCallback, useLayoutEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { NORMALIZED_HEIGHT, POPOVER_TIME, PopboxTypeEnum, NORMALIZED_WIDTH, NORMALIZED_CREST_RANGE, SampleState, NUM_MEASUREMENTS, RowType } from '../constants';
import { getNearestIndex } from '../util';
import { useStateValue, Action } from '../state';
import AddSamplePopup from './AddSamplePopup';
import PositionIndicator from './PositionIndicator';
import PositionIndicatorRhex from './PositionIndicatorRhex';
import { propertyOf } from 'lodash';

const diagram = require('../../assets/diagram_scalebar.png');

const useStyles = makeStyles({
  cross: {
    cursor: 'crosshair'
  },
  image: {
    borderRadius: 4,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    width: '70vw',
    display: 'block',
    margin: 'auto',
  },
  imageDecision: {
    borderRadius: 4,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    width: '45vw',
    display: 'block',
    margin: 'auto',
  }
});

interface IProps {
  enabled: boolean,
  addDataFunc: (row: IRow) => void,
  setPopOver: (popoverContent : any) => void,
  transectIdx: number,
  robotSuggestions?: IRow[] | undefined,
  showRobotSuggestions: boolean,
  setDisableSubmitButton: any,
  numImgClicks: number,
  setNumImgClicks: any,
  width?: number
}

export default function ClickableImage({ enabled, addDataFunc, setPopOver, transectIdx, robotSuggestions, showRobotSuggestions, 
  setDisableSubmitButton, numImgClicks, setNumImgClicks, width } : IProps) {
  const [clickPosition, setClickPosition] = useState({
    left: 0,
    top: 0,
    normOffsetX: 0,
    normOffsetY: 0
  });
  width = width || NORMALIZED_WIDTH;
  const [clickIndex, setClickIndex] = useState(0);
  const [imgEl, setImgEl] = useState<HTMLImageElement>();
  // Obtain DOM element
  // It's wrong to store the height/width only
  // since the DOMRect would have 0 height initially (don't know why)
  const imgHeightRef = useCallback((node : HTMLImageElement) => {
    if (node) {
      setImgEl(node);
    }
  }, []);
  const [globalState, dispatch] = useStateValue();
  const classes = useStyles();
  const { showNOMInput, strategy, robotVersion, sampleState } = globalState;
  const { transectSamples } = strategy;
  const rows = (transectIdx >= 0 && transectIdx < transectSamples.length) ? transectSamples[transectIdx] : [];

  // Use a setTimeout method to get the height because the imgEl.getBoundingClientRect() function may return 0 for the 
  // height if it is run immediately, which would cause all the PositionIndicator labels to initially show up at the top 
  // of the ClickableImage until another render.
  const [height, setHeight] = useState(0);
  setTimeout(() => {
    if (imgEl) {
      setHeight(imgEl.getBoundingClientRect().height)
    }
  }, 300);
  // This adjusts the PositionIndicator labels for when the window size changes
  useLayoutEffect(() => {
    function timer() {
      if (imgEl) {
        setHeight(imgEl.getBoundingClientRect().height)
      }
    };
    window.addEventListener('resize', timer);
    return () => window.removeEventListener('resize', timer);
  });

  
  const onImageClick = ev => {
    if (!enabled || (robotVersion && sampleState === 0)) {
      return;
    }
    
    // ev.clientX gets the x coordinate of the mouse click position on the viewport
    // ev.clientY gets the y coordinate of the mouse click position on the viewport
    const { clientX, clientY } = ev;

    // imgEl.getBoundingClientRect().x gets the x coordinate of the left boundary of the image
    // imgEl.getBoundingClientRect().y gets the y coordinate of the top boundary of the image
    // imgEl.getBoundingClientRect().height gets the height of the image
    const { x, y, height } = imgEl!.getBoundingClientRect();
  
    // offsetX and offsetY represent the coordinates of the mouse click position with the whitespace to the left and top
    // and of the image (between the image and the edges of the viewport) removed
    const offsetX = clientX - x; 
    const offsetY = clientY - y;
    const normOffsetX = offsetX * NORMALIZED_HEIGHT / height; 
    const normOffsetY = offsetY * NORMALIZED_HEIGHT / height;
    
    const index = getNearestIndex([normOffsetX, normOffsetY]);

    // console.log({index, offsetX, offsetY, normOffsetX, normOffsetY, height, NORMALIZED_HEIGHT, width, NORMALIZED_WIDTH}); // for debugging

    if (index == -1) {
      dispatch({
        type: Action.SHOW_NOM_INPUT,
        value: false
      });
      setPopOver({
        content: 'Please click near the surface of stoss slope!',
        type: PopboxTypeEnum.ERROR
      });
      setTimeout(() => setPopOver(null), POPOVER_TIME);
      return;
    }
    setPopOver(null);
    setClickIndex(index);
    setClickPosition({ left: offsetX, top: offsetY, normOffsetX, normOffsetY });
    // dispatch({
    //   type: Action.SHOW_NOM_INPUT,
    //   value: true
    // });

    if (numImgClicks > 0) {
      dispatch({
        type: Action.DELETE_ROW, // delete the old row
        value: rows.length - 1
      });
    }

    setNumImgClicks(numImgClicks + 1);

    const newRow : IRow = {
      index: index,
      measurements: NUM_MEASUREMENTS,
      type: RowType.NORMAL,
      normOffsetX,
      normOffsetY,
      isHovered: false
    };
    dispatch({
      type: Action.ADD_ROW, // add the new row to the state
      value: newRow
    });
    
    setDisableSubmitButton(false);
  }

  return (
    <div id="clickable-image" style={{ position: 'relative' }} >
      <img ref={imgHeightRef} className={sampleState > SampleState.COLLECT_DATA ? `${classes.imageDecision} ${enabled ? classes.cross : ''}` : `${classes.image} ${enabled ? classes.cross : ''}` } id="pos-picker" src={diagram} onClick={onImageClick}/>
      {
        showNOMInput && <AddSamplePopup clickPosition={clickPosition} clickIndex={clickIndex} onAddData={addDataFunc} setDisableSubmitButton={setDisableSubmitButton}/>
      }
      {
        rows.map((row, rowIndex) => {
          if (!imgEl) {
            return null;
          }

          const { index, type, normOffsetX, normOffsetY, isHovered } = row;
          
          return <PositionIndicator
            key={rowIndex}
            left={normOffsetX * height / NORMALIZED_HEIGHT}
            top={normOffsetY * height / NORMALIZED_HEIGHT}
            rowIndex={rowIndex}
            isHovered={isHovered}
            type={type}
            locationIndex={index}
            robot={false}
          />;
        })
      }
      {
        <PositionIndicatorRhex
          left={(rows[rows.length - 1].normOffsetX - 7) * height / NORMALIZED_HEIGHT}
          top={(rows[rows.length - 1].normOffsetY - 50) * height / NORMALIZED_HEIGHT}
        />
      }
      {showRobotSuggestions && robotSuggestions &&
        robotSuggestions.map((suggestion, rowIndex) => (
          <PositionIndicator
            key={suggestion.index + suggestion.normOffsetX + suggestion.normOffsetY}
            left={suggestion.normOffsetX * height / NORMALIZED_HEIGHT}
            top={suggestion.normOffsetY * height / NORMALIZED_HEIGHT}
            rowIndex={rowIndex}
            isHovered={suggestion.isHovered}
            type={suggestion.type}
            locationIndex={suggestion.index}
            robot={true}
          />
        )) 
      }
    </div>
  );
}