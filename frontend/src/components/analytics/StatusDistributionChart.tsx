/**
 * 状态分布环形图 - 使用 Recharts
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { StatusDistribution } from '../../types/analytics';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'new': '#8a8a8a',
  'contacted': '#1890ff',
  'replied': '#52c41a',
  'negotiating': '#faad14',
  'cooperating': '#14F195',
  'cooperated': '#2f54eb',
  'rejected': '#ff4d4f',
};

const STATUS_NAMES: Record<string, string> = {
  'new': '新增',
  'contacted': '已联系',
  'replied': '已回复',
  'negotiating': '洽谈中',
  'cooperating': '合作中',
  'cooperated': '已合作',
  'rejected': '已拒绝',
};

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  // 过滤掉 count 为 0 的数据并添加中文名称
  const filteredData = data
    .filter(item => item.count > 0)
    .map(item => ({
      ...item,
      name: STATUS_NAMES[item.status] || item.status,
    }));

  // 计算总数
  const total = filteredData.reduce((sum, item) => sum + item.count, 0);

  // 自定义标签渲染
  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.count / total) * 100).toFixed(1);
    return `${entry.name}: ${percent}%`;
  };

  return (
    <Card
      title="状态分布"
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
                    outerRadius={105}
                    innerRadius={65}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#8a8a8a'}
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
                    formatter={(value: number, name: string) => [`${value} 个`, name]}
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
                <div style={{ color: '#8a8a8a', fontSize: '14px' }}>KOL 总数</div>
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
