import * as React from 'react';

interface MCTSBarChartProps {
  labels: string[];
  rewards: number[];
  width?: number;
  height?: number;
  yLabel?: string;
}

const MCTSBarChart: React.FC<MCTSBarChartProps> = ({
  labels,
  rewards,
  width = 800,
  height = 280,
  yLabel = 'Reward',
}) => {
  if (labels.length === 0 || rewards.length === 0) return null;

  // Layout
  const padding = { top: 20, right: 20, bottom: 90, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Bar geometry
  const barSpacing = chartWidth / labels.length;
  const barWidth = barSpacing * 0.6;

  // Scales
  const maxReward = Math.max(...rewards, 0);
  const minReward = Math.min(...rewards, 0);
  const range = maxReward - minReward || 1;

  const yScale = (value: number) =>
    padding.top + ((maxReward - value) / range) * chartHeight;

  const zeroY = yScale(0);

  // Y-axis ticks
  const numTicks = 5;
  const tickValues = Array.from({ length: numTicks + 1 }, (_, i) =>
    minReward + (i * range) / numTicks
  );

  return (
    <svg width={width} height={height}>
      {/* Y-axis */}
      <line
        x1={padding.left}
        x2={padding.left}
        y1={padding.top}
        y2={padding.top + chartHeight}
        stroke="#333"
      />

      {/* X-axis */}
      <line
        x1={padding.left}
        x2={padding.left + chartWidth}
        y1={zeroY}
        y2={zeroY}
        stroke="#333"
      />

      {/* Y-axis label */}
      <text
        transform={`translate(20, ${padding.top + chartHeight / 2}) rotate(-90)`}
        textAnchor="middle"
        fontSize="12"
        fill="#333"
      >
        {yLabel}
      </text>

      {/* Y-axis ticks & numbers */}
      {tickValues.map((val, i) => {
        const y = yScale(val);
        return (
          <g key={i}>
            <line
              x1={padding.left - 5}
              x2={padding.left}
              y1={y}
              y2={y}
              stroke="#333"
            />
            <text
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#333"
            >
              {val.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Bars, values, and x labels */}
      {rewards.map((reward, i) => {
        const barHeight = Math.abs(yScale(reward) - zeroY);
        const x =
          padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
        const y = reward >= 0 ? yScale(reward) : zeroY;

        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={reward >= 0 ? '#4caf50' : '#f44336'}
            />

            {/* Value label */}
            <text
              x={x + barWidth / 2}
              y={reward >= 0 ? y - 6 : y + barHeight + 14}
              textAnchor="middle"
              fontSize="11"
              fill="#333"
            >
              {reward.toFixed(2)}
            </text>

            {/* X-axis label */}
            <text
              transform={`translate(${x + barWidth / 2}, ${
                padding.top + chartHeight + 12
              }) rotate(-35)`}
              textAnchor="end"
              fontSize="10"
              fill="#333"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default MCTSBarChart;

