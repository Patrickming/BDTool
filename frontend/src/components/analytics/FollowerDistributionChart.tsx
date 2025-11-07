/**
 * 粉丝数分布柱状图 - 使用 Recharts
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { FollowerCountDistribution } from '../../types/analytics';

interface FollowerDistributionChartProps {
  data: FollowerCountDistribution[];
  loading?: boolean;
}

export const FollowerDistributionChart: React.FC<FollowerDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Card
      title="粉丝数分布"
      bordered={false}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      headStyle={{
        color: '#fff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Spin spinning={loading}>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9945FF" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#14F195" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="range"
                tick={{ fill: '#8a8a8a', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <YAxis
                tick={{ fill: '#8a8a8a', fontSize: 12 }}
                stroke="rgba(255,255,255,0.2)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 26, 46, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                cursor={{ fill: 'rgba(153, 69, 255, 0.1)' }}
                formatter={(value: number) => [`${value} 个`, '数量']}
              />
              <Bar
                dataKey="count"
                fill="url(#colorBar)"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count > 0 ? 'url(#colorBar)' : 'rgba(138, 138, 138, 0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Spin>
    </Card>
  );
};
