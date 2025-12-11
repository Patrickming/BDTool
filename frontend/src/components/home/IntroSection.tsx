/**
 * 介绍区块 - 产品价值主张
 */

import { useRef } from 'react';
import { Button } from 'antd';
import { motion, useInView } from 'framer-motion';
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const benefits = [
  '自动化 KOL 数据收集和评分',
  '多语言模板和智能翻译',
  '实时数据分析和洞察',
  '团队协作和权限管理',
];

export default function IntroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '120px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景网格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3,
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* 左侧内容 */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2
                style={{
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: 24,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #3B82F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                KOL BD 管理
                <br />
                更智能 更高效
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              一站式解决 KOL 发现、联系、跟进和数据分析的所有需求。
              让 BD 工作变得简单、高效、可追踪。
            </motion.p>

            {/* 特性列表 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ marginBottom: 40 }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: 20,
                      color: '#14F195',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 16,
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {benefit}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* 行动按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/kols')}
                style={{
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  border: 'none',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                }}
              >
                开始使用 <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/analytics')}
                style={{
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#6366F1',
                  borderRadius: 8,
                }}
              >
                查看数据分析
              </Button>
            </motion.div>
          </div>

          {/* 右侧可视化 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 主卡片 */}
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                height: 500,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 24,
                padding: 32,
                boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 装饰性圆圈 */}
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                  animation: 'float-gentle 6s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                  animation: 'float-gentle 8s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              />

              {/* 内容区域 - KOL 管理流程演示 */}
              <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* 标题 */}
                <div style={{ marginBottom: 24, textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: 8,
                    }}
                  >
                    智能工作流
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    一站式 KOL BD 管理
                  </div>
                </div>

                {/* 流程步骤 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
                  {/* 步骤 1: 发现 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: 12,
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      🔍
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
                        发现 KOL
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                        浏览器插件快速收集
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: '#14F195',
                        animation: 'pulse-gentle 2s ease-in-out infinite',
                      }}
                    >
                      ✓
                    </div>
                  </motion.div>

                  {/* 步骤 2: 评分 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: 12,
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      ⭐
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
                        AI 评分
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                        智能质量分析
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: '#14F195',
                        animation: 'pulse-gentle 2s ease-in-out infinite',
                        animationDelay: '0.3s',
                      }}
                    >
                      ✓
                    </div>
                  </motion.div>

                  {/* 步骤 3: 联系 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: 12,
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      💬
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
                        多语言联系
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                        模板 + AI 翻译
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: '#14F195',
                        animation: 'pulse-gentle 2s ease-in-out infinite',
                        animationDelay: '0.6s',
                      }}
                    >
                      ✓
                    </div>
                  </motion.div>

                  {/* 步骤 4: 分析 */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 16,
                      background: 'rgba(20, 241, 149, 0.1)',
                      borderRadius: 12,
                      border: '1px solid rgba(20, 241, 149, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #14F195 0%, #00D4AA 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      📊
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 2 }}>
                        数据分析
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
                        实时效果追踪
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        color: '#14F195',
                        animation: 'pulse-gentle 2s ease-in-out infinite',
                        animationDelay: '0.9s',
                      }}
                    >
                      ✓
                    </div>
                  </motion.div>
                </div>

                {/* 底部统计 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  style={{
                    marginTop: 24,
                    padding: 16,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#6366F1',
                          marginBottom: 4,
                        }}
                      >
                        10x
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
                        效率提升
                      </div>
                    </div>
                    <div
                      style={{
                        width: 1,
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#8B5CF6',
                          marginBottom: 4,
                        }}
                      >
                        80%
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
                        时间节省
                      </div>
                    </div>
                    <div
                      style={{
                        width: 1,
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: '#14F195',
                          marginBottom: 4,
                        }}
                      >
                        50+
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
                        响应率 %
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }

        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        @keyframes pulse-bar {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
