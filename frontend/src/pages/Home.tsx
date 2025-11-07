/**
 * 首页 - Solana 风格
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Spin, Statistic } from 'antd';
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
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, loadUser } = useAuthStore();

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

  return (
    <div>
      {/* 欢迎横幅 */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '48px',
          marginBottom: 40,
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: '#ffffff', fontSize: 32, fontWeight: 600 }}>
              欢迎回来，{user.fullName}
            </h1>
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }}>
              {user.role === 'admin' ? '管理员' : '团队成员'} • {user.email}
            </Text>
          </div>
        </div>
      </div>

      {/* 快速统计 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(153, 69, 255, 0.2)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>KOL 总数</span>}
              value={0}
              prefix={<DatabaseOutlined style={{ color: '#9945FF', fontSize: 20 }} />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(20, 241, 149, 0.2)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>模板数量</span>}
              value={0}
              prefix={<FileTextOutlined style={{ color: '#14F195', fontSize: 20 }} />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 212, 170, 0.2)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>联系次数</span>}
              value={0}
              prefix={<ThunderboltOutlined style={{ color: '#00D4AA', fontSize: 20 }} />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '12px',
              border: '1px solid rgba(220, 31, 255, 0.2)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>活跃合作</span>}
              value={0}
              prefix={<StarOutlined style={{ color: '#DC1FFF', fontSize: 20 }} />}
              valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能模块 */}
      <div>
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
            <div
              onClick={() => navigate('/kols')}
              style={{
                padding: 32,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.border = '1px solid rgba(153, 69, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
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
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div
              onClick={() => navigate('/templates')}
              style={{
                padding: 32,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.border = '1px solid rgba(220, 31, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
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
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div
              onClick={() => navigate('/analytics')}
              style={{
                padding: 32,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.border = '1px solid rgba(20, 241, 149, 0.3)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
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
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <div
              style={{
                padding: 32,
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                cursor: 'not-allowed',
                opacity: 0.5,
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  background: 'rgba(138, 138, 138, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <PhoneOutlined style={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.4)' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 20, color: '#fff', fontWeight: 600 }}>
                联系记录
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14, display: 'block', marginBottom: 16 }}>
                历史记录，统计分析
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 14 }}>即将推出</Text>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
