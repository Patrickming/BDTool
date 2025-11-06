/**
 * Solana 风格 3D 网格背景
 * 使用 GSAP 和 Canvas 实现高性能动画
 */

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const SolanaBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 Canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 网格参数
    const gridSize = 40;
    const cols = Math.ceil(canvas.width / gridSize) + 1;
    const rows = Math.ceil(canvas.height / gridSize) + 1;

    // 创建网格点
    const points: { x: number; y: number; baseX: number; baseY: number }[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        points.push({
          x: j * gridSize,
          y: i * gridSize,
          baseX: j * gridSize,
          baseY: i * gridSize,
        });
      }
    }

    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 动画循环
    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.005;

      // 清空画布
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = 'rgba(153, 69, 255, 0.15)';
      ctx.lineWidth = 1;

      // 水平线
      for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        for (let j = 0; j < cols; j++) {
          const point = points[i * cols + j];

          // 波浪效果
          const wave = Math.sin(point.baseX * 0.005 + time) * 10;
          const mouseDistance = Math.hypot(point.baseX - mousePos.current.x, point.baseY - mousePos.current.y);
          const mouseEffect = Math.max(0, 50 - mouseDistance / 5);

          point.x = point.baseX;
          point.y = point.baseY + wave + mouseEffect;

          if (j === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }

      // 垂直线
      ctx.strokeStyle = 'rgba(20, 241, 149, 0.1)';
      for (let j = 0; j < cols; j++) {
        ctx.beginPath();
        for (let i = 0; i < rows; i++) {
          const point = points[i * cols + j];
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }

      // 绘制光点
      points.forEach((point) => {
        const mouseDistance = Math.hypot(point.baseX - mousePos.current.x, point.baseY - mousePos.current.y);
        if (mouseDistance < 100) {
          const opacity = (100 - mouseDistance) / 100;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(153, 69, 255, ${opacity})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // 渐变光球动画
    if (gradientRef.current) {
      gsap.to(gradientRef.current, {
        x: '100vw',
        y: '100vh',
        duration: 20,
        ease: 'none',
        repeat: -1,
        yoyo: true,
      });
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* 渐变背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, #0a0a1f 0%, #000000 100%)',
        }}
      />

      {/* Canvas 网格 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* 动态渐变光球 */}
      <div
        ref={gradientRef}
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(153, 69, 255, 0.2) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20, 241, 149, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'particleFloat 15s ease-in-out infinite',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220, 31, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default SolanaBackground;
