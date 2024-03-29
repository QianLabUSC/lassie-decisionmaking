import * as React from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../state';

// import { paths } from '../paths';

const width = 1400;
const height = 700;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };
interface Point {
  x: number;
  y: number;
}

export const newpath = [
  [
    [0.1343, 0.12454, 0.345, 0.143545, 0.49],
    [0.1,  0.115, 0.21, 0.32, 0.45]
  ],
  [
      [0.1, 0.2114, 0.147, 0.479, 0.48],
      [0.1,  0.365, 0.465, 0.485, 0.49]
  ],
  [
      [0.1, 0.1243, 0.23543, 0.24359, 0.54],
      [0.1,  0.3225, 0.345, 0.3832, 0.44]
  ]
];

const secondpath = [
  [
    [0.49, 0.30510220440881763526, 0.310420841683366733, 0.41062124248496994, 0.489979959919839678, 0.489999999],
    [0.45, 0.510220440881763526, 0.610420841683366733, 0.671062124248496994, 0.689979959919839678, 0.78978]
  ],
  [
    [0.48, 0.43499875, 0.43535655, 0.356676, 0.3587989, 0.215686787],
    [0.49, 0.49879759519038075, 0.519899799599198396, 0.545465, 0.674556, 0.7898675]
  ],
  [
    [0.54, 0.345501002004008016, 0.34559020040080160321, 0.46503006012024048, 0.769989979959919839, 0.871],
    [0.44, 0.5001002004008016032, 0.5250501002004008, 0.6541503006012024, 0.73386773547094188, 0.75]
  ]
];
// Convert initial path data to the format suitable for LinePath
const lineData: Point[][] = newpath.map((pathSet) =>
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

// Labels and Colors for each path
const labels = ['A', 'B', 'C'];
const colors = ['#FF5733', '#33FF57', '#3357FF']; // Example colors for 3 paths

const RobotChart: React.FC = () => {
  const [{ currUserStep }] = useStateValue();

  const getPathData = (index: number): Point[] => {
    if (index < secondpath.length) {
      return secondpath[index][0].map((x, i) => ({ x, y: secondpath[index][1][i] }));
    }
    return [];
  };

  const shouldShowPath = (index: number): boolean => {
    // If option D is selected (represented here by a special value like -1), show all paths
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
          if (!shouldShowPath(index)) return null;  // Do not render the path if it should not be shown
        
          const lastPoint = data[data.length - 1];

          const pathsToRender = [
            <React.Fragment key={`fragment-${index}`}>
              <LinePath
                key={`line-${index}`}
                data={data}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
                stroke={colors[index % colors.length]} // Use fixed color based on index
                strokeWidth={4}
                curve={curveBasis} // Apply the curve function here
              />
              <Text
                key={`text-${index}`}
                x={xScale(lastPoint.x)}
                y={yScale(lastPoint.y)}
                dx={-10} // Offset a bit to the right
                dy={5} // Offset a bit up
                fill="red"
                fontSize={25}
                fontWeight="bold"
              >
                {labels[index]}
              </Text>
            </React.Fragment>
          ];

          // If the current path is selected, append the new path from secondpath
          if (index === currUserStep.acceptOrReject) {
            const newPathData = getPathData(index);
            pathsToRender.push(
              <LinePath
                key={`line-new-${index}`}
                data={newPathData}
                x={(d) => xScale(d.x)}
                y={(d) => yScale(d.y)}
                stroke={colors[index % colors.length]} // Use the same fixed color for the new path
                strokeWidth={4}
                strokeDasharray="4,4" // Optional: makes the new path dashed
                curve={curveBasis} // Apply the curve function here
              />
            );
          }

          return pathsToRender;
        })}
        <AxisLeft scale={yScale} left={margin.left} />
        <AxisBottom scale={xScale} top={height - margin.bottom} />
      </Group>
    </svg>
  );
};

export default RobotChart;