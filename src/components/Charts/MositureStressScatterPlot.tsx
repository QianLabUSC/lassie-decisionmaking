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
interface ScatterData {
  x: number;
  y: number;
  value: number;
}

interface ScatterPlotProps {
  width: number;
  height: number;
}


function generateScatterData(type: String): ScatterData[] {
  const data: ScatterData[] = [];

  const numOfPoints = 50;
  const maxValue = 100;

  for (let i = 0; i < numOfPoints; i++) {
    const x = Math.floor(Math.random() * maxValue);
    const y = Math.floor(Math.random() * maxValue);
    let value;
    if (type == 'SHEERSTRESS') {
      value = Math.floor(Math.random() * 5);
    } else {
      value = Math.floor(Math.random() * 100);
    }

 
    data.push({ x, y, value });
  }

  return data;
}

const MoistureStressScatterPlot: React.FC<ScatterPlotProps> = ({
  width,
  height,
}) => {
  const [selectedOption, setSelectedOption] = useState<
    'MOISTURE' | 'SHEARSTRESS'
  >('MOISTURE');
  const data = generateScatterData(selectedOption);
  const svgRef = useRef(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 120 };
  const plotWidth = width - margin.left;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (data && svgRef.current) {
      const svg = d3.select(svgRef.current);
      console.log(svg.selectAll('circle').size(), 'size');

      // Clear SVG before re-drawing
      svg.selectAll('*').remove();

      const xScale = d3.scaleLinear().domain([0, 100]).range([0, plotWidth]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X Axis
      g.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale))
        .append('text') // X-axis Label
        .attr('y', 40)
        .attr('x', plotWidth / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('X-Coordinate');

      // Y Axis
      g.append('g')
        .call(d3.axisLeft(yScale))
        .append('text') // Y-axis Label
        .attr('transform', 'rotate(-90)')
        .attr('y', -45)
        .attr('x', -plotHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
        .style('font-size', '15px') // Set the font size here
        .text('Y-Coordinate');


        const lineData = [{ x: 3, y: 11}, { x: 90, y: 90 }];

        // Line Generator
        const lineGenerator = d3.line<ScatterData>()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y));
    
        // Append the line
        g.append("path")
          .datum(lineData)
          .attr("fill", "none")
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("d", lineGenerator);


      // Points
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('fill', 'steelblue')
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(`x: ${d.x}, y: ${d.y}, ${selectedOption}: ${d.value}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
        });
    }
  }, [plotWidth, plotHeight, selectedOption]);

  return (
    <>
      <div>
      <Typography variant="h3"  style={{ minWidth: 200, marginTop: '30px', marginLeft: '400px' }}>
        Scatter Plot Data Visualization
      </Typography>
      <FormControl variant="outlined" style={{ marginLeft: '550px', marginTop:'20px', width: '200px' }}>
          <InputLabel id="dataSelect-label">Dataset</InputLabel>
          <Select
            labelId="dataSelect-label"
            id="dataSelect"
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
      </div>
      <svg ref={svgRef} width={width} height={height} />
      <div
        id="tooltip"
        style={{
          position: 'absolute',
          opacity: 0,
          textAlign: 'center',
          width: '120px',
          height: 'auto',
          padding: '2px',
          font: '12px sans-serif',
          background: 'lightsteelblue',
          border: '0px',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
      ></div>
      <Typography
        style={{ minWidth: 200, marginTop: '25px', marginLeft: '500px' }}
      >
        {selectedOption} V/S COORDINATES{' '}
      </Typography>
    </>
  );
};

export default MoistureStressScatterPlot;
