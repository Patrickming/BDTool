/**
 * 联系时间线图表组件
 */

import React from 'react';
import { Card, Spin } from 'antd';
import { DualAxes } from '@ant-design/charts';
import type { ContactTimelinePoint } from '../../types/analytics';

interface ContactTimelineChartProps {
  data: ContactTimelinePoint[];
  loading?: boolean;
}

export const ContactTimelineChart: React.FC<ContactTimelineChartProps> = ({
  data,
  loading = false,
}) => {
  const config = {
    data: [data, data],
    xField: 'date',
    yField: ['contactsCount', 'responsesCount'],
    geometryOptions: [
      {
        geometry: 'line',
        color: '#9945FF',
        lineStyle: {
          lineWidth: 2,
        },
        point: {
          size: 4,
          shape: 'circle',
          style: {
            fill: '#9945FF',
            stroke: '#fff',
            lineWidth: 2,
          },
        },
      },
      {
        geometry: 'line',
        color: '#14F195',
        lineStyle: {
          lineWidth: 2,
        },
        point: {
          size: 4,
          shape: 'circle',
          style: {
            fill: '#14F195',
            stroke: '#fff',
            lineWidth: 2,
          },
        },
      },
    ],
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: true,
        style: {
          fill: '#8a8a8a',
        },
      },
    },
    yAxis: {
      contactsCount: {
        label: {
          style: {
            fill: '#8a8a8a',
          },
        },
        title: {
          text: '联系数',
          style: {
            fill: '#9945FF',
          },
        },
      },
      responsesCount: {
        label: {
          style: {
            fill: '#8a8a8a',
          },
        },
        title: {
          text: '响应数',
          style: {
            fill: '#14F195',
          },
        },
      },
    },
    legend: {
      itemName: {
        style: {
          fill: '#8a8a8a',
        },
        formatter: (text: string) => {
          const nameMap: Record<string, string> = {
            'contactsCount': '联系数',
            'responsesCount': '响应数',
          };
          return nameMap[text] || text;
        },
      },
    },
    smooth: true,
    theme: {
      styleSheet: {
        backgroundColor: 'transparent',
      },
    },
  };

  return (
    <Card
      title="联系时间线"
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
          <DualAxes {...config} />
        </div>
      </Spin>
    </Card>
  );
};
