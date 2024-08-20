import * as React from 'react';
import { useEffect, useState} from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../state';
import { Action } from '../state';
import InformationGainHeatMap from '../components/Charts/InformationGainHeatMap';
import ChartColourLegendPanel from '../components/Charts/ChartColourLegendPanel' ;
// Dimensions and margins
const width = 603;
const height = 420;
const margin = { top: 20, bottom: 20, left: 50, right: 20 };

// Scales
const xScale = scaleLinear({
  domain: [0, 1],
  range: [margin.left, width - margin.right],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [height - margin.bottom, margin.top-19],
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
    <svg x={x-10}
    y={y-15} xmlns="http://www.w3.org/2000/svg"  viewBox="0,0,256,256" width="24px" height="24px"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" ><g transform="scale(10.66667,10.66667)"><path d="M17,10h-10c-0.552,0 -1,-0.448 -1,-1v-1c0,-3.314 2.686,-6 6,-6v0c3.314,0 6,2.686 6,6v1c0,0.552 -0.448,1 -1,1z" fill="#000000"></path><path d="M13,21h-2c-2.761,0 -5,-2.239 -5,-5v-4c0,-1.105 0.895,-2 2,-2h8c1.105,0 2,0.895 2,2v4c0,2.761 -2.239,5 -5,5z" fill="#ff7a0f" opacity="0.35"></path><path d="M6,20.092v-8.592c0,-0.829 -0.671,-1.5 -1.5,-1.5c-0.829,0 -1.5,0.671 -1.5,1.5v8.592c-0.581,0.207 -1,0.756 -1,1.408c0,0.829 0.671,1.5 1.5,1.5h2c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.652 -0.419,-1.202 -1,-1.408z" fill="#ff7a0f"></path><path d="M21,20.092v-8.592c0,-0.829 -0.671,-1.5 -1.5,-1.5c-0.829,0 -1.5,0.671 -1.5,1.5v8.592c-0.581,0.207 -1,0.756 -1,1.408c0,0.829 0.671,1.5 1.5,1.5h2c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.652 -0.419,-1.202 -1,-1.408z" fill="#ff7a0f"></path><path d="M14.5,12h-5c-0.829,0 -1.5,0.671 -1.5,1.5c0,0.829 0.671,1.5 1.5,1.5h5c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.671,-1.5 -1.5,-1.5z" fill="#ff7a0f"></path><circle cx="13.5" cy="6.5" r="1.5" fill="#b3b3b3"></circle></g></g></svg>
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
        width={583}
        height={400}
        data={heatmapData}
        x={50}
        y={0}
      />
    );
  };

  return (
    <div>
      
      <div>
      <div className="legend" >
      <ChartColourLegendPanel width={70} height={300} colorFrom="#ffffff" colorTo="#ff8731" />
     

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
