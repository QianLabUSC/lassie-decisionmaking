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
import InformationGainHeatMap from '../components/Charts/InformationGainHeatMap';
import { FormatAlignCenter } from '@material-ui/icons';

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

// Define the structure of a single sub-path as an array of numbers
type SubPath = number[];

// Define a path as an array containing two sub-paths
type Path = [SubPath, SubPath, SubPath, SubPath];

// Define the structure for testPath, which is an array of paths
type TestPath = Path[];



const RobotChart: React.FC = () => {
  const [{ currUserStep, newpathvalues, threePaths, simulation_api_full_data }, dispatch] = useStateValue();

  console.log('uncertanity_heat_map_data123 ', simulation_api_full_data)


  const [selectedPath, setSelectedPath] = useState('');
  const [allPaths, setAllPaths] = useState<TestPath[]>([]);

  const [heatMapType, setHeatMapType] = useState('infogain');
  const handleChangeHeatMap = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setHeatMapType(event.target.value as string);
  };

  useEffect(() => {
    // Load initial paths only on component mount
    const firstPath: TestPath = [
      [
        [],
        [],
        [],
        [],
      ],
      [
        [],
        [],
        [],
        [],
      ],
      [
        [],
        [],
        [],
        [],
      ],
    ];
    setAllPaths([firstPath]); // Set initial path
  }, []);

  const [pathsubmittedtimes2, setpathsubmittedtimes2] = useState(0);
  // Ensure new path values are also TestPath
  useEffect(() => {
    if (
      threePaths &&
      Array.isArray(threePaths) &&
      threePaths.length > 0
    ) {
      setAllPaths([threePaths]); // Ensure newpathvalues is TestPath
    }
  }, [threePaths]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPath(event.target.value);
  };

  const handleSubmit = () => {
    const count = pathsubmittedtimes2 + 1;

    setpathsubmittedtimes2(count);

    if (selectedPath !== null) {
      let currentindexofpathselectedoutof3;
      if (selectedPath == 'A') {
        currentindexofpathselectedoutof3 = 0;
      } else if (selectedPath == 'B') {
        currentindexofpathselectedoutof3 = 1;
      } else if (selectedPath == 'C') {
        currentindexofpathselectedoutof3 = 2;
      } else if (selectedPath == 'D') {
        currentindexofpathselectedoutof3 = 3;
      }

      dispatch({
        type: Action.INCREMENT_STEP_IDX,
        value: [pathsubmittedtimes2, currentindexofpathselectedoutof3], // Passing the selected path as the value
      });
    }
  };

  const getPathData = (paths: TestPath, index: number): Point[] => {
    if (index < paths.length) {
      return paths[index][0].map((x, i) => ({
        x,
        y: paths[index][1][i],
      }));
    }
    return [];
  };

  const getHeatMapData = (
    paths: TestPath,
    index: number
  ): { points: Point[]; infogain: number[]; discrepancy: number[] } => {

    
    if (index < paths.length) {
      const points = paths[index][0].map((x, i) => ({
        x: x,
        y: paths[index][1][i],
      }));
      const infogain = paths[index][2]; // Assuming the heatmap data is at the third index of each path
      const discrepancy = paths[index][3];
      return { points, infogain, discrepancy };
    }
    return { points: [], infogain: [], discrepancy: [] };
  };

  const shouldShowPath = (index: number): boolean => {
    if (
      currUserStep.acceptOrReject === -1 ||
      currUserStep.acceptOrReject >= labels.length
    ) {
      return true;
    }
    return index === currUserStep.acceptOrReject;
  };

  const totalPaths = allPaths.reduce((acc, paths) => acc + paths.length, 0);

  const disableSubmitButton = false; // Update logic as needed

  const renderHeatMap = () => {
    const heatmapData = heatMapType === 'infogain' ?  simulation_api_full_data?.info_gain_shear: simulation_api_full_data?.uncertainity;
    console.log(heatMapType, heatmapData, 'hereaaami')

    console.log(heatmapData ,'simulation_api_full_data?.uncertainity',simulation_api_full_data?.uncertainity)
    if (!heatmapData.length) return null;
    const startX = xScale(0);
    const startY = yScale(0);
    const endX = xScale(10);  // x goes from 0 to 10
    const endY = yScale(10);  // y goes from 0 to 10  

    console.log(heatmapData)
    
    return (
      simulation_api_full_data && (<InformationGainHeatMap
        width={1550}
        height={2490}
        data={heatmapData}
        x={50}
        y={50}
      />)
    );
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <FormControl
          style={{
            minWidth: 200,
          }}
        >
          <Select
            value={heatMapType}
            onChange={handleChangeHeatMap}
            displayEmpty
            style={{
              background: 'white',
              color: 'rgba(0, 0.2, 0, 0.17)',
              padding: '10px 15px',
            }}
            inputProps={{
              'aria-label': 'Without label',
              style: {
                paddingTop: '10px',
                paddingBottom: '10px',
              },
            }}
          >
            <MenuItem
              value="infogain"
              style={{ background: 'white', margin: '5px 0' }}
            >
              Information Gain
            </MenuItem>
            <MenuItem
              value="discrepancy"
              style={{ background: 'white', margin: '5px 0' }}
            >
              Discrepancy
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <svg width={width} height={height}>
        <Group>
        {renderHeatMap()}
          {allPaths.map((paths, idx) =>
            paths.map((_, pathIndex) => {
              const data = getPathData(
                allPaths[allPaths.length - 1],
                pathIndex
              );
              const heatMapFullData = getHeatMapData(
                allPaths[allPaths.length - 1],
                pathIndex
              );
              const heatMapData = heatMapFullData;
              if (!data.length || !shouldShowPath(pathIndex)) return null;
              const lastPoint = data[data.length - 1];
              const globalPathIndex =
                allPaths
                  .slice(0, idx)
                  .reduce((acc, cur) => acc + cur.length, 0) + pathIndex;
              const isLastThreePaths = globalPathIndex >= totalPaths - 3;
              return (
                
                <React.Fragment key={`path-set-${idx}-path-${pathIndex}`} >
                  <LinePath
                    data={data}
                    x={(d: Point) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    stroke={
                      isLastThreePaths
                        ? colors[pathIndex % colors.length]
                        : 'black'
                    }
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

      <RadioGroup
        row
        aria-label="path selection"
        name="path_selection"
        value={selectedPath}
        onChange={handleChange}
      >
        <FormControlLabel
          value="A"
          control={<Radio />}
          label="Accept suggested location A"
        />
        <FormControlLabel
          value="B"
          control={<Radio />}
          label="Accept suggested location B"
        />
        <FormControlLabel
          value="C"
          control={<Radio />}
          label="Accept suggested location C"
        />
        <FormControlLabel
          value="D"
          control={<Radio />}
          label="Reject suggestions"
        />
      </RadioGroup>
      <Button
        disabled={!selectedPath}
        variant="contained"
        color="secondary"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </div>
  );
};

export default RobotChart;
