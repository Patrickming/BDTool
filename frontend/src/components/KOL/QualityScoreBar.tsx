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
  // 根据分数确定颜色 - 匹配数据统计页面的4种颜色和后端区间
  const getColor = (score: number): string => {
    if (score >= 85) return '#14F195'; // 高质量 (绿色)
    if (score >= 75) return '#9945FF'; // 良好 (紫色)
    if (score >= 65) return '#FFA500'; // 一般 (橙色)
    return '#FF4D4F'; // 较差 (红色)
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
