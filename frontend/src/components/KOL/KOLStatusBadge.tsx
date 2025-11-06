/**
 * KOL 状态标签组件
 */

import React from 'react';
import { Tag } from 'antd';
import { KOLStatus, KOLStatusConfig } from '../../types/kol';

interface KOLStatusBadgeProps {
  status: KOLStatus;
}

const KOLStatusBadge: React.FC<KOLStatusBadgeProps> = ({ status }) => {
  const config = KOLStatusConfig[status];

  if (!config) {
    return <Tag>未知状态</Tag>;
  }

  return <Tag color={config.color}>{config.label}</Tag>;
};

export default KOLStatusBadge;
