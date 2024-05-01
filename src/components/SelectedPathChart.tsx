import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import {
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
} from '@material-ui/core';
import { useStateValue } from '../state';
import { Action } from '../state';
import InformationGainHeatMap from './Charts/InformationGainHeatMap';

const width = 850;
const height = 850;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };

interface Point {
  x: number;
  y: number;
}

const xScale = scaleLinear({
  domain: [0, 1], // Adjust this domain based on your data's range
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1], // Adjust this domain based on your data's range
  range: [height - margin.bottom, margin.top],
});

const colors = ['#FF5733', '#33FF57', '#3357FF'];

const SelectedPathChart: React.FC = () => {
  const [{ currUserStep, simulation_api_full_data }, dispatch] =
    useStateValue();

  // State to store the path data
  const [pathData, setPathData] = useState<Point[]>([]);

  useEffect(() => {
    // Assuming the API data is available in simulation_api_full_data
    const { path_x, path_y } = simulation_api_full_data;
    if (path_x && path_y) {
      const newPathData = path_x.map((x, index) => ({
        x: x,
        y: path_y[index] || 0, // Ensure there's a corresponding y value or use 0 as a fallback
      }));
      setPathData(newPathData);
    }
  }, [simulation_api_full_data]); // Dependency on API data

  return (
    <div>
      <svg width={width} height={height}>
        <Group>
          <LinePath
            data={pathData}
            x={(d) => xScale(d.x)}
            y={(d) => yScale(d.y)}
            stroke={colors[0]} // Use the first color or any logic to choose the color
            strokeWidth={4}
            curve={curveBasis}
          />
          <AxisLeft scale={yScale} left={50} />
          <AxisBottom scale={xScale} top={height - margin.bottom} />
        </Group>
      </svg>
    </div>
  );
};

export default SelectedPathChart;
