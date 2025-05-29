import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
  data: any[];
  xAxisDataKey: string;
  bars: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  title?: string;
  height?: number | string;
  className?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  formatYAxis?: (value: number) => string;
  formatXAxis?: (value: string) => string;
}

export function BarChart({
  data,
  xAxisDataKey,
  bars,
  title,
  height = 400,
  className,
  showGrid = true,
  showLegend = true,
  stacked = false,
  horizontal = false,
  formatYAxis,
  formatXAxis,
}: BarChartProps) {
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
          <RechartsBarChart
            data={data}
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            
            {horizontal ? (
              <>
                <XAxis type="number" tickFormatter={yAxisFormatter} />
                <YAxis dataKey={xAxisDataKey} type="category" tickFormatter={xAxisFormatter} />
              </>
            ) : (
              <>
                <XAxis dataKey={xAxisDataKey} tickFormatter={xAxisFormatter} />
                <YAxis tickFormatter={yAxisFormatter} />
              </>
            )}
            
            <Tooltip />
            {showLegend && <Legend />}
            
            {bars.map((bar, index) => (
              <Bar
                key={index}
                dataKey={bar.dataKey}
                name={bar.name}
                fill={bar.color}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}