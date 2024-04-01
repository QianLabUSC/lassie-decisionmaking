import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@material-ui/core';

interface HeatmapData {
  x: number;
  y: number;
  value: number;
}

interface HeatmapProps {
  width: number;
  height: number;
}

const generateHeatmapData = (
  type: 'MOISTURE' | 'SHEARSTRESS'
): HeatmapData[] => {
  const data: HeatmapData[] = [];
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

const MoistureHeatMap: React.FC<HeatmapProps> = ({ width, height }) => {
  const [selectedOption, setSelectedOption] = useState<
    'MOISTURE' | 'SHEARSTRESS'
  >('MOISTURE');
  const [data, setData] = useState<HeatmapData[]>(
    generateHeatmapData('MOISTURE')
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const margin = { top: 20, right: 20, bottom: 150, left: 120 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    setData(generateHeatmapData(selectedOption));
  }, [selectedOption]);

  useEffect(() => {
    if (data.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG content before redrawing

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
        .padding(0.05);

      const yScale = d3
        .scaleBand()
        .domain(data.map((d) => d.y.toString()))
        .range([plotHeight, 0]) // Inverted to make y-axis start from bottom
        .padding(0.05);

      const colorScale = d3
        .scaleSequential()
        .interpolator(
          selectedOption === 'MOISTURE'
            ? d3.interpolateBlues
            : d3.interpolateReds
        )
        .domain([0, d3.max(data, (d) => d.value) ?? 0]);

      // Append the squares for the heatmap
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.x.toString()) ?? 0)
        .attr('y', (d) => yScale(d.y.toString()) ?? 0)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('fill', (d) => colorScale(d.value))
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
      svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${height - margin.bottom})`
        )
        .call(d3.axisBottom(xScale).tickSizeOuter(0));

      // Add Y axis
      svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(d3.axisLeft(yScale).tickSizeOuter(0))
        .append('text') // Y-axis Label
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -plotHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('Y-Coordinate');

      // Add X axis
      svg
        .append('g')
        .attr(
          'transform',
          `translate(${margin.left},${height - margin.bottom})`
        )
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .append('text') // X-axis Label
        .attr('y', 40)
        .attr('x', plotWidth / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('X-Coordinate');
    }
  }, [data, plotWidth, plotHeight, selectedOption]);

  return (
    <>
      <Typography
        variant="h3"
        style={{ minWidth: 200, marginTop: '30px', marginLeft: '400px' }}
      >
        Heatmap Visualization
      </Typography>
      <FormControl
        variant="outlined"
        style={{ marginLeft: '550px', marginTop: '20px', width: '200px' }}
      >
        <InputLabel id="dataset-select-label">Dataset</InputLabel>
        <Select
          labelId="dataset-select-label"
          id="dataset-select"
          value={selectedOption}
          onChange={(e) =>
            setSelectedOption(e.target.value as 'MOISTURE' | 'SHEARSTRESS')
          }
          label="Dataset"
        >
          <MenuItem value="MOISTURE">Moisture</MenuItem>
          <MenuItem value="SHEARSTRESS">Shear Stress</MenuItem>
        </Select>
      </FormControl>
      <svg ref={svgRef} width={width} height={height} />
      <div ref={tooltipRef} className="tooltip"></div>
    </>
  );
};

export default MoistureHeatMap;
