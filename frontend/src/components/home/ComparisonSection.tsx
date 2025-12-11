/**
 * 对比区块 - 展示产品优势
 */

import { useEffect, useRef, useState } from 'react';
import { Card } from 'antd';
import { motion, useInView } from 'framer-motion';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const comparisonData = [
  {
    category: '传统方式',
    items: [
      { text: '手动记录 Excel', hasFeature: false },
      { text: '信息分散难管理', hasFeature: false },
      { text: '无数据分析', hasFeature: false },
      { text: '效率低易出错', hasFeature: false },
    ],
    color: 'text-red-400',
  },
  {
    category: '其他工具',
    items: [
      { text: '功能单一', hasFeature: false },
      { text: '缺少自动化', hasFeature: false },
      { text: '无 AI 辅助', hasFeature: false },
      { text: '价格昂贵', hasFeature: false },
    ],
    color: 'text-yellow-400',
  },
  {
    category: 'KOL BD Tool',
    items: [
      { text: '一站式管理', hasFeature: true },
      { text: 'AI 智能评分', hasFeature: true },
      { text: '多语言翻译', hasFeature: true },
      { text: '实时数据分析', hasFeature: true },
    ],
    color: 'text-[#6366F1]',
    highlight: true,
  },
];

export default function ComparisonSection() {
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: number[] }>({});
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      comparisonData.forEach((column, columnIndex) => {
        column.items.forEach((_, itemIndex) => {
          setTimeout(
            () => {
              setVisibleItems((prev) => ({
                ...prev,
                [columnIndex]: [...(prev[columnIndex] || []), itemIndex],
              }));
            },
            columnIndex * 400 + itemIndex * 150
          );
        });
      });
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(26, 26, 36, 0.5) 100%)',
        position: 'relative',
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
              fontSize: 48,
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 16,
            }}
          >
            未来的 BD 管理方式
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.6)',
              maxWidth: 700,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            看看 KOL BD Tool 如何在竞争中脱颖而出
          </motion.p>
        </div>

        {/* 对比卡片 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          {comparisonData.map((column, columnIndex) => {
            const isHighlight = column.highlight;

            return (
              <motion.div
                key={columnIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: columnIndex * 0.2 }}
                style={{
                  position: 'relative',
                  transform: isHighlight ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <Card
                  style={{
                    background: isHighlight
                      ? 'linear-gradient(135deg, rgba(26, 26, 36, 0.9) 0%, rgba(15, 15, 22, 0.9) 100%)'
                      : 'rgba(26, 26, 36, 0.5)',
                    backdropFilter: 'blur(20px)',
                    border: isHighlight
                      ? '2px solid rgba(99, 102, 241, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    padding: 24,
                    transition: 'all 0.3s ease',
                    boxShadow: isHighlight
                      ? '0 20px 60px rgba(99, 102, 241, 0.3)'
                      : '0 4px 16px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  {/* 最佳选择标签 */}
                  {isHighlight && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        color: 'white',
                        padding: '6px 20px',
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.5)',
                        zIndex: 1,
                      }}
                    >
                      ⭐ 最佳选择
                    </div>
                  )}

                  <div style={{ paddingTop: isHighlight ? 16 : 0 }}>
                    {/* 分类标题 */}
                    <h3
                      style={{
                        fontSize: 24,
                        fontWeight: 700,
                        textAlign: 'center',
                        marginBottom: 32,
                        background: isHighlight
                          ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                          : 'transparent',
                        WebkitBackgroundClip: isHighlight ? 'text' : 'unset',
                        WebkitTextFillColor: isHighlight ? 'transparent' : '#ffffff',
                      }}
                    >
                      {column.category}
                    </h3>

                    {/* 特性列表 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {column.items.map((item, itemIndex) => {
                        const isVisible = visibleItems[columnIndex]?.includes(itemIndex);
                        const hasFeature = item.hasFeature;

                        return (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isVisible ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.4 }}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                            }}
                          >
                            {/* 图标 */}
                            <div
                              style={{
                                flexShrink: 0,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: hasFeature
                                  ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                                  : 'rgba(255, 77, 79, 0.2)',
                                animation: hasFeature && isVisible ? 'bounce-in 0.6s ease' : 'none',
                              }}
                            >
                              {hasFeature ? (
                                <CheckCircleOutlined
                                  style={{
                                    fontSize: 14,
                                    color: 'white',
                                  }}
                                />
                              ) : (
                                <CloseCircleOutlined
                                  style={{
                                    fontSize: 14,
                                    color: '#FF4D4F',
                                  }}
                                />
                              )}
                            </div>

                            {/* 文本 */}
                            <span
                              style={{
                                fontSize: 15,
                                color: hasFeature ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                                lineHeight: 1.6,
                                fontWeight: hasFeature ? 600 : 400,
                              }}
                            >
                              {item.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 高光效果 */}
                  {isHighlight && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        pointerEvents: 'none',
                        animation: 'pulse-gentle 3s ease-in-out infinite',
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
