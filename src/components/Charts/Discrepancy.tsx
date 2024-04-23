import * as React from 'react';
import  { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Interfaces
interface Data {
  moisture: number;
  shear: number;
  x: number;
  y: number;
}

interface Props {
  width: number;
  height: number;
}

// Data generation and calculations
function generatemyData(numOfPoints = 500, maxValue = 100): Data[] {
    const data: Data[] = [];
    for (let i = 0; i < numOfPoints; i++) {
      // Create clusters by reducing the randomness of subsequent points
      const clusterEffect = i % 5 === 0 ? 1 : 0.1;
      const prevData = data.length > 0 ? data[data.length - 1] : null;
      const x = prevData
        ? prevData.x + (Math.random() - 0.5) * maxValue * clusterEffect
        : Math.random() * maxValue;
      const y = prevData
        ? prevData.y + (Math.random() - 0.5) * maxValue * clusterEffect
        : Math.random() * maxValue;
      const moisture = prevData
        ? prevData.moisture + (Math.random() - 0.5) * 10 * clusterEffect
        : Math.random() * maxValue;
      const shear = prevData
        ? prevData.shear + (Math.random() - 0.5) * 10 * clusterEffect
        : Math.random() * maxValue;
  
      // Clamp values to ensure they're within the allowed range
      const clampedX = Math.max(0, Math.min(x, maxValue));
      const clampedY = Math.max(0, Math.min(y, maxValue));
      const clampedMoisture = Math.max(0, Math.min(moisture, maxValue));
      const clampedShear = Math.max(0, Math.min(shear, maxValue));
  
      data.push({
        x: clampedX,
        y: clampedY,
        moisture: clampedMoisture,
        shear: clampedShear,
      });
    }
    return data;
  }

  function calculateInformationRewards(discrepancies: number[]): number[] {
  // Here we assume that the reward is inversely proportional to the discrepancy
  // You may want to transform this differently based on your domain knowledge
  return discrepancies.map(discrepancy => 1 / (1 + discrepancy));
}

function calculateDiscrepancies(data: Data[]): number[] {
  return data.map(d => Math.abs(d.moisture - d.shear));
}

function calculateCumulativeDiscrepancies(discrepancies: number[]): number[] {
  let cumulativeSum = 0;
  return discrepancies?.map(discrepancy => cumulativeSum += discrepancy);
}

// React component for the chart
const DiscrepancyChart: React.FC<Props> = ({ width, height }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const myData = generatemyData();
    const discrepancies = calculateDiscrepancies(myData);
    const cumulativeDiscrepancies = calculateCumulativeDiscrepancies(discrepancies);

    const informationRewards = calculateInformationRewards(discrepancies);
    const cumulativeInformationRewards = calculateCumulativeDiscrepancies(informationRewards);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear SVG for redraw

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Scales
    const xScale = d3.scaleLinear().domain([0, myData.length]).range([0, chartWidth]);
    const yScale = d3.scaleLinear().domain([0, d3.max(cumulativeDiscrepancies) ?? 0]).range([chartHeight, 0]);

    const yInfoRewardScale = d3.scaleLinear()
    .domain([0, d3.max(cumulativeInformationRewards) ?? 0])
    .range([chartHeight, 0]);


    // Line generator
    const line = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yScale(d));

    // SVG group for the chart
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5));

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Line path
    g.append('path')
      .datum(cumulativeDiscrepancies)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 5.0)
      .attr('d', line);


    // Line generator for information rewards
    const infoRewardLine = d3.line<number>()
      .x((_, i) => xScale(i))
      .y(d => yInfoRewardScale(d));

    // Add information reward path
    g.append('path')
      .datum(cumulativeInformationRewards)
      .attr('fill', 'none')
      .attr('stroke', 'darkorange') // Change the color to differentiate the lines
      .attr('stroke-width', 5.0)
      .attr('d', infoRewardLine);


      const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12) // Increased font size
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data([
        { color: 'steelblue', text: 'Discrepancy' },
        { color: 'darkorange', text: 'Information Reward' }
      ])
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${chartWidth - margin.right},${chartHeight - margin.bottom - (i * 20)})`);
  
    legend.append('rect')
      .attr('x', 0)
      .attr('y', -10)
      .attr('width', 18)
      .attr('height', 10)
      .attr('fill', d => d.color);
  
    legend.append('text')
      .attr('x', 24) // Offset the text to the right of the rectangle
      .attr('y', 0)
      .text(d => d.text)
      .style('font-size', '14px') // Increase the font size here if you want
  
    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 18)
      .attr('y1', -5) // Center the line in the rect
      .attr('y2', -5)
      .attr('stroke-width', '6')
      .attr('stroke', d => d.color);


  }, [width, height]);

  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
};

export default DiscrepancyChart;
