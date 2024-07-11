import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Typography } from '@material-ui/core';
import { useStateValue } from '../../state';

interface ScatterData {
  moisture: number;
  shear: number;
}

interface LineData {
  x: number;
  y: number;
}
interface ScatterPlotProps {
  width: number;
  height: number;
}

const MoistureStressScatterPlot: React.FC<ScatterPlotProps> = ({
  width,
  height,
}) => {
  const [{ simulation_api_full_data }] = useStateValue();

  // Transform the separate moisture and shear arrays into an array of ScatterData objects
  const data: ScatterData[] =
    simulation_api_full_data?.measured_data?.moisture.map(
      (moisture, index) => ({
        moisture,
        shear: simulation_api_full_data.measured_data.shear[index],
      })
    ) || [];

  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 20, right: 20, bottom: 50, left: 120 };
  const plotWidth = width;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG

      const xScale = d3.scaleLinear().domain([0.0, 2]).range([0, plotWidth]);

      const yScale = d3.scaleLinear().domain([0, 2]).range([plotHeight, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${plotHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(5)
            .tickFormat((d) => `${d}`)
        );

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
        .call(
          d3
            .axisBottom(xScale)
            .ticks(10)
            .tickSize(-plotHeight)

            .tickFormat(null)
        )
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7)
        .selectAll('.tick line')
        .attr('stroke', 'lightgrey');

      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yScale).ticks(10).tickSize(-plotWidth).tickFormat(null)
        )
        .attr('stroke', 'lightgrey')
        .attr('stroke-opacity', 0.7)
        .selectAll('.tick line')
        .attr('stroke', 'lightgrey');

      const lineData = [
        { x: 0, y: 11 },
        { x: 100, y: 85 },
      ];

      // // Line Generator
      // const lineGenerator = d3
      //   .line(LineData)
      //   .x((d) => xScale(d.x))
      //   .y((d) => yScale(d.y));

      // // Append the line
      // g.append('path')
      //   .datum(lineData)
      //   .attr('fill', 'none')
      //   .attr('stroke', 'red')
      //   .attr('stroke-width', 2)
      //   .attr('d', lineGenerator);

      const colorScale = (moisture) => {
        if (moisture >= 0.0 && moisture <= 0.1) return 'orange';
        if (moisture > 0.1 && moisture <= 0.2) return 'yellow';
        if (moisture > 0.2 && moisture <= 0.3) return 'pink';
        if (moisture > 0.3 && moisture <= 0.4) return 'beige';
        if (moisture > 0.4 && moisture <= 0.5) return 'skyblue';
        if (moisture > 0.5 && moisture <= 0.6) return 'teal';
        if (moisture > 0.6 && moisture <= 0.7) return 'brown';
        if (moisture > 0.7 && moisture <= 0.8) return 'olive';
        if (moisture > 0.8 && moisture <= 0.9) return 'violet';
        if (moisture > 0.9) return 'purple';
        return 'grey';
      };

      // Data points
      g.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 8)
        .attr('cx', (d) => xScale(d.moisture))
        .attr('cy', (d) => yScale(d.shear))
        .attr('fill', (d) => colorScale(d.moisture))
        .on('mouseover', (event, d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(
              `x: ${d.moisture}, y: ${d.shear}, Shear:${d.shear} Moisture:${d.moisture}`
            )
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
      <Typography
        variant="h5"
        style={{ marginTop: '20px', textAlign: 'center' }}
      >
        Collected Data from the Transect
      </Typography>
      <Typography
        variant="h6"
        style={{ marginTop: '20px', textAlign: 'center' }}
      >
        Shear Strength vs Moisture Percentage
      </Typography>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ marginLeft: '25px', border: '1px solid black' }}
      />
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
