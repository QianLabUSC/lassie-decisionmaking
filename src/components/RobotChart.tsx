import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve'
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { Button, Radio, RadioGroup, FormControlLabel } from '@material-ui/core';
import { useStateValue } from '../state';
import { Action } from '../state';

const width = 850;
const height = 850;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };

interface Point {
  x: number;
  y: number;
}

const xScale = scaleLinear({
  domain: [0, 1],
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [height - margin.bottom, margin.top],
});

const labels = ['A', 'B', 'C'];
const colors = ['#FF5733', '#33FF57', '#3357FF'];

type TestPath = number[][][];

const RobotChart: React.FC = () => {
  const [{ currUserStep, newpathvalues }, dispatch] = useStateValue();
  const [selectedPath, setSelectedPath] = useState('');
  const [allPaths, setAllPaths] = useState<TestPath[]>([]);

  useEffect(() => {
    // Load initial paths only on component mount
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
    setAllPaths([firstPath]);  // Set initial path
  }, []);

// Ensure new path values are also TestPath
useEffect(() => {
  if (newpathvalues && Array.isArray(newpathvalues) && newpathvalues.length > 0) {
    setAllPaths(prevPaths => [...prevPaths, newpathvalues]);  // Ensure newpathvalues is TestPath
  }
}, [newpathvalues]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPath(event.target.value);
  };


  const handleSubmit = () => {
    console.log('Path generated for selection: ', selectedPath);
    dispatch({ type: Action.INCREMENT_STEP_IDX });
  };

  const getPathData = (paths: TestPath, index: number): Point[] => {
    console.log(paths,'allpaatgetpaths')
    if (index < paths.length) {
      return paths[index][0].map((x, i) => ({
        x,
        y: paths[index][1][i],
      }));
    }
    return [];
  };
  

  const shouldShowPath = (index: number): boolean => {
    if (currUserStep.acceptOrReject === -1 || currUserStep.acceptOrReject >= labels.length) {
      return true;
    }
    return index === currUserStep.acceptOrReject;
  };

  const totalPaths = allPaths.reduce((acc, paths) => acc + paths.length, 0);

  const newSubmit = async () => {
    console.log('testtttt')
    dispatch({ type: Action.INCREMENT_STEP_IDX });
  };

  const disableSubmitButton = false; // Update logic as needed

  console.log('allpaths', allPaths)
  return (
    <div>
      <svg width={width} height={height}>
        <Group>
        {allPaths.map((paths, idx) =>
            paths.map((_, pathIndex) => {

              console.log('eachpaths', allPaths)
              const data = getPathData(allPaths[allPaths.length-1], pathIndex);
              if (!data.length || !shouldShowPath(pathIndex)) return null;
              const lastPoint = data[data.length - 1];
              const globalPathIndex = allPaths.slice(0, idx).reduce((acc, cur) => acc + cur.length, 0) + pathIndex;
              const isLastThreePaths = globalPathIndex >= totalPaths - 3;
              return (
                <React.Fragment key={`path-set-${idx}-path-${pathIndex}`}>
                  <LinePath
                    data={data}
                    x={(d: Point) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    stroke={isLastThreePaths ? colors[pathIndex % colors.length] : 'black'}
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

      <RadioGroup row aria-label="path selection" name="path_selection" value={selectedPath} onChange={handleChange}>
        <FormControlLabel value="A" control={<Radio />} label="Accept suggested location A" />
        <FormControlLabel value="B" control={<Radio />} label="Accept suggested location B" />
        <FormControlLabel value="C" control={<Radio />} label="Accept suggested location C" />
        <FormControlLabel value="reject" control={<Radio />} label="Reject suggestions" />
      </RadioGroup>
      <Button
        disabled={!selectedPath}
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
      >
        Generate Path
      </Button>
    </div>
  );
};

export default RobotChart;
