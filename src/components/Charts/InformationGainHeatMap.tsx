import * as React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

const InformationGainHeatMap = ({
  x,
  y,
  width,
  height,
  infogain,
  discrepancy,
  type
}) => {
  const numCols = infogain.length;
  const numRows = discrepancy.length;

  const rectWidth = width / numCols;
  const rectHeight = height / numRows;


  const valuesForColor = type === 'infogain' ? infogain : discrepancy;

  const colorScale = scaleLinear({
    domain: [Math.min(...valuesForColor), Math.max(...valuesForColor)],
    range: ['#ffffcc', '#ff7043'] // Yellow to red color range
  });
  return (
    <Group style={{ pointerEvents: 'none', opacity: 0.5 }}>
    {discrepancy.map((discrepValue, rowIndex) => (
      infogain.map((infoValue, colIndex) => (
        <rect
          key={`${rowIndex}-${colIndex}`}
          x={x + colIndex * rectWidth}
          y={y + rowIndex * rectHeight}
          width={rectWidth}
          height={rectHeight}
          fill={colorScale(valuesForColor[rowIndex])} // Color based on selected metric
          stroke={'black'}
        />
      ))
    ))}
  </Group>
  );
};

export default InformationGainHeatMap;
