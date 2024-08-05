import * as React from 'react';
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChartColourLegendPanel = ({ width, height, colorFrom, colorTo }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const legendWidth = width - 20;
    const legendHeight = height - 20;

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colorFrom);
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colorTo);

    svg.append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .style('stroke', 'black')
      .style('stroke-width', '1px');

    // Add legend axis
    const legendScale = d3.scaleLinear()
      .domain([0, 1]) // Adjust domain as needed
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickSize(-legendHeight);

    svg.append('g')
      .attr('transform', `translate(10, ${10 + legendHeight})`)
      .call(legendAxis)
      .select('.domain').remove();

  }, [width, height, colorFrom, colorTo]);

  return (
    <svg ref={svgRef}></svg>
  );
};

export default ChartColourLegendPanel;
