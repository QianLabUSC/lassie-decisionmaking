import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../state';
import { Action } from '../state';
import InformationGainHeatMap from '../components/Charts/InformationGainHeatMap';
import ChartColourLegendPanel from '../components/Charts/ChartColourLegendPanel' 
// Dimensions and margins
const width = 400;
const height = 400;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };

// Scales
const xScale = scaleLinear({
  domain: [0, 1],
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [height - margin.bottom, margin.top],
});

// Labels and colors
const labels = ['A', 'B', 'C'];
const colors = ['#FF5733', '#33FF57', '#3357FF'];

// Types
type Point = { x: number; y: number };
type SubPath = number[];
type Path = [SubPath, SubPath, SubPath, SubPath];
type TestPath = Path[];

interface RobotChartProps {
  currentselectedpath: string;
  heatMapType: string;
}

const RobotChart: React.FC<RobotChartProps> = ({ currentselectedpath, heatMapType }) => {
  const [{ currUserStep, newpathvalues, threePaths, simulation_api_full_data, all_single_curve_selected_black_path }, dispatch] = useStateValue();
  
  const [selectedPath, setSelectedPath] = useState('');
  const [allPaths, setAllPaths] = useState<TestPath[]>([]);
  const [pathsubmittedtimes2, setpathsubmittedtimes2] = useState(0);

  useEffect(() => {
    const firstPath: TestPath = [
      [[], [], [], []],
      [[], [], [], []],
      [[], [], [], []],
    ];
    setAllPaths([firstPath]);
  }, []);

  useEffect(() => {
    if (threePaths && Array.isArray(threePaths) && threePaths.length > 0) {
      setAllPaths([threePaths]);
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
        value: [pathsubmittedtimes2, currentindexofpathselectedoutof3],
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
        x,
        y: paths[index][1][i],
      }));
      const infogain = paths[index][2];
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

  const disableSubmitButton = false;
  
  const RobotIcon = ({ x, y }) => (
    <svg
      x={x - 12}
      y={y - 20}
      width="50"
      height="30"
      viewBox="0 0 24 24"
      fill="yellow"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C13.1046 2 14 2.89543 14 4H10C10 2.89543 10.8954 2 12 2ZM18 8H20C21.1046 8 22 8.89543 22 10V18C22 19.1046 21.1046 20 20 20H18V22H16V20H8V22H6V20H4C2.89543 20 2 19.1046 2 18V10C2 8.89543 2.89543 8 4 8H6V6H8V8H16V6H18V8ZM4 10V18H20V10H4ZM7 11H9V13H7V11ZM15 11H17V13H15V11Z"
        fill="#ff0066"
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
    const heatmapData = heatMapType === 'DISCREPANCY_REWARD' ? simulation_api_full_data?.uncertainity : simulation_api_full_data?.info_gain_shear;

    if (!heatmapData.length) return null;

    return (
      <InformationGainHeatMap
        width={380}
        height={410}
        data={heatmapData}
        x={50}
        y={-30}
      />
    );
  };

  return (
    <div>
      
      <div style={{ display: 'flex', justifyContent: 'center', }}>
      <div className="legend">
      <ChartColourLegendPanel width={70} height={393} colorFrom="#ffffff" colorTo="#ff8731" />
     

      <svg width={width} height={height} >
        {allPaths?.[0]?.[0]?.[0].length === 0 && <RobotIcon x={xScale(0)} y={yScale(0)} />}
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
              const isSelectedPath = currentselectedpath === select;
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
          <AxisLeft scale={yScale} left={margin.left} />
          <AxisBottom scale={xScale} top={height - margin.bottom} />
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
        <Text
          x={width / 2}
          y={height - 10}
          fontSize={14}
          textAnchor="middle"
        >
          X
        </Text>
        <Text
          x={-height / 2}
          y={15}
          fontSize={14}
          textAnchor="middle"
          transform="rotate(-90)"
        >
          Y
        </Text>
      </svg>
    </div>
    </div>
    </div>
  );
};

export default RobotChart;
