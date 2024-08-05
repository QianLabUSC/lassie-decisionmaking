import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Typography } from '@material-ui/core';
import ChartColourLegendPanel from './ChartColourLegendPanel';
import '../Charts/ShearStrengthOnWorldMapChart.css'; // Ensure to import your custom styles

const graduallyChangingEnivironmentImage = require('../../assests/Gradually_changing_square_env.png');

interface ChartData {
  x: number;
  y: number;
  value: number;
}

interface ChartProps {
  width: number;
  height: number;

  shearPlotdata: {
    x: number[];
    y: number[];
    moisture: number[];
    shear: number[];
  };
}

const generateInitialChartData = ( ): ChartData[] => {
    const initialdata: ChartData[] = [];
    const numOfPoints = 50; // Adjust for a denser or sparser grid
  
    for (let x = 0; x < numOfPoints; x++) {
      for (let y = 0; y < numOfPoints; y++) {
        const value = 0;
        initialdata.push({ x, y, value });
      }
    }
  
    return initialdata;
  };

const ShearStrengthOnWorldMapChart: React.FC<ChartProps> = ({ width, height, shearPlotdata }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const processData = () => {
    if (!shearPlotdata || shearPlotdata.x.length === 0) {
      return generateInitialChartData(); // Generate default data with 10x10 grid
    }
    return shearPlotdata?.x.map((x, i) => ({
      x: x,
      y: shearPlotdata.y[i],
      value: shearPlotdata.shear[i],
    }));
  };

  const [data, setData] = useState<ChartData[]>(processData());

  useEffect(() => {
    setData(processData());
  }, [shearPlotdata]);

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
        .attr('y', margin.top);

      // Create tooltip
      const tooltip = d3.select(tooltipRef.current)
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px');

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([0, plotWidth]);

      const yScale = d3.scaleLinear()
        .domain([0.0, 1.0])
        .range([plotHeight, 0]); // Inverted to make y-axis start from bottom

      // Create custom color scale
      const colorScale = d3.scaleLinear<string>()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .range(['orange', 'blue', 'darkblue']);

      const arrowLengthScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .range([3, 30]);

      const arrow = d3.symbol().type(d3.symbolTriangle).size(100);

      svg.selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('d', arrow)
        .attr('transform', (d) => {
          const x = xScale(d.x) + margin.left;
          const y = yScale(d.y) + margin.top;
          const length = arrowLengthScale(d.value);
          return `translate(${x},${y}) rotate(90) scale(${length / 15})`; // Adjust the rotation as needed
        })
        .attr('fill', (d) => colorScale(d.value))
        .attr('stroke', '#fff')
        .on('mouseover', function (event, d) {
          tooltip.style('opacity', 1);
        })
        .on('mousemove', function (event, d) {
          tooltip
            .html(`Shear Strength : ${d.value}`)
            .style('left', event.pageX + 20 + 'px')
            .style('top', event.pageY + 'px');
        })
        .on('mouseleave', function () {
          tooltip.style('opacity', 0);
        });

      // Add X axis
      svg.append('g')
        .attr('transform', `translate(${margin.left},${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format(".1f")).tickValues(d3.range(0.0, 1.0, 0.1)))
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
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".1f")).tickValues(d3.range(0.1, 1.0, 0.1)))
        .append('text') // Y-axis Label
        .attr('transform', 'rotate(-90)')
        .attr('y', -25)
        .attr('x', -plotHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('Y-Coordinate');
    }
  }, [data, plotWidth, plotHeight]);

  return (
    <>
      <div className="chart-container">
        <div className="chart">
          <svg ref={svgRef} width={width} height={height} style={{ marginLeft: '10px' }} />
          <div ref={tooltipRef} className="tooltip"></div>
        </div>
        <div className="legend">
          <ChartColourLegendPanel width={50} height={600} colorFrom="#bf7c40" colorTo="#0000ff" />
        </div>
      </div>
    </>
  );
};

export default ShearStrengthOnWorldMapChart;
