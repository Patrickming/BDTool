/**
 * 内容分类分布柱状图 - 使用 Recharts
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ContentCategoryDistribution } from '../../types/analytics';

interface ContentCategoryChartProps {
  data: ContentCategoryDistribution[];
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  'contract_trading': '#14F195',
  'crypto_trading': '#9945FF',
  'web3': '#00D4FF',
  'unknown': '#8a8a8a',
};

const CATEGORY_NAMES: Record<string, string> = {
  'contract_trading': '合约交易',
  'crypto_trading': '加密货币',
  'web3': 'Web3',
  'unknown': '未知',
};

export const ContentCategoryChart: React.FC<ContentCategoryChartProps> = ({
  data,
  loading = false,
}) => {
  // 添加中文名称
  const chartData = data.map(item => ({
    ...item,
    name: CATEGORY_NAMES[item.category] || item.category,
  }));

  return (
    <Card
      title="内容分类分布"
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
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
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
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: 'rgba(153, 69, 255, 0.1)' }}
                formatter={(value: number, name: string) => [`${value} 个`, name]}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || '#8a8a8a'}
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
