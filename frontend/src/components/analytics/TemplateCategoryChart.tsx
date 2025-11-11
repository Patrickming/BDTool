/**
 * 模板分类统计折线图 - 使用 Recharts
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TemplateEffectiveness } from '../../types/analytics';

interface TemplateCategoryChartProps {
  data: TemplateEffectiveness[];
  loading?: boolean;
}

const CATEGORY_NAMES: Record<string, string> = {
  'initial': '初次联系',
  'followup': '跟进联系',
  'negotiation': '价格谈判',
  'collaboration': '合作细节',
  'maintenance': '关系维护',
  'unknown': '未分类',
};

export const TemplateCategoryChart: React.FC<TemplateCategoryChartProps> = ({
  data,
  loading = false,
}) => {
  // 转换数据格式，添加中文名称
  const chartData = data.map(item => ({
    category: CATEGORY_NAMES[item.category] || item.category,
    count: item.useCount, // useCount 存储的是分类数量
  }));

  return (
    <Card
      title="模板分类统计"
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
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#8a8a8a', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.2)"
                />
                <YAxis
                  tick={{ fill: '#8a8a8a', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.2)"
                  allowDecimals={false}
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
                  formatter={(value: number) => [`${value} 个`, '模板数量']}
                />
                <Legend
                  wrapperStyle={{ color: '#8a8a8a' }}
                  formatter={() => <span style={{ color: '#8a8a8a' }}>模板数量</span>}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9945FF"
                  strokeWidth={3}
                  dot={{ fill: '#9945FF', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="模板数量"
                />
              </LineChart>
            </ResponsiveContainer>
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
