/**
 * 首页 - Web3 简约高级风格
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
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    // 检查是否有 token
    const token = localStorage.getItem('auth_token');

    if (!token) {
      // 没有 token，跳转到登录页
      navigate('/login');
      return;
    }

    // 有 token，尝试加载用户信息
    if (!user) {
      loadUser().catch(() => {
        // 加载失败，跳转到登录页
        navigate('/login');
      });
    }
  }, [user, navigate, loadUser]);

  // 加载中
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

  // 没有用户信息
  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '0 8px' }}>
      {/* 欢迎横幅 */}
      <div
        className="animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(153, 69, 255, 0.2)',
        }}
      >
        {/* 背景装饰 */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(153, 69, 255, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'radial-gradient(circle, rgba(20, 241, 149, 0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />

        <Row align="middle" gutter={24} style={{ position: 'relative', zIndex: 1 }}>
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}
                className="animate-pulse-glow"
              >
                <UserOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <div>
                <Title level={2} style={{ margin: 0, color: '#fff', fontSize: 28 }}>
                  欢迎回来，
                  <span
                    style={{
                      background: 'var(--gradient-primary)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginLeft: 8,
                    }}
                    className="animate-gradient"
                  >
                    {user.fullName}
                  </span>
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                  {user.role === 'admin' ? '管理员' : '团队成员'} • {user.email}
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 快速统计卡片 */}
      <Row gutter={[16, 16]} className="animate-fade-in-up" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(153, 69, 255, 0.2)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>KOL 总数</span>}
              value={0}
              prefix={<DatabaseOutlined style={{ color: '#9945FF' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(20, 241, 149, 0.2)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>模板数量</span>}
              value={0}
              prefix={<FileTextOutlined style={{ color: '#14F195' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 212, 170, 0.2)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>联系次数</span>}
              value={0}
              prefix={<ThunderboltOutlined style={{ color: '#00D4AA' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(220, 31, 255, 0.2)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>活跃合作</span>}
              value={0}
              prefix={<StarOutlined style={{ color: '#DC1FFF' }} />}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能模块卡片 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RocketOutlined
              style={{
                fontSize: 20,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            />
            <span style={{ fontSize: 18, fontWeight: 600 }}>功能模块</span>
          </div>
        }
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        headStyle={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
        }}
        bodyStyle={{ padding: '24px' }}
        className="animate-fade-in-up"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div
              onClick={() => navigate('/kols')}
              className="hover-lift"
              style={{
                padding: 24,
                background: 'rgba(153, 69, 255, 0.1)',
                border: '1px solid rgba(153, 69, 255, 0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 0 30px rgba(153, 69, 255, 0.5)',
                }}
                className="animate-pulse-glow"
              >
                <DatabaseOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 18, color: '#fff' }}>
                KOL 管理
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                管理 KOL 数据库，筛选和评分
              </Text>
              <div style={{ marginTop: 16 }}>
                <Text
                  className="text-gradient"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  立即使用 →
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              onClick={() => navigate('/templates')}
              className="hover-lift"
              style={{
                padding: 24,
                background: 'rgba(220, 31, 255, 0.1)',
                border: '1px solid rgba(220, 31, 255, 0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 0 30px rgba(220, 31, 255, 0.5)',
                }}
                className="animate-pulse-glow"
              >
                <FileTextOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 18, color: '#fff' }}>
                模板管理
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                多语言模板，快速复制
              </Text>
              <div style={{ marginTop: 16 }}>
                <Text
                  className="text-gradient"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  立即使用 →
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              onClick={() => navigate('/analytics')}
              className="hover-lift"
              style={{
                padding: 24,
                background: 'rgba(20, 241, 149, 0.1)',
                border: '1px solid rgba(20, 241, 149, 0.3)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, #14F195 0%, #00D4AA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: '0 0 30px rgba(20, 241, 149, 0.5)',
                }}
                className="animate-pulse-glow"
              >
                <BarChartOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 18, color: '#fff' }}>
                数据分析
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 }}>
                可视化图表，深度洞察
              </Text>
              <div style={{ marginTop: 16 }}>
                <Text
                  className="text-gradient"
                  style={{ fontSize: 13, fontWeight: 600 }}
                >
                  立即使用 →
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                padding: 24,
                background: 'rgba(138, 138, 138, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.5,
                transition: 'all 0.3s ease',
                height: '100%',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(138, 138, 138, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <PhoneOutlined style={{ fontSize: 28, color: 'rgba(255, 255, 255, 0.5)' }} />
              </div>
              <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 18, color: '#fff' }}>
                联系记录
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 14 }}>
                历史记录，统计分析
              </Text>
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 13 }}>
                  即将推出
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
