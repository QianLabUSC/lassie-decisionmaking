import * as React from "react";
import { useState, useCallback, useLayoutEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  NORMALIZED_HEIGHT,
  NORMALIZED_FLAGATOB,
  NORMALIZED_STRAT,
  POPOVER_TIME,
  PopboxTypeEnum,
  NORMALIZED_WIDTH,
  NUM_MEASUREMENTS,
  INDEX_LENGTH,
} from "../constants";
import { Sample } from "../types";
import { getNearestIndex, getMeasurements } from "../util";
import { useStateValue, Action } from "../state";
import AddSamplePopup from "./AddSamplePopup";
import PositionIndicator from "./PositionIndicator";
import PositionIndicatorRhex from "./PositionIndicatorRhex";
import {PathpointIndicator} from "./PositionIndicator";
import {RowType} from "../constants";
import { FALSE } from "sass";

const diagram = require("../../assets/diagram_scalebar.png");

const useStyles = makeStyles({
  cross: {
    cursor: "crosshair",
  },
  image: {
    borderRadius: 4,
    // boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    // width: "70vw",
    display: "block",
    margin: "auto",
  },
  imageDecision: {
    borderRadius: 4,
    // boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    width: "30vw",
    display: "block",
    margin: "auto",
  },
});

interface IProps {
  enabled: boolean;
  addDataFunc: (sample: Sample) => void;
  setPopOver: (popoverContent: any) => void;
  width?: number;
}

