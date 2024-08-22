import * as React from 'react';
import { scaleLinear } from '@visx/scale';
import { interpolateRgb } from 'd3-interpolate';

const InformationGainHeatMap = ({ width, height, data, x, y }) => {
  // Assuming the data is a 2D array and we want a grid
  const numRows = data.length;
  const numCols = data[0]?.length || 0;

  // Calculate cell size based on the provided width and height
  const cellWidth = width / numCols;
  const cellHeight = height / numRows;

  // Define shallow red and shallow blue
  const shallowRed = '#FA8072'; // Light red
  const shallowBlue = '#B0C4DE'; // Light blue

  // Scale for color based on the data values, ranging from shallow red to shallow blue
  const colorScale = scaleLinear({
    domain: [Math.min(...data.flat()), Math.max(...data.flat())],
    range: [0, 1], // Normalize the data range to 0-1 for interpolation
  });

  const colorInterpolator = interpolateRgb(shallowBlue, shallowRed);

  return (
    <svg width={width} height={height}>
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <rect
            key={`cell-${rowIndex}-${colIndex}`}
            x={colIndex * cellWidth + x}
            y={rowIndex * cellHeight + y}
            width={cellWidth}
            height={cellHeight}
            fill={colorInterpolator(colorScale(value))} // Interpolate color from shallow red to shallow blue
            stroke="#eee" // Optional, adds border to each cell
          />
        ))
      )}
    </svg>
  );
};

export default InformationGainHeatMap;
