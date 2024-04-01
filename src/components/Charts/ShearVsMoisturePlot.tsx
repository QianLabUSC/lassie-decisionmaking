import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Typography } from '@material-ui/core';

interface ScatterData {
  x: number;
  y: number;
  moisturevalue: number;
  shearvalue: number;
}

interface ScatterPlotProps {
  width: number;
  height: number;
}

function generateScatterData(type: 'MOISTURE' | 'SHEARSTRESS'): ScatterData[] {
  const data: ScatterData[] = [];
  const numOfPoints = 50;
  const maxValue = 100;

  for (let i = 0; i < numOfPoints; i++) {
    const x = Math.floor(Math.random() * maxValue);
    const y = Math.floor(Math.random() * maxValue);
    let moisturevalue, shearvalue;

    moisturevalue = Math.floor(Math.random() * 5);

    shearvalue = Math.floor(Math.random() * 100);

    data.push({ x, y, moisturevalue, shearvalue });
  }
  return data;
}

const MoistureStressScatterPlot: React.FC<ScatterPlotProps> = ({
  width,
  height,
}) => {
  const moistureData = generateScatterData('MOISTURE');
  const shearStressData = generateScatterData('SHEARSTRESS');
  const svgRef = useRef(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 120 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG

      const xScale = d3.scaleLinear().domain([0, 100]).range([0, plotWidth]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([plotHeight, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale));

      g.append('g').call(d3.axisLeft(yScale));

      // // Moisture - Circles
      // g.selectAll('.dot-moisture')
      //   .data(moistureData)
      //   .enter()
      //   .append('circle')
      //   .attr('class', 'dot-moisture')
      //   .attr('r', 5)
      //   .attr('cx', d => xScale(d.x))
      //   .attr('cy', d => yScale(d.y))
      //   .attr('fill', 'green');

      // // Shear Stress - Rectangles
      // g.selectAll('.dot-shearstress')
      //   .data(shearStressData)
      //   .enter()
      //   .append('rect')
      //   .attr('class', 'dot-shearstress')
      //   .attr('width', 10)
      //   .attr('height', 10)
      //   .attr('x', d => xScale(d.x) - 5) // Offset by half the width to center
      //   .attr('y', d => yScale(d.y) - 5) // Offset by half the height to center
      //   .attr('fill', 'red');

      // Moisture - Circles
      g.selectAll('.dot-moisture')
        .data(moistureData)
        .enter()
        .append('circle')
        .attr('class', 'dot-moisture')
        .attr('r', 8)
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('fill', 'green')
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(`x: ${d.x}, y: ${d.y}, Moisture:${d.moisturevalue}`) // Show moisture value
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
        });

      // Shear Stress - Rectangles
      g.selectAll('.dot-shearstress')
        .data(shearStressData)
        .enter()
        .append('rect')
        .attr('class', 'dot-shearstress')
        .attr('width', 15)
        .attr('height', 15)
        .attr('x', (d) => xScale(d.x) - 5) // Offset by half the width to center
        .attr('y', (d) => yScale(d.y) - 5) // Offset by half the height to center
        .attr('fill', 'red')
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(`x: ${d.x}, y: ${d.y}, Shear: ${d.shearvalue}`) // Show shear stress value
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
        });
    }
  }, [moistureData, shearStressData, plotWidth, plotHeight]);

  return (
    <>
      <Typography
        variant="h3"
        style={{ marginTop: '30px', textAlign: 'center' }}
      >
        Moisture & Shear Stress Scatter Plot
      </Typography>
      <svg ref={svgRef} width={width} height={height} />
    </>
  );
};

export default MoistureStressScatterPlot;
