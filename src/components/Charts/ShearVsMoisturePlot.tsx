import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStateValue } from '../../state';
const graduallyChangingEnivironmentImage = require('../../assests/Gradually_Changing_Env.png');

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

const MoistureStressScatterPlot: React.FC<ScatterPlotProps> = ({ width, height }) => {
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
  const plotWidth = 600;
  const plotHeight = 600;

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove(); // Clear SVG

      // Define the blur filter
      svg.append('defs')
        .append('filter')
        .attr('id', 'blurFilter')
        .append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '5'); // Adjust the stdDeviation for more/less blur

      // Add the background image with blur filter
      svg.append('image')
        .attr('xlink:href', graduallyChangingEnivironmentImage)
        .attr('x', 40)
        .attr('y', 19)
        .attr('width', width-50)
        .attr('height', height)
        .attr('filter', 'url(#blurFilter)');

      const xScale = d3.scaleLinear().domain([0, 1]).range([0, plotWidth]);
      const yScale = d3.scaleLinear().domain([0, 1]).range([plotHeight, 0]);
      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left-80},${margin.top+10})`);

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
        .attr('stroke', 'black')
        .attr('stroke-opacity', 0.9)
        .selectAll('.tick line')
        .attr('stroke', 'black');

      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yScale).ticks(10).tickSize(-plotWidth).tickFormat(null)
        )
        .attr('stroke', 'black')
        .attr('stroke-opacity', 0.7)
        .selectAll('.tick line')
        .attr('stroke', 'black');

        
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
              `x: ${d.moisture}, y: ${d.shear}, Shear: ${d.shear}, Moisture: ${d.moisture}`
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
      <div>
        <svg ref={svgRef} width={width} height={height} style={{ marginLeft: '50px' }} />
      </div>
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
