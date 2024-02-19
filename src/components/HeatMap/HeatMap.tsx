import * as React from 'react';
import { HeatmapRect } from '@visx/heatmap';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';

interface DataCell {
  bin: number;
  count: number;
}

// Explicitly type the matrix
const matrix: DataCell[][] = [];

const moistureReward = [
    2.3488, 5.5525, 8.1282, 8.7527, 6.622, 2.5104, 6.4769, 9.5017, 1.0957, 9.2917,
    2.6433, 7.6944, 4.6489, 10.7488, 3.6218, 7.4957, 6.7703, 9.321, 4.6574, 0.5531,
    6.3793, 10.2388, 3.4532, 2.2017, 8.3789, 8.2758, 9.3516, 7.0065, 8.3971, 7.0524,
    10.9908, 4.8174, 10.5419, 3.6568, 2.9493, 2.6528, 2.4054, 5.6568, 10.5311, 4.2985,
    10.4241, 9.9814, 8.6651, 1.9951, 1.5994, 7.7977, 3.0836, 9.5217, 4.408, 2.8031
  ];


const size = Math.ceil(Math.sqrt(moistureReward.length));
for (let i = 0; i < size; i++) {
  matrix[i] = [];
  for (let j = 0; j < size; j++) {
    const value = moistureReward[i * size + j] || 0; // fill in the missing values with 0
    matrix[i].push({ bin: j, count: value });
  }
}


const HeatmapComponent = () => {
    // Dimensions
    const width = 500;
    const height = 500;
    const margin = { top: 10, left: 20, right: 20, bottom: 10 };

    // Scales
    const xScale = scaleLinear({
        domain: [0, size],
        range: [0, width],
    });

    const yScale = scaleLinear({
        domain: [0, size],
        range: [0, height],
    });

    const colorMax = Math.max(...moistureReward);
    const colorScale = scaleLinear<string>({
      range: ['rgb(0,0,0)', 'rgb(0,0,255)'],
      domain: [0, colorMax / 2, colorMax],
    });
    

    const opacityScale = scaleLinear({
        domain: [0, 1],
        range: [0.1, 1],
    });

    const binWidth = width / size;
    const binHeight = height / size;

    
    return (
        <svg width={width} height={height}>
            {matrix.map((row, i) => (
                <Group key={`row-${i}`} top={yScale(i)}>
                    {row.map((cell, j) => (
                        <rect
                            key={`cell-${i}-${j}`}
                            className="heatmap-rect"
                            colorScale={colorScale}
                            width={binWidth}
                            height={binHeight}
                            x={xScale(j)}
                            y={0}
                            fill={colorScale(cell.count)}
                            fillOpacity={opacityScale(cell.count)}
                        />
                    ))}
                </Group>
            ))}
        </svg>
    );
};

export default HeatmapComponent;