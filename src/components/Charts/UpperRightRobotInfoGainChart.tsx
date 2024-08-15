import * as React from 'react';
import { useEffect, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { Text } from '@visx/text';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useStateValue } from '../../state';

// Constants for chart dimensions and margins
const width = 500;
const height = 500;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

type SubPath = number[];

interface Point {
  x: number;
  y: number;
}

type Path = [SubPath, SubPath, SubPath, SubPath];

type TestPath = Path[];

interface UpperLeftRobotChartProps {
  currentselectedpath: string;
  heatMapType:string;
}

const xScale = scaleLinear({
  domain: [0, 1],
  range: [0, innerWidth],
});

const yScale = scaleLinear({
  domain: [0, 1],
  range: [innerHeight, 0],
});

const UpperRightRobotInfoGainChart: React.FC<UpperLeftRobotChartProps> = ({ currentselectedpath, heatMapType }) => {
  const [{ threePaths, all_single_curve_selected_black_path, simulation_api_full_data }, dispatch] = useStateValue();

  const [allPaths, setAllPaths] = useState<TestPath[]>([]);
  const [heatMapData, setHeatMapData] = useState<{ points: number[][] } | null>(null);

  useEffect(() => {
    const firstPath: TestPath = [
      [[], [], [], []],
      [[], [], [], []],
      [[], [], [], []],
    ];
    setAllPaths([firstPath]); // Set initial path
  }, []);

  useEffect(() => {
    if (threePaths && Array.isArray(threePaths) && threePaths.length > 0) {
      setAllPaths([threePaths]);
      const heatmap = getHeatMapData(threePaths, 0);
      setHeatMapData(heatmap);
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
  ): { points: number[][] } => {
    if (index < paths.length) {
      // Initialize the grid with zeros
      const gridSize = paths[index][0].length;
      const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  
      // Fill the grid with data
      paths[index][0].forEach((x, i) => {
        const row = Math.floor(x); // Assuming x maps to row index
        const col = Math.floor(paths[index][1][i]); // Assuming y maps to column index
        grid[row][col] = paths[index][2] ? paths[index][2][i] : 0; // Set value from third path or default to 0
      });
  
      return { points: grid };
    }
    return { points: [] };
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

  const renderHeatMap = () => {
    if (!heatMapData) return null;

    const gridSize = heatMapData.points.length; // Assuming square grid
    const cellWidth = innerWidth / gridSize;
    const cellHeight = innerHeight / gridSize;

    const flattenedHeatMapData = heatMapData.points.flatMap((row, rowIndex) =>
      row.map((value, colIndex) => ({
        x: colIndex * cellWidth,
        y: rowIndex * cellHeight,
        value,
      }))
    );

    const colorScale = scaleLinear({
      domain: [
        Math.min(...flattenedHeatMapData.map(d => d.value)),
        Math.max(...flattenedHeatMapData.map(d => d.value)),
      ],
      range: ['white', 'orange'],
    });

    return (
      <Group>
        {flattenedHeatMapData.map((data, index) => (
          <rect
            key={index}
            x={data.x}
            y={data.y}
            width={cellWidth}
            height={cellHeight}
            fill={colorScale(data.value)}
            opacity={0.6}
          />
        ))}
      </Group>
    );
  };

  return (
    <div>
      <svg width={width} height={height} style={{ marginLeft: '150px' }}>
        <Group left={margin.left} top={margin.top}>
          {renderHeatMap()}

          {allPaths?.[0]?.[0]?.[0].length === 0 && <RobotIcon x={xScale(0)} y={yScale(0)} />}
          {allPaths.map((paths, idx) =>
            paths.map((_, pathIndex) => {
              const data = getPathData(allPaths[allPaths.length - 1], pathIndex);
              if (!data.length) return null;
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
        <Text x={-height / 2} y={margin.left - 70 / 2} fontSize={20} textAnchor="middle" transform="rotate(-90)">
          Y Coordinates
        </Text>
      </svg>
    </div>
  );
};

export default UpperRightRobotInfoGainChart;
