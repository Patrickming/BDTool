/**
 * 质量分分布饼图 - 使用 Recharts
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { QualityScoreDistribution } from '../../types/analytics';

interface QualityScoreChartProps {
  data: QualityScoreDistribution[];
  loading?: boolean;
}

const COLORS = {
  '高质量': '#14F195',
  '良好': '#9945FF',
  '一般': '#FFA500',
  '较差': '#FF4D4F',
};

export const QualityScoreChart: React.FC<QualityScoreChartProps> = ({
  data,
  loading = false,
}) => {
  // 过滤掉 count 为 0 的数据
  const filteredData = data.filter(item => item.count > 0);

  // 计算总数
  const total = filteredData.reduce((sum, item) => sum + item.count, 0);

  // 自定义标签渲染
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.count / total) * 100).toFixed(1);
    return `${entry.level}: ${percent}%`;
  };

  return (
    <Card
      title="质量分分布"
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
        <div style={{ height: '300px', position: 'relative' }}>
          {filteredData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="level"
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.level as keyof typeof COLORS] || '#8a8a8a'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value} 个`, '数量']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span style={{ color: '#8a8a8a' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ color: '#8a8a8a', fontSize: '14px' }}>总计</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>{total}</div>
              </div>
            </>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8a8a8a'
            }}>
              暂无数据
            </div>
          )}
        </div>
      </Spin>
    </Card>
  );
};
