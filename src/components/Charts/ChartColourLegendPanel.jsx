import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChartColourLegendPanel = ({ width, height, colorFrom, colorTo }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const legendWidth = width -55;
    const legendHeight = height - 11;

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%'); // Change gradient direction to vertical

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorFrom);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorTo);

    svg.append('rect')
      .attr('x', 50)
      .attr('y', 10)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    // Add legend axis
    const legendScale = d3.scaleLinear()
      .domain([0.0, 1.0]) // Adjust domain as needed
      .range([legendHeight, 0]);

    const legendAxis = d3.axisLeft(legendScale)
      .ticks(5)
      .tickValues([0.0, 0.2, 0.4, 0.6, 0.8, 1.0])
      .tickFormat(d3.format(".1f")) // Ensure one decimal place
      .tickSize(-60);

    svg.append('g')
      .attr('transform', `translate(${35}, 10)`) // Move the axis to the left of the color panel
      .call(legendAxis)
      .select('.domain').remove();

    // Increase font size
    svg.selectAll('.tick text')
      .style('font-size', '15px'); // Adjust font size as needed

  }, [width, height, colorFrom, colorTo]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default ChartColourLegendPanel;