export default function ClickableImage({
  enabled,
  addDataFunc,
  setPopOver,
  width,
}: IProps) {
  const [clickPosition, setClickPosition] = useState({
    left: 0,
    top: 0,
    normOffsetX: 0,
    normOffsetY: 0,
  });
  width = width || NORMALIZED_WIDTH;
  const [clickIndex, setClickIndex] = useState(0);
  const [imgEl, setImgEl] = useState<HTMLImageElement>();
  // Obtain DOM element
  // It's wrong to store the height/width only
  // since the DOMRect would have 0 height initially (don't know why)
  const imgHeightRef = useCallback((node: HTMLImageElement) => {
    if (node) {
      setImgEl(node);
    }
  }, []);
  const [globalState, dispatch] = useStateValue();
  const classes = useStyles();

  const {
    samples,
    currUserStep,
    numImgClicks,
    transectIdx,
    showRobotSuggestions,
    showNOMInput,
  } = globalState;
  const { robotSuggestions } = currUserStep;

  // Use a setTimeout method to get the height because the imgEl.getBoundingClientRect() function may return 0 for the
  // height if it is run immediately, which would cause all the PositionIndicator labels to initially show up at the top
  // of the ClickableImage until another render.
  const [height, setHeight] = useState(0);
  const [imgWidth, setImgWidth] = useState(0);

  const mid = height - height / 2;
  setTimeout(() => {
    if (imgEl) {
      setHeight(imgEl.getBoundingClientRect().height);
      setImgWidth(imgEl.getBoundingClientRect().width);
    }
  }, 300);
  // This adjusts the PositionIndicator labels for when the window size changes
  useLayoutEffect(() => {
    function timer() {
      if (imgEl) {
        setHeight(imgEl.getBoundingClientRect().height);
        setImgWidth(imgEl.getBoundingClientRect().width);
      }
    }
    window.addEventListener("resize", timer);
    return () => window.removeEventListener("resize", timer);
  });

  const onImageClick = (ev) => {
    if (!enabled) {
      return;
    }

    // ev.clientX gets the x coordinate of the mouse click position on the viewport
    // ev.clientY gets the y coordinate of the mouse click position on the viewport
    const { clientX, clientY } = ev;

    // imgEl.getBoundingClientRect().x gets the x coordinate of the left boundary of the image
    // imgEl.getBoundingClientRect().y gets the y coordinate of the top boundary of the image
    // imgEl.getBoundingClientRect().height gets the height of the image
    const { x, y, height, width } = imgEl!.getBoundingClientRect();

    // offsetX and offsetY represent the coordinates of the mouse click position with the whitespace to the left and top
    // and of the image (between the image and the edges of the viewport) removed
    const offsetX = clientX - x;
    const offsetY = clientY - y;
    const normOffsetX = (offsetX * NORMALIZED_HEIGHT) / height;
    const normOffsetY = (offsetY * NORMALIZED_HEIGHT) / height;

    const index = getNearestIndex([normOffsetX, normOffsetY]);

    // console.log({index, offsetX, offsetY, normOffsetX, normOffsetY, height, NORMALIZED_HEIGHT, width, NORMALIZED_WIDTH}); // for debugging

    if (index == -1) {
      dispatch({
        type: Action.SET_SHOW_NOM_INPUT,
        value: false,
      });
      setPopOver({
        content: "Please click near the surface of stoss slope!",
        type: PopboxTypeEnum.ERROR,
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
        type: Action.DELETE_SAMPLE,
        value: samples.length - 1,
      }); // delete the old row
    }

    dispatch({
      type: Action.SET_NUM_IMG_CLICKS,
      value: numImgClicks + 1,
    });

    const { shearValues, moistureValues } = getMeasurements(
      globalState,
      transectIdx,
      index,
      NUM_MEASUREMENTS
    );
    const newSample: Sample = {
      index: index,
      type: "user",
      measurements: NUM_MEASUREMENTS,
      normOffsetX: normOffsetX,
      normOffsetY: height - height / 2,
      isHovered: false,
      moisture: moistureValues,
      shear: shearValues,
      path: [[0.5],[0]]
    };
    // Add the new sample to the state
    dispatch({
      type: Action.ADD_SAMPLE,
      value: newSample,
    });
    dispatch({
      type: Action.SET_USER_SAMPLE,
      value: newSample,
    });

    dispatch({
      type: Action.SET_DISABLE_SUBMIT_BUTTON,
      value: false,
    });
  };

  return (
    <div id="clickable-image" style={{ position: "relative" }}>
      <img
        ref={imgHeightRef}
        className={`${classes.imageDecision} ${enabled ? classes.cross : ""}`}
        id="pos-picker"
        src={diagram}
        onClick={onImageClick}
      />
      {showNOMInput && (
        <AddSamplePopup
          clickPosition={clickPosition}
          clickIndex={clickIndex}
          onAddData={addDataFunc}
        />
      )}
      {samples.map((sample, sampleIdx) => {
        if (!imgEl) {
          return null;
        }

        let path_x = sample.path[0];
        let path_y = sample.path[1];
      
        const indicators = path_x.map((x, index) => {
          let xPoint = x;
          let yPoint = path_y[index];
          let key_index = `${sampleIdx}-${index}`;
      
          return (
            <PathpointIndicator
              key={key_index}
              left={(0.97 * xPoint + 0.02) * imgWidth}
              top={(0.97 - 0.97 * yPoint) * height}
              isHovered={false}
              locationIndex={Math.floor(index * 21)}
              rowIndex={0}
              type={RowType.ROBOT_SUGGESTION}
              robot={false}
            />
          );
        });
      
        return (
          <>
            <PositionIndicator
              key={`sampleposition-${sampleIdx}`}
              left={(0.97 * path_x[path_x.length - 1] + 0.02) * imgWidth}
              top={(0.97 - 0.97 * path_y[path_y.length - 1]) * height}
              rowIndex={sampleIdx}
              isHovered={false}
              type={RowType.ROBOT_SUGGESTION}
              locationIndex={2}
              robot={false}
            />
            <div key={`samplepath-${sampleIdx}`}>
              {indicators}
            </div>
          </>
        );

      })}



      {samples.length > 0 && (() => {
          const lastSample = samples[samples.length - 1];
          const path_x = lastSample.path[0];
          const path_y = lastSample.path[1];
          const path_x_point = path_x[path_x.length - 1];
          const path_y_point = path_y[path_y.length - 1];

          return (
            <PositionIndicatorRhex
              left={
                // (index / INDEX_LENGTH) * (imgWidth - 1)
                (0.96 * (path_x_point) + 0.02) * imgWidth - 20
                
              }
              top={(0.96 - 0.96 * (path_y_point)) * height -20}
            />
          );
        })()}
      {showRobotSuggestions &&
        robotSuggestions &&
        robotSuggestions.map((suggestion, rowIndex) => {
          let path_x = suggestion.path[0];
          let path_y = suggestion.path[1];
        
          const indicators = path_x.map((x, index) => {
            let xPoint = x;
            let yPoint = path_y[index];
            let key_index = `${rowIndex}-${index}`;
        
            return (
              <PathpointIndicator
                key={key_index}
                left={(0.97 * xPoint + 0.02) * imgWidth}
                top={(0.97 - 0.97 * yPoint) * height}
                isHovered={false}
                locationIndex={Math.floor(index * 21)}
                rowIndex={0}
                type={RowType.ROBOT_SUGGESTION}
                robot={false}
              />
            );
          });
        
          return (
            <>
              <PositionIndicator
                key={`position-${rowIndex}`}
                left={(0.97 * path_x[path_x.length - 1] + 0.02) * imgWidth -10}
                top={(0.97 - 0.97 * path_y[path_y.length - 1]) * height-10}
                rowIndex={rowIndex}
                isHovered={false}
                type={RowType.ROBOT_SUGGESTION}
                locationIndex={2}
                robot={true}
              />
              <div key={`path-${rowIndex}`}>
                {indicators}
              </div>
            </>
          );
        })
        
          
          
          }


    </div>
  );
}
