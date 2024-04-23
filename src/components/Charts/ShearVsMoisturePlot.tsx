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
  const margin = { top: 20, right: 20, bottom: 50, left: 120 };
  const plotWidth = width
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

      g.append('g')
      .attr('transform', `translate(0,${plotHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text') // X-axis Label
      .attr('y', 40)
      .attr('x', plotWidth / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '15px') // Set the font size here
      .text('Moisture Percentage');

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
      .text('Shear Stress');
      
  
 // Grid lines for the X-axis
 g.append('g')
 .attr('class', 'grid')
 .attr('transform', `translate(0,${plotHeight})`)
 .call(d3.axisBottom(xScale)
   .ticks(10)
   .tickSize(-plotHeight)

   .tickFormat(null)
   )
 .attr('stroke', 'lightgrey')
 .attr('stroke-opacity', 0.7)
 .selectAll('.tick line').attr('stroke', 'lightgrey');

// Grid lines for the Y-axis
g.append('g')
 .attr('class', 'grid')
 .call(d3.axisLeft(yScale)
   .ticks(10)
   .tickSize(-plotWidth)
   .tickFormat(null)
  )
 .attr('stroke', 'lightgrey')
 .attr('stroke-opacity', 0.7)
 .selectAll('.tick line').attr('stroke', 'lightgrey');


      const lineData = [
        { x: 0, y: 11 },
        { x: 100, y: 85 },
      ];

      // Line Generator
      const lineGenerator = d3
        .line<ScatterData>()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y));

      // Append the line
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);


 
    
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
     <Typography variant="h5" style={{ marginTop: '20px', textAlign: 'center' }}>
        Collected Data from the Transect
      </Typography>

      <Typography variant="h6" style={{ marginTop: '20px', textAlign: 'center' }}>
        Shear Strength vs Moisture Percentage
      </Typography>
      <svg ref={svgRef} width={width} height={height} style={{ marginLeft:'25px', border: '1px solid black' }} />
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
