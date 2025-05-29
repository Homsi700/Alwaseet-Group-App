import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number | string;
  className?: string;
  showLegend?: boolean;
  innerRadius?: number | string;
  outerRadius?: number | string;
  dataKey?: string;
  nameKey?: string;
  formatValue?: (value: number) => string;
  colors?: string[];
  donut?: boolean;
}

export function PieChart({
  data,
  title,
  height = 400,
  className,
  showLegend = true,
  innerRadius = 0,
  outerRadius = '80%',
  dataKey = 'value',
  nameKey = 'name',
  formatValue,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'],
  donut = false,
}: PieChartProps) {
  // تنسيق القيمة
  const valueFormatter = formatValue || ((value) => `${value}`);

  // تحديد الألوان لكل قطاع
  const getColor = (index: number) => {
    return data[index].color || colors[index % colors.length];
  };

  // تنسيق التسمية
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={donut ? '60%' : innerRadius}
              outerRadius={outerRadius}
              dataKey={dataKey}
              nameKey={nameKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index)} />
              ))}
            </Pie>
            <Tooltip formatter={valueFormatter} />
            {showLegend && <Legend />}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}