/**
 * 质量分分布饼图
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { Pie } from '@ant-design/charts';
import type { QualityScoreDistribution } from '../../types/analytics';

interface QualityScoreChartProps {
  data: QualityScoreDistribution[];
  loading?: boolean;
}

export const QualityScoreChart: React.FC<QualityScoreChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    angleField: 'count',
    colorField: 'level',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer' as const,
      content: '{name} {percentage}',
      style: {
        fill: '#fff',
        fontSize: 12,
      },
    },
    legend: {
      itemName: {
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    color: ['#14F195', '#9945FF', '#FFA500', '#FF4D4F'],
    theme: {
      styleSheet: {
        backgroundColor: 'transparent',
      },
    },
    statistic: {
      title: {
        style: {
          color: '#8a8a8a',
          fontSize: '14px',
        },
        content: '总计',
      },
      content: {
        style: {
          color: '#fff',
          fontSize: '24px',
          fontWeight: 600,
        },
      },
    },
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
        <div style={{ height: '300px' }}>
          <Pie {...config} />
        </div>
      </Spin>
    </Card>
  );
};
