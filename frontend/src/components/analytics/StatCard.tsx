/**
 * 统计卡片组件
 */

import React from 'react';
import { Card, Statistic, Spin, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EyeOutlined } from '@ant-design/icons';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  loading?: boolean;
  suffix?: string;
  prefix?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  valueStyle?: React.CSSProperties;
  description?: string; // 计算说明
  onViewDetails?: () => void; // 查看详情回调
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  loading = false,
  suffix,
  prefix,
  trend,
  trendValue,
  valueStyle,
  description,
  onViewDetails,
}) => {
  return (
    <Card
      bordered={false}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Spin spinning={loading}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {icon && (
            <div
              style={{
                fontSize: '32px',
                color: '#9945FF',
                lineHeight: 1,
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Statistic
                title={
                  <span style={{ color: '#8a8a8a', fontSize: '14px' }}>
                    {title}
                  </span>
                }
                value={value}
                suffix={suffix}
                prefix={prefix}
                valueStyle={{
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: 600,
                  ...valueStyle,
                }}
              />
              {onViewDetails && (
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={onViewDetails}
                  style={{
                    color: '#9945FF',
                    fontSize: '18px',
                    padding: '4px 8px',
                  }}
                />
              )}
            </div>
            {trend && trendValue !== undefined && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: trend === 'up' ? '#52c41a' : '#ff4d4f',
                }}
              >
                {trend === 'up' ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )}
                <span style={{ marginLeft: '4px' }}>
                  {Math.abs(trendValue)}%
                </span>
              </div>
            )}
            {description && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#666',
                  lineHeight: '1.4',
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      </Spin>
    </Card>
  );
};
