/**
 * 状态分布环形图
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { Pie } from '@ant-design/charts';
import type { StatusDistribution } from '../../types/analytics';

interface StatusDistributionChartProps {
  data: StatusDistribution[];
  loading?: boolean;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    angleField: 'count',
    colorField: 'status',
    radius: 0.9,
    innerRadius: 0.65,
    label: {
      type: 'spider' as const,
      content: '{name}\n{percentage}',
      style: {
        fill: '#fff',
        fontSize: 12,
      },
    },
    legend: {
      layout: 'horizontal' as const,
      position: 'bottom' as const,
      itemName: {
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    color: ({ status }: { status: string }) => {
      const colorMap: Record<string, string> = {
        'new': '#8a8a8a',
        'contacted': '#1890ff',
        'replied': '#52c41a',
        'negotiating': '#faad14',
        'cooperating': '#14F195',
        'rejected': '#ff4d4f',
        'not_interested': '#d9d9d9',
      };
      return colorMap[status] || '#8a8a8a';
    },
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
        content: 'KOL 总数',
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
        <div style={{ height: '300px' }}>
          <Pie {...config} />
        </div>
      </Spin>
    </Card>
  );
};
