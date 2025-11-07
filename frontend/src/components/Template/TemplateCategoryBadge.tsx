/**
 * 模板分类标签组件
 */

import React from 'react';
import { Tag } from 'antd';
import { TEMPLATE_CATEGORY_CONFIG, type TemplateCategory } from '@/types/template';

interface TemplateCategoryBadgeProps {
  category: TemplateCategory;
  showIcon?: boolean;
}

export const TemplateCategoryBadge: React.FC<TemplateCategoryBadgeProps> = ({
  category,
  showIcon = true,
}) => {
  const config = TEMPLATE_CATEGORY_CONFIG[category];

  return (
    <Tag color={config.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
      {showIcon && <span style={{ marginRight: '4px' }}>{config.icon}</span>}
      {config.label}
    </Tag>
  );
};
