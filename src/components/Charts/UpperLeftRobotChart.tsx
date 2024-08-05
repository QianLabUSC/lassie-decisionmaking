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
// Constants for chart dimensions and margins
const width = 650;
const height = 650;
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

const UpperLeftRobotChart = () => {
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

  return (
    <div>
      <svg width={width} height={height} style={{marginLeft:'150px'}}>
      <defs>
          <filter id="blurFilter" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
          </filter>
        </defs>
        
      <image href={patchyEnivironmentImage} x={50} y={22} width={innerWidth} height={innerHeight} filter="url(#blurFilter)" />
        <Group left={margin.left} top={margin.top}>
          {/* For showing initial robot icon at (0,0) */}
          {allPaths?.[0]?.[0]?.[0].length === 0 && <RobotIcon x={xScale(0)} y={yScale(0)} />}
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
        </Group>
        <Text x={width / 2} y={height - 5} fontSize={20} textAnchor="middle">
          X Coordinates
        </Text>
        <Text x={-height / 2}  y={margin.left-70/ 2} fontSize={20} textAnchor="middle" transform="rotate(-90)">
          Y Coordinates
        </Text>
      </svg>
    </div>
  );
};

export default UpperLeftRobotChart;
