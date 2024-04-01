import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@material-ui/core';

interface HeatmapData {
  x: number;
  y: number;
  value: number;
}

interface HeatmapProps {
  width: number;
  height: number;
}

const generateHeatmapData = (type: 'MOISTURE' | 'SHEARSTRESS'): HeatmapData[] => {
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
  const [selectedOption, setSelectedOption] = useState<'MOISTURE' | 'SHEARSTRESS'>('MOISTURE');
  const [data, setData] = useState<HeatmapData[]>(generateHeatmapData('MOISTURE'));
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 100, right: 20, bottom: 50, left: 120 };
  const plotWidth = width - margin.left;
  const plotHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    setData(generateHeatmapData(selectedOption));
  }, [selectedOption]);

  useEffect(() => {
    if (data.length > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const xScale = d3.scaleBand()
        .domain(data.map(d => d.x.toString()))
        .range([0, plotWidth])
        .padding(0.05);

      const yScale = d3.scaleBand()
        .domain(data.map(d => d.y.toString()))
        .range([0, plotHeight])
        .padding(0.05);

        const colorScale = d3.scaleSequential()
        .interpolator(selectedOption === 'MOISTURE' ? d3.interpolateBlues : d3.interpolateReds)
        .domain([0, d3.max(data, d => d.value ?? 0) as number]); // Use ?? operator for nullish coalescing
      

      svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .selectAll('rect')
        .data(data)
        .enter().append('rect')
          .attr('x', d => xScale(d.x.toString()) ?? 0)
          .attr('y', d => yScale(d.y.toString()) ??0)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .style('fill', d => colorScale(d.value));
    }
  }, [data, plotWidth, plotHeight, selectedOption]);

  return (
    <>
      <Typography variant="h6" style={{ textAlign: 'center' }}>
        Heatmap Visualization
      </Typography>
      <FormControl variant="outlined" style={{ margin: '20px', width: '500px' }}>
        <InputLabel id="dataset-select-label">Dataset</InputLabel>
        <Select
          labelId="dataset-select-label"
          id="dataset-select"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value as 'MOISTURE' | 'SHEARSTRESS')}
          label="Dataset"
        >
          <MenuItem value="MOISTURE">Moisture</MenuItem>
          <MenuItem value="SHEARSTRESS">Shear Stress</MenuItem>
        </Select>
      </FormControl>
      <svg ref={svgRef} width={width} height={height} />
    </>
  );
};

export default MoistureHeatMap;
