/**
 * 功能特性区块 - 参考 sui-messenger-landing-page 设计
 */

import { useEffect, useRef, useState } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'framer-motion';
import {
  ThunderboltOutlined,
  GlobalOutlined,
  SafetyOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const features = [
  {
    icon: ThunderboltOutlined,
    title: '智能管理',
    description: 'AI 辅助的 KOL 管理系统，自动评分和智能推荐，提升工作效率',
    color: 'from-[#6366F1] to-[#8B5CF6]',
  },
  {
    icon: GlobalOutlined,
    title: '多语言支持',
    description: '内置翻译和多语言模板系统，轻松管理全球 KOL 合作',
    color: 'from-[#8B5CF6] to-[#A855F7]',
  },
  {
    icon: SafetyOutlined,
    title: '数据安全',
    description: '企业级数据加密和权限管理，保障您的商业信息安全',
    color: 'from-[#06B6D4] to-[#3B82F6]',
  },
  {
    icon: RocketOutlined,
    title: '高效协作',
    description: '实时同步和团队协作功能，让 BD 工作更加高效',
    color: 'from-[#3B82F6] to-[#6366F1]',
  },
];

export default function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      features.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => [...prev, index]);
        }, index * 200);
      });
    }
  }, [isInView]);

  return (
    <section ref={sectionRef} style={{ padding: '80px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 48,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #3B82F6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 16,
            }}
          >
            强大功能
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            一站式 KOL BD 管理平台，让合作更简单高效
          </motion.p>
        </div>

        {/* 功能卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = visibleCards.includes(index);
            const isHovered = hoveredCard === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: 'relative',
                }}
              >
                <Card
                  style={{
                    background: 'rgba(26, 26, 36, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${isHovered ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.2)'}`,
                    borderRadius: 16,
                    padding: 24,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isHovered
                      ? '0 20px 40px rgba(99, 102, 241, 0.3)'
                      : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 图标容器 */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${feature.color.split(' ')[1]} 0%, ${feature.color.split(' ')[3]} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 24,
                      transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <Icon style={{ fontSize: 32, color: 'white' }} />
                  </div>

                  {/* 文字内容 */}
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: isHovered ? '#6366F1' : '#ffffff',
                      marginBottom: 12,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {feature.description}
                  </p>

                  {/* 悬停发光效果 */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${feature.color.split(' ')[1]} 0%, ${feature.color.split(' ')[3]} 100%)`,
                        opacity: 0.1,
                        pointerEvents: 'none',
                        filter: 'blur(20px)',
                      }}
                    />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
