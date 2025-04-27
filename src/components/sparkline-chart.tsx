'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  strokeColor?: string;
  height?: number;
  width?: number | string;
  className?: string;
}

export function SparklineChart({
  data = [],
  strokeColor = 'hsl(var(--foreground))', // Default to foreground color
  height = 40,
  width = '100%',
  className,
}: SparklineChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ height: `${height}px`, width }} className={cn("flex items-center justify-center text-xs text-muted-foreground", className)}>No data</div>;
  }

  const chartData = data.map((value, index) => ({ name: index, value }));
  const isPositive = data[data.length - 1] >= data[0];
  const defaultColor = isPositive ? 'hsl(var(--chart-1))' : 'hsl(var(--destructive))'; // Use theme colors

  return (
    <div style={{ height: `${height}px`, width }} className={cn(className)}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              fontSize: '12px',
              padding: '4px 8px',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={() => ''} // Hide label
            cursor={false} // Hide cursor line
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor === 'hsl(var(--foreground))' ? defaultColor : strokeColor}
            strokeWidth={1.5}
            dot={false} // Hide dots on the line
            isAnimationActive={false} // Disable animation for performance
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
