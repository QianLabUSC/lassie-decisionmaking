import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../../state';
const patchyEnivironmentImage = require('../../assests/Patchy_Env.png');
const graduallyChangingEnivironmentImage = require('../../assests/Picture1.png');
import ChartColourLegendPanel from './ChartColourLegendPanel';
// Constants for chart dimensions and margins
const width = 780;
const height = 390;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Define the structure of a single sub-path as an array of numbers
type SubPath = number[];

interface Point {
  x: number;
  y: number;
}

// Define a path as an array containing sub-paths
type Path = [SubPath, SubPath, SubPath, SubPath];

// Define the structure for testPath, which is an array of paths
type TestPath = Path[];

interface UpperLeftRobotChartProps {
  currentselectedpath: string;
}

const xScale = scaleLinear({
  domain: [0, 1],
  range: [0, innerWidth],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [innerHeight, 0],
});

interface RobotChartProps {
  currentselectedpath: string;
}

const UpperLeftRobotChart: React.FC<RobotChartProps>  = ({currentselectedpath }) => {
  const [{ threePaths, all_single_curve_selected_black_path }, dispatch] = useStateValue();

  const [allPaths, setAllPaths] = useState<TestPath[]>([]);

  useEffect(() => {
    // Load initial paths only on component mount
    const firstPath: TestPath = [
      [[], [], [], []],
      [[], [], [], []],
      [[], [], [], []],
    ];
    setAllPaths([firstPath]); // Set initial path
  }, []);

  useEffect(() => {
    if (threePaths && Array.isArray(threePaths) && threePaths.length > 0) {
      setAllPaths([threePaths]); // Ensure newpathvalues is TestPath
    }
  }, [threePaths]);

  const RobotIcon = ({ x, y }) => (
    <svg x={x-10}
    y={y-15} xmlns="http://www.w3.org/2000/svg"  viewBox="0,0,256,256" width="24px" height="24px"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" ><g transform="scale(10.66667,10.66667)"><path d="M17,10h-10c-0.552,0 -1,-0.448 -1,-1v-1c0,-3.314 2.686,-6 6,-6v0c3.314,0 6,2.686 6,6v1c0,0.552 -0.448,1 -1,1z" fill="#000000"></path><path d="M13,21h-2c-2.761,0 -5,-2.239 -5,-5v-4c0,-1.105 0.895,-2 2,-2h8c1.105,0 2,0.895 2,2v4c0,2.761 -2.239,5 -5,5z" fill="#ff7a0f" opacity="0.35"></path><path d="M6,20.092v-8.592c0,-0.829 -0.671,-1.5 -1.5,-1.5c-0.829,0 -1.5,0.671 -1.5,1.5v8.592c-0.581,0.207 -1,0.756 -1,1.408c0,0.829 0.671,1.5 1.5,1.5h2c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.652 -0.419,-1.202 -1,-1.408z" fill="#ff7a0f"></path><path d="M21,20.092v-8.592c0,-0.829 -0.671,-1.5 -1.5,-1.5c-0.829,0 -1.5,0.671 -1.5,1.5v8.592c-0.581,0.207 -1,0.756 -1,1.408c0,0.829 0.671,1.5 1.5,1.5h2c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.652 -0.419,-1.202 -1,-1.408z" fill="#ff7a0f"></path><path d="M14.5,12h-5c-0.829,0 -1.5,0.671 -1.5,1.5c0,0.829 0.671,1.5 1.5,1.5h5c0.829,0 1.5,-0.671 1.5,-1.5c0,-0.829 -0.671,-1.5 -1.5,-1.5z" fill="#ff7a0f"></path><circle cx="13.5" cy="6.5" r="1.5" fill="#b3b3b3"></circle></g></g></svg>
  );

  const getPathData = (paths: TestPath, index: number): Point[] => {
    if (index < paths.length) {
      return paths[index][0].map((x, i) => ({
        x,
        y: paths[index][1][i],
      }));
    }
    return [];
  };



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
  const totalPaths = allPaths.reduce((acc, paths) => acc + paths.length, 0);
  const labels = ['A', 'B', 'C'];
  const colors = ['#FF5733', '#33FF57', '#3357FF'];
  
  let backgoundImg;

  let chartBackgroundImg = process.env.REACT_APP_EXPERIMENT_LOCATION_FOR_BACKGROUND_IMAGES;
  console.log(chartBackgroundImg, 'chartBackgroundImg');
  
  if (chartBackgroundImg === 'PATCHY') {
    backgoundImg = patchyEnivironmentImage;
  } else if (chartBackgroundImg === 'GRADUALLY_CHANGING') {
    backgoundImg = graduallyChangingEnivironmentImage;
  } else {
    backgoundImg = '';
  }

  return (
  <div>
    <div className="legend" style={{marginLeft:'50px'}}>
      <ChartColourLegendPanel width={70} height={300} colorFrom="#ffffff" colorTo="#ff8731" />
      <svg width={width} height={height} style={{marginLeft:'20px'}}>      
      <image href={backgoundImg} x={50} y={20} width={innerWidth} height={innerHeight} filter="url(#blurFilter)" />
        <Group left={margin.left} top={margin.top}>
          {/* For showing initial robot icon at (0,0) */}
          {allPaths?.[0]?.[0]?.[0].length === 0 && <RobotIcon x={xScale(0)} y={yScale(0)} />}
          {allPaths.map((paths, idx) =>
            paths.map((_, pathIndex) => {
              const data = getPathData(allPaths[allPaths.length - 1], pathIndex);
              if (!data.length ) return null;
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
          <AxisLeft scale={yScale} numTicks={10} />
          <AxisBottom top={innerHeight} scale={xScale} numTicks={10} />
          {selectedPathData.length > 0 && (
            <LinePath
              data={selectedPathData}
              x={(d: Point) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              stroke="yellow"
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
          {/* Add top border */}
          <line
            x1={0}
            x2={innerWidth}
            y1={0}
            y2={0}
            stroke="black"
            strokeWidth={1}
          />

          {/* Add right border */}
          <line
            x1={innerWidth}
            x2={innerWidth}
            y1={0}
            y2={innerHeight}
            stroke="black"
            strokeWidth={1}
          />
        </Group>
        <Text x={width / 2} y={height - 5} fontSize={20} textAnchor="middle">
          X Coordinates
        </Text>
        <Text x={-height / 2}  y={margin.left-70/ 2} fontSize={20} textAnchor="middle" transform="rotate(-90)">
          Y Coordinates
        </Text>
      </svg>
    </div>
  </div>
  );
};

export default UpperLeftRobotChart;
