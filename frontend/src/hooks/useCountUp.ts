/**
 * 数字滚动计数动画 Hook
 */

import { useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number; // 动画持续时间（毫秒）
  start?: number;
  decimals?: number;
}

export const useCountUp = ({ end, duration = 2000, start = 0, decimals = 0 }: UseCountUpOptions) => {
  const [count, setCount] = useState(start);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // 使用 easeOutQuart 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentCount = start + (end - start) * easeProgress;

      setCount(Number(currentCount.toFixed(decimals)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, duration, start, decimals]);

  return { count, ref };
};
