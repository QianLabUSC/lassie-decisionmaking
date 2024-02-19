import * as React from 'react';
import { HeatmapRect } from '@visx/heatmap';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

interface DataCell {
  x: number;
  moisture: number;
}

const data = {
    "xaxis": [
        2.3488, 5.5525, 8.1282, 8.7527, 6.622, 2.5104, 6.4769, 9.5017, 1.0957, 9.2917,
        2.6433, 7.6944, 4.6489, 10.7488, 3.6218, 7.4957, 6.7703, 9.321, 4.6574, 0.5531,
        6.3793, 10.2388, 3.4532, 2.2017, 8.3789, 8.2758, 9.3516, 7.0065, 8.3971, 7.0524,
        10.9908, 4.8174, 10.5419, 3.6568, 2.9493, 2.6528, 2.4054, 5.6568, 10.5311, 4.2985,
        10.4241, 9.9814, 8.6651, 1.9951, 1.5994, 7.7977, 3.0836, 9.5217, 4.408, 2.8031
      ],
      "moisture": [
        4.547, 9.046, 6.046, 1.094, 6.242, 1.604, 2.058, 6.89, 6.428, 6.62, 3.835,
        9.865, 1.155, 2.379, 5.344, 4.134, 10.643, 3.28, 3.396, 10.354, 1.561, 7.834,
        8.979, 7.631, 8.782, 2.352, 9.802, 8.905, 2.748, 6.492, 6.828, 9.598, 6.224,
        0.087, 7.044, 9.787, 7.562, 9.284, 3.943, 7.587, 5.815, 1.44, 1.383, 8.468,
        7.437, 9.77, 7.414, 3.076, 5.646, 0.219
      ]
};
// Assuming you want a 50x50 matrix
const size = 1000; // size of one dimension of the matrix
const width = 1000; // width of the SVG
const height = 1000; // height of the SVG
const binSize = 15; // size of one cell in the matrix


const heatmapData: DataCell[][] = [];
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    if (!heatmapData[i]) heatmapData[i] = [];
    heatmapData[i][j] = {
      x: data.xaxis[j % data.xaxis.length], // Cycle through xaxis values if less than 50
      moisture: data.moisture[i % data.moisture.length] // Cycle through moisture values if less than 50
    };
  }
}

const xScale = scaleLinear({
  domain: [Math.min(...data.xaxis), Math.max(...data.xaxis)],
  range: [0, width], // Leave space for last bin
});

const yScale = scaleLinear({
  domain: [Math.min(...data.moisture), Math.max(...data.moisture)],
  range: [0, height], // Leave space for last bin
});

const moistureMin = Math.min(...data.moisture);
const moistureMax = Math.max(...data.moisture);
const colorScale = scaleLinear<string>({
  domain: [moistureMin, moistureMax],
  range: ['red', 'blue'], // Change as per your color preference
});

const HeatMap2D: React.FC = () => {
  return (
    <svg width={width} height={height}>
      {heatmapData.map((row, i) =>
        row.map((cell, j) => (
          <rect
            key={`cell-${i}-${j}`}
            x={xScale(cell.x)}
            y={i * binSize} // Position based on row index
            width={binSize}
            height={binSize}
            fill={colorScale(cell.moisture)}
          />
        ))
      )}
    </svg>
  );
};

export default HeatMap2D;