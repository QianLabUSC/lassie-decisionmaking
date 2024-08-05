import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Typography,
} from '@material-ui/core';

const graduallyChangingEnivironmentImage = require('../../assests/Gradually_Changing_Env.png');

interface ChartData {
  x: number;
  y: number;
  value: number;
}

interface ChartProps {
  width: number;
  height: number;
}

const generateChartData = (
  type: 'MOISTURE' | 'SHEAR-STRENGTH'
): ChartData[] => {
  const data: ChartData[] = [];
  const numOfPoints = 10; // Adjust for a denser or sparser grid
  const maxValue = type === 'MOISTURE' ? 100 : 5;

  for (let x = 0; x < numOfPoints; x++) {
    for (let y = 0; y < numOfPoints; y++) {
      const value = Math.floor(Math.random() * maxValue);
      data.push({ x, y, value });
    }
  }

  return data;
};

const ShearStrengthOnWorldMapChart: React.FC<ChartProps> = ({ width, height }) => {
  const [selectedOption, setSelectedOption] = useState<
    'MOISTURE' | 'SHEAR-STRENGTH'
  >('SHEAR-STRENGTH');
  const [data, setData] = useState<ChartData[]>(
    generateChartData('SHEAR-STRENGTH')
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    setData(generateChartData(selectedOption));
  }, [selectedOption]);

  useEffect(() => {
    if (data.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG content before redrawing

      // Add background image
      svg.append('image')
        .attr('xlink:href', graduallyChangingEnivironmentImage)
        .attr('width', plotWidth)
        .attr('height', plotHeight)
        .attr('x', margin.left)
        .attr('y', margin.top+12);

      // Create tooltip
      const tooltip = d3
        .select(tooltipRef.current)
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px');

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.x.toString()))
        .range([0, plotWidth])
   

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.y.toString()))
        .range([plotHeight, 0]) // Inverted to make y-axis start from bottom
      

      const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([0, d3.max(data, d => d.value) ?? 0]);

      const arrowLengthScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) ?? 0])
        .range([1, 30]);

      const arrow = d3.symbol().type(d3.symbolTriangle).size(100);

      svg.selectAll('path')
        .data(data)
        .enter().append('path')
        .attr('d', arrow)
        .attr('transform', d => {
          const x = xScale(d.x.toString())! + xScale.bandwidth() / 2 + margin.left;
          const y = yScale(d.y.toString())! + yScale.bandwidth() / 2 + margin.top;
          const length = arrowLengthScale(d.value);
          return `translate(${x},${y}) rotate(90) scale(${length / 15})`; // Adjust the rotation as needed
        })
        .attr('fill', d => colorScale(d.value))
        .attr('stroke', '#fff')
        .on('mouseover', function (event, d) {
          tooltip.style('opacity', 1);
        })
        .on('mousemove', function (event, d) {
          tooltip
            .html(`${selectedOption} <br> value is: ` + d.value)
            .style('left', event.pageX + 20 + 'px')
            .style('top', event.pageY + 'px');
        })
        .on('mouseleave', function () {
          tooltip.style('opacity', 0);
        });

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .append('text') // X-axis Label
        .attr('y', 40)
        .attr('x', plotWidth / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px')
        .text('X-Coordinate');

      // Add Y axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale).tickSizeOuter(0))
        .append('text') // Y-axis Label
        .attr('transform', 'rotate(-90)')
        .attr('y', -25)
        .attr('x', -plotHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('Y-Coordinate');
    }
  }, [data, plotWidth, plotHeight, selectedOption]);

  return (
    <>
      <Typography
        variant="h3"
        style={{ minWidth: 200, marginTop: '30px', marginLeft: '400px' }}
      >
       Shear Strength  Visualization
      </Typography>
      {/* <FormControl
        variant="outlined"
        style={{ marginLeft: '550px', marginTop: '20px', width: '200px' }}
      >
        <InputLabel id="dataset-select-label">Dataset</InputLabel>
        <Select
          labelId="dataset-select-label"
          id="dataset-select"
          value={selectedOption}
          onChange={(e) =>
            setSelectedOption( 'MOISTURE')
          }
          label="Dataset"
        >
           <MenuItem value="MOISTURE">Moisture</MenuItem>
          <MenuItem value="SHEARSTRESS">Shear Stress</MenuItem>
        </Select>
      </FormControl> */}
      <svg ref={svgRef} width={width} height={height}  style={{marginLeft:'50px'}} >
        </svg>
      <div ref={tooltipRef} className="tooltip"></div>
    </>
  );
};

export default ShearStrengthOnWorldMapChart;
