import * as React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

const InformationGainHeatMap = ({ x, y, width, height, data }) => {
  const rectWidth = width / data.length;
  const rectHeight = height; // Single height for all rectangles

  const colorScale = scaleLinear({
    domain: [Math.min(...data), Math.max(...data)],
    range: ['#ffffcc', '#ff7043'] // Yellow to red color range
  });

  return (
    <Group>
      {data.map((value, index) => (
        <rect
          key={index}
          x={x + index * rectWidth}
          y={y}
          width={rectWidth}
          height={rectHeight}
          fill={colorScale(value)}
          stroke={'black'}
        />
      ))}
    </Group>
  );
};

export default InformationGainHeatMap;
