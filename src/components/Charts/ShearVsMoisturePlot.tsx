import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Typography } from '@material-ui/core';

interface ScatterData {
  moisture: number;
  shear: number;
  x:number;
  y:number;
}

interface ScatterPlotProps {
  width: number;
  height: number;
}


function generateScatterData(): ScatterData[] {
  const data: ScatterData[] = [];
  const numOfPoints = 100;
  const maxValue = 100;

  for (let i = 0; i < numOfPoints; i++) {
    const x = Math.floor(Math.random() * maxValue);
    const y = Math.floor(Math.random() * maxValue);
 
    const moisture = Math.random() * 100; // Moisture value
    const shear = Math.random() * 100; // Shear stress value

    data.push({ x, y, moisture, shear });
  }
  return data;
}

const MoistureStressScatterPlot: React.FC<ScatterPlotProps> = ({
  width,
  height,
}) => {
  const data = generateScatterData();
  const svgRef = useRef(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG

      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.moisture)!])
        .range([0, plotWidth]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.shear)!])
        .range([plotHeight, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}`));

      g.append('g').call(d3.axisLeft(yScale));

      // Data points
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 8)
        .attr('cx', d => xScale(d.moisture))
        .attr('cy', d => yScale(d.shear))
        .attr('fill', 'blue')
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(`x: ${d.x}, y: ${d.y}, Shear:${d.shear} Moisture:${d.moisture}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', () => {
          d3.select('#tooltip').style('opacity', 0);
        });

        

    }
  }, [data, plotWidth, plotHeight]);

  return (
    <>
      <Typography variant="h6" style={{ marginTop: '20px', textAlign: 'center' }}>
        Moisture vs. Shear Stress Scatter Plot
      </Typography>
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
    </>
  );
};

export default MoistureStressScatterPlot;
