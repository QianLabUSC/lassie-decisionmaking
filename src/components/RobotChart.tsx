import * as React from 'react';
import { LinePath} from '@visx/shape';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import Typography from '@material-ui/core/Typography';
import { useStateValue } from '../state';

import { paths } from '../paths';

const width = 1400;
const height = 700;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };
interface Point {
  x: number;
  y: number;
}


// Convert paths data to the format suitable for LinePath
const lineData: Point[][] = paths.map((pathSet) =>
  pathSet[0].map((x, i) => ({ x, y: pathSet[1][i] }))
);

// Scales
const xScale = scaleLinear({
  domain: [0, 1],
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [height - margin.bottom, margin.top],
});

// Labels for each path
const labels = ['A', 'B', 'C'];

const RobotChart:React.FC = () => {
  // This function determines if a path should be shown based on the selected option

  const [{ currUserStep }] = useStateValue(); 

  const shouldShowPath = (index: number): boolean => {
    // If no option is selected (or if the "Reject suggestions" option is selected), show all paths
    if (currUserStep.acceptOrReject === -1 || currUserStep.acceptOrReject >= labels.length) {
      return true;
    }
    // Only show the path that corresponds to the selected option
    return index === currUserStep.acceptOrReject;
  };


  return (
    <svg width={width} height={height}>
      <Group>
        {lineData.map((data, index) => {
          if (!shouldShowPath(index)) return null; // Do not render the path if it should not be shown

          // Get the last point of the path for the label positioning
          const lastPoint = data[data.length - 1];
          return (
            <React.Fragment key={`line-group-${index}`}>
              <LinePath
                data={data}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each line
                strokeWidth={4}
              />
              {/* Add text label */}
              <Text
                x={xScale(lastPoint.x)}
                y={yScale(lastPoint.y)}
                dx={-30} // Offset a bit to the right
                dy={25} // Offset a bit up
                fill="red"
                fontSize={50}
                fontWeight="bold"
              >
                {labels[index]}
              </Text>
            </React.Fragment>
          );
        })}
        <AxisLeft scale={yScale} left={margin.left} />
        <AxisBottom scale={xScale} top={height - margin.bottom} />
      </Group>
    </svg>
  );
};


export default RobotChart;