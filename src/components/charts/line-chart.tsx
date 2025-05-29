import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineChartProps {
  data: any[];
  xAxisDataKey: string;
  lines: {
    dataKey: string;
    name: string;
    color: string;
    strokeWidth?: number;
    dot?: boolean;
  }[];
  title?: string;
  height?: number | string;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatYAxis?: (value: number) => string;
  formatXAxis?: (value: string) => string;
  areaChart?: boolean;
}

export function LineChart({
  data,
  xAxisDataKey,
  lines,
  title,
  height = 400,
  className,
  showGrid = true,
  showLegend = true,
  formatYAxis,
  formatXAxis,
  areaChart = false,
}: LineChartProps) {
  // تنسيق المحور Y
  const yAxisFormatter = formatYAxis || ((value) => `${value}`);
  
  // تنسيق المحور X
  const xAxisFormatter = formatXAxis || ((value) => value);

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisDataKey} tickFormatter={xAxisFormatter} />
            <YAxis tickFormatter={yAxisFormatter} />
            <Tooltip />
            {showLegend && <Legend />}
            
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot !== false}
                activeDot={{ r: 8 }}
                {...(areaChart ? { fill: `${line.color}20` } : {})}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}