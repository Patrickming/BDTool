/**
 * 模板效果表格组件
 */

import React from 'react';
import { Card, Table, Progress, Tag, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TemplateEffectiveness } from '../../types/analytics';

interface TemplateEffectivenessTableProps {
  data: TemplateEffectiveness[];
  loading?: boolean;
}

export const TemplateEffectivenessTable: React.FC<TemplateEffectivenessTableProps> = ({
  data,
  loading = false,
}) => {
  const categoryColorMap: Record<string, string> = {
    'initial': 'blue',
    'followup': 'green',
    'negotiation': 'orange',
    'collaboration': 'purple',
    'maintenance': 'cyan',
  };

  const categoryNameMap: Record<string, string> = {
    'initial': '初次联系',
    'followup': '跟进联系',
    'negotiation': '价格谈判',
    'collaboration': '合作细节',
    'maintenance': '关系维护',
  };

  const columns: ColumnsType<TemplateEffectiveness> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <span style={{ color: '#fff', fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color={categoryColorMap[category] || 'default'}>
          {categoryNameMap[category] || category}
        </Tag>
      ),
    },
    {
      title: '使用次数',
      dataIndex: 'useCount',
      key: 'useCount',
      width: 100,
      sorter: (a, b) => a.useCount - b.useCount,
      render: (count: number) => (
        <span style={{ color: '#fff' }}>{count}</span>
      ),
    },
    {
      title: '响应次数',
      dataIndex: 'responseCount',
      key: 'responseCount',
      width: 100,
      sorter: (a, b) => a.responseCount - b.responseCount,
      render: (count: number) => (
        <span style={{ color: '#14F195' }}>{count}</span>
      ),
    },
    {
      title: '响应率',
      dataIndex: 'responseRate',
      key: 'responseRate',
      width: 150,
      sorter: (a, b) => a.responseRate - b.responseRate,
      defaultSortOrder: 'descend',
      render: (rate: number) => (
        <Progress
          percent={rate}
          size="small"
          strokeColor={{
            '0%': '#9945FF',
            '100%': '#14F195',
          }}
          format={(percent) => `${percent?.toFixed(1)}%`}
          style={{ width: '120px' }}
        />
      ),
    },
    {
      title: '平均响应时间',
      dataIndex: 'avgResponseTime',
      key: 'avgResponseTime',
      width: 120,
      sorter: (a, b) => (a.avgResponseTime || 0) - (b.avgResponseTime || 0),
      render: (time: number | null) => {
        if (time === null || time === 0) {
          return <span style={{ color: '#8a8a8a' }}>-</span>;
        }
        if (time < 24) {
          return <span style={{ color: '#14F195' }}>{time.toFixed(1)} 小时</span>;
        }
        const days = (time / 24).toFixed(1);
        return <span style={{ color: '#fff' }}>{days} 天</span>;
      },
    },
  ];

  return (
    <Card
      title="模板效果统计"
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
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            style: { color: '#8a8a8a' },
          }}
          style={{
            background: 'transparent',
          }}
        />
      </Spin>
    </Card>
  );
};
