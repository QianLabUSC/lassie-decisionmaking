import * as React from 'react';
import {useEffect, useState} from 'react';
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



// // Convert initial path data to the format suitable for LinePath
// const lineData: Point[][] = newpath.map((pathSet) =>
//   pathSet[0].map((x, i) => ({ x, y: pathSet[1][i] }))
// );

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
// let testpathfull: Point[] = []; // Persist outside to accumulate across calls

// Assuming TestPath represents an array of arrays of numbers,
// adjust the structure as necessary based on your data
type TestPath = number[][][];

const test: TestPath[] = [];

const RobotChart: React.FC = () => {
  const [{ currUserStep, newpathvalues }] = useStateValue();

  const [allPaths, setAllPaths] = useState<TestPath[]>([]);

  useEffect(() => {
    setAllPaths((prevPaths) => [...prevPaths, newpathvalues]);
  }, [newpathvalues]);

  // This function seems fine as it is, assuming newpathvalues structure is [[x[], y[]], [x[], y[]], ...]
  const getPathData = (paths: TestPath, index: number): Point[] => {
    if (index < paths.length) {
      return paths[index][0].map((x, i) => ({
        x,
        y: paths[index][1][i],
      }));
    }
    return [];
  };

  const shouldShowPath = (index: number): boolean => {
    // If option D is selected (represented here by a special value like -1), show all paths
    if (
      currUserStep.acceptOrReject === -1 ||
      currUserStep.acceptOrReject >=
       labels.length
    ) {
      return true;
    }
    // Only show the path that corresponds to the selected option
    return index === currUserStep.acceptOrReject;
  };

  test.push(newpathvalues)
  console.log(newpathvalues, 'data1')

  return (
    <svg width={width} height={height}>
      <Group>
        {allPaths.map((paths, idx) => 
          paths.map((_, pathIndex) => {
            const data = getPathData(paths, pathIndex);
            if (!data.length || !shouldShowPath(pathIndex)) return null;

            const lastPoint = data[data.length - 1];
            return (
              <React.Fragment key={`path-set-${idx}-path-${pathIndex}`}>
                <LinePath
                  data={data}
                  x={(d: Point) => xScale(d.x)}
                  y={(d) => yScale(d.y)}
                  stroke={colors[pathIndex % colors.length]} // Adjust as needed
                  strokeWidth={4}
                  curve={curveBasis}
                />
                <Text
                  x={xScale(lastPoint.x)}
                  y={yScale(lastPoint.y)}
                  dx={-10}
                  dy={5}
                  fill="red"
                  fontSize={25}
                  fontWeight="bold"
                >
                 {pathIndex}
                </Text>
              </React.Fragment>
            );
          })
        )}
        <AxisLeft scale={yScale} left={50} />
        <AxisBottom scale={xScale} top={height - 20} />
      </Group>
    </svg>
  );
};

export default RobotChart;
