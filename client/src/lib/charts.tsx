import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  name: string | number;
  [key: string]: any;
}

interface LineChartProps {
  data: ChartData[];
  lines: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  width?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
}

export const ResponsiveLineChart: React.FC<LineChartProps> = ({ 
  data, 
  lines, 
  height = 300, 
  width = '100%',
  xAxisLabel,
  yAxisLabel,
  tooltip = true,
  grid = true,
  legend = true
}) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name || line.key}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface BarChartProps {
  data: ChartData[];
  bars: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  width?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
  stacked?: boolean;
}

export const ResponsiveBarChart: React.FC<BarChartProps> = ({ 
  data, 
  bars, 
  height = 300, 
  width = '100%',
  xAxisLabel,
  yAxisLabel,
  tooltip = true,
  grid = true,
  legend = true,
  stacked = false
}) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.key}
              fill={bar.color}
              name={bar.name || bar.key}
              stackId={stacked ? "a" : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AreaChartProps {
  data: ChartData[];
  areas: {
    key: string;
    color: string;
    name?: string;
  }[];
  height?: number;
  width?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  tooltip?: boolean;
  grid?: boolean;
  legend?: boolean;
  stacked?: boolean;
}

export const ResponsiveAreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  areas, 
  height = 300, 
  width = '100%',
  xAxisLabel,
  yAxisLabel,
  tooltip = true,
  grid = true,
  legend = true,
  stacked = true
}) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} />
          <YAxis label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined} />
          {tooltip && <Tooltip />}
          {legend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.key}
              fill={area.color}
              stroke={area.color}
              name={area.name || area.key}
              stackId={stacked ? "1" : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
