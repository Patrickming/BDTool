/**
 * 内容分类分布柱状图
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { Column } from '@ant-design/charts';
import type { ContentCategoryDistribution } from '../../types/analytics';

interface ContentCategoryChartProps {
  data: ContentCategoryDistribution[];
  loading?: boolean;
}

export const ContentCategoryChart: React.FC<ContentCategoryChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data,
    xField: 'category',
    yField: 'count',
    seriesField: 'category',
    label: {
      position: 'top' as const,
      style: {
        fill: '#fff',
        opacity: 0.8,
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    color: ({ category }: { category: string }) => {
      const colorMap: Record<string, string> = {
        'contract_trading': '#14F195',
        'crypto_trading': '#9945FF',
        'web3': '#00D4FF',
        'unknown': '#8a8a8a',
      };
      return colorMap[category] || '#8a8a8a';
    },
    legend: {
      itemName: {
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    theme: {
      styleSheet: {
        backgroundColor: 'transparent',
      },
    },
  };

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
        <div style={{ height: '300px' }}>
          <Column {...config} />
        </div>
      </Spin>
    </Card>
  );
};
