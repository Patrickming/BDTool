/**
 * 生态系统区块 - 展示集成的工具和平台
 */

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const platforms = [
  'Twitter/X',
  'Telegram',
  'Discord',
  'Medium',
  'YouTube',
  'LinkedIn',
  'Instagram',
  'Facebook',
];

export default function EcosystemSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scroll = () => {
      scrollPosition += 0.5;
      if (scrollContainer.scrollWidth && scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '80px 0',
        background: 'linear-gradient(180deg, rgba(26, 26, 36, 0.5) 0%, rgba(10, 10, 15, 0) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装饰 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), transparent 50%)',
          }}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
              }}
            >
              全平台覆盖
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 18,
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            支持主流社交媒体平台，轻松管理多渠道 KOL 合作
          </motion.p>
        </div>

        {/* 无限滚动轮播 */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 32,
            overflowX: 'hidden',
            paddingBottom: 16,
            marginBottom: 48,
          }}
        >
          {[...platforms, ...platforms, ...platforms].map((platform, index) => (
            <div
              key={index}
              style={{
                flexShrink: 0,
                width: 192,
                height: 128,
                background: 'linear-gradient(135deg, rgba(26, 26, 36, 0.8) 0%, rgba(15, 15, 22, 0.8) 100%)',
                borderRadius: 12,
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                {platform}
              </span>
            </div>
          ))}
        </div>

        {/* 连接可视化 */}
        <div style={{ position: 'relative', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* 向内吸收的漩涡动效 - 多层圆环 */}
          {[0, 1, 2, 3].map((ringIndex) => (
            <div
              key={`ring-${ringIndex}`}
              style={{
                position: 'absolute',
                width: 96 + ringIndex * 40,
                height: 96 + ringIndex * 40,
                borderRadius: '50%',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                animation: `spiral-in ${2 + ringIndex * 0.5}s ease-in-out infinite`,
                animationDelay: `${ringIndex * 0.2}s`,
                opacity: 1 - ringIndex * 0.2,
              }}
            />
          ))}

          {/* 中心 Logo */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse-ring 2s ease-in-out infinite',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.6), inset 0 0 30px rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 旋转光环 */}
              <div
                style={{
                  position: 'absolute',
                  inset: -20,
                  background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
                  animation: 'spin-slow 4s linear infinite',
                  borderRadius: '50%',
                }}
              />

              {/* Logo 图片 */}
              <img
                src="/logo.svg"
                alt="KOL BD Tool"
                style={{
                  width: 64,
                  height: 64,
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 12px rgba(56, 189, 248, 0.6))',
                  animation: 'float-gentle 3s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* 围绕中心的连接点 - 向内运动 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <div
              key={angle}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                background: 'radial-gradient(circle, #3B82F6 0%, #8B5CF6 100%)',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-100px)`,
                animation: `spiral-in-dot 2s ease-in-out infinite`,
                animationDelay: `${angle / 360}s`,
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes spiral-in {
          0% {
            transform: scale(1.5) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: scale(0.8) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes spiral-in-dot {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-100px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(-20px) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
