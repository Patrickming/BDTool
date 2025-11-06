/**
 * KOL 质量分进度条组件
 */

import React from 'react';
import { Progress } from 'antd';

interface QualityScoreBarProps {
  score: number; // 0-100
  size?: 'small' | 'default';
  showInfo?: boolean;
}

const QualityScoreBar: React.FC<QualityScoreBarProps> = ({
  score,
  size = 'default',
  showInfo = true,
}) => {
  // 根据分数确定颜色
  const getColor = (score: number): string => {
    if (score >= 80) return '#52c41a'; // 绿色 - 优秀
    if (score >= 60) return '#1890ff'; // 蓝色 - 良好
    if (score >= 40) return '#faad14'; // 橙色 - 一般
    return '#ff4d4f'; // 红色 - 较差
  };

  return (
    <Progress
      percent={score}
      strokeColor={getColor(score)}
      size={size}
      showInfo={showInfo}
    />
  );
};

export default QualityScoreBar;
