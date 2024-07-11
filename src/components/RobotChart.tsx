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

interface RobotChartProps {
  currentselectedpath: string;
}
const RobotChart: React.FC<RobotChartProps> = ({ currentselectedpath }) => {
  const [{ currUserStep, newpathvalues, threePaths, simulation_api_full_data, all_single_curve_selected_black_path }, dispatch] = useStateValue();

  const [selectedPath, setSelectedPath] = useState('');
  const [allPaths, setAllPaths] = useState<TestPath[]>([]);
  const [heatMapType, setHeatMapType] = useState('infogain');

  const handleChangeHeatMap = (event: React.ChangeEvent<{ value: unknown }>) => {
    setHeatMapType(event.target.value as string);
  };

  useEffect(() => {
    // Load initial paths only on component mount
    const firstPath: TestPath = [
      [[], [], [], []],
      [[], [], [], []],
      [[], [], [], []],
    ];
    setAllPaths([firstPath]); // Set initial path
  }, []);

  const [pathsubmittedtimes2, setpathsubmittedtimes2] = useState(0);

  useEffect(() => {
    if (threePaths && Array.isArray(threePaths) && threePaths.length > 0) {
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
      if (selectedPath === 'A') {
        currentindexofpathselectedoutof3 = 0;
      } else if (selectedPath === 'B') {
        currentindexofpathselectedoutof3 = 1;
      } else if (selectedPath === 'C') {
        currentindexofpathselectedoutof3 = 2;
      } else if (selectedPath === 'D') {
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
    if (currUserStep.acceptOrReject === -1 || currUserStep.acceptOrReject >= labels.length) {
      return true;
    }
    return index === currUserStep.acceptOrReject;
  };

  const totalPaths = allPaths.reduce((acc, paths) => acc + paths.length, 0);

  const disableSubmitButton = false; // Update logic as needed
  const RobotIcon = ({ x, y }) => (
    <svg
      x={x - 15}
      y={y - 15}
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C13.1046 2 14 2.89543 14 4H10C10 2.89543 10.8954 2 12 2ZM18 8H20C21.1046 8 22 8.89543 22 10V18C22 19.1046 21.1046 20 20 20H18V22H16V20H8V22H6V20H4C2.89543 20 2 19.1046 2 18V10C2 8.89543 2.89543 8 4 8H6V6H8V8H16V6H18V8ZM4 10V18H20V10H4ZM7 11H9V13H7V11ZM15 11H17V13H15V11Z"
        fill="black"
      />
    </svg>
  );

  const getSelectedPathData = (): Point[] => {
    const selectedXs = all_single_curve_selected_black_path?.selectedPath?.selectedXs_path_cordinates.flat();
    const selectedYs = all_single_curve_selected_black_path?.selectedPath?.selectedYs_path_cordinates.flat();
  
    if (selectedXs && selectedYs) {
      return selectedXs.map((x: number, i: number) => ({
        x,
        y: selectedYs[i],
      }));
    }
    return [];
  };

  const getEndCoordinates = (): Point[] => {
    const selectedEndXs = all_single_curve_selected_black_path?.selectedPathEndCoordinates?.selectedXs_path_end_corinates;
    const selectedEndYs = all_single_curve_selected_black_path?.selectedPathEndCoordinates?.selectedYs_path_end_corinates;

    if (selectedEndXs && selectedEndYs) {
      return selectedEndXs.map((x: number, i: number) => ({
        x,
        y: selectedEndYs[i],
      }));
    }
    return [];
  };

  const selectedPathData = getSelectedPathData();
  const endCoordinates = getEndCoordinates();

  const renderHeatMap = () => {
    const heatmapData = heatMapType === 'infogain' ? simulation_api_full_data?.info_gain_shear : simulation_api_full_data?.uncertainity;

    if (!heatmapData.length) return null;
    const startX = xScale(0);
    const startY = yScale(0);
    const endX = xScale(10); // x goes from 0 to 10
    const endY = yScale(10); // y goes from 0 to 10

    return (
      simulation_api_full_data && (
        <InformationGainHeatMap
          width={1550}
          height={2490}
          data={heatmapData}
          x={50}
          y={50}
        />
      )
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
              const data = getPathData(allPaths[allPaths.length - 1], pathIndex);
              const heatMapFullData = getHeatMapData(allPaths[allPaths.length - 1], pathIndex);
              const heatMapData = heatMapFullData;
              if (!data.length || !shouldShowPath(pathIndex)) return null;
              const lastPoint = data[data.length - 1];
              const globalPathIndex = allPaths.slice(0, idx).reduce((acc, cur) => acc + cur.length, 0) + pathIndex;
              const isLastThreePaths = globalPathIndex >= totalPaths - 3;

              let select;
              if (labels[pathIndex] === 'A') {
                select = 1;
              } else if (labels[pathIndex] === 'B') {
                select = 2;
              } else if (labels[pathIndex] === 'C') {
                select = 3;
              }
              const isSelectedPath = currentselectedpath == select;
              return (
                <React.Fragment key={`path-set-${idx}-path-${pathIndex}`}>
                  <LinePath
                    data={data}
                    x={(d: Point) => xScale(d.x)}
                    y={(d) => yScale(d.y)}
                    stroke={isSelectedPath ? 'black' : colors[pathIndex % colors.length]}
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
                  {isSelectedPath && (
                    <RobotIcon x={xScale(lastPoint.x)} y={yScale(lastPoint.y)} />
                  )}
                </React.Fragment>
              );
            })
          )}
          <AxisLeft scale={yScale} left={50} />
          <AxisBottom scale={xScale} top={height - 20} />
          {selectedPathData.length > 0 && (
            <LinePath
              data={selectedPathData}
              x={(d: Point) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              stroke="black"
              strokeWidth={4}
              curve={curveBasis}
            />
          )}
          {endCoordinates.map((point, index) => (
            <circle
              key={index}
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={5}
              fill="blue"
            />
          ))}
        </Group>
      </svg>
    </div>
  );
};

export default RobotChart;
