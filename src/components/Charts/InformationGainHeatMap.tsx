import * as React from 'react';
import { scaleLinear } from '@visx/scale';
import ChartColourLegendPanel from './ChartColourLegendPanel'
const InformationGainHeatMap = ({ width, height, data, x, y }) => {
  // Assuming the data is a 2D array and we want a grid
  const numRows = data.length;
  const numCols = data[0]?.length || 0;

  // Calculate cell size based on the provided width and height
  const cellWidth = width / numCols;
  const cellHeight = height / numRows;

  // Scale for opacity based on the data values
  const opacityScale = scaleLinear({
    domain: [Math.min(...data.flat()), Math.max(...data.flat())],
    range: [0.0, 0.4], // Adjust opacity range as needed
  });

  return (
    <svg width={width} height={height}>
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <rect
            key={`cell-${rowIndex}-${colIndex}`}
            x={colIndex * cellWidth + x}
            y={rowIndex * cellHeight + y}           // Keep Y axis the same
            width={cellWidth}
            height={cellHeight}
            fill={`rgba(255,165,100,${opacityScale(value)})`}
            stroke="#ccc" // Optional, adds border to each cell
          />
        ))
      )}
    </svg>
  );
};


export default InformationGainHeatMap;
