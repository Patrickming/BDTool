/**
 * 技术栈区块 - 展示项目使用的技术
 */

import { useState, useRef } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'framer-motion';
import {
  CodeOutlined,
  CloudOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons';

const techCards = [
  {
    icon: CodeOutlined,
    title: 'React + TypeScript',
    description: '现代化前端技术栈',
    details: '使用 React 18 和 TypeScript 构建，确保类型安全和开发效率',
  },
  {
    icon: CloudOutlined,
    title: 'Node.js + Express',
    description: '高性能后端服务',
    details: '基于 Node.js 的 RESTful API，提供稳定可靠的后端支持',
  },
  {
    icon: DatabaseOutlined,
    title: 'PostgreSQL + Prisma',
    description: '企业级数据库',
    details: '采用 PostgreSQL 数据库和 Prisma ORM，保证数据安全和性能',
  },
  {
    icon: ApiOutlined,
    title: 'AI 集成',
    description: '智能化功能支持',
    details: '集成 AI 翻译和内容优化，提供智能化的 BD 工作体验',
  },
];

export default function TechnologySection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '80px 0',
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(26, 26, 36, 0.5) 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* 标题区域 */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 16,
            }}
          >
            先进技术栈
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
            基于最新的技术栈构建，确保系统的稳定性和可扩展性
          </motion.p>
        </div>

        {/* 技术卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {techCards.map((card, index) => {
            const Icon = card.icon;
            const isExpanded = expandedCard === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                  style={{
                    background: 'rgba(26, 26, 36, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: 16,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isExpanded
                      ? '0 12px 32px rgba(59, 130, 246, 0.3)'
                      : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 图标 */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      transform: isExpanded ? 'rotate(12deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <Icon style={{ fontSize: 28, color: 'white' }} />
                  </div>

                  {/* 标题和描述 */}
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: 8,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    {card.description}
                  </p>

                  {/* 展开的详细信息 */}
                  {isExpanded && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 13,
                        color: '#3B82F6',
                        lineHeight: 1.6,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      {card.details}
                    </motion.p>
                  )}

                  {/* 玻璃态效果 */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
