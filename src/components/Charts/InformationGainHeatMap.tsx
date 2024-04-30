import * as React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

const InformationGainHeatMap = ({ width, height, data, x, y }) => {
  // Assuming each cell is a square and the component size is fixed to width and height for a 100x100 grid
  const cellSize = width / 100; // or height / 100, assuming width and height are the same
  const opacityScale = scaleLinear({
    domain: [Math.min(...data.flat()), Math.max(...data.flat())],
    range: [0.02, 0.4], // Adjust opacity range as needed
  });

  return (

    <svg width={width} height={height}>
      {data.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <rect
            key={`cell-${rowIndex}-${colIndex}`}
            x={colIndex * cellSize + x}
            y={rowIndex * cellSize + y}
            width={cellSize}
            height={cellSize}
            fill={`rgba(255,165,100,${opacityScale(value)})`}
            stroke="#ccc" // Optional, adds border to each cell
          />
        ))
      )}
    </svg>
  );
};


export default InformationGainHeatMap;
