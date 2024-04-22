import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath} from '@visx/shape';
import { curveBasis } from '@visx/curve'
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../state';
import { Action } from '../state';

const width = 850;
const height = 850;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };
const colors = ['#FF5733', '#33FF57', '#3357FF'];

const xScale = scaleLinear({
  domain: [0, 1],
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [height - margin.bottom, margin.top],
});

type Point = { x: number; y: number; };
type TestPath = number[][][];

const RobotChart: React.FC = () => {
  const [{ currUserStep, newpathvalues }, dispatch] = useStateValue();
  const [allPaths, setAllPaths] = useState<TestPath[]>([]);

  // Initialize paths once on component mount
  useEffect(() => {
    const firstPath: TestPath = [
      [
        [0, 0.012699544, 0.01377393, 0.0148343254, 0.148540198, 0.1889489748],
        [0, 0.01330707, 0.13732145, 0.14574513, 0.14924912, 0.1554568],
      ],
      [
        [0, 0.012699544, 0.0142308, 0.01501995, 0.1727556, 0.17514517],
        [0, 0.01330707, 0.01417771, 0.161951, 0.16915733, 0.1737063],
      ],
      [
        [0, 0.012699544, 0.1339001, 0.14742749, 0.16707451, 0.1682743],
        [0, 0.01330707, 0.01474205, 0.1509101, 0.1752565, 0.1793485],
      ],
    ];
    setAllPaths([firstPath]);
  }, []);

  const getPathData = (path) => {
    return path[0].map((x, i) => ({
      x,
      y: path[1][i],
    }));
  };

  return (
    <div>
      <svg width={width} height={height}>
        <Group>
          {allPaths.map((paths, idx) =>
            paths.map((path, pathIndex) => (
              <React.Fragment key={`path-set-${idx}-path-${pathIndex}`}>
                <LinePath
                  data={getPathData(path)}
                  x={(d: Point) => xScale(d.x)}
                  y={(d) => yScale(d.y)}
                  stroke={colors[pathIndex % colors.length]}
                  strokeWidth={4}
                  curve={curveBasis}
                />
                <Text
                  x={xScale(path[0][path[0].length - 1])}
                  y={yScale(path[1][path[1].length - 1])}
                  dx={-10}
                  dy={5}
                  fill="red"
                  fontSize={25}
                  fontWeight="bold"
                >
                  {`Path ${pathIndex}`}
                </Text>
              </React.Fragment>
            ))
          )}
          <AxisLeft scale={yScale} left={50} />
          <AxisBottom scale={xScale} top={height - 20} />
        </Group>
      </svg>
    </div>
  );
};

export default RobotChart;
