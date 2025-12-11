/**
 * 首页 - Solana 风格 + 高级动效
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Spin, message, Avatar } from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  PhoneOutlined,
  BarChartOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { getOverviewStats } from '@/services/analytics.service';
import type { OverviewStats } from '@/types/analytics';
import { AnimatedBackground } from '@/components/home/AnimatedBackground';
import { AnimatedStatistic } from '@/components/home/AnimatedStatistic';
import IntroSection from '@/components/home/IntroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import TechnologySection from '@/components/home/TechnologySection';
import EcosystemSection from '@/components/home/EcosystemSection';
import ComparisonSection from '@/components/home/ComparisonSection';

const { Title, Text } = Typography;

// 获取完整的头像 URL
const getAvatarUrl = (avatar?: string) => {
  if (!avatar) return undefined;
  // 如果已经是完整 URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // 否则拼接后端服务器地址
  return `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}/uploads/avatars/${avatar}`;
};

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, loadUser } = useAuthStore();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // 获取时间问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  // 获取响应率样式
  const getResponseRateStyle = (rate?: number) => {
    if (rate && rate >= 50) {
      return {
        background: 'rgba(16, 185, 129, 0.05)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 4px 24px rgba(16, 185, 129, 0.08)',
        hoverBoxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
        iconColor: '#10B981',
      };
    }
    if (rate && rate < 30) {
      return {
        background: 'rgba(255, 77, 79, 0.05)',
        border: '1px solid rgba(255, 77, 79, 0.3)',
        boxShadow: '0 4px 24px rgba(255, 77, 79, 0.08)',
        hoverBoxShadow: '0 8px 32px rgba(255, 77, 79, 0.2)',
        iconColor: '#FF4D4F',
      };
    }
    return {
      background: 'rgba(20, 241, 149, 0.05)',
      border: '1px solid rgba(20, 241, 149, 0.3)',
      boxShadow: '0 4px 24px rgba(20, 241, 149, 0.08)',
      hoverBoxShadow: '0 8px 32px rgba(20, 241, 149, 0.2)',
      iconColor: '#14F195',
    };
  };

  // 获取待跟进样式
  const getPendingStyle = (count?: number) => {
    if (count && count > 0) {
      return {
        background: 'rgba(255, 165, 0, 0.05)',
        border: '1px solid rgba(255, 165, 0, 0.3)',
        boxShadow: '0 4px 24px rgba(255, 165, 0, 0.08)',
        hoverBoxShadow: '0 8px 32px rgba(255, 165, 0, 0.2)',
        iconColor: '#FFA500',
      };
    }
    return {
      background: 'rgba(153, 69, 255, 0.05)',
      border: '1px solid rgba(153, 69, 255, 0.3)',
      boxShadow: '0 4px 24px rgba(153, 69, 255, 0.08)',
      hoverBoxShadow: '0 8px 32px rgba(153, 69, 255, 0.2)',
      iconColor: '#9945FF',
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!user) {
      loadUser().catch(() => {
        navigate('/login');
      });
    }
  }, [user, navigate, loadUser]);

  // 加载统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const data = await getOverviewStats();
        setStats(data);
      } catch (error) {
        console.error('加载统计数据失败:', error);
        message.error('加载统计数据失败');
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // 滚动视差效果
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 动态背景 */}
      <AnimatedBackground />

      {/* 内容容器 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* 欢迎横幅 */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{
          opacity,
          scale,
          background: 'linear-gradient(135deg, rgba(153, 69, 255, 0.08) 0%, rgba(20, 241, 149, 0.04) 100%)',
          borderRadius: '16px',
          padding: '48px',
          marginBottom: 40,
          border: '1px solid rgba(153, 69, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(153, 69, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar
            size={64}
            src={getAvatarUrl(user.avatar)}
            icon={!user.avatar && <UserOutlined />}
            style={{
              background: user.avatar
                ? '#fff'
                : 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              boxShadow: '0 4px 16px rgba(153, 69, 255, 0.3)',
              fontSize: 32,
              borderRadius: '12px',
            }}
          >
            {!user.avatar && user.fullName?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <h1 style={{ margin: 0, marginBottom: 8, color: '#ffffff', fontSize: 32, fontWeight: 600 }}>
              {getGreeting()}，{user.fullName} 👋
            </h1>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16, display: 'block', marginBottom: 4 }}>
              {user.role === 'admin' ? '👑 管理员' : `👤 ${user.company ? user.company.toUpperCase() + ' 团队' : '团队'}成员`} • {user.email}
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>
              📊 让我们一起查看今天的数据吧
            </Text>
          </div>
        </div>
      </motion.div>

      {/* 快速统计 - 第一行 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>KOL 总数</span>}
            value={stats?.totalKols ?? 0}
            prefix={<DatabaseOutlined style={{ color: '#9945FF', fontSize: 20 }} />}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/kols')}
            background="rgba(153, 69, 255, 0.05)"
            border="1px solid rgba(153, 69, 255, 0.3)"
            boxShadow="0 4px 24px rgba(153, 69, 255, 0.08)"
            hoverBoxShadow="0 8px 32px rgba(153, 69, 255, 0.2)"
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>模板数量</span>}
            value={stats?.totalTemplates ?? 0}
            prefix={<FileTextOutlined style={{ color: '#14F195', fontSize: 20 }} />}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/templates')}
            background="rgba(20, 241, 149, 0.05)"
            border="1px solid rgba(20, 241, 149, 0.3)"
            boxShadow="0 4px 24px rgba(20, 241, 149, 0.08)"
            hoverBoxShadow="0 8px 32px rgba(20, 241, 149, 0.2)"
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>联系次数</span>}
            value={stats?.totalContacts ?? 0}
            prefix={<ThunderboltOutlined style={{ color: '#00D4AA', fontSize: 20 }} />}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/analytics')}
            background="rgba(0, 212, 170, 0.05)"
            border="1px solid rgba(0, 212, 170, 0.3)"
            boxShadow="0 4px 24px rgba(0, 212, 170, 0.08)"
            hoverBoxShadow="0 8px 32px rgba(0, 212, 170, 0.2)"
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>活跃合作</span>}
            value={stats?.activePartnerships ?? 0}
            prefix={<StarOutlined style={{ color: '#DC1FFF', fontSize: 20 }} />}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/kols?status=partnered')}
            background="rgba(220, 31, 255, 0.05)"
            border="1px solid rgba(220, 31, 255, 0.3)"
            boxShadow="0 4px 24px rgba(220, 31, 255, 0.08)"
            hoverBoxShadow="0 8px 32px rgba(220, 31, 255, 0.2)"
            delay={0.3}
          />
        </Col>
      </Row>

      {/* 快速统计 - 第二行 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={12} lg={8}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>本周新增 KOL</span>}
            value={stats?.newKolsThisWeek ?? 0}
            prefix={<DatabaseOutlined style={{ color: '#667eea', fontSize: 20 }} />}
            suffix={<span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>个</span>}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/kols')}
            background="rgba(102, 126, 234, 0.05)"
            border="1px solid rgba(102, 126, 234, 0.3)"
            boxShadow="0 4px 24px rgba(102, 126, 234, 0.08)"
            hoverBoxShadow="0 8px 32px rgba(102, 126, 234, 0.2)"
            delay={0.4}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>总体响应率</span>}
            value={stats?.overallResponseRate ?? 0}
            precision={1}
            prefix={<PhoneOutlined style={{ color: getResponseRateStyle(stats?.overallResponseRate).iconColor, fontSize: 20 }} />}
            suffix={<span style={{ fontSize: 14 }}>%</span>}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/analytics')}
            {...getResponseRateStyle(stats?.overallResponseRate)}
            delay={0.5}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <AnimatedStatistic
            title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>待跟进数</span>}
            value={stats?.pendingFollowups ?? 0}
            prefix={<PhoneOutlined style={{ color: getPendingStyle(stats?.pendingFollowups).iconColor, fontSize: 20 }} />}
            suffix={<span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>个</span>}
            valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            loading={loadingStats}
            onClick={() => navigate('/kols?status=replied')}
            {...getPendingStyle(stats?.pendingFollowups)}
            delay={0.6}
          />
        </Col>
      </Row>

      {/* 功能模块 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <RocketOutlined style={{ color: '#9945FF' }} />
          功能模块
        </h2>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
            <div
              onClick={() => navigate('/kols')}
              style={{
                padding: 32,
                background: 'rgba(153, 69, 255, 0.03)',
                border: '1px solid rgba(153, 69, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                boxShadow: '0 4px 16px rgba(153, 69, 255, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(153, 69, 255, 0.08)';
                e.currentTarget.style.border = '1px solid rgba(153, 69, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(153, 69, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(153, 69, 255, 0.03)';
                e.currentTarget.style.border = '1px solid rgba(153, 69, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(153, 69, 255, 0.06)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <DatabaseOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#fff', fontWeight: 600 }}>
                KOL 管理
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, display: 'block', marginBottom: 16 }}>
                管理 KOL 数据库，筛选和评分
              </Text>
              <Text style={{ color: '#9945FF', fontSize: 14, fontWeight: 500 }}>
                立即使用 <ArrowRightOutlined />
              </Text>
            </div>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
            <div
              onClick={() => navigate('/templates')}
              style={{
                padding: 32,
                background: 'rgba(220, 31, 255, 0.03)',
                border: '1px solid rgba(220, 31, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                boxShadow: '0 4px 16px rgba(220, 31, 255, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 31, 255, 0.08)';
                e.currentTarget.style.border = '1px solid rgba(220, 31, 255, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(220, 31, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 31, 255, 0.03)';
                e.currentTarget.style.border = '1px solid rgba(220, 31, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(220, 31, 255, 0.06)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #DC1FFF 0%, #00D4AA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <FileTextOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#fff', fontWeight: 600 }}>
                模板管理
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, display: 'block', marginBottom: 16 }}>
                多语言模板，快速复制
              </Text>
              <Text style={{ color: '#DC1FFF', fontSize: 14, fontWeight: 500 }}>
                立即使用 <ArrowRightOutlined />
              </Text>
            </div>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
            <div
              onClick={() => navigate('/analytics')}
              style={{
                padding: 32,
                background: 'rgba(20, 241, 149, 0.03)',
                border: '1px solid rgba(20, 241, 149, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                boxShadow: '0 4px 16px rgba(20, 241, 149, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(20, 241, 149, 0.08)';
                e.currentTarget.style.border = '1px solid rgba(20, 241, 149, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(20, 241, 149, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(20, 241, 149, 0.03)';
                e.currentTarget.style.border = '1px solid rgba(20, 241, 149, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(20, 241, 149, 0.06)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #14F195 0%, #00D4AA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <BarChartOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#fff', fontWeight: 600 }}>
                数据分析
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, display: 'block', marginBottom: 16 }}>
                可视化图表，深度洞察
              </Text>
              <Text style={{ color: '#14F195', fontSize: 14, fontWeight: 500 }}>
                立即使用 <ArrowRightOutlined />
              </Text>
            </div>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
            >
            <div
              onClick={() => navigate('/extension')}
              style={{
                padding: 32,
                background: 'rgba(255, 140, 0, 0.03)',
                border: '1px solid rgba(255, 140, 0, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
                boxShadow: '0 4px 16px rgba(255, 140, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 140, 0, 0.08)';
                e.currentTarget.style.border = '1px solid rgba(255, 140, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 140, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 140, 0, 0.03)';
                e.currentTarget.style.border = '1px solid rgba(255, 140, 0, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 140, 0, 0.06)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <RocketOutlined style={{ fontSize: 24, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#fff', fontWeight: 600 }}>
                插件内容
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, display: 'block', marginBottom: 16 }}>
                浏览器插件，快速捕获 KOL
              </Text>
              <Text style={{ color: '#FF8C00', fontSize: 14, fontWeight: 500 }}>
                立即使用 <ArrowRightOutlined />
              </Text>
            </div>
            </motion.div>
          </Col>
        </Row>
      </motion.div>

      {/* 新增区块 - 介绍 */}
      <IntroSection />

      {/* 新增区块 - 功能特性 */}
      <FeaturesSection />

      {/* 新增区块 - 生态系统 */}
      <EcosystemSection />

      {/* 新增区块 - 技术栈 */}
      <TechnologySection />

      {/* 新增区块 - 产品对比 */}
      <ComparisonSection />
      </div>
    </div>
  );
}
