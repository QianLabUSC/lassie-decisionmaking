import * as React from "react";
import { useState, useCallback, useLayoutEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  NORMALIZED_HEIGHT,
  POPOVER_TIME,
  PopboxTypeEnum,
  NORMALIZED_WIDTH,
  NUM_MEASUREMENTS,
} from "../constants";
import { Sample } from "../types";
import { getNearestIndex, getMeasurements } from "../util";
import { useStateValue, Action } from "../state";
import AddSamplePopup from "./AddSamplePopup";
import PositionIndicator from "./PositionIndicator";
import PositionIndicatorRhex from "./PositionIndicatorRhex";

const diagram = require("../../assets/diagram_scalebar.png");

const useStyles = makeStyles({
  cross: {
    cursor: "crosshair",
  },
  image: {
    borderRadius: 4,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    width: "70vw",
    display: "block",
    margin: "auto",
  },
  imageDecision: {
    borderRadius: 4,
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.3)",
    width: "45vw",
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

  const mid = height - height / 2;
  setTimeout(() => {
    if (imgEl) {
      setHeight(imgEl.getBoundingClientRect().height);
    }
  }, 300);
  // This adjusts the PositionIndicator labels for when the window size changes
  useLayoutEffect(() => {
    function timer() {
      if (imgEl) {
        setHeight(imgEl.getBoundingClientRect().height);
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
    const { x, y, height } = imgEl!.getBoundingClientRect();

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

        const { index, type, normOffsetX, normOffsetY, isHovered } = sample;

        return (
          <PositionIndicator
            key={sampleIdx}
            left={(normOffsetX * height) / NORMALIZED_HEIGHT}
            top={height - height / 2}
            rowIndex={sampleIdx}
            isHovered={isHovered}
            type={type}
            locationIndex={index}
            robot={false}
          />
        );
      })}
      {
        <PositionIndicatorRhex
          left={
            ((samples[samples.length - 1].normOffsetX - 7) * height) /
            NORMALIZED_HEIGHT
          }
          top={height - height / 2}
        />
      }
      {showRobotSuggestions &&
        robotSuggestions &&
        robotSuggestions.map((suggestion, rowIndex) => (
          <PositionIndicator
            key={
              suggestion.index + suggestion.normOffsetX + suggestion.normOffsetY
            }
            left={(suggestion.normOffsetX * height) / NORMALIZED_HEIGHT}
            top={height - height / 2}
            rowIndex={rowIndex}
            isHovered={suggestion.isHovered}
            type={suggestion.type}
            locationIndex={suggestion.index}
            robot={true}
          />
        ))}
    </div>
  );
}
