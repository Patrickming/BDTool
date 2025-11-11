/**
 * 语言分布图表组件
 */

import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LanguageDistribution } from '../../types/analytics';
import { LanguageConfig, KOLLanguage } from '../../types/kol';

interface LanguageDistributionChartProps {
  data: LanguageDistribution[];
  loading?: boolean;
}


export const LanguageDistributionChart: React.FC<LanguageDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  // 转换数据，添加语言名称和旗帜
  const chartData = data.map(item => {
    const langConfig = LanguageConfig[item.language as KOLLanguage];
    return {
      language: item.language,
      languageLabel: langConfig ? `${langConfig.flag} ${langConfig.label}` : item.language,
      count: item.count,
    };
  });

  return (
    <Card
      title="语言分布"
      loading={loading}
      style={{
        background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.1) 0%, rgba(20, 241, 149, 0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(153, 69, 255, 0.3)',
      }}
      headStyle={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontWeight: 'bold',
      }}
      bodyStyle={{
        padding: '20px',
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="languageLabel"
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
            formatter={(value: number) => [`${value} 个`, '数量']}
          />
          <Legend
            wrapperStyle={{ color: '#8a8a8a' }}
            formatter={() => <span style={{ color: '#8a8a8a' }}>数量</span>}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#14F195"
            strokeWidth={3}
            dot={{ fill: '#14F195', r: 6 }}
            activeDot={{ r: 8 }}
            name="数量"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default LanguageDistributionChart;
