/**
 * 带动画的统计卡片组件
 */

import React from 'react';
import { Card, Statistic } from 'antd';
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedStatisticProps {
  title: React.ReactNode;
  value: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
  loading?: boolean;
  onClick?: () => void;
  background: string;
  border: string;
  boxShadow: string;
  hoverBoxShadow: string;
  delay?: number;
}

export const AnimatedStatistic: React.FC<AnimatedStatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision = 0,
  valueStyle,
  loading,
  onClick,
  background,
  border,
  boxShadow,
  hoverBoxShadow,
  delay = 0,
}) => {
  const { count, ref } = useCountUp({
    end: loading ? 0 : value,
    duration: 2000,
    decimals: precision
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        delay,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3 }
      }}
      style={{ height: '100%' }}
    >
      <Card
        bordered={false}
        onClick={onClick}
        style={{
          background,
          borderRadius: '12px',
          border,
          boxShadow,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
        }}
        bodyStyle={{ padding: 24 }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = hoverBoxShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = boxShadow;
        }}
      >
        <Statistic
          title={title}
          value={count}
          precision={precision}
          prefix={prefix}
          suffix={suffix}
          valueStyle={valueStyle}
          loading={loading}
        />
      </Card>
    </motion.div>
  );
};
