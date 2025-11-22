/**
 * KOL 状态变更时间线图表组件
 * 使用 Recharts 渐变面积图展示
 */

import React, { useMemo } from 'react';
import { Card, Spin, Row, Col, Statistic } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  UserAddOutlined,
  SwapOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ContactTimelinePoint } from '../../types/analytics';

interface ContactTimelineChartProps {
  data: ContactTimelinePoint[];
  loading?: boolean;
}

// 自定义 Tooltip 组件
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid rgba(153, 69, 255, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 8px 32px rgba(153, 69, 255, 0.2)',
        }}
      >
        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: entry.color,
                marginRight: '8px',
              }}
            />
            <span style={{ color: '#8a8a8a', marginRight: '8px' }}>{entry.name}:</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 自定义 Legend 组件
const CustomLegend = ({ payload }: any) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
      {payload?.map((entry: any, index: number) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '16px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: entry.color,
              marginRight: '8px',
            }}
          />
          <span style={{ color: '#8a8a8a', fontSize: '12px' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ContactTimelineChart: React.FC<ContactTimelineChartProps> = ({
  data,
  loading = false,
}) => {
  // 格式化日期显示
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // 将 YYYY-MM-DD 格式化为 MM/DD
      displayDate: item.date.slice(5).replace('-', '/'),
    }));
  }, [data]);

  // 计算汇总统计
  const summaryStats = useMemo(() => {
    return {
      totalNewKols: data.reduce((sum, item) => sum + item.newKols, 0),
      totalStatusChanges: data.reduce((sum, item) => sum + item.statusChanges, 0),
      totalResponses: data.reduce((sum, item) => sum + item.responses, 0),
    };
  }, [data]);

  // 检查是否有数据
  const hasData = summaryStats.totalNewKols > 0 || summaryStats.totalStatusChanges > 0 || summaryStats.totalResponses > 0;

  return (
    <Card
      title="KOL 状态变更时间线"
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
        {/* 汇总统计 */}
        <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={8}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.15) 0%, rgba(153, 69, 255, 0.05) 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(153, 69, 255, 0.2)',
              }}
            >
              <Statistic
                title={<span style={{ color: '#8a8a8a', fontSize: '12px' }}>新增 KOL</span>}
                value={summaryStats.totalNewKols}
                prefix={<UserAddOutlined style={{ color: '#9945FF', marginRight: '8px' }} />}
                valueStyle={{ color: '#9945FF', fontSize: '28px', fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={8}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
            >
              <Statistic
                title={<span style={{ color: '#8a8a8a', fontSize: '12px' }}>状态变更</span>}
                value={summaryStats.totalStatusChanges}
                prefix={<SwapOutlined style={{ color: '#00D4FF', marginRight: '8px' }} />}
                valueStyle={{ color: '#00D4FF', fontSize: '28px', fontWeight: 600 }}
              />
            </div>
          </Col>
          <Col xs={8}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(20, 241, 149, 0.15) 0%, rgba(20, 241, 149, 0.05) 100%)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(20, 241, 149, 0.2)',
              }}
            >
              <Statistic
                title={<span style={{ color: '#8a8a8a', fontSize: '12px' }}>获得响应</span>}
                value={summaryStats.totalResponses}
                prefix={<CheckCircleOutlined style={{ color: '#14F195', marginRight: '8px' }} />}
                valueStyle={{ color: '#14F195', fontSize: '28px', fontWeight: 600 }}
              />
            </div>
          </Col>
        </Row>

        {/* 图表区域 */}
        <div style={{ height: '280px' }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  {/* 新增 KOL 渐变 - 紫色 */}
                  <linearGradient id="gradientNewKols" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9945FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#9945FF" stopOpacity={0} />
                  </linearGradient>
                  {/* 状态变更渐变 - 青色 */}
                  <linearGradient id="gradientStatusChanges" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                  {/* 响应数渐变 - 绿色 */}
                  <linearGradient id="gradientResponses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14F195" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#8a8a8a', fontSize: 11 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                />
                <YAxis
                  tick={{ fill: '#8a8a8a', fontSize: 11 }}
                  stroke="rgba(255, 255, 255, 0.1)"
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Area
                  type="monotone"
                  dataKey="newKols"
                  name="新增 KOL"
                  stroke="#9945FF"
                  strokeWidth={2}
                  fill="url(#gradientNewKols)"
                  dot={{ fill: '#9945FF', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, stroke: '#9945FF', strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="statusChanges"
                  name="状态变更"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  fill="url(#gradientStatusChanges)"
                  dot={{ fill: '#00D4FF', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, stroke: '#00D4FF', strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  name="获得响应"
                  stroke="#14F195"
                  strokeWidth={2}
                  fill="url(#gradientResponses)"
                  dot={{ fill: '#14F195', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, stroke: '#14F195', strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8a8a8a',
              }}
            >
              <SwapOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ margin: 0 }}>暂无状态变更数据</p>
              <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.6 }}>
                当 KOL 状态发生变化时，数据将显示在这里
              </p>
            </div>
          )}
        </div>
      </Spin>
    </Card>
  );
};
